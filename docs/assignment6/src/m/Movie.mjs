/**
 * @fileOverview  The model class Movie with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { cloneObject, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { ConstraintViolation, FrozenValueConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation} from "../../lib/errorTypes.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";
/**
 * Enumeration type
 * @global
 */
const MovieCategoryEL = new Enumeration(["TvSeries","Biography"]);
/**
 * Constructor function for the class Movie 
 * including the incomplete disjoint segmentation {TextMovie, Biography}
 * @class
 */
class Movie {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({movieId, title, reDate, category, subjectArea, about}) {
    this.movieId = movieId;
    this.title = title;
    this.reDate = reDate;
    // optional properties
    if (category) this.category = category;  // from MovieCategoryEL
    if (subjectArea) this.subjectArea = subjectArea;
    if (about) this.about = about;
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
            "A value for the MOVIEID must be provided!");
      } else if (movieId in Movie.instances) {
        validationResult = new UniquenessConstraintViolation(
            "There is already a movie record with this MOVIEID!");
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set movieId( movieId) {
    const validationResult = Movie.checkMovieIdAsId( movieId);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = movieId;
    } else {
      throw validationResult;
    }
  }
  get title() {return this._title;}
  set title( t) {this._title = t;}  //***** SIMPLIFIED CODE: no validation *****
  get reDate() {return this._reDate;}
  set reDate( v) {this._reDate = v;}  //***** SIMPLIFIED CODE: no validation *****
  get category() {return this._category;}
  static checkCategory( c) {
    if (c === undefined) {
      return new NoConstraintViolation();  // category is optional
    } else if (!isIntegerOrIntegerString( c) || parseInt( c) < 1 ||
        parseInt( c) > MovieCategoryEL.MAX) {
      return new RangeConstraintViolation(
          `Invalid value for category: ${c}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  set category( c) {
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
          "The category cannot be changed!");
    } else {
      validationResult = Movie.checkCategory( c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt( c);
    } else {
      throw validationResult;
    }
  }
  get subjectArea() {return this._subjectArea;}
  static checkSubjectArea( sA, c) {
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TVSERIES && !sA) {
      return new MandatoryValueConstraintViolation(
          "A subject area must be provided for a Tv series!");
    } else if (cat !== MovieCategoryEL.TVSERIES && sA) {
      return new ConstraintViolation("A subject area must not " +
          "be provided if the movie is not a Tv series!");
    } else if (sA && (typeof(sA) !== "string" || sA.trim() === "")) {
      return new RangeConstraintViolation(
          "The subject area must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set subjectArea( v) {
    const validationResult = Movie.checkSubjectArea( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._subjectArea = v;
    } else {
      throw validationResult;
    }
  }
  get about() {return this._about;}
  static checkAbout( a, c) {
    const cat = parseInt( c);
    //??? if (!cat) cat = MovieCategoryEL.BIOGRAPHY;
    if (cat === MovieCategoryEL.BIOGRAPHY && !a) {
      return new MandatoryValueConstraintViolation(
          "A biography movie record must have an 'about' field!");
    } else if (cat !== MovieCategoryEL.BIOGRAPHY && a) {
      return new ConstraintViolation("An 'about' field value must not " +
          "be provided if the movie is not a biography!");
    } else if (a && (typeof(a) !== "string" || a.trim() === "")) {
      return new RangeConstraintViolation(
          "The 'about' field value must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set about( v) {
    const validationResult = Movie.checkAbout( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._about = v;
    } else {
      throw validationResult;
    }
  }
  /*********************************************************
   ***  Other Instance-Level Methods  ***********************
   **********************************************************/
  toString() {
    var movieStr = `Movie{ MOVIEID: ${this.movieId}, title: ${this.title}, reDate: ${this.reDate}`;
    switch (this.category) {
      case MovieCategoryEL.TVSERIES:
        movieStr += `, tv series subject area: ${this.subjectArea}`;
        break;
      case MovieCategoryEL.BIOGRAPHY:
        movieStr += `, biography about: ${this.about}`;
        break;
    }
    return movieStr + "}";
  }
  /* Convert object to record */
  toJSON() { // is invoked by JSON.stringify in Movie.saveAll
    const rec = {};
    for (const p of Object.keys( this)) {
      // remove underscore prefix
      if (p.charAt(0) === "_") rec[p.substr(1)] = this[p];
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/************************************************
*** Class-level ("static") methods **************
*************************************************/
/**
 * Create a new Movie record
 * @method 
 * @static
 * @param {{movieId: string, title: string, reDate: date, category: ?number, subjectArea: ?string, about: ?string}} slots - A record of parameters.
 */
Movie.add = function (slots) {
  var movie = null;
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
 * Update an existing Movie record
 * where the slots argument contains the slots to be updated and performing 
 * the updates with setters makes sure that the new values are validated
 * @method 
 * @static
 * @param {{movieId: string, title: string, reDate: date, category: ?number, subjectArea: ?string, about: ?string}} slots - A record of parameters.
 */
Movie.update = function ({movieId, title, reDate, category, subjectArea, about}) {
  const movie = Movie.instances[movieId],
        objectBeforeUpdate = cloneObject( movie);
  var noConstraintViolated = true, updatedProperties = [];
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (reDate && movie.reDate !== reDate) {
      movie.reDate = reDate;
      updatedProperties.push("reDate");
    }
    if (category) {
      if (movie.category === undefined) {
        movie.category = category;
        updatedProperties.push("category");
      } else if (category !== movie.category) {
        throw new FrozenValueConstraintViolation(
            "The movie category must not be changed!");
      }
    } else if (category === "" && "category" in movie) {
      throw new FrozenValueConstraintViolation(
          "The movie category must not be unset!");
    }
    if (subjectArea && movie.subjectArea !== subjectArea) {
      movie.subjectArea = subjectArea;
      updatedProperties.push("subjectArea");
    }
    if (about && movie.about !== about) {
      movie.about = about;
      updatedProperties.push("about");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its previous state (before updating)
    Movie.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
    } else {
      console.log(`No property value changed for movie ${movie.toString()}!`);
    }
  }
};
/**
 * Delete an existing Movie record
 * @method 
 * @static
 * @param {string} movieId - The MOVIEID of a movie.
 */
Movie.destroy = function (movieId) {
  if (Movie.instances[movieId]) {
    console.log(`${Movie.instances[movieId].toString()} deleted!`);
    delete Movie.instances[movieId];
  } else {
    console.log(`There is no movie with MOVIEID ${movieId} in the database!`);
  }
};
/**
 * Load all movie table records and convert them to objects
 * Precondition: publishers and people must be loaded first
 * @method 
 * @static
 */
Movie.retrieveAll = function () {
  var movies={};
  try {
    if (!localStorage["movies"]) localStorage.setItem("movies", "{}");
    else {
      movies = JSON.parse( localStorage["movies"]);
      console.log( Object.keys( movies).length +" movies loaded.");
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  for (const movieId of Object.keys( movies)) {
    Movie.instances[movieId] = Movie.convertRec2Obj( movies[movieId]);
  }
};
/**
 * Convert movie record to movie object
 * @method 
 * @static
 * @param {{movieId: string, title: string, reDate: date, category: ?number, subjectArea: ?string, about: ?string}} slots - A record of parameters.
 * @returns {object}
 */
Movie.convertRec2Obj = function (movieRow) {
  var movie=null;
  try {
    movie = new Movie( movieRow);
  } catch (e) {
    console.log(`${e.constructor.name} while deserializing a movie record: ${e.message}`);
  }
  return movie;
};
/**
 * Save all Movie objects as records
 * @method 
 * @static
 */
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log(`${nmrOfMovies} movie records saved.`);
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Movie;
export { MovieCategoryEL };
