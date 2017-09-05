/*
 * Create a new popup from options
*/
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
    // priority of each popup in PopupStub
    // name 'priority' might be better
    zIndex: 1,
    // animation related
    duration: 1000,
    // default 'none' might be better?
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

export default createPopup
