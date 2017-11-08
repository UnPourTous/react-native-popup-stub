/* global __DEV__ */
/*
 * print log in dev mode
*/
export default function log (info, isWarning) {
  // Dev flag is set in project config
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (isWarning) {
      console.warn('[popup]:', info)
    } else {
      console.log('[popup]:', info)
    }
  }
}
