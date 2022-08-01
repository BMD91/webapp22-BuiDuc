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
import {fillSelectWithOptions, date2IsoDateString, createMultiSelectionWidget} from "../../lib/util.mjs";
import InLine from "../m/InLine.mjs";
import order from "../m/Order.mjs";

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
const updateOrderLineWidget = formEl.querySelector(".MultiSelectionWidget");


/***************************************************************
 Declare variable to cancel record changes listener, DB-UI sync
 ***************************************************************/
let cancelListener = null;


/***************************************************************
 Set up select element
 ***************************************************************/
formEl["orderId"].addEventListener("blur", async function(){
  /**
   * handle id to ensure the least waste of ressourses
   */
  formEl["orderId"].addEventListener("input", async function(){
    const responsiveValidation = await Order.checkOrderIdAsIdRef(formEl["orderId"].value);
    if (responsiveValidation) formEl["orderId"].setCustomValidity(responsiveValidation.message);
    formEl["orderId"].reportValidity();
    if (!formEl["orderId"].value){
      formEl.reset();
      updateOrderLineWidget.innerHTML ="";
    }
    return;
  });
  if (formEl["orderId"].checkValidity() && formEl["orderId"].value) {
    const orderRec = await Order.retrieve(formEl["orderId"].value);
    formEl["orderId"].value = orderRec.orderId;
    formEl["orderId"].reportValidity();
    formEl["customerName"].value = orderRec.customerName;
    formEl["customerName"].reportValidity();
    formEl["dateOfPurchase"].value = date2IsoDateString(orderRec.dateOfPurchase);
    formEl["dateOfPurchase"].reportValidity();
    formEl["deliveryAddress"].value = orderRec.deliveryAddress;
    formEl["deliveryAddress"].reportValidity();
    formEl["finalPrice"].value = orderRec.finalPrice;
    formEl["finalPrice"].reportValidity();
    await createMultiSelectionWidget(formEl, orderRec.orderLineIdRef,"inLines",
        "id", "lineId", InLine.checkLineIdAsIdRef, InLine.retrieve);
    console.log(updateOrderLineWidget)
  }else{
    formEl.reset();
  }
})


/******************************************************************
 Add event listeners for the update/submit button
 ******************************************************************/
// set an event handler for the update button
updateButton.addEventListener("click", async function () {
  const addedOrderLinesEl = updateOrderLineWidget.children[1];
  const slots = {
    orderId: formEl["orderId"].value,
    customerName: formEl["customerName"].value,
    dateOfPurchase: formEl["dateOfPurchase"].value,
    deliveryAddress: formEl["deliveryAddress"].value,
    finalPrice: formEl["finalPrice"].value
  };
  formEl["customerName"].setCustomValidity(Order.checkCustomerName(slots.customerName).message);
  formEl["customerName"].reportValidity();
  formEl["dateOfPurchase"].setCustomValidity(Order.checkDateOfPurchase(slots.dateOfPurchase).message);
  formEl["dateOfPurchase"].reportValidity();
  formEl["deliveryAddress"].setCustomValidity(Order.checkDeliveryAddress(slots.deliveryAddress).message);
  formEl["deliveryAddress"].reportValidity();
  if (addedOrderLinesEl.children.length) {
    const orderLineIdRefsToAdd = [], orderLineIdRefsToRemove = [];
    for (const orderLineItemEl of addedOrderLinesEl.children) {
      if (orderLineItemEl.classList.contains("added")) {
        const orderLine = JSON.parse(orderLineItemEl.getAttribute("data-value"));
        const responseValidation = await InLine.checkLineIdAsIdRef(orderLine.lineId);
        if (responseValidation.message) {
          formEl["inLines"].setCustomValidity(responseValidation.message);
          break;
        } else {
          orderLineIdRefsToAdd.push(orderLine);
          formEl["inLines"].setCustomValidity("");
        }
      }
      if (orderLineItemEl.classList.contains("removed")) {
        const orderLine = JSON.parse(orderLineItemEl.getAttribute("data-value"));
        console.log(orderLine)
        orderLineIdRefsToRemove.push(orderLine);
      }
    }
    if (orderLineIdRefsToRemove.length > 0) {
      slots.orderLineIdRefsToRemove = orderLineIdRefsToRemove;
    }
    if (orderLineIdRefsToAdd.length > 0) {
      slots.orderLineIdRefsToAdd = orderLineIdRefsToAdd;
    }
  } else formEl["inLine"].setCustomValidity(formEl["inLine"].value ? "" : "No Lines selected !");
  if (formEl.checkValidity()) {
    await Order.update(slots.orderId, slots.customerName, slots.dateOfPurchase, slots.deliveryAddress, slots.orderLineIdRefsToAdd, slots.orderLineIdRefsToRemove, slots.finalPrice);
    formEl.reset();
    updateOrderLineWidget.innerHTML = "";

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

