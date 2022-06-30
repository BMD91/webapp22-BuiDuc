/**
 * @fileOverview  View methods for the use case "create book"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Order from "../m/Order.mjs";

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Order"]
const createButton = formEl["commit"];

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
  await Order.add( slots);
  formEl.reset();
});
