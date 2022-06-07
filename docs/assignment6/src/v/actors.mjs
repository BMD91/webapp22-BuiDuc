/**
 * @fileOverview  View code of UI for managing Actor data
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Actor from "../m/Actor.mjs";
import Person from "../m/Person.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
import { fillSelectWithOptions } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Actor.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  Actor.saveAll();
});

/**********************************************
 * Use case List Actors
**********************************************/
document.getElementById("RetrieveAndListAll").addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Actor-R>table>tbody");
  // reset view table (drop its previous contents)
  tableBodyEl.innerHTML = "";
  // populate view table
  for (const key of Object.keys( Actor.instances)) {
    const actor = Actor.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = actor.personId;
    row.insertCell().textContent = actor.name;
    row.insertCell().textContent = actor.biography;
    // if (actor.category === ActorCategoryEL.MANAGER) {
    //   row.insertCell().textContent = `Manager of ${actor.department} department`;
    // }
  }
  document.getElementById("Actor-M").style.display = "none";
  document.getElementById("Actor-R").style.display = "block";
});

/**********************************************
 * Use case Create Actor
**********************************************/
const createFormEl = document.querySelector("section#Actor-C > form");
const crtSelCategoryEl = createFormEl.selectCategory;
//----- set up event handler for menu item "Create" -----------
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Actor-M").style.display = "none";
  document.getElementById("Actor-C").style.display = "block";
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.personId.addEventListener("input", function () {
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId( createFormEl.personId.value, Actor).message);
});
/* SIMPLIFIED CODE: no responsive validation of name and biography */

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const categoryStr = createFormEl.selectCategory.value;
  const slots = {
    personId: createFormEl.personId.value,
    name: createFormEl.name.value,
    biography: createFormEl.biography.value
  };
  if (categoryStr) {
    // convert array index to enum index
    slots.category = parseInt( categoryStr) + 1;
    // switch (slots.category) {
    //   case ActorCategoryEL.MANAGER:
    //     slots.department = createFormEl.department.value;
    //     createFormEl.department.setCustomValidity(
    //       Actor.checkDepartment( createFormEl.department.value, slots.category).message);
    //     break;
    // }
  }
  // check all input fields and show error messages
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId( slots.personId).message, Actor);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Actor.add( slots);
});
// define event listener for pre-filling superclass attributes
createFormEl.personId.addEventListener("change", function () {
  const persId = createFormEl.personId.value;
  if (persId in Person.instances) {
    createFormEl.name.value = Person.instances[persId].name;
    // set focus to next field
    createFormEl.biography.focus();
  }
});

/* Incomplete code: no responsive validation of "name" and "empNo" */
// set up the actor category selection list
// fillSelectWithOptions( crtSelCategoryEl);
crtSelCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);

/**********************************************
 * Use case Update Actor
**********************************************/
const updateFormEl = document.querySelector("section#Actor-U > form"),
      updSelActorEl = updateFormEl.selectActor,
      updSelCategoryEl = updateFormEl.selectCategory;
//----- set up event handler for menu item "Update" -----------
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updSelActorEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updSelActorEl, Actor.instances,
      "personId", {displayProp:"name"});
  document.getElementById("Actor-M").style.display = "none";
  document.getElementById("Actor-U").style.display = "block";
  updateFormEl.reset();
});
// handle change events on actor select element
updSelActorEl.addEventListener("change", handleActorSelectChangeEvent);
// set up the actor category selection list
// fillSelectWithOptions( updSelCategoryEl);

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const categoryStr = updateFormEl.selectCategory.value;
  const actorIdRef = updSelActorEl.value;
  if (!actorIdRef) return;
  const slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value,
    biography: updateFormEl.biography.value
  }
  if (categoryStr) {
    // convert array index to enum index
    slots.category = parseInt( categoryStr) + 1;
  }
  // check all property constraints
  /*SIMPLIFIED CODE: no before-save validation of name */
  // save the input data only if all of the form fields are valid
  if (updSelActorEl.checkValidity()) {
    Actor.update( slots);
    // update the author selection list's option element
    updSelActorEl.options[updSelActorEl.selectedIndex].text = slots.name;
  }
  updSelCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);
});
/**
 * handle actor selection events
 * on selection, populate the form with the data of the selected actor
 */
function handleActorSelectChangeEvent() {
  const key = updateFormEl.selectActor.value;
  if (key) {
    const emp = Actor.instances[key];
    updateFormEl.personId.value = emp.personId;
    updateFormEl.name.value = emp.name;
    updateFormEl.biography.value = emp.biography;
    if (emp.category) {
      updateFormEl.selectCategory.selectedIndex = parseInt( emp.category);
      displaySegmentFields( updateFormEl, ActorCategoryEL.labels, emp.category);
      
    } else {  // no emp.category
      updateFormEl.selectCategory.value = "";
      updateFormEl.department.value = "";
      undisplayAllSegmentFields( updateFormEl);
    }
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 * Use case Delete Actor
**********************************************/
const deleteFormEl = document.querySelector("section#Actor-D > form");
const delSelActorEl = deleteFormEl.selectActor;
//----- set up event handler for menu item "Delete" -----------
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelActorEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelActorEl, Actor.instances,
    "personId", {displayProp:"name"});
  document.getElementById("Actor-M").style.display = "none";
  document.getElementById("Actor-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const personIdRef = delSelActorEl.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this actor?")) {
    Actor.destroy( personIdRef);
    delSelActorEl.remove( delSelActorEl.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Actors Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage actor UI and hide the other UIs
  document.getElementById("Actor-M").style.display = "block";
  document.getElementById("Actor-R").style.display = "none";
  document.getElementById("Actor-C").style.display = "none";
  document.getElementById("Actor-U").style.display = "none";
  document.getElementById("Actor-D").style.display = "none";
}

/**
 * event handler for actor category selection events
 * used both in create and update
 */
function handleCategorySelectChangeEvent( e) {
  var formEl = e.currentTarget.form,
    categoryIndexStr = formEl.selectCategory.value,  // the array index of ActorCategoryEL.labels
    category = 0;
  if (categoryIndexStr) {
    // convert array index to enum index
    category = parseInt(categoryIndexStr) + 1;
    
    displaySegmentFields(formEl, category);
  } else {
    undisplayAllSegmentFields(formEl);
  }
}

// Set up Manage Actors UI
refreshManageDataUI();
