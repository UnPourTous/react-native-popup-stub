import {
  View,
  TouchableOpacity,
  Text
} from 'react-native'
import React, { Component } from 'react'
import { PopupStub } from '@unpourtous/react-native-popup-stub'
import Toast from '../Toast/index'

export default class extends Component {
  render () {
    return (
      <View
        style={{
          flex: 1,
          alignSelf: 'stretch',
          backgroundColor: 'red'
        }}>
        <View>
          <TouchableOpacity onPress={() => {
            const toastId = PopupStub.stub && PopupStub.stub.addPopup(<Toast msg={'test message'} />, {
              mask: false,
              position: 'center',
              zIndex: 500,
              delay: 0,
              duration: 1000,
              animation: 'fadeIn',
              easing: 'ease'
            })

            setTimeout(() => {
              PopupStub.stub.removePopup(toastId)
            }, 2000)
          }}>
            <Text>PopupStub</Text>
          </TouchableOpacity>
        </View>
        <PopupStub ref={(ref) => {
          PopupStub.init(ref)
        }} />
      </View>
    )
  }
}
