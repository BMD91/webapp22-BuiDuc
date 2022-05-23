/**
 * @fileOverview  View code of UI for managing Movie data
 * @author Gerd Wagner
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";
import { fillSelectWithOptions, createListFromMap, createMultiSelectionWidget }
    from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Person.retrieveAll();
Movie.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all CRUD UIs
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all CRUD UIs
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", Movie.saveAll);

/**********************************************
 Use case Retrieve/List All Movies
 **********************************************/
document.getElementById("RetrieveAndListAll")
    .addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "block";
  const tableBodyEl = document.querySelector("section#Movie-R>table>tbody");
  tableBodyEl.innerHTML = "";  // drop old content
  for (const key of Object.keys( Movie.instances)) {
    const movie = Movie.instances[key];
    // create list of authors for this movie
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = movie.movieId;
    row.insertCell().textContent = movie.title;
    row.insertCell().textContent = movie.reDate.toLocaleDateString("en-EN");
    row.insertCell().textContent = movie.director.name;
    if(movie.actors){
    const actListEl = createListFromMap( movie.actors, "name");
    row.insertCell().appendChild( actListEl);
    }else {
      row.insertCell().textContent = "";
    }
  }
});

/**********************************************
  Use case Create Movie
 **********************************************/
  const createFormEl = document.querySelector("section#Movie-C > form"),
  selectActorsEl = createFormEl["selectPersons"],
  selectDirectorEl = createFormEl["selectPersons"];
document.getElementById("Create").addEventListener("click", function () {
// set up a single selection list for selecting a Director
fillSelectWithOptions( selectDirectorEl, Person.instances, "personId", {displayProp: "name"});
// set up a multiple selection list for selecting authors
fillSelectWithOptions( selectActorsEl, Person.instances,
  "personId", {displayProp: "name"});
document.getElementById("Movie-M").style.display = "none";
document.getElementById("Movie-C").style.display = "block";
createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.movieId.addEventListener("input", function () {
  createFormEl.movieId.setCustomValidity(
      Movie.checkMovieIdAsId( createFormEl["movieId"].value).message);
});
/* SIMPLIFIED/MISSING CODE: add event listeners for responsive
   validation on user input with Movie.checkTitle and checkYear */

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    movieId: createFormEl["movieId"].value,
    title: createFormEl["title"].value,
    reDate: createFormEl["reDate"].value,
    actors_id: [],
    director_id: createFormEl["selectPersons"].value
  };
  // check all input fields and show error messages
  createFormEl.movieId.setCustomValidity(
      Movie.checkMovieIdAsId( slots.movieId).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // get the list of selected actors
  const selActOptions = createFormEl.selectPersons.selectedOptions;
  // check the mandatory value constraint for actors
  createFormEl.selectPersons.setCustomValidity(
      selActOptions.length > 0 ? "" : "No actor selected!"
  );
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    // construct a list of actor ID references
    for (const opt of selActOptions) {
      slots.actors_id.push( opt.value);
    }
    Movie.add( slots);
  }
});

/**********************************************
 * Use case Update Movie
**********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form"),
      updSelMovieEl = updateFormEl["selectMovie"];
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updSelMovieEl, Movie.instances,
      "movieId", {displayProp: "title"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";
  updateFormEl.reset();
});
/**
 * handle movie selection events: when a movie is selected,
 * populate the form with the data of the selected movie
 */
updSelMovieEl.addEventListener("change", function () {
  const saveButton = updateFormEl["commit"],
    selectPersonsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectDirectorEl = updateFormEl["selectPersons"],
    movieId = updateFormEl["selectMovie"].value;
  if (movieId) {
    const movie = Movie.instances[movieId];
    updateFormEl["movieId"].value = movie.movieId;
    updateFormEl["title"].value = movie.title;
    updateFormEl["reDate"].value = movie.reDate;
    // set up the associated director selection list
    fillSelectWithOptions( selectDirectorEl, Person.instances, "personId");
    // set up the associated actors selection widget
    createMultiSelectionWidget( selectPersonsWidget, movie.actors,
        Person.instances, "personId", "name");  // minCard=0
    // assign associated director as the selected option to select element
    if (movie.director) updateFormEl["selectPersons"].value = movie.director.name;
    saveButton.disabled = false;
  } else {
    updateFormEl.reset();
    updateFormEl["selectPersons"].selectedIndex = 0;
    selectPersonsWidget.innerHTML = "";
    saveButton.disabled = true;
  }
});
// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = updSelMovieEl.value,
    selectPersonsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectedPersonsListEl = selectPersonsWidget.firstElementChild;
  if (!movieIdRef) return;
  const slots = {
    movieId: updateFormEl["movieId"].value,
    title: updateFormEl["title"].value,
    reDate: updateFormEl["reDate"].value,
    actors_id: updateFormEl["selectPersons"].value,
    director_id: updateFormEl["selectPersons"].value
  };
  // add event listeners for responsive validation
  /* MISSING CODE */
  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    // construct actorIdRefs-ToAdd/ToRemove lists
    const actorIdRefsToAdd=[], actorIdRefsToRemove=[];
    for (const actorItemEl of selectedPersonsListEl.children) {
      if (actorItemEl.classList.contains("removed")) {
        actorIdRefsToRemove.push( actorItemEl.getAttribute("data-value"));
      }
      if (actorItemEl.classList.contains("added")) {
        actorIdRefsToAdd.push( actorItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (actorIdRefsToRemove.length > 0) {
      slots.actorIdRefsToRemove = actorIdRefsToRemove;
    }
    if (actorIdRefsToAdd.length > 0) {
      slots.authorIdRefsToAdd = actorIdRefsToAdd;
    }
    Movie.update( slots);
    // update the movie selection list's option element
    updSelMovieEl.options[updSelMovieEl.selectedIndex].text = slots.title;
    // drop widget content
    selectPersonsWidget.innerHTML = "";
  }
});

/**********************************************
 * Use case Delete Movie
**********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const delSelMovieEl = deleteFormEl["selectMovie"];
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelMovieEl, Movie.instances,
      "movieId", {displayProp: "title"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = delSelMovieEl.value;
  if (!movieIdRef) return;
  if (confirm("Do you really want to delete this movie?")) {
    Movie.destroy( movieIdRef);
    // remove deleted movie from select options
    delSelMovieEl.remove( delSelMovieEl.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Movies Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage movie UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

// Set up Manage Movie UI
refreshManageDataUI();
