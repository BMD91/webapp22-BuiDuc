/**
 * @fileOverview  View methods for the use case "create Product"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Product, {VaseSizeEL} from "../m/Product.mjs";
import { createChoiceWidget}
  from "../../lib/util.mjs";
import { handleAuthentication } from "./accessControl.mjs";

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Product"];
const createButton = formEl["commit"];
const vaseSizeFieldsetEl = formEl.querySelector("fieldset[data-bind='vaseSize']");

/**
 * fill select
 */
// set up the category radio button group
createChoiceWidget( vaseSizeFieldsetEl, "vaseSize",
    [], "radio", VaseSizeEL.labels);

/**
 * validation
 */
formEl["productId"].addEventListener("input",function () {
  //console.log(wh)
  const b = Product.checkProductId(formEl["productId"].value)
  //console.log(b.message)
  //console.log(await Product.checkProductIdAsId( b).message)
  //console.log(vaseSizeFieldsetEl)
  formEl["productId"].setCustomValidity(b.message);
  formEl["productId"].reportValidity();
});
vaseSizeFieldsetEl.addEventListener("click", function () {
  formEl["vaseSize"][0].setCustomValidity(
      (!vaseSizeFieldsetEl.getAttribute("data-value")) ?
          "A size must be selected!":"" );
  formEl["vaseSize"][0].reportValidity();
});

/******************************************************************
 Add event listeners for the create/submit button
 ******************************************************************/
createButton.addEventListener("click", async function () {
  const slots = {
    productId: formEl["productId"].value,
    vaseSize: vaseSizeFieldsetEl.getAttribute("data-value")
  };
  formEl["productId"].setCustomValidity(( await Product.checkProductIdAsId(slots.productId)).message);
  formEl["productId"].reportValidity();
  formEl["vaseSize"][0].setCustomValidity(
      Product.checkVaseSize( slots.vaseSize).message);
  formEl["vaseSize"][0].reportValidity();
  if (formEl.checkValidity()) {
  await Product.add( slots);
  formEl.reset();
  }
});
// neutralize the submit event
formEl.addEventListener( "submit", function (e) {
  e.preventDefault();
});

