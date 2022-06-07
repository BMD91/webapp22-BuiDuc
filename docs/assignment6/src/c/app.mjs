/**
 * @fileOverview  App-level controller code
 * @author Gerd Wagner
 */
import Person from "../m/Person.mjs";
import Director from "../m/Director.mjs";
import Actor from "../m/Actor.mjs";
import Movie, { MovieCategoryEL } from "../m/Movie.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {
    Movie.instances["1"] = new Movie({
      movieId: "1",
      title: "Pulp Fiction",
      reDate: new Date(1994,4,12),
      category: MovieCategoryEL.TVSERIES,
      subjectArea: "Action"
    });
    Movie.instances["2"] = new Movie({
      movieId: "2",
      title: "The Critique of Pure Reason",
      reDate: new Date(1998,5,12),
      category: MovieCategoryEL.BIOGRAPHY,
      about: "Theory of change"
    });
    Movie.instances["3"] = new Movie({
      movieId: "3",
      title: "Life of a developer",
      reDate: new Date(2020,2,18),
      category: MovieCategoryEL.TVSERIES,
      subjectArea: "Horror series"
    });
    Movie.instances["4"] = new Movie({
      movieId: "4",
      title: "Way back home",
      reDate: new Date(2011,9,22),
      category: MovieCategoryEL.TVSERIES,
      subjectArea: ""
    });
    Movie.saveAll();
    Actor.instances["1001"] = new Actor({
      personId: 1001,
      name: "Harry Wagner",
      biography: "Nothing can change"
    });
    Actor.instances["1002"] = new Actor({
      personId: 1002,
      name: "Peter Boss",
      biography: "In the ocean of knowledge"
    });
    Actor.saveAll();
    Director.instances["1001"] = new Director({
      personId: 1001,
      name: "Harry Wagner",
      biography: "Born in Boston, MA, in 1956, ..."
    });
    Director.instances["1077"] = new Director({
      personId: 1077,
      name: "Immanuel Kant",
      biography: "Immanuel Kant (1724-1804) was a German philosopher ..."
    });
    Director.saveAll();
    // an example of a person that is neither an actor, nor an director
    Person.instances["1003"] = new Person({
      personId:1003,
      name:"Tom Daniels",
      biography: "Born in London"
    });
    Person.saveAll();
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
function clearData() {
  if (confirm( "Do you really want to delete the entire database?")) {
    try {
      [Actor, Director, Person, Movie].forEach(Class => {
        Class.instances = {};
      });
      /*
          Actor.instances = {};
          Director.instances = {};
          Person.instances = {};
          Movie.instances = {};
      */
      localStorage["actors"] = localStorage["directors"] = localStorage["people"] = "{}";
      localStorage["movies"] = "{}";
      console.log("All data cleared.");
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
