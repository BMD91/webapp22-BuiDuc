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


/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Load data
 ***************************************************************/
const productRecords = await Product.retrieveAll();

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

/***************************************************************
 Set up select element
 ***************************************************************/
fillSelectWithOptions(selectProductEl,productRecords,
    {valueProp:"productId", displayProp:"productId"});

/*******************************************************************
 Setup listener on the selected product record synchronising DB with UI
 ******************************************************************/
// set up listener to document changes on selected product record
selectProductEl.addEventListener("change", async function () {
  const productKey = selectProductEl.value;
  if (productKey) {
    // cancel record listener if a previous listener exists
    if (cancelListener) cancelListener();
    // add listener to selected product, returning the function to cancel listener
    cancelListener = await Product.observeChanges( productKey);
  }
});


/******************************************************************
 Add event listeners for the delete/submit button
 ******************************************************************/
// set an event handler for the delete button
deleteButton.addEventListener("click", async function () {
  const productId = selectProductEl.value;
  if (!productId) return;
  if (confirm("Do you really want to delete this product record?")) {
    if (cancelListener) cancelListener();
    await Product.destroy(productId);
    // remove deleted product from select options
    selectProductEl.remove( selectProductEl.selectedIndex);
  }
});

// set event to cancel DB listener when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
  if (cancelListener) cancelListener();
});
