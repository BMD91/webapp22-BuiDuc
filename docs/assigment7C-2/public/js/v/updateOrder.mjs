/**
 * @fileOverview  View methods for the use case "update book"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Order from "../m/Order.mjs";

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

/***************************************************************
 Set up select element
 ***************************************************************/
// fill select with options
for (const orderRec of orderRecords) {
  const optionEl = document.createElement("option");
  optionEl.text = orderRec.orderId;
  optionEl.value = orderRec.orderId;
  selectOrderEl.add( optionEl, null);
}
// when a book is selected, fill the form with its data
selectOrderEl.addEventListener("change", async function () {
  const orderId = selectOrderEl.value;
  if (orderId) {
    // retrieve up-to-date book record
    const orderRec = await Order.retrieve( orderId);
    formEl["orderId"].value = orderRec.orderId;
    formEl["customerName"].value = orderRec.customerName;
    formEl["dateOfPurchase"].value = orderRec.dateOfPurchase.toDate().toLocaleDateString();
    formEl["deliveryAddress"].value = orderRec.deliveryAddress;
    formEl["finalPrice"].value = orderRec.finalPrice;
  } else {
    formEl.reset();
  }
});

/******************************************************************
 Add event listeners for the update/submit button
 ******************************************************************/
// set an event handler for the update button
updateButton.addEventListener("click", async function () {
  const slots = {
    orderId: formEl["orderId"].value,
    customerName: formEl["customerName"].value,
    dateOfPurchase: formEl["dateOfPurchase"].value,
    deliveryAddress: formEl["deliveryAddress"].value,
    finalPrice: formEl["finalPrice"].value
  },
    orderIdRef = selectOrderEl.value;
  if (!orderIdRef) return;
  await Order.update( slots);
  // update the selection list option element
  selectOrderEl.options[selectOrderEl.selectedIndex].text = slots.orderId;
  formEl.reset();
});
