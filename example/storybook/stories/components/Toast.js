import React, {Component } from 'react'
import { View, Text } from 'react-native'
import { PopupStub } from '@unpourtous/react-native-popup-stub'

/**
 * Toast impplements by react-native-popup-stub
 */
export default class Toast extends Component {
  static show (option = {}) {
    let height = 55
    height += option.header ? 33 : 0
    height += option.menuList ? option.menuList.length * 50 : 0

    let keyframes = {
      from: { translateY: height },
      to: { translateY: 0 }
    }

    Toast._id = PopupStub.stub.addPopup(
      <Toast />,
      {
        mask: true,
        position: 'bottom',
        zIndex: 100,
        delay: 0,
        duration: 200,
        animation: keyframes,
        easing: 'ease-in-out',
        wrapperStyle: {alignSelf: 'stretch', backgroundColor: '#fff', height: height}
      }
    )
  }

  static hide () {
    PopupStub.stub.removePopup(Toast._id)
  }
  render () {
    return (
      <View style={{
        alignSelf: 'center',
        backgroundColor: '#000000AA',
        padding: 10
      }}>
        <Text>{this.props.msg}</Text>
      </View>
    )
  }
}
