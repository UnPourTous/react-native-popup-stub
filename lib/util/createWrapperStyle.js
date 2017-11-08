/*
 * position & layout
*/
import flattenStyle from 'react-native/Libraries/StyleSheet/flattenStyle'

// merge positon to style definition
// style: component animated wrapper style
// position: position of the component in the screen
export default function createWrapperStyle(style, position) {
  let wrapperStyle = flattenStyle(style || {})

  switch (position) {
    case 'bottom':
      wrapperStyle.position = 'absolute'
      wrapperStyle.bottom = 0
      wrapperStyle.left = 0
      wrapperStyle.right = 0
      break
    case 'left':
      wrapperStyle.position = 'absolute'
      wrapperStyle.left = 0
      wrapperStyle.top = 0
      wrapperStyle.bottom = 0
      break
    case 'none':
      break
    case 'right':
      wrapperStyle.position = 'absolute'
      wrapperStyle.right = 0
      wrapperStyle.top = 0
      wrapperStyle.bottom = 0
      break
    case 'top':
      wrapperStyle.position = 'absolute'
      wrapperStyle.top = 0
      wrapperStyle.left = 0
      wrapperStyle.right = 0
      break
    default: // do nothing here
  }

  return wrapperStyle
}
