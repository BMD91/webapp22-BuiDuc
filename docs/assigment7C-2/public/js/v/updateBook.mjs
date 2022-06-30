/**
 * @fileOverview  View methods for the use case "update book"
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
  updateButton = formEl["commit"],
  selectBookEl = formEl["selectBook"];

/***************************************************************
 Set up select element
 ***************************************************************/
// fill select with options
for (const bookRec of bookRecords) {
  const optionEl = document.createElement("option");
  optionEl.text = bookRec.title;
  optionEl.value = bookRec.isbn;
  selectBookEl.add( optionEl, null);
}
// when a book is selected, fill the form with its data
selectBookEl.addEventListener("change", async function () {
  const isbn = selectBookEl.value;
  if (isbn) {
    // retrieve up-to-date book record
    const bookRec = await Book.retrieve( isbn);
    formEl["isbn"].value = bookRec.isbn;
    formEl["title"].value = bookRec.title;
    formEl["year"].value = bookRec.year;
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
      isbn: formEl["isbn"].value,
      title: formEl["title"].value,
      year: formEl["year"].value
    },
    bookIdRef = selectBookEl.value;
  if (!bookIdRef) return;
  await Book.update( slots);
  // update the selection list option element
  selectBookEl.options[selectBookEl.selectedIndex].text = slots.title;
  formEl.reset();
});
