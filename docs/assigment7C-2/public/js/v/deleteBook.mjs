/**
 * @fileOverview  View methods for the use case "delete book"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Book from "../m/Book.mjs";

/***************************************************************
 Load data
 ***************************************************************/
const bookRecords = await Book.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Book"],
  deleteButton = formEl["commit"],
  selectBookEl = formEl["selectBook"];

/***************************************************************
 Set up select element
 ***************************************************************/
for (const bookRec of bookRecords) {
  const optionEl = document.createElement("option");
  optionEl.text = bookRec.title;
  optionEl.value = bookRec.isbn;
  selectBookEl.add( optionEl, null);
}

/******************************************************************
 Add event listeners for the delete/submit button
 ******************************************************************/
// set an event handler for the delete button
deleteButton.addEventListener("click", async function () {
  const isbn = selectBookEl.value;
  if (!isbn) return;
  if (confirm("Do you really want to delete this book record?")) {
    await Book.destroy( isbn);
    // remove deleted book from select options
    selectBookEl.remove( selectBookEl.selectedIndex);
  }
});