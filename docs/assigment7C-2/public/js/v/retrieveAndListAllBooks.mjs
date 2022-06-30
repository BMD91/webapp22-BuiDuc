/**
 * @fileOverview  View methods for the use case "retrieve and list books"
 * @authors Gerd Wagner & Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import { handleAuthentication } from "./accessControl.mjs";
import Book from "../m/Book.mjs";

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Load data
 ***************************************************************/
const bookRecords = await Book.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const tableBodyEl = document.querySelector("table#books>tbody");

/***************************************************************
 Render list of all book records
 ***************************************************************/
// for each book, create a table row with a cell for each attribute
for (const bookRec of bookRecords) {
  const row = tableBodyEl.insertRow();
  row.insertCell().textContent = bookRec.isbn;
  row.insertCell().textContent = bookRec.title;
  row.insertCell().textContent = bookRec.year;
}
