import React, { PropTypes, Component } from 'react'
import { View, Text } from 'react-native'
import { PopupStub } from '@unpourtous/react-native-popup-stub'

/**
 * Toast impplements by react-native-popup-stub
 */
export default class Toast extends Component {
  static show (msg) {
    const id = PopupStub.stub.addPopup(<Toast msg={msg}/>, {
      mask: false,
      position: 'center',
      zIndex: 500,
      delay: 0,
      duration: 100,
      animation: 'fadeIn',
      easing: 'ease'
    })
    // autoclose after 1.5s
    setTimeout(() => {
      PopupStub.stub.removePopup(id)
    }, 1500)
  }

  render () {
    return (
      <View style={{alignSelf: 'center'}}>
        <Text>{this.props.msg}</Text>
      </View>
    )
  }
}
