import {
  View,
  TouchableOpacity,
  Text
} from 'react-native'
import React, { Component } from 'react'
import { PopupStub } from '@unpourtous/react-native-popup-stub'
import { Toast, Dialog, ActionSheet } from '../components'

export default class extends Component {
  render () {
    return (
      <View
        style={{
          flex: 1,
          alignSelf: 'stretch'
        }}>
        <View>
          <TouchableOpacity onPress={this.showToast.bind(this)}>
            <Text>Show Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.showDialog.bind(this)}>
            <Text>Show Dialog</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.showActionSheet.bind(this)}>
            <Text>Show ActionSheet</Text>
          </TouchableOpacity>
        </View>

        <PopupStub ref={(ref) => {
          PopupStub.init(ref)
        }} />
      </View>
    )
  }

  showToast () {
    console.log('showToast')
    const toastId = PopupStub.addPopup(<Toast msg={'test message'} />, {
      mask: false,
      enableClickThrough: true,
      position: 'center',
      zIndex: 500,
      delay: 0,
      duration: 1000,
      animation: 'fadeIn',
      easing: 'ease'
    })

    setTimeout(() => {
      PopupStub.removePopup(toastId)
    }, 2000)
  }

  showDialog () {
    const dialogId = PopupStub.addPopup(<Dialog msg={'test message'} />, {
      mask: false,
      position: 'center',
      zIndex: 100,
      delay: 0,
      duration: 1000,
      animation: 'fadeIn',
      easing: 'ease'
    })
  }

  showActionSheet () {

  }
}
