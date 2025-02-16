import * as dom from '../utils/dom/index'

export {
  getTitle,
  getContent,
  getImage,
  getButtonsWrapper,
  getActions,
  getConfirmButton,
  getCancelButton,
  getFooter,
  isLoading
} from '../utils/dom/index'

/*
 * Global function to determine if swal2 popup is shown
 */
export const isVisible = () => {
  return !!dom.getPopup()
}

/*
 * Global function to click 'Confirm' button
 */
export const clickConfirm = () => dom.getConfirmButton().click()

/*
 * Global function to click 'Cancel' button
 */
export const clickCancel = () => dom.getCancelButton().click()
