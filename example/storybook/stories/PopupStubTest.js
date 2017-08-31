import React, {Component} from 'react'
import {View, Button, ScrollView} from 'react-native'
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
const PopupView = () => <View style={{width: 100, height: 100, backgroundColor: 'green'}} />

/**
 * 生成测试用例
 * @param {string} attrName 待测试属性
 * @param {any[]} attrValues 待测试属性的所有取值组成的数组
 * @returns {Array<{title: string, action: () => string }>}
 */
const genTestCases = (attrName, attrValues) => {
  return attrValues.map(attrValue => ({
    title: `addPopup (${attrName}=${attrValue})`,
    action: () => PopupStub.stub.addPopup(<PopupView />, { [attrName]: attrValue })
  }))
}

const testCases = [
  {
    title: 'addPopup (default config)',
    action: () => PopupStub.stub.addPopup(<PopupView />)
  },
  ...genTestCases('mask', [true, false]),
  ...genTestCases('position', ['center', 'none', 'top', 'right', 'bottom', 'left'])
]
