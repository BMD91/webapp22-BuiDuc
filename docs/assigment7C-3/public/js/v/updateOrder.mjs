/**
 * @fileOverview  View methods for the use case "update order"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Order from "../m/Order.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { fillSelectWithOptions, createChoiceWidget } from "../../lib/util.mjs";

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Load data
 ***************************************************************/
const orderRecords = await Order.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Order"],
  updateButton = formEl["commit"],
  selectOrderEl = formEl["selectOrder"];

/***************************************************************
 Declare variable to cancel record changes listener, DB-UI sync
 ***************************************************************/
let cancelListener = null;

/**
 * Validation
 */
formEl["customerName"].addEventListener("input", function () {
  formEl["customerName"].setCustomValidity( Order.checkCustomerName( formEl["customerName"].value).message);
  formEl["customerName"].reportValidity();
});
formEl["dateOfPurchase"].addEventListener("input", function () {
  formEl["dateOfPurchase"].setCustomValidity( Order.checkDateOfPurchase( formEl["dateOfPurchase"].value).message);
  formEl["dateOfPurchase"].reportValidity();
});
formEl["deliveryAddress"].addEventListener("input", function () {
  formEl["deliveryAddress"].setCustomValidity( Order.checkDeliveryAddress( formEl["deliveryAddress"].value).message);
  formEl["deliveryAddress"].reportValidity();
});
formEl["finalPrice"].addEventListener("input", function () {
  formEl["finalPrice"].setCustomValidity( Order.checkFinalPrice( formEl["finalPrice"].value).message);
  formEl["finalPrice"].reportValidity();
});

/***************************************************************
 Set up select element
 ***************************************************************/
// fill select with options
fillSelectWithOptions(selectOrderEl, orderRecords,
    {valueProp:"orderId", displayProp:"orderId"});
// when a order is selected, fill the form with its data
selectOrderEl.addEventListener("change", async function () {
  const orderId = selectOrderEl.value;
  if (orderId) {
    // retrieve up-to-date order record
    const orderRec = await Order.retrieve( orderId);
    formEl["orderId"].value = orderRec.orderId;
    formEl["orderId"].reportValidity();
    formEl["customerName"].value = orderRec.customerName;
    formEl["customerName"].reportValidity();
    formEl["dateOfPurchase"].value = orderRec.dateOfPurchase;
    formEl["dateOfPurchase"].reportValidity();
    formEl["deliveryAddress"].value = orderRec.deliveryAddress;
    formEl["deliveryAddress"].reportValidity();
    formEl["finalPrice"].value = orderRec.finalPrice;
    formEl["finalPrice"].reportValidity();
    //synch DB with UI
    if (cancelListener) cancelListener();
    // add listener to selected order, returning the function to cancel listener
    cancelListener = await Order.observeChanges( orderId);
  } else {
    formEl.reset();
  }
});

/******************************************************************
 Add event listeners for the update/submit button
 ******************************************************************/
// set an event handler for the update button
updateButton.addEventListener("click", async function () {
  const slots = {
    orderId: formEl["orderId"].value,
    customerName: formEl["customerName"].value,
    dateOfPurchase: formEl["dateOfPurchase"].value,
    deliveryAddress: formEl["deliveryAddress"].value,
    finalPrice: formEl["finalPrice"].value
  },
    orderIdRef = selectOrderEl.value;
  if (!orderIdRef) return;
  if (cancelListener) cancelListener();
    Order.update( slots);
    // update the selection list option element
    selectOrderEl.options[selectOrderEl.selectedIndex].text = slots.orderId;
    formEl.reset();
});
// neutralize the submit event
formEl.addEventListener( "submit", function (e) {
  e.preventDefault();
});
// set event to cancel DB listener when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
  if (cancelListener) cancelListener();
});

