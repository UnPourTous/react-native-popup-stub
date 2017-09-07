/* global __DEV__ */
/*
 * Popup global controller, schedules popups and their layers
 */
'use strict'

import React, { Component } from 'react'
import { Platform, View, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import uuidV1 from 'uuid/v1'
import * as Animatable from 'react-native-animatable'
import createPopup from './util/createPopup'
import log from './util/log'
import { reverseKeyframes } from './util/keyframes'

const IS_ANDROID = Platform.OS === 'android'
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
    // mask color for all popups
    maskColor: PropTypes.string,
    // zIndex for PopupStub
    // popups are always within this container
    zIndex: PropTypes.number
  }

  static defaultProps = {
    maskColor: BG_TO,
    zIndex: 999
  }

  // static method is easier to use
  // these are the same api to non-static methods

  static addPopup (element, option) {
    if (!element || !PopupStub.stub) return

    return PopupStub.stub.addPopup(element, option)
  }

  static removePopup (id, forceUpdate = true) {
    if (!id || !PopupStub.stub) return

    PopupStub.stub.removePopup(id, forceUpdate)
  }

  static removePopupImmediately (id) {
    if (!id || !PopupStub.stub) return null

    return PopupStub.stub.removePopupImmediately(id)
  }

  static resetPopupProperty (id, key, value) {
    if (!id || !PopupStub.stub) return null

    PopupStub.stub.resetPopupProperty(id, key, value)
  }

  constructor (props) {
    super(props)

    this.state = {
      popups: new Map()
    }
  }

  _sortPopups (popups) {
    if (popups.size > 1) {
      // sort by zIndex
      return new Map([...popups.entries()].sort((a, b) => {
        return a[1].zIndex - b[1].zIndex
      }))
    }

    return popups
  }

  /*
   * Add a new popup
   * @function addPopup
   * @param {Component} element
   * @param {Object} [option]
   * @return {String} popup unique id
   */
  addPopup (element, option) {
    if (!element || !PopupStub.stub) return

    let newPopup = createPopup(element, option, uuidV1())
    let popups = this.state.popups

    // close previous popup that has the same zIndex
    // TODO: enable config to close or not
    for (let key of popups.keys()) {
      let popup = popups.get(key)
      if (popup.zIndex === newPopup.zIndex && !popup._closing) {
        // new popup with same zIndex comes in with delay, visually
        newPopup.delay = popup.duration / 2
        // remove popup until it completes animation
        this.removePopup(key, false)
        // there is no more to close
        break
      }
    }

    // add this new popup to our list
    popups.set(newPopup.id, newPopup)

    this.setState({
      // We can't use position-zIndex here to identify the layer,
      // cause it has compatible problem in android devices,
      // so sort by hand.
      popups: this._sortPopups(popups)
    })

    log('added ' + newPopup.id)

    return newPopup.id
  }

  /*
   * Invoke popup exiting animation and remove it on animation end
   * @private
   * @function removePopup
   * @param {String} id popup unique id
   * @param {Boolean} [forceUpdate=true] whether force refresh, default true
  */
  removePopup (id, forceUpdate = true) {
    if (!id || !PopupStub.stub) return
    // TODO: fix playback animation in android
    if (IS_ANDROID) {
      return this.removePopupImmediately(id)
    }

    let popups = this.state.popups
    let popup = popups.get(id)

    if (!popup || popup._closing) {
      return
    }
    // if no animation defined, remove it directly
    if (!popup.animation) {
      this.removePopupImmediately(id)
      return
    }

    log('closing...' + id)

    // set close flag
    popup._closing = true
    // reset delay
    popup.delay = 0

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
      this.setState({popups})
    }
  }

  /*
   * Remove a popup immediately
   * @function removePopup
   * @param {String} id popup unique id
   * @return {Boolean} if popup is found, return true, else false
  */
  removePopupImmediately (id) {
    let popups = this.state.popups
    if (popups.has(id)) {
      popups.delete(id)
      this.setState({popups})
      log('closed ' + id)
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
      // force update
      // if return null, it won't refresh in some android devices
      return <View style={{position: 'absolute', left: 0, top: 0, height: 0, width: 0}} />
    }

    return (
      <View pointerEvents='box-none' style={[styles.full, {zIndex: this.props.zIndex}]}>
        {createPopupElements(this.state.popups, this.props.maskColor)}
      </View>
    )
  }
}

function createPopupElements (popups, maskColor) {
  log('render...size ' + popups.size)
  let popupElements = []
  popups.forEach((popup, id) => {
    // Popups are independent to each other
    let pointerEvents = getPointerEvents(popup)
    popupElements.push(
      <View
        key={id}
        pointerEvents={pointerEvents}
        style={[
          styles.full,
          popup.position === 'center' ? styles.posCenter : null
        ]}
      >
        {popup.mask ? <TouchableWithoutFeedback onPress={() => onAutoClose(popup)}>
          <View style={[styles.full, {backgroundColor: maskColor, zIndex: -1}]} />
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
  if (popup && popup.autoClose && !popup._closing) {
    PopupStub.removePopup(popup.id)
  }
}

// map popup status to pointerEvents
function getPointerEvents (popup) {
  if (popup._closing) {
    // all touches will be blocked, this will prevent double click
    return 'box-only'
  }
  if (popup.mask) {
    return popup.autoClose ? 'auto' : 'box-none'
  } else {
    // only if there is no mask, blank erea can click through it's container
    return popup.enableClickThrough ? 'box-none' : 'auto'
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
  posCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
