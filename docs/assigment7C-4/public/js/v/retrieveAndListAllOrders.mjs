/**
 * @fileOverview  View methods for the use case "retrieve and list orders"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Order from "../m/Order.mjs";
import {createListFromMap} from "../../lib/util.mjs";


/***************************************************************
 Render list of all order records
 ***************************************************************/
const tableBodyEl = document.querySelector("table>tbody"),
    selectOrderEl = document.querySelector("div > label > select"),
    previousBtnEl = document.getElementById("previousPage"),
    nextBtnEl = document.getElementById("nextPage");;

// initialize pagination mapping references
let cursor = null,
    previousPageRef = null,
    nextPageRef = null,
    startAtRefs = [];
let order = "orderId"; // default order value
/**
 * create listing page
 */
async function createBlock (startAt) {
  tableBodyEl.innerHTML = "";
  const orderRecs = await Order.retrieveBlock({"order": order, "cursor": startAt});

  if (orderRecs.length) {
    // set page references for current (cursor) page
    cursor = orderRecs[0][order];
    // set next startAt page reference, if not next page, assign "null" value
    nextPageRef = (orderRecs.length < 21) ? null : orderRecs[orderRecs.length - 1][order];
    for (const orderRec of orderRecs) {
      const orderLineListEl = createListFromMap(orderRec.orderLineIdRef, "amount","name", "price");
      const row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = orderRec.orderId;
      row.insertCell(-1).textContent = orderRec.customerName;
      row.insertCell(-1).textContent = orderRec.dateOfPurchase;
      row.insertCell(-1).textContent = orderRec.deliveryAddress;
      row.insertCell(-1).appendChild(orderLineListEl);
      row.insertCell(-1).textContent = orderRec.finalPrice;
    }
  }
}
/**
 * "Previous" button
 */
previousBtnEl.addEventListener("click", async function () {
  // locate current page reference in index of page references
  previousPageRef = startAtRefs[startAtRefs.indexOf( cursor) - 1];
  // create new page
  await createBlock( previousPageRef);
  // disable "previous" button if cursor is first page
  if (cursor === startAtRefs[0]) previousBtnEl.disabled = true;
  // enable "next" button if cursor is not last page
  if (cursor !== startAtRefs[startAtRefs.length -1]) nextBtnEl.disabled = false;
});
/**
 *  "Next" button
 */
nextBtnEl.addEventListener("click", async function () {
  await createBlock( nextPageRef);
  // add new page reference if not present in index
  if (!startAtRefs.find( i => i === cursor)) startAtRefs.push( cursor);
  // disable "next" button if cursor is last page
  if (!nextPageRef) nextBtnEl.disabled = true;
  // enable "previous" button if cursor is not first page
  if (cursor !== startAtRefs[0]) previousBtnEl.disabled = false;
});
/**
 * handle order selection events: when an order is selected,
 * populate the list according to the selected order
 */
selectOrderEl.addEventListener("change", async function (e) {
  order = e.target.value;
  startAtRefs = [];
  await createBlock();
  startAtRefs.push( cursor);
  previousBtnEl.disabled = true;
  nextBtnEl.disabled = false;
});

