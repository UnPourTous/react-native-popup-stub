/*
 * 包装popup元素，以便进行动画
*/

import React from 'react'
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import * as Animatable from 'react-native-animatable'

export default function animatedPopup (popup, maskColor, onAutoClose) {
  // Popups are independent to each other
  let pointerEvents = getPointerEvents(popup)

  return (
    <View
      key={popup.id}
      pointerEvents={pointerEvents}
      style={[
        styles.full,
        popup.position === 'center' ? styles.posCenter : null
      ]}
    >
      {popup.mask ? <TouchableWithoutFeedback onPress={() => onAutoClose(popup)}>
        <View style={[styles.full, {backgroundColor: maskColor}]} />
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
        {popup._element}
      </Animatable.View>
    </View>
  )
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
    // only if there is no mask, blank area can click through it's container
    // usually only toast need to click through
    return popup.enableClickThrough ? 'box-none' : 'box-only'
  }
}

const styles = StyleSheet.create({
  posCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  full: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  }
})
