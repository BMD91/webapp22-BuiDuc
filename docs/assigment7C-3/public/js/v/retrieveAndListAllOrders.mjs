/**
 * @fileOverview  View methods for the use case "retrieve and list orders"
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
const tableBodyEl = document.querySelector("table#orders>tbody");

/***************************************************************
 Render list of all order records
 ***************************************************************/
// for each order, create a table row with a cell for each attribute
for (const orderRec of orderRecords) {
  const row = tableBodyEl.insertRow();
  row.insertCell().textContent = orderRec.orderId;
  row.insertCell().textContent = orderRec.customerName;
  row.insertCell().textContent = orderRec.dateOfPurchase.toDate().toLocaleDateString();
  row.insertCell().textContent = orderRec.deliveryAddress;
  row.insertCell().textContent = orderRec.finalPrice;

}
