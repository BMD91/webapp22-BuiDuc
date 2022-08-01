/**
 * @fileOverview  View methods for the use case "create Product"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Product, {VaseSizeEL, CategoryEL} from "../m/Product.mjs";
import InLine from "../m/InLine.mjs";
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
const categoryFieldsetEl = formEl.querySelector("fieldset[data-bind='category']");

/**
 * fill select
 */
// set up the category radio button group
createChoiceWidget( vaseSizeFieldsetEl, "vaseSize",
    [], "radio", VaseSizeEL.labels);

createChoiceWidget( categoryFieldsetEl, "category",
    [], "radio", CategoryEL.labels);

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
formEl["price"].addEventListener("input", function(){
  formEl["price"].setCustomValidity(Product.checkPrice(formEl["price"].value).message);
  formEl["price"].reportValidity();
})

/******************************************************************
 Add event listeners for the create/submit button
 ******************************************************************/
createButton.addEventListener("click", async function () {
  const slots = {
    productId: formEl["productId"].value,
    vaseSize: vaseSizeFieldsetEl.getAttribute("data-value"),
    name: formEl["name"].value,
    category: categoryFieldsetEl.getAttribute("data-value"),
    price: formEl["price"].value
  };
  formEl["productId"].setCustomValidity(( await Product.checkProductIdAsId(slots.productId)).message);
  formEl["productId"].reportValidity();
  formEl["vaseSize"][0].setCustomValidity(
      Product.checkVaseSize( slots.vaseSize).message);
  formEl["vaseSize"][0].reportValidity();
  formEl["name"].setCustomValidity(Product.checkName(slots.name).message);
  formEl["name"].reportValidity();
  formEl["category"][0].setCustomValidity(
      Product.checkCategory(slots.category).message);
  formEl["category"][0].reportValidity();
  formEl["price"].setCustomValidity(Product.checkPrice(slots.price).message);
  formEl["price"].reportValidity();
  if (formEl.checkValidity()) {
  await Product.add( slots);
  await InLine.generateData(await Product.retrieve(slots.productId), false)
  formEl.reset();
  }
});
// neutralize the submit event
formEl.addEventListener( "submit", function (e) {
  e.preventDefault();
});

