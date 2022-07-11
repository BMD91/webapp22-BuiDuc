/**
 * @fileOverview  View methods for the use case "update product"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Product, {VaseSizeEL} from "../m/Product.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { fillSelectWithOptions, createChoiceWidget } from "../../lib/util.mjs";


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
    updateButton = formEl["commit"],
    selectProductEl = formEl["selectProduct"],
    vaseSizeFieldsetEl = formEl.querySelector("fieldset[data-bind='vaseSize']");

/***************************************************************
 Declare variable to cancel record changes listener, DB-UI sync
 ***************************************************************/
let cancelListener = null;

/***************************************************************
 Set up select element
 ***************************************************************/
// fill select with options
fillSelectWithOptions(selectProductEl, productRecords,
    {valueProp:"productId", displayProp: "productId"});
// when a product is selected, fill the form with its data
selectProductEl.addEventListener("change", async function () {
  const productId = selectProductEl.value;
  if (productId) {
    // retrieve up-to-date product record
    const productRec = await Product.retrieve( productId);
    formEl["productId"].value = productRec.productId;
    createChoiceWidget( vaseSizeFieldsetEl, "vaseSize",
        [productRec.vaseSize], "radio", VaseSizeEL.labels);
    // cancel record listener if a previous listener exists
    if (cancelListener) cancelListener();
    // add listener to selected product, returning the function to cancel listener
    cancelListener = await Product.observeChanges( productId);
  } else {
    formEl.reset();
  }
});
/**
 * responsive validation
 */
// mandatory value check
vaseSizeFieldsetEl.addEventListener("click", function () {
  formEl["vaseSize"][0].setCustomValidity(
      (!vaseSizeFieldsetEl.getAttribute("data-value")) ?
          "A size must be selected!":"" );
  formEl["vaseSize"][0].reportValidity();
});

/******************************************************************
 Add event listeners for the update/submit button
 ******************************************************************/
// set an event handler for the update button
updateButton.addEventListener("click", async function () {
  const slots = {
    productId: formEl["productId"].value,
    vaseSize: vaseSizeFieldsetEl.getAttribute("data-value")
  },
    productIdRef = selectProductEl.value;
  if (!productIdRef) return;
  formEl["vaseSize"][0].setCustomValidity(
      Product.checkVaseSize( slots.vaseSize).message);
  if (formEl.checkValidity()) {
    if (cancelListener) cancelListener();
    Product.update(slots);
    // update the selection list option element
    selectProductEl.options[selectProductEl.selectedIndex].text = slots.productId;
    formEl.reset();
  }
});
// neutralize the submit event
formEl.addEventListener( "submit", function (e) {
  e.preventDefault();
});
// set event to cancel DB listener when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
  if (cancelListener) cancelListener();
});