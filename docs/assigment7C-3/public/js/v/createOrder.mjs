/**
 * @fileOverview  View methods for the use case "create Order"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Order from "../m/Order.mjs";
import { handleAuthentication } from "./accessControl.mjs";


/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Order"]
const createButton = formEl["commit"];

/**
 * Validation
*/

formEl["orderId"].addEventListener("input", function () {
  formEl["orderId"].setCustomValidity( Order.checkOrderId( formEl["orderId"].value).message);
  formEl["orderId"].reportValidity();
});
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
/******************************************************************
 Add event listeners for the create/submit button
 ******************************************************************/
createButton.addEventListener("click", async function () {
  const slots = {
    orderId: formEl["orderId"].value,
    customerName: formEl["customerName"].value,
    dateOfPurchase: formEl["dateOfPurchase"].value,
    deliveryAddress: formEl["deliveryAddress"].value,
    finalPrice: formEl["finalPrice"].value
  };
  /**
   * validity messages before adding the object
*/
  //console.log(slots.orderId);
  formEl["orderId"].setCustomValidity(( await Order.checkOrderIdAsId(slots.orderId)).message);
  formEl["orderId"].reportValidity();
  formEl["customerName"].setCustomValidity( Order.checkCustomerName( slots.customerName).message);
  formEl["customerName"].reportValidity();
  formEl["dateOfPurchase"].setCustomValidity( Order.checkDateOfPurchase( slots.dateOfPurchase).message);
  formEl["dateOfPurchase"].reportValidity();
  formEl["deliveryAddress"].setCustomValidity( Order.checkDeliveryAddress( slots.deliveryAddress).message);
  formEl["deliveryAddress"].reportValidity();
  formEl["finalPrice"].setCustomValidity( Order.checkFinalPrice( slots.finalPrice).message);
  formEl["finalPrice"].reportValidity();
 if(formEl.checkValidity()) {
    await Order.add(slots);
    formEl.reset();
  }

});
// neutralize the submit event
formEl.addEventListener( "submit", function (e) {
  e.preventDefault();
});
