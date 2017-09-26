import react, {Component} from 'react'
import {ViewProperties} from 'react-native'

export interface PopupStub extends Component<ViewProperties> {
  maskColor: string,
  orientation: 'LANDSCAPE' | 'PORTRAIT'
}

type UUID = string

// deprecated & animation related properties are ignored

type PopupStubOption = {
  id?: UUID,
  autoClose: boolean,
  enableClickThrough: boolean,
  mask: boolean,
  visible: boolean,
  zIndex: number,
  position: 'center' | 'none' | 'top' | 'right' | 'bottom' | 'left',
  wrapperStyle: object
}

/**
 * @export
 * @interface PopupStubStatic
 */
export interface PopupStubStatic {
  new(props: object): PopupStub

  /**
   * Initialize PopupStub instance
   *
   * This static method **MUST** be called once before any other methods of PopupStub is called. e.g:
   * <PopupStub ref={ref => if (ref) PopupStub.init(ref)} />
   *
   * @param {PopupStub} popupStub
   */
  init(popupStub: PopupStub): void

  /**
   * Return true if any popup is displaying, otherwise return false
   *
   * @param {boolean} ignoreClosing default false
   * @returns {boolean}
   */
  isShow(ignoreClosing: boolean): boolean

  /**
   * Create a unique string with UUID algorithm
   *
   * @returns {UUID}
   */
  getNewId(): UUID

  /**
   * Show popup to display passed in content view according to options
   *
   * @param {Component} reactElement A react component
   * @param {PopupStubOption} options options
   * @returns {UUID} return a unique id to indentify the added PopupStub instance
   */
  addPopup(reactElement: Component, options: PopupStubOption): UUID

  /**
   * Remove specified popup with animation
   *
   * @param {UUID} id
   * @param {boolean} [forceUpdate=true] default true
   */
  removePopup(id: UUID, forceUpdate?: boolean): void

  /**
   * Remove specified popup immediately
   *
   * @param {UUID} id
   */
  removePopupImmediately(id: UUID): boolean

  /**
   * Reset property of specified popup
   *
   * @param {UUID} id
   * @param {string} key
   * @param {string} value
   */
  resetPopupProperty(id: UUID, key: string, value: any): void
}

declare var PopupStub: PopupStubStatic & PopupStub

export default PopupStub
