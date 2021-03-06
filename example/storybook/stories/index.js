import React from 'react'
import { storiesOf } from '@storybook/react-native'
// import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

import Welcome from './Welcome'
import ToastDemo from './Welcome/PopupDemo'
import PopupStubTest from './PopupStubTest'

storiesOf('PopupDemo', module)
  .add('PopupStub', () => <PopupStubTest />)
  .add('ActionSheet', () => <Welcome showApp={linkTo('Button')} />)
  .add('Dialog', () => <Welcome showApp={linkTo('Button')} />)
  .add('Toast', () => <ToastDemo showApp={linkTo('Button')} />)
