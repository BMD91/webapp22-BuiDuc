/**
 * @fileOverview  The model class Actor with attribute definitions, 
 *     (class-level) check methods, setter methods, and the special 
 *     methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright � 2013-2014 Gerd Wagner, Chair of Internet Technology, 
 *     Brandenburg University of Technology, Germany. 
 * @license This code is licensed under The Code Project Open License (CPOL), 
 *     implying that the code is provided "as-is", can be modified to create 
 *     derivative works, can be redistributed, and can be used in commercial 
 *     applications.
 */
import Person from "./Person.mjs";
import { cloneObject } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, FrozenValueConstraintViolation, ConstraintViolation }
  from "../../lib/errorTypes.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";
/**
 * Enumeration type
 * @global
 */
// const ActorCategoryEL = new Enumeration(["Manager"]);
/**
 * Constructor function for the class Actor 
 * @constructor
 * @param {{personId: string, name: string, biography: string}} [slots] - 
 *     A record of parameters.
 */
class Actor extends Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name, biography, category}) {
    super({personId, name, biography});  // invoke Person constructor
    // assign additional properties

    if (category) this.category = category;
    //if (department) this.department = department;
  }
  get biography() {
    return this._biography;
  }
  set biography( n) {
    /*SIMPLIFIED CODE: no validation */
    this._biography = n;
  }
  get category() {
    return this._category;
  }
  // static checkCategory( v) {
  //   if (!v) {
  //     return new NoConstraintViolation();
  //   } else {
  //     if (!Number.isInteger( v) || v < 1 || v > ActorCategoryEL.MAX) {
  //       return new RangeConstraintViolation(
  //           "The value of category must represent an employee type!");
  //     } else {
  //       return new NoConstraintViolation();
  //     }
  //   }
  // }
  set category( v) {
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation("The category cannot be changed!");
    } else {
      v = parseInt(v);
      validationResult = Actor.checkCategory( v);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = v;
    } else {
      throw validationResult;
    }
  }
  // get department() {
  //   return this._department;
  // }
  // /**
  //  * Check if the attribute "department" applies to the given category of book
  //  * and if the value for it is admissible
  //  * @method
  //  * @static
  //  * @param {string} d - The department of a manager.
  //  * @param {number} c - The category of an employee.
  //  */
  // static checkDepartment( d, c) {
  //   c = parseInt( c);
  //   if (c === ActorCategoryEL.MANAGER && !d) {
  //     return new MandatoryValueConstraintViolation(
  //         "A department must be provided for a manager!");
  //   } else if (c !== ActorCategoryEL.MANAGER && d) {
  //     return new ConstraintViolation(
  //         "A department must not be provided if the employee is not a manager!");
  //   } else if (d && (typeof(d) !== "string" || d.trim() === "")) {
  //     return new RangeConstraintViolation(
  //         "The department must be a non-empty string!");
  //   } else {
  //     return new NoConstraintViolation();
  //   }
  // }
  // set department( v) {
  //   const validationResult = Actor.checkDepartment( v, this.category);
  //   if (validationResult instanceof NoConstraintViolation) {
  //     this._department = v;
  //   } else {
  //     throw validationResult;
  //   }
  // }
  toString() {
    var empStr = `Actor { persID: ${this.personId}, name: ${this.name}, biography: ${this.biography}`;
    if (this.category) empStr += `, category: ${this.category}`;
    // if (this.department) empStr += `, department: ${this.department}`;
    return `${empStr} }`;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Actor.instances = {};
// add Actor to the list of Person subtypes
Person.subtypes.push( Actor);

/*********************************************************
*** Class-level ("static") storage management methods ****
**********************************************************/
/**
 * Create a new Actor row
 * @method 
 * @static
 * @param {{personId: string, name: string, biography: string}} slots - A record of parameters.
 */
Actor.add = function (slots) {
  var emp = null;
  try {
	  emp = new Actor( slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    emp = null;
  }
  if (emp) {
    Actor.instances[emp.personId] = emp;
    console.log(`${emp.toString()} created!`);
  }
};
/**
 * Update an existing Actor row
 * @method 
 * @static
 * @param {{personId: string, name: string, biography: string}} slots - A record of parameters.
 */
Actor.update = function ({personId, name, biography, category}) { // department
  const emp = Actor.instances[personId],
        objectBeforeUpdate = cloneObject( emp);
  var noConstraintViolated = true, updatedProperties = [];
  try {
    if (name && emp.name !== name) {
      emp.name = name;
      updatedProperties.push("name");
    }
    if (biography && emp.biography !== biography) {
      emp.biography = biography;
      updatedProperties.push("biography");
    }
    if (category && (!("category" in emp) || emp.category !== category)) {
      emp.category = category;
      updatedProperties.push("category");
    } else if (!category && "category" in emp) {
      // since the employee category represents a role, it can be unset
      delete emp._category;  // drop category slot
      // delete emp._department;  // drop department slot
      updatedProperties.push("category");
    }
    // if (department && emp.department !== department) {
  	//   emp.department = department;
    //   updatedProperties.push("department");
    // }
  } catch (e) {
    console.log( e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Actor.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      const ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for employee ${name}`);
    } else {
      console.log(`No property value changed for Actor ${emp.name}!`);
    }
  }
};
/**
 * Delete an existing Actor row
 * @method 
 * @static
 * @param {string} personId - The ID of a person.
 */
Actor.destroy = function (personId) {
  const name = Actor.instances[personId].name;
  delete Actor.instances[personId];
  console.log(`Actor ${name} deleted.`);
};
/**
 *  Retrieve all employee objects as records
 */
Actor.retrieveAll = function () {
  var employees={};
  if (!localStorage["employees"]) localStorage["employees"] = "{}";
  try {
    employees = JSON.parse( localStorage["employees"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
  }
  for (const key of Object.keys( employees)) {
    try {  // convert record to (typed) object
      Actor.instances[key] = new Actor( employees[key]);
      // create superclass extension
      Person.instances[key] = Actor.instances[key];
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing employee ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys( Actor.instances).length} Actor records loaded.`);
}
/**
 * Save all Actor objects as rows
 * @method
 * @static
 */
Actor.saveAll = function () {
  try {
    localStorage["employees"] = JSON.stringify( Actor.instances);
    console.log( Object.keys( Actor.instances).length +" employees saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Actor;
// export { ActorCategoryEL };
