/*
 * Create a new popup from options
*/
'use strict'

import createWrapperStyle from './createWrapperStyle'
import log from './log'

function createPopup (element, option, defaultId) {
  if (option && typeof option === 'string') {
    // This warning is for original version, and will be removed in future
    log('`id` parameter is deprecated, use `option` instead.', true)
    option = {id: option}
  }

  if (option.lock) {
    log('`lock` is deprecated, use `autoClose` and `enableClickThrough` instead.', true)
  }

  let popup = Object.assign({
    id: defaultId,
    zIndex: 1,
    // animation related
    duration: 1000,
    // none may be better?
    position: 'center',
    // has a visual mask or not
    mask: true,
    // enable clicking mask to close or not, default true
    autoClose: true,
    // blank erea (of container) may click through or not
    enableClickThrough: false
  }, option, {
    component: element
  })

  // reset wrapperStyle
  popup.wrapperStyle = createWrapperStyle(popup.wrapperStyle, popup.position)

  // map previous lock value to current autoClose and enableClickThrough
  if (option.autoClose === undefined) {
    // lock changes a lot....but it's for better api
    if (option.lock && option.lock !== 'auto') {
      popup.autoClose = false
    }
    // by default, lock is 'auto', and none is a pointerEvents value
    if (!option.lock || option.lock === 'auto' || option.lock === 'none') {
      popup.enableClickThrough = true
    }
  } else if (typeof option.autoClose !== 'boolean') {
    popup.autoClose = true
    log('`autoClose` should be true or false.', true)
  }

  return popup
}

export default createPopup
