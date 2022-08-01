/**
 * @fileOverview  View methods for the use case "update product"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Product, {VaseSizeEL, CategoryEL} from "../m/Product.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { fillSelectWithOptions, createChoiceWidget } from "../../lib/util.mjs";
import {NoConstraintViolation} from "../../lib/errorTypes.mjs";


/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();




/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Product"],
    updateButton = formEl["commit"],
    vaseSizeFieldsetEl = formEl.querySelector("fieldset[data-bind='vaseSize']"),
    categoryFieldsetEl = formEl.querySelector("fieldset[data-bind='category']");

/***************************************************************
 Declare variable to cancel record changes listener, DB-UI sync
 ***************************************************************/
let cancelListener = null;

/**
 * fill select
 */
// set up the category radio button group
createChoiceWidget( vaseSizeFieldsetEl, "vaseSize",
    [], "radio", VaseSizeEL.labels);

createChoiceWidget( categoryFieldsetEl, "category",
    [], "radio", CategoryEL.labels);


formEl["productId"].addEventListener("blur", async function () {
  formEl["productId"].addEventListener("input", async function () {
    const responseValidation = await Product.checkProductIdAsIdRef(formEl["productId"].value);
    if(!responseValidation instanceof  NoConstraintViolation) return;
    formEl["productId"].setCustomValidity(responseValidation.message);
    formEl["commit"].disabled = responseValidation.message;
    // add listener to selected product, returning the function to cancel listener
    cancelListener = await Product.observeChanges(formEl["productId"]);
    if(!formEl["productId"].value) formEl.reset();
  });
  if (formEl["productId"].checkValidity() && formEl["productId"].value) {
    const productRec = await Product.retrieve( formEl["productId"].value);
    console.log(productRec)
    formEl["name"].value = productRec.name;
    formEl["price"].value = productRec.price;
    console.log(productRec.category);
    formEl["category"].value  = productRec.category;
    formEl["vaseSize"].value = productRec.vaseSize;
  } else {
    formEl.reset();
  }
});

/**
 * responsive validation
 */
// mandatory value check
formEl["name"].addEventListener("input", function(){
  formEl["name"].setCustomValidity(Product.checkName(formEl["name"].value).message);
  formEl["name"].reportValidity();
})
categoryFieldsetEl.addEventListener("click", function(){
  formEl["category"][0].setCustomValidity(
      (!categoryFieldsetEl.getAttribute("data-value")) ?
          "A category must be selected!":"");
  formEl["category"][0].reportValidity();
});
vaseSizeFieldsetEl.addEventListener("click", function () {
  formEl["vaseSize"][0].setCustomValidity(
      (!vaseSizeFieldsetEl.getAttribute("data-value")) ?
          "A size must be selected!":"" );
  formEl["vaseSize"][0].reportValidity();
});
formEl["price"].addEventListener("input", function(){
  formEl["price"].setCustomValidity(Product.checkName(formEl["price"].value).message);
  formEl["price"].reportValidity();
})

/******************************************************************
 Add event listeners for the update/submit button
 ******************************************************************/
// set an event handler for the update button
updateButton.addEventListener("click", async function () {
  if(!formEl["productId"].value) return;

  const slots = {
    productId: formEl["productId"].value,
    vaseSize: vaseSizeFieldsetEl.getAttribute("data-value"),
    category: categoryFieldsetEl.getAttribute("data-value"),
    name: formEl["name"].value,
    price: formEl["price"].value
  };
  formEl["vaseSize"][0].setCustomValidity(
      Product.checkVaseSize( slots.vaseSize).message);
  formEl["name"].setCustomValidity(Product.checkName(slots.name).message);
  formEl["name"].reportValidity();
  formEl["category"][0].setCustomValidity(
      Product.checkCategory(slots.category).message);
  formEl["category"][0].reportValidity();
  formEl["price"].setCustomValidity(Product.checkName(slots.price).message);
  formEl["price"].reportValidity();
  if (formEl.checkValidity()) {
    if (cancelListener) cancelListener();
    await Product.update(slots);
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