import React, {Component} from 'react'
import {View, Button, ScrollView, Text, TouchableWithoutFeedback} from 'react-native'
import { PopupStub } from '@unpourtous/react-native-popup-stub'

export default class PopupStubTest extends Component {
  render () {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          {testCases.map(({ title, action }, index) =>
            <View key={index} style={{flexDirection: 'row'}}>
              <Button title={title} onPress={action} style={{flexGrow: 0}} />
            </View>
          )}
        </ScrollView>

        <PopupStub ref={ref => PopupStub.init(ref)} />
      </View>
    )
  }
}

// 模拟弹窗内容
const PopupView = ({ style = {}, children, onPressClose }) => (
  <View style={[{ width: 100, height: 100, backgroundColor: '#9aa83a' }, style]} >
    {onPressClose
      ? (<TouchableWithoutFeedback onPress={onPressClose}>
        <View><Text style={{ color: 'white' }}>X</Text></View>
      </TouchableWithoutFeedback>)
      : null
    }
    {children}
  </View>
)

const testCases = [{
    title: 'addPopup(view)',
    action: () => PopupStub.stub.addPopup(<PopupView />)
  },
  ...genTestCases('mask', [true, false]),
  ...genTestCases('position', ['center', 'none', 'top', 'right', 'bottom', 'left']),
  ...genTestCases('lock', ['all', 'auto', 'mask-only', 'none']),
  {
    title: 'addPopup with zIndex [0, 1, 2, 3]',
    action: genActionForZIndex([0, 1, 2, 3])
  }, {
    title: 'addPopup with zIndex [3, 2, 1, 0]',
    action: genActionForZIndex([3, 2, 1, 0])
  }, {
    title: 'addPopup with zIndex [1, 1, 2, 2]',
    action: genActionForZIndex([1, 1, 2, 2])
  }, {
    title: 'addPopup with animation',
    action: () => PopupStub.addPopup(<PopupView />, {
      duration: 800,
      animation: 'fadeIn',
      easing: 'ease'
    })
  }
]


/**
 * 生成测试用例
 * @param {string} attrName 待测试属性
 * @param {any[]} attrValues 待测试属性的所有取值组成的数组
 * @returns {Array<{title: string, action: () => string }>}
 */
function genTestCases (attrName, attrValues) {
  return attrValues.map(attrValue => ({
    title: `addPopup(view, {${attrName}: ${attrValue}})`,
    action: () => {
      const id = PopupStub.addPopup(
        <PopupView onPressClose={() => PopupStub.removePopup(id)}>
            <Text style={{ color: 'white' }}>{`${attrName}: ${attrValue}`}</Text>
        </PopupView>,
        { [attrName]: attrValue })
    }
  }))
}

function genActionForZIndex (zIndexs = []) {
  return () => zIndexs.forEach(zIndex => {
    const id = PopupStub.addPopup(
      <PopupView style={{ marginLeft: 20 * zIndex, marginTop: 20 * zIndex, backgroundColor: `#${(0xFF - 20 * zIndex).toString(16)}0000` }}>
        <Text style={{ color: 'white' }}>zIndex: {zIndex}</Text>
      </PopupView>,
      { zIndex })
  })
}