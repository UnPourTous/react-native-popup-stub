# react-native-popup-stub

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)  
  
## Introduction 
Popup global controller:

- Handles popup animations
- Remove old popup that has the same zIndex automatically

Derived from @unpourtous/react-native-stub-toast/PopupStub.

## Installation 
```
npm install @unpourtous/react-native-popup-stub --save
```

## Usage
First, add PopupStub as sibling node of you Root Node
``` js
export default class example extends Component {
  render () {
    return (
      <View style={styles.container}>
        {/* Your root node */} 
        <TouchableHighlight
          onPress={() => {
            // Step three: Use Toast with static function
            Toast.show('This is a Toast')
            Toast.show('This is another Toast')
          }}>
          <Text>Show Toast</Text>
        </TouchableHighlight>
        
        {/* Step One: Add popup stub */} 
        <PopupStub ref={_ref => {
          // Step Two: Init PopupStub itself
          PopupStub.init(_ref)
        }} />
      </View>
    )
  }
}
```

Then, just push your popup instance to PopupStub
```js
export default class Toast extends Component {
  static show(msg) {
    const id = PopupStub.stub.addPopup(<Toast msg={msg} />, {
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
    return <View style={{alignSelf:'center'}}><Text>{this.props.msg}</Text></View>
  }
}
```

## License
This library is distributed under MIT Licence.
