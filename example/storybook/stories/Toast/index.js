import React, { PropTypes, Component } from 'react'
import { View, Text } from 'react-native'
import { PopupStub } from '@unpourtous/react-native-popup-stub'

/**
 * Toast impplements by react-native-popup-stub
 */
export default class Toast extends Component {
  render () {
    return (
      <View style={{alignSelf: 'center'}}>
        <Text>{this.props.msg}</Text>
      </View>
    )
  }
}
