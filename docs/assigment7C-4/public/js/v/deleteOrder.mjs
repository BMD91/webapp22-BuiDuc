/**
 * @fileOverview  View methods for the use case "delete order"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Order from "../m/Order.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import {createMultiSelectionWidget, date2IsoDateString, fillSelectWithOptions} from "../../lib/util.mjs";
import order from "../m/Order.mjs";
import InLine from "../m/InLine.mjs";
import Product from "../m/Product.mjs";

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();


/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Order"],
  deleteButton = formEl["commit"],
  selectOrderEl = formEl["selectOrder"];

/***************************************************************
 Declare variable to cancel observer, DB-UI sync
 ***************************************************************/
let cancelListener = null;





/******************************************************************
 Add event listeners for the delete/submit button
 ******************************************************************/
// set an event handler for the delete button

  if (formEl.checkValidity()) {
    formEl["commit"].addEventListener("click", async function () {
      const orderIdRef = formEl["orderId"].value;
      if (!orderIdRef) return;
      if (confirm("Do you really want to delete this Order?")) {
        await Order.destroy(orderIdRef);
        formEl.reset();
      }
    });
  }
formEl["orderId"].addEventListener("blur", async function(){
  /**
   * handle id to ensure the least waste of ressourses
   */
  formEl["orderId"].addEventListener("input", async function(){
    const responsiveValidation = await Order.checkOrderIdAsIdRef(formEl["orderId"].value);
    if (responsiveValidation) formEl["orderId"].setCustomValidity(responsiveValidation.message);
    formEl["orderId"].reportValidity();
    return;
  });
  cancelListener = await Product.observeChanges( formEl["orderId"]);
})
// set event to cancel DB listener when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
  if (cancelListener) cancelListener();
});