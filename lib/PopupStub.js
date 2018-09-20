/*
 * Popup global controller, schedules popups and their layers
 */
'use strict'

import React, { Component } from 'react'
import { View, Platform, BackHandler } from 'react-native'
import PropTypes from 'prop-types'
import uuidV1 from 'uuid/v1'
import log from './util/log'
import createPopup from './util/createPopup'
import animatedPopup from './util/animatedPopup'
import { reverseKeyframes } from './util/keyframes'

export default class PopupStub extends Component {
  /* @private */
  static _stub = null
  static _orderId = 0

  static get stub () {
    return PopupStub._stub
  }

  static set stub (stub) {
    PopupStub._stub = stub
  }

  static init (_ref) {
    if (_ref) PopupStub.stub = _ref
  }

  /*
   * Check if there is a popup showing
   * @param {Boolean} [ignoreClosing=false] if true, closing popup is ignored
   * @return {Boolean}
  */
  static isShow (ignoreClosing) {
    if (!PopupStub.stub) return false

    const popups = PopupStub.stub.state.popups

    for (let popup of popups.values()) {
      if (popup.visible && (!ignoreClosing || (ignoreClosing && !popup._closing))) {
        return true
      }
    }

    return false
  }

  static getNewId () {
    return uuidV1()
  }

  static propTypes = {
    // mask color for all popups
    maskColor: PropTypes.string,
    // whether enable mask animation
    maskAnimatable: PropTypes.bool
  }

  static defaultProps = {
    maskColor: 'rgba(23,26,35,0.6)',
    maskAnimatable: false
  }

  // static method is easier to use
  // these are the same api to non-static methods

  static addPopup (element, option) {
    if (element && PopupStub.stub) {
      return PopupStub.stub.addPopup(element, option)
    }
  }

  static removePopup (id, forceUpdate = true) {
    if (id && PopupStub.stub) {
      PopupStub.stub.removePopup(id, forceUpdate)
    }
  }

  static removePopupImmediately (id) {
    if (id && PopupStub.stub) {
      return PopupStub.stub.removePopupImmediately(id)
    }

    return false
  }

  static resetPopupProperty (id, key, value) {
    if (id && PopupStub.stub) {
      PopupStub.stub.resetPopupProperty(id, key, value)
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      // popup raw data
      popups: new Map()
    }

    this._onBackAndroid = this._onBackAndroid.bind(this)
  }

  componentWillMount () {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this._onBackAndroid)
    }
  }

  componentWillUnmount () {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this._onBackAndroid)
    }
  }

  _onBackAndroid () {
    let popups = this.state.popups
    if (popups.size > 0) {
      let popupArr = [...popups.entries()].sort((a, b) => {
        if (!a || !b) {
          return 0
        }
        return a.orderId - b.orderId
      })

      let lastAddedOption = popupArr[popupArr.length - 1][1]
      if (lastAddedOption && lastAddedOption.handleBack) {
        this.removePopup(lastAddedOption.id)
        return true
      }
    }

    return false
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
   * @private
   * @function addPopup
   * @param {Component} element
   * @param {Object} [option]
   * @return {String} popup unique id
   */
  addPopup (element, option) {
    if (!element || !PopupStub.stub) return

    // 为了快速找到最后添加的popup
    option = {
      orderId: PopupStub._orderId++,
      ...option
    }
    let newPopup = createPopup(element, option, this.props)
    let popups = this.state.popups

    // close previous popup that has the same zIndex
    // TODO: enable config to close or not
    for (let key of popups.keys()) {
      let popup = popups.get(key)
      if (popup.zIndex === newPopup.zIndex && !popup._closing) {
        // new popup with same zIndex comes in with delay, visually
        newPopup.delay = newPopup._maskDelay = popup.duration / 2
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
   * Prepare for playback animatino
   * @private
  */
  _beforeClosing (popup) {
    const id = popup.id
    // reset delay
    popup.delay = 0
    // set close flag
    popup._closing = true
    // mask lazy disappearing
    if (popup._maskAnimatable) {
      popup._maskAnimation = reverseKeyframes(popup._maskAnimation)
      popup._maskDelay = popup.duration - popup.maskDuration
    }

    // when closing a popup, it plays back
    if (!popup.closingAnimation && typeof popup.animation === 'string') {
      popup.direction = 'reverse'
      popup.closingAnimation = popup.animation
      // seems that reset onAnimationEnd won't work here, neither does the animation
      // but it will be removed
      setTimeout(() => {
        this.removePopupImmediately(id)
      }, popup.duration || 100)
    } else {
      // for unkown reason，we have to change keyframes to take effect
      popup.closingAnimation = popup.closingAnimation || reverseKeyframes(popup.animation)
      popup.onAnimationEnd = () => {
        this.removePopupImmediately(id)
      }
    }
  }

  /*
   * Invoke popup exiting animation and remove it on animation end
   * @private
   * @function removePopup
   * @param {String} id popup unique id
   * @param {Boolean} [forceUpdate=true] whether force refresh, default true
   * @remark if no animation defined or not visible, it will be removed directly
  */
  removePopup (id, forceUpdate = true) {
    if (!id || !PopupStub.stub) return

    let popups = this.state.popups
    let popup = popups.get(id)

    if (!popup || popup._closing) {
      return
    }
    if (!popup.animation || !popup.visible) {
      this.removePopupImmediately(id)
      return
    }

    log('closing...' + id)

    this._beforeClosing(popup)

    if (forceUpdate) {
      // fires closing animation
      this.setState({popups})
    }
  }

  /*
   * Remove a popup immediately
   * @private
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
   * Reset certain property of a popup
   * @private
   * @function resetPopupProperty
   * @param {String} id popup unique id
   * @param {String} key can not be id, component or private propety
   * @param {Any} value
  */
  resetPopupProperty (id, key, value) {
    if (!id || !key || key === 'id' || key.charAt(0) === '_') {
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
    const popups = this.state.popups
    let rendered = []

    popups.forEach((popup) => {
      if (popup.visible) {
        rendered.push( animatedPopup(popup, onAutoClose) )
      }
    })

    log('total size ' + popups.size + ', rendered ' + rendered.length)

    const hasMask = rendered.length > 0

    return (
      <View pointerEvents={hasMask ? 'box-none' : 'none'} style={{
        overflow: 'visible',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}>
        { rendered }
      </View>
    )
  }
}

// Close a popup when hit its mask
function onAutoClose (popup) {
  if (popup && popup.autoClose && !popup._closing) {
    PopupStub.removePopup(popup.id)
  }
}
