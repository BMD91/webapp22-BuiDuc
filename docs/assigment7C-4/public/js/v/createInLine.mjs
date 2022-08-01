/**
 * @fileOverview  View methods for the use case "create Product"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Product from "../m/Product.mjs";
import InLine from "../m/InLine.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import {NoConstraintViolation} from "../../lib/errorTypes.mjs";

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["InLine"];
const createButton = formEl["commit"];
let price;

formEl["productIdRef"].addEventListener("blur", async function () {
  formEl["productIdRef"].addEventListener("input", async function () {
    const responseValidation = await Product.checkProductIdAsIdRef(formEl["productIdRef"].value);
    formEl["productIdRef"].setCustomValidity(responseValidation.message);
    formEl["productIdRef"].reportValidity();
    formEl["commit"].disabled = responseValidation.message;
    if(!formEl["productIdRef"].value) formEl.reset();
  });
  if (formEl["productIdRef"].checkValidity() && formEl["productIdRef"].value) {
    const productRec = await Product.retrieve( formEl["productIdRef"].value);
    formEl["productName"].value = productRec.name;
    price = Number(productRec.price);
  } else {
    formEl.reset();
  }
  if(formEl["amount"].value){
    formEl["total"].value = Number(formEl["amount"].value)*price;
  }
});

/**
 * validation
 */
formEl["lineId"].addEventListener("input",function () {
  //console.log(wh)
  const b = InLine.checkLineId(formEl["lineId"].value)
  //console.log(b.message)
  //console.log(await InLine.checkLineIdAsId( b).message)
  //console.log(vaseSizeFieldsetEl)
  formEl["lineId"].setCustomValidity(b.message);
  formEl["lineId"].reportValidity();
});
formEl["amount"].addEventListener("input", function(){
  formEl["amount"].setCustomValidity(InLine.checkAmount(formEl["amount"].value).message);
  formEl["amount"].reportValidity();
})
/******************************************************************
 Add event listeners for the create/submit button
 ******************************************************************/
createButton.addEventListener("click", async function () {
  const slots = {
    lineId: formEl["lineId"].value,
    productIdRef: formEl["productIdRef"].value,
    productName: formEl["productName"].value,
    amount: Number(formEl["amount"].value),
    total: (Number(formEl["amount"].value) *price)
  };
  formEl["lineId"].setCustomValidity(( await InLine.checkLineIdAsId(slots.lineId)).message);
  formEl["lineId"].reportValidity();
  formEl["amount"].setCustomValidity(InLine.checkAmount(slots.amount).message);
  formEl["amount"].reportValidity();
  if (formEl.checkValidity()) {
  await InLine.add( slots);
  formEl.reset();
  }
});
// neutralize the submit event
formEl.addEventListener( "submit", function (e) {
  e.preventDefault();
});

