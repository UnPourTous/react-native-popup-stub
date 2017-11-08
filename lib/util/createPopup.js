/*
 * Create a new popup from options
*/
import uuidV1 from 'uuid/v1'
import createWrapperStyle from './createWrapperStyle'
import log from './log'

const DEFAULT_PROPS = {
  // priority of each popup in PopupStub
  // name 'priority' might be better
  zIndex: 1,
  // animation related
  duration: 1000,
  // default 'none' might be better?
  position: 'center',
  // has a visual mask or not
  mask: true,
  // duration of mask animation (if enabled)
  maskDuration: 100,
  // enable clicking mask to close or not, default true
  autoClose: true,
  // blank erea (of container) may click through or not
  enableClickThrough: false,
  // whether to render this popup
  // useful when you jump from pages but hold the popup status
  // however, remember to close it afterwards
  visible: true
  // content animation
  // animation: default animation
  // closingAnimation: by default, reversed animation
  // duration, direction, delay, etc.
}

export default function createPopup (element, option, props) {
  if (option && typeof option === 'string') {
    // This warning is for original version, and will be removed in future
    log('`id` parameter is deprecated, use `option` instead.', true)
    option = {id: option}
  }

  if (option.lock) {
    log('`lock` is deprecated, use `autoClose` and `enableClickThrough` instead.', true)
  }

  let popup = Object.assign({}, DEFAULT_PROPS, option, {
    _element: element,
    _maskColor: props.maskColor,
    _maskAnimatable: props.maskAnimatable
  })

  popup.id = popup.id || uuidV1()

  // reset wrapperStyle
  popup.wrapperStyle = createWrapperStyle(popup.wrapperStyle, popup.position)

  // mask animation
  if (popup._maskAnimatable) {
    popup._maskDelay = 0
    popup._maskAnimation = {
      from: {backgroundColor: 'rgba(0,0,0,0)'},
      to: {backgroundColor: props.maskColor}
    }
    if (popup.maskDuration > popup.duration) {
      popup.maskDuration = popup.duration
    }
  }

  // map previous lock value to current autoClose and enableClickThrough
  if (option.autoClose === undefined && option.lock) {
    // lock changes a lot....but it's for better api
    if (option.lock !== 'auto') {
      popup.autoClose = false
    }
    // auto and none are both pointerEvents values
    if (option.lock === 'auto' || option.lock === 'none') {
      popup.enableClickThrough = true
    }
  }

  return popup
}
