/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import React, { PropTypes } from 'react'
import { View, Text } from 'react-native'

export default class Welcome extends React.Component {
  styles = {
    wrapper: {
      flex: 1,
      padding: 24,
      justifyContent: 'center'
    },
    header: {
      fontSize: 18,
      marginBottom: 18
    },
    content: {
      fontSize: 12,
      marginBottom: 10,
      lineHeight: 18
    }
  }

  render () {
    return (
      <View style={this.styles.wrapper}>
        <Text style={this.styles.header}>React Native Popup Stub Demo</Text>
        <Text style={this.styles.content}>Makes it easy too implement your own popup like Dialog, Toast, ActionSheet
        </Text>
      </View>
    )
  }
}

Welcome.defaultProps = {
  showApp: null
}

Welcome.propTypes = {
  showApp: PropTypes.func
}
