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
import { createMultiSelectionWidget}
  from "../../lib/util.mjs";
import InLine from "../m/InLine.mjs";


/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Order"];
const createButton = formEl["commit"];
const createOrderLineWidget = formEl.querySelector(".MultiSelectionWidget");
await createMultiSelectionWidget (formEl, [], "inLines",
    "id", "lineId", InLine.checkLineIdAsIdRef, InLine.retrieve);

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
/******************************************************************
 Add event listeners for the create/submit button
 ******************************************************************/
createButton.addEventListener("click", async function () {
  const addedOrderLinesListEl = createOrderLineWidget.children[1];// ul
  const slots = {
    orderId: formEl["orderId"].value,
    customerName: formEl["customerName"].value,
    dateOfPurchase: formEl["dateOfPurchase"].value,
    deliveryAddress: formEl["deliveryAddress"].value,
    orderLineIdRef: [],
    finalPrice: 0,
  };
  /**
   * validity messages before adding the object
*/
  formEl["orderId"].setCustomValidity(( await Order.checkOrderIdAsId(slots.orderId)).message);
  formEl["orderId"].reportValidity();
  formEl["customerName"].setCustomValidity( Order.checkCustomerName( slots.customerName).message);
  formEl["customerName"].reportValidity();
  formEl["dateOfPurchase"].setCustomValidity( Order.checkDateOfPurchase( slots.dateOfPurchase).message);
  formEl["dateOfPurchase"].reportValidity();
  formEl["deliveryAddress"].setCustomValidity( Order.checkDeliveryAddress( slots.deliveryAddress).message);
  formEl["deliveryAddress"].reportValidity();
  if(addedOrderLinesListEl.children.length){
    for (const orderLineEl of addedOrderLinesListEl.children){
      const orderLine = JSON.parse(orderLineEl.getAttribute("data-value"));
      const responseValidation = await InLine.checkLineIdAsIdRef(orderLine.lineId);
      if(responseValidation.message){
        formEl["inLines"].setCustomValidity(responseValidation.message);
        break;
      }else{
        slots.orderLineIdRef.push(orderLine);
        formEl["inLines"].setCustomValidity("");
      }
    }
  } else formEl["inLines"].setCustomValidity(formEl["inLines"].value ? "" : "No Lines selected");
 if(formEl.checkValidity()) {
    await Order.add(slots);
    addedOrderLinesListEl.innerHTML = "";
    formEl.reset();
  }

});
// neutralize the submit event
formEl.addEventListener( "submit", function (e) {
  e.preventDefault();
});
