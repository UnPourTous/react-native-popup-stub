import react, {Component} from 'react'

export interface PopupStub {
}

type UUID = string

type PopupStubOption = {
  id?: UUID,
  lock: 'auto' | 'mask-only' | 'all' | 'none' = 'auto' | 'mask-only',
  mask: boolean = true,
  zIndex: number = 1,
  position: 'center' | 'none' | 'top' | 'right' | 'bottom' | 'left' = 'center',
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
   * @returns {boolean} 
   */
  isShow(): boolean

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
   * @param {boolean} [forceUpdate=true] 
   */
  removePopup(id: UUID, forceUpdate = true): void

  /**
   * Remove specified popup without animation
   * 
   * @param {UUID} id 
   */
  removePopupImmediately(id: UUID): void

  /**
   * Reset property of specified popup
   * 
   * @param {UUID} id 
   * @param {string} key 
   * @param {string} value 
   */
  resetPopupProperty(id: UUID, key: string, value: string): void
}

var PopupStub: PopupStubStatic & PopupStub

export default PopupStub