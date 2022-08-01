/**
 * @fileOverview  View methods for the use case "delete product"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import { handleAuthentication } from "./accessControl.mjs";
import Product from "../m/Product.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";
import Order from "../m/Order.mjs";


/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Product"],
  deleteButton = formEl["commit"],
  selectProductEl = formEl["selectProduct"];

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
    const productIdRef = formEl["productId"].value;
    if (!productIdRef) return;
    if (confirm("Do you really want to delete this Product?")) {
      await Product.destroy(productIdRef);
      formEl.reset();
    }
  });
}

formEl["productId"].addEventListener("blur", async function(){
  /**
   * handle id to ensure the least waste of ressourses
   */
  formEl["productId"].addEventListener("input", async function(){
    const responsiveValidation = await Product.checkProductIdAsIdRef(formEl["productId"].value);
    if (responsiveValidation) formEl["productId"].setCustomValidity(responsiveValidation.message);
    formEl["productId"].reportValidity();
    return;
  });
  cancelListener = await Product.observeChanges( formEl["productId"]);
})
// set event to cancel DB listener when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
  if (cancelListener) cancelListener();
});
