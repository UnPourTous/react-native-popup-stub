/*
 * keyframes difinition & helpers
*/
'use strict'

// TODO: reverse any valid keyframes definition
function reverseKeyframes (keyframes) {
  return {
    from: keyframes.to,
    to: keyframes.from
  }
}

export {
  reverseKeyframes
}
