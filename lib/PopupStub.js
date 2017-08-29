/* global __DEV__ */
/*
 * Popup global controller, schedules popups and their layers
 */
'use strict'

import React, { Component } from 'react'
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import uuidV1 from 'uuid/v1'
import * as Animatable from 'react-native-animatable'

const BG_FROM = 'rgba(0,0,0,0)'
const BG_TO = 'rgba(23,26,35,0.6)'

export default class PopupStub extends Component {
  /* @readonly */
  static stub = null

  static init (popupStub) {
    if (popupStub) PopupStub.stub = popupStub
  }

  static isShow () {
    return PopupStub.stub && PopupStub.stub.state.popups.size > 0
  }

  static getNewId () {
    return uuidV1()
  }

  static propTypes = {
    maskColor: PropTypes.string
  }

  static defaultProps = {
    maskColor: BG_TO
  }

  constructor (props) {
    super(props)

    this.state = {
      popups: new Map(),
      // if true, show a background visual mask
      hasMask: true,
      // visual mask related animation
      maskDelay: 0,
      maskDirection: 'normal',
      // background mask fades in/out
      maskAnimation: {
        from: { backgroundColor: BG_FROM },
        to: { backgroundColor: props.maskColor }
      }
    }
  }

  /*
   * Add a new popup
   * @function addPopup
   * @param {Component} element
   * @param {Object} [option] ```{
      id: popup global unique id.
      lock: nearly same as pointerEvents, by default, 'auto' if has a mask, otherwise 'box-none'.
      mask: has a mask or not, default true.
      zIndex: same as in css, the priority of popup, the bigger the higher.
      position: position of element in screen, available: none, left, right, top, bottom, center(defualt).
      wrapperStyle: animation wrapper style (each popup is wrapped in an Animatable.View).
      ...[Animatable.props](https://github.com/oblador/react-native-animatable) direction and onAnimationEnd are reserved
    }```
   * @return {String} popup unique id
   */
  addPopup (element, option) {
    if (option && typeof option === 'string') {
      // This warning is for original version, and will be removed in future
      log('`id` parameter is deprecated, use `option` instead.', true)
      option = {id: option}
    }
    let opt = Object.assign({id: uuidV1(), zIndex: 1, mask: true, duration: 1000}, option)
    if (!opt.lock) {
      opt.lock = opt.mask ? 'auto' : 'box-none'
    }

    let newPopups = this.state.popups

    // close previous popup that has the same zIndex
    for (let key of newPopups.keys()) {
      let popup = newPopups.get(key)
      if (popup.zIndex === opt.zIndex && !popup._closing) {
        // new popup with same zIndex comes in with delay, visually
        opt.delay = popup.duration / 2
        opt.onAnimationEnd = () => {
          // reset property
          let popups = this.state.popups
          let popup = popups.get(key)
          if (popup) {
            popup.delay = 0
            popup.onAnimationEnd = null
            this.setState({popups})
          }
        }
        // remove popup until it completes animation
        this.removePopup(key, false)
        // there is no more to close
        break
      }
    }

    // add this new popup to our list
    opt.component = element
    newPopups.set(opt.id, opt)

    log('adding...' + opt.id)

    this.setState({
      popups: newPopups,
      // whenever a popup is added, reset background mask config
      hasMask: hasMask(newPopups),
      maskDelay: 0,
      maskDirection: 'normal'
    })

    return opt.id
  }

  /*
   * Invoke popup exiting animation and remove it on animation end
   * @private
   * @function removePopup
   * @param {String} id popup unique id
   * @param {Boolean} [forceUpdate=true] whether force refresh, default true
  */
  removePopup (id, forceUpdate = true) {
    if (!id) return

    log('lazy closing...' + id)

    let popups = this.state.popups
    let popup = popups.get(id)

    if (!popup || popup._closing) return
    // if no animation defined, remove it directly
    if (!popup.animation) {
      this.removePopupImmediately(id)
      return
    }

    // set close flag
    popup._closing = true
    // prevent double click
    popup.lock = 'box-only'
    // and try to activate background mask animation
    popup.mask = false

    // when closing a popup, it plays back
    if (typeof popup.animation === 'string') {
      popup.direction = 'reverse'
      // seems that reset onAnimationEnd won't work here, neither does the animation
      // but it will be removed
      setTimeout(() => {
        this.removePopupImmediately(id)
      }, popup.duration || 100)
    } else {
      // for unkown reason，we have to change keyframes to take effect
      popup.animation = reverseKeyframes(popup.animation)
      popup.onAnimationEnd = () => {
        this.removePopupImmediately(id)
      }
    }

    if (forceUpdate) {
      let isLast = popups.size === 1
      this.setState({
        popups: popups,
        // if this is the last popup, prepare for fading out of background mask
        maskDirection: isLast ? 'reverse' : this.state.maskDirection,
        maskDelay: isLast ? Math.max(0, popup.duration - 100) : this.state.maskDelay
      })
    }
  }

