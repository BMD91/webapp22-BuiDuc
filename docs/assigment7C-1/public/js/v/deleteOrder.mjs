/**
 * @fileOverview  View methods for the use case "delete book"
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
  deleteButton = formEl["commit"],
  selectOrderEl = formEl["selectOrder"];

/***************************************************************
 Set up select element
 ***************************************************************/
for (const orderRec of orderRecords) {
  const optionEl = document.createElement("option");
  optionEl.text = orderRec.orderId;
  optionEl.value = orderRec.orderId;
  selectOrderEl.add( optionEl, null);
}

/******************************************************************
 Add event listeners for the delete/submit button
 ******************************************************************/
// set an event handler for the delete button
deleteButton.addEventListener("click", async function () {
  const orderId = selectOrderEl.value;
  if (!orderId) return;
  if (confirm("Do you really want to delete this order record?")) {
    await Order.destroy(orderId);
    // remove deleted book from select options
    selectOrderEl.remove( selectOrderEl.selectedIndex);
  }
});