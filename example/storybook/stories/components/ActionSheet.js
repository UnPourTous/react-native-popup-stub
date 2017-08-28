import { PopupStub } from '@unpourtous/react-native-popup-stub'
import React, {Component} from 'react'

// 每个popup都有一个静态的show和hide方法，以及一个render
export default class ActionSheet extends Component {
  static _id = null

  // 每个弹层决定它自身的层级、位置和动画形式
  static show (option = {}) {
    let height = 55
    height += option.header ? 33 : 0
    height += option.menuList ? option.menuList.length * 50 : 0

    let keyframes = {
      from: { translateY: height },
      to: { translateY: 0 }
    }

    ActionSheet._id = PopupStub.stub.addPopup(
      <ActionSheet header={option.header} items={option.menuList} footer={option.footer} />,
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
    PopupStub.stub.removePopup(ActionSheet._id)
  }

  render () {
    return (
      <View style={{
        alignSelf: 'stretch',
        backgroundColor: '#979797'
      }}>
        {this.props.header ? (
          <View style={styles.header}><Text style={styles.headerItem}>{this.props.header}</Text></View>
        ) : null}
        {this.props.items.map((item, index) => (
          <WeTouchable key={index} onPress={() => { item.onItemPress() }}>
            <View style={item.subhead ? styles.fixedItem : styles.item}>
              <Text style={[
                item.subhead ? styles.fixedItemText : styles.itemText,
                item.isWarning ? {color: '#e0473b'} : null
              ]}>{item.text}</Text>
              {item.subhead ? <Text style={styles.subhead}>{item.subhead}</Text> : null}
            </View>
          </WeTouchable>
        ))}
        <TouchableWithoutFeedback onPress={() => PopupTest.hideActionSheet()}>
          <View style={styles.footer}>
            <Text allowFontScaling style={styles.footerItem}>取消</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
}
