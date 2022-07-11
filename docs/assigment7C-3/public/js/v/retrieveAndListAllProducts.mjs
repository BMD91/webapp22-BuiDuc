/**
 * @fileOverview  View methods for the use case "retrieve and list products"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Product, {VaseSizeEL} from "../m/Product.mjs";
import { handleAuthentication } from "./accessControl.mjs";

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Load data
 ***************************************************************/
const productRecords = await Product.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const tableBodyEl = document.querySelector("table#products>tbody");

/***************************************************************
 Render list of all product records
 ***************************************************************/
// for each product, create a table row with a cell for each attribute
for (const productRec of productRecords) {
  const row = tableBodyEl.insertRow();
  row.insertCell().textContent = productRec.productId;
  row.insertCell().textContent = VaseSizeEL.labels[productRec.vaseSize - 1];

}