  /*
   * Remove a popup immediately
   * @function removePopup
   * @param {String} id popup unique id
   * @return {Boolean} if popup is found, return true, else false
  */
  removePopupImmediately (id) {
    log('[popup]: closing ' + id)

    let popups = this.state.popups
    if (popups.has(id)) {
      popups.delete(id)
      this.setState({popups})

      return true
    }

    return false
  }

  /*
   * Reset certain property of a popup, especially useful when you want to lock/unlock a popup
   * @function resetPopupProperty
   * @param {String} id popup unique id
   * @param {String} key can not be id, component or private propety
   * @param {Any} value
  */
  resetPopupProperty (id, key, value) {
    if (!key || key === 'id' || key === 'component' || key.charAt(0) === '_') {
      return
    }
    let popups = this.state.popups
    let popup = popups.get(id)
    if (popup && popup.hasOwnProperty(key)) {
      popup[key] = value
      this.setState({popups})
    }
  }

  render () {
    if (this.state.popups.size === 0) {
      // It's weird to not use null here,
      // but it can make sure that the stub will be refreshed eventually.
      return <View style={{position: 'absolute', left: 0, top: 0, height: 0, width: 0}} />
    }

    return (
      <View
        pointerEvents={this.state.hasMask ? 'auto' : 'box-none'}
        style={[styles.full, {zIndex: 999}]}
      >
        {this.state.hasMask ? <Animatable.View
          style={styles.full}
          duration={500}
          delay={this.state.maskDelay}
          direction={this.state.maskDirection}
          animation={this.state.maskAnimation} />
        : null}
        {createPopupElements(this.state.popups)}
      </View>
    )
  }
}

function log (info, isWarning) {
  // Dev flag is set in project config
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (isWarning) {
      console.warn('[popup]:', info)
    } else {
      console.log('[popup]:', info)
    }
  }
}

function hasMask (popups) {
  for (let popup of popups.values()) {
    if (popup.mask) {
      return true
    }
  }

  return false
}

// TODO: reverse any valid keyframes definition
function reverseKeyframes (keyframes) {
  return {
    from: keyframes.to,
    to: keyframes.from
  }
}

function createPopupElements (popups) {
  log('render...size ' + popups.size)
  let popupElements = []
  popups.forEach((popup, id) => {
    // Popups are independent to each other, by default, clicks won't pass through current layer;
    // if lock is 'box-only', it can't be autoclosed, neither respond the clicks;
    // if has a mask, set mode to 'auto' to enable autoclose, otherwise 'box-none';
    // if has no mask, set mode to 'box-none' to enable click through in blank area.
    // For popups like toast, lock may be 'none' with mask false.
    popupElements.push(
      <View
        key={id}
        pointerEvents={popup.lock}
        style={[
          styles.full,
          {zIndex: popup.zIndex},
          getPositionStyle(popup.position)
        ]}
      >
        {popup.mask ? <TouchableWithoutFeedback onPress={() => onAutoClose(popup)}>
          <View style={styles.full} />
        </TouchableWithoutFeedback> : null}
        <Animatable.View
          delay={popup.delay}
          duration={popup.duration}
          direction={popup.direction}
          animation={popup.animation}
          onAnimationEnd={popup.onAnimationEnd}
          easing={popup.easing}
          style={popup.wrapperStyle}
        >
          {popup.component}
        </Animatable.View>
      </View>
    )
  })

  return popupElements
}
 
function onAutoClose (popup) {
  if (popup && popup.lock === 'auto' && !popup._closing) {
    PopupStub.stub.removePopup(popup.id)
  }
}

function getPositionStyle (pos) {
  switch (pos) {
    case 'bottom':
      return styles.posBottom
    case 'center':
      return styles.posCenter
    case 'left':
      return styles.posLeft
    case 'none':
      return null
    case 'right':
      return styles.posRight
    case 'top':
      return styles.posTop
    default:
      return styles.posCenter
  }
}

const styles = StyleSheet.create({
  full: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  posLeft: {
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  posRight: {
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  posTop: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  posBottom: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  posCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
