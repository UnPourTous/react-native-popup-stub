/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import React from 'react';
import {
  Text,
  View,
  TouchableOpacity
} from 'react-native';

import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import Welcome from './Welcome';
import Toast from './Toast'

storiesOf('Welcome', module).add('RN-Library-Seed Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Toast', module).add('Toast', () => {
  return (<TouchableOpacity onPress={() => {
    Toast.show("hello")
  }}>
    <Text>Show Toast</Text>
  </TouchableOpacity>)
});
