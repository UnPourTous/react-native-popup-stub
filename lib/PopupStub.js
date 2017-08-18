/* global __DEV__ */
/*
 * Popup global controller, schedules popups and their layers
 */
'use strict'
import React, { Component } from 'react'
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import * as Animatable from 'react-native-animatable'
import uuidV1 from 'uuid/v1'

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
      // background mask is fading in/out
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
      lock: if true, it can't be closed, default false.
      mask: has a mask or not, defatul true.
      zIndex: the priority of popup, the higher the upper.
      position: position of element in screen, available: left, right, top, bottom, center(defualt).
      wrapperStyle: animation wrapper style (each popup is wrapped in an Animatable.View).
      ...[Animatable.props](https://github.com/oblador/react-native-animatable) direction and onAnimationEnd are reserved
    }```
   * @return {String} unique id
   */
  addPopup (element, option) {
    if (option && typeof option === 'string') {
      log('`id` parameter is deprecated, use `option` instead.', true)
      option = {id: option}
    }
    let opt = Object.assign({id: uuidV1(), zIndex: 1, mask: true, duration: 1000}, option)

    let newPopups = this.state.popups

    // close previous popup that has the same zIndex
    for (let key of newPopups.keys()) {
      let popup = newPopups.get(key)
      if (popup.zIndex === opt.zIndex && !popup.closing) {
        // new popup comes in with delay, visually
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
      // whenever a popup is added, reset background mask animation
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
  removePopup (id, forceUpdate) {
    if (!id) return

    log('lazy closing...' + id)

    let popups = this.state.popups
    let popup = popups.get(id)

    if (!popup) return
    // if no animation defined, remove it directly
    if (!popup.animation) {
      this.removePopupImmediately(id)
      return
    }

    // set close flag
    popup.closing = true
    // remove the mask to avoid double click,
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

    if (forceUpdate !== false) {
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
   * @param {String} key can not be id or component
   * @param {Any} value
  */
  resetPopupProperty (id, key, value) {
    if (!key || key === 'id' || key === 'component') {
      return
    }
    let popups = this.state.popups
    let popup = popups.get(id)
    if (popup) {
      popup[key] = value
      this.setState({popups})
    }
  }

  render () {
    if (this.state.popups.size === 0) {
      return null
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
  if (typeof __DEV__ !== undefined && __DEV__) {
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
    // if locked, it can't be closed, neither response the clicks;
    // if unlocked, it may have a mask;
    // if unlocked and has no mask, clicks in blank area can pass through.
    let pointer = popup.lock ? 'box-only' : 'box-none'
    // popups are independent to each other
    popupElements.push(
      <View
        key={id}
        pointerEvents={pointer}
        style={[
          styles.full,
          getPositionStyle(popup.position),
          {zIndex: popup.zIndex}
        ]}
      >
        {(!popup.lock && popup.mask) ? <TouchableWithoutFeedback
          onPress={() => PopupStub.stub.removePopup(popup.id)}>
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

function getPositionStyle (pos) {
  switch (pos) {
    case 'bottom':
      return styles.posBottom
    case 'left':
      return styles.posLeft
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  posBottom: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  posCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
