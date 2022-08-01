/**
 * @fileOverview  View methods for the use case "retrieve and list products"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import InLine from "../m/InLine.mjs";
import { handleAuthentication } from "./accessControl.mjs";

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();


/***************************************************************
 Declare variables for accessing UI elements
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
let order = "lineId"; // default order value
/**
 * create listing page
 */
async function createBlock (startAt) {
  tableBodyEl.innerHTML = "";
  const lineRecs = await InLine.retrieveBlock({"order": order, "cursor": startAt});
  if (lineRecs.length) {
    // set page references for current (cursor) page
    cursor = lineRecs[0][order];
    // set next startAt page reference, if not next page, assign "null" value
    nextPageRef = (lineRecs.length < 21) ? null : lineRecs[lineRecs.length - 1][order];
    for (const lineRec of lineRecs) {
      const row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = lineRec.lineId;
      row.insertCell(-1).textContent = lineRec.productIdRef;
      row.insertCell(-1).textContent = lineRec.productName;
      row.insertCell(-1).textContent = lineRec.amount;
      row.insertCell(-1).textContent = lineRec.total;
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
