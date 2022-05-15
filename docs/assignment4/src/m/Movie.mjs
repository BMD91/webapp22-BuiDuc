/**
 * @fileOverview  The model class Movie with attribute definitions, (class-level)
 *                check methods, setter methods, and the special methods saveAll
 *                and retrieveAll
 * @author Gerd Wagner
 */
import Person from "./Person.mjs";
import {cloneObject} from "../../lib/util.mjs";
import {NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation}
  from "../../lib/errorTypes.mjs";

/**
 * The class Movie
 * @class
 */
class Movie {
  // using a record parameter with ES6 function parameter destructuring
  constructor ({movieId, title, reDate, actors, actors_id,
                 director, director_id}) {
    this.movieId = movieId;
    this.title = title;
    this.reDate = reDate;
    // assign object references or ID references (to be converted in setter)
    this.actors = actors || actors_id;
    this.director = director || director_id;
  }
  get movieId() {
    return this._movieId;
  }
  static checkMovieId( movieId) {
    if (!movieId) return new NoConstraintViolation();
    else if (!Number.isInteger(parseInt(movieId)) || parseInt(movieId) < 0) {
      return new RangeConstraintViolation(
          "The Movie ID must be a positive number!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkMovieIdAsId( movieId) {
    var validationResult = Movie.checkMovieId( movieId);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!movieId) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the Movie ID must be provided!");
      } else if (Movie.instances[movieId]) {
        validationResult = new UniquenessConstraintViolation(
            `There is already a movie record with Movie ID ${movieId}`);
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set movieId( n) {
    const validationResult = Movie.checkMovieIdAsId( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = n;
    } else {
      throw validationResult;
    }
  }
  get title() {
    return this._title;
  }
  static checkTitle( t) {
    if (!t) {
      return new MandatoryValueConstraintViolation(
        "A title must be provided!");
    } else if (!(typeof(t) === "string" && t.trim() !== "")) {
      return new RangeConstraintViolation(
        "The title must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
}
  set title( t) {
    const validationResult = Movie.checkTitle( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = t;
    } else {
      throw validationResult;
    }
  }
  get reDate() {
    return this._reDate;
  }

  static checkReDate( d) {
    if (!d) {
      return new MandatoryValueConstraintViolation(
        "A release date must be provided!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set reDate( d) {
    const validationResult = Movie.checkReDate( d);
    if (validationResult instanceof NoConstraintViolation) {
    this._reDate = new Date(d);
    } else {
      throw validationResult;
    }
  }
  get director() {
    return this._director;
  }
  static checkDirector( director_id) {
    var validationResult = null;
    if (!director_id) {
      return new MandatoryValueConstraintViolation (
        "A movie has to have its director!");
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef( director_id);
    }
    return validationResult;
  }
  set director( p) {
    if (!p) {  // unset director
      delete this._director;
    } else {
      // p can be an ID reference or an object reference
      const director_id = (typeof p !== "object") ? p : p.personId;
      const validationResult = Movie.checkDirector( director_id);
      if (validationResult instanceof NoConstraintViolation) {
        // create the new director reference
        this._director = Director.instances[ director_id];
      } else {
        throw validationResult;
      }
    }
  }
  get actors() {
    return this._actors;
  }
  static checkActors( actors_id) {
    var validationResult = null;
    if (!actors_id) {
      // actor(s) are optional
      validationResult = new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef( actors_id);
    }
    return validationResult;
  }
  addActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.actorId;
    if (actor_id) {
      const validationResult = Movie.checkActors( actor_id);
      if (actor_id && validationResult instanceof NoConstraintViolation) {
        // add the new actor reference
        const key = String( actor_id);
        this._actors[key] = Person.instances[key];
      } else {
        throw validationResult;
      }
    }
  }
  removeActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.actorId;
    if (actor_id) {
      const validationResult = Movie.checkPerson( actor_id);
      if (validationResult instanceof NoConstraintViolation) {
        // delete the actor reference
        delete this._actors[String( actor_id)];
      } else {
        throw validationResult;
      }
    }
  }
  set actors( a) {
    this._actors = {};
    if (Array.isArray(a)) {  // array of IdRefs
      for (const idRef of a) {
        this.addActor( idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys( a)) {
        this.addActor( a[idRef]);
      }
    }
  }
  // Serialize movie object
  toString() {
    var movieStr = `Movie{ Movie ID: ${this.movieId}, title: ${this.title}, release date: ${this.reDate}`;
    if (this.director) movieStr += `, director: ${this.director.name}`;
    return `${movieStr}, actors: ${Object.keys( this.actors).join(",")} }`;
  }
  // Convert object to record with ID references
  toJSON() {  // is invoked by JSON.stringify in Movie.saveAll
    var rec = {};
    for (const p of Object.keys( this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_director":
          // convert object reference to ID reference
          if (this._director) rec.director_id = this._director.name;
          break;
        case "_actors":
          // convert the map of object references to a list of ID references
          rec.authorIdRefs = [];
          for (const authorIdStr of Object.keys( this.actors)) {
            rec.authorIdRefs.push( parseInt( authorIdStr));
          }
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/********************************************************
*** Class-level ("static") storage management methods ***
*********************************************************/
/**
 *  Create a new movie record/object
 */
Movie.add = function (slots) {
  var movie=null;
  try {
    movie = new Movie( slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    movie = null;
  }
  if (movie) {
    Movie.instances[movie.movieId] = movie;
    console.log(`${movie.toString()} created!`);
  }
};
/**
 *  Update an existing Movie record/object
 */
Movie.update = function ({movieId, title, reDate,
    actorIdRefsToAdd, actorIdRefsToRemove, director_id}) {
  const movie = Movie.instances[movieId],
        objectBeforeUpdate = cloneObject( movie);
  var noConstraintViolated=true, updatedProperties=[];
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (reDate && movie.reDate !== new Date(reDate)) {
      movie.reDate = reDate;
      updatedProperties.push("reDate");
    }
    if (actorIdRefsToAdd) {
      updatedProperties.push("actors(added)");
      for (const actorIdRef of actorIdRefsToAdd) {
        movie.addActor( actorIdRef);
      }
    }
    if (actorIdRefsToRemove) {
      updatedProperties.push("actors(removed)");
      for (const actor_id of actorIdRefsToRemove) {
        movie.removeActor( actor_id);
      }
    }
    // director_id may be the empty string for unsetting the optional property
    if (director_id && (!movie.director && director_id ||
        movie.director && movie.director.name !== director_id)) {
      movie.director = director_id;
      updatedProperties.push("director");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Movie.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
    } else {
      console.log(`No property value changed for movie ${movie.movieId}!`);
    }
  }
};
/**
 *  Delete an existing Movie record/object
 */
Movie.destroy = function (movieId) {
  if (Movie.instances[movieId]) {
    console.log(`${Movie.instances[movieId].toString()} deleted!`);
    delete Movie.instances[movieId];
  } else {
    console.log(`There is no movie with Movie ID ${movieId} in the database!`);
  }
};
/**
 *  Load all movie table rows and convert them to objects 
 *  Precondition: directors and people must be loaded first
 */
Movie.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["movies"]) localStorage["movies"] = "{}";
    else {
      movies = JSON.parse( localStorage["movies"]);
      console.log(`${Object.keys( movies).length} movie records loaded.`);
    }
  } catch (e) {
    alert( "Error when reading from Local Storage\n" + e);
  }
  for (const movieId of Object.keys( movies)) {
    try {
      Movie.instances[movieId] = new Movie( movies[movieId]);
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
};
/**
 *  Save all movie objects
 */
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log(`${nmrOfMovies} movie records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};

export default Movie;
