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
import { fillSelectWithOptions } from "../../lib/util.mjs";

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
  deleteButton = formEl["commit"],
  selectOrderEl = formEl["selectOrder"];

/***************************************************************
 Declare variable to cancel observer, DB-UI sync
 ***************************************************************/
let cancelListener = null;

/***************************************************************
 Set up select element
 ***************************************************************/
fillSelectWithOptions(selectOrderEl, orderRecords,
    {valueProp:"orderId", displayProp: "orderId"});


/*******************************************************************
 Setup listener on the selected order record synchronising DB with UI
 ******************************************************************/
// set up listener to document changes on selected order record
selectOrderEl.addEventListener("change", async function () {
  const orderKey = selectOrderEl.value;
  if (orderKey) {
    // cancel record listener if a previous listener exists
    if (cancelListener) cancelListener();
    // add listener to selected order, returning the function to cancel listener
    cancelListener = await Order.observeChanges( orderKey);
  }
});

/******************************************************************
 Add event listeners for the delete/submit button
 ******************************************************************/
// set an event handler for the delete button
deleteButton.addEventListener("click", async function () {
  const orderId = selectOrderEl.value;
  if (!orderId) return;
  if (confirm("Do you really want to delete this order record?")) {
    if (cancelListener) cancelListener();
    Order.destroy( orderId);
    // remove deleted order from select options
    selectOrderEl.remove( selectOrderEl.selectedIndex);
  }
});
// set event to cancel DB listener when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
  if (cancelListener) cancelListener();
});