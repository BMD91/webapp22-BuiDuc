/**
 * @fileOverview  The model class Order with attribute definitions and storage management methods
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 * @copyright Copyright 2020-2022 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes,
 * Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { fsDb } from "../initFirebase.mjs";
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs,
  orderBy, query as fsQuery, writeBatch, startAt,arrayRemove,  arrayUnion, limit, setDoc, updateDoc, where }
  from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore-lite.js";
import {isIntegerOrIntegerString }
  from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, ReferentialIntegrityConstraintViolation, UniquenessConstraintViolation }
  from "../../lib/errorTypes.mjs";
import Product from "./Product.mjs";
import product from "./Product.mjs";
import order from "./Order.mjs";
import Order from "./Order.mjs";

/**
 * Constructor function for the class Product
 * @constructor
 * @param {{lineId:: string, productId:: string, productName:: string, amount:: number(int), total:: number }} slots - Object creation slots.
 */
class InLine {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({lineId, productIdRef, productName, amount, total}) {
    this.lineId = lineId;
    this.productIdRef = productIdRef;
    this.productName = productName;
    this.amount = amount;
    this.total = total;
  };
  get lineId(){
    return this._lineId;
  };
  get productIdRef(){
    return this._productIdRef;
  }
  get productName(){
    return this._productName;
  }
  get amount(){
    return this._amount;
  }
  get total(){
    return this._total;
  }
  set lineId(id){
    const validationResult = InLine.checkLineId(id);
    if(validationResult instanceof NoConstraintViolation){
      this._lineId = id;
    }else{
      throw validationResult;
    }
  };
  set productIdRef(idRef){
    this._productIdRef = idRef;
  };
  set productName(pName){
    this._productName = pName;
  }
  set amount(am){
    const validationResult = InLine.checkAmount(am);
    if(validationResult instanceof NoConstraintViolation){
      this._amount = am;
    }else{
      throw validationResult;
    }
  }
  set total(tot){
    this._total = tot;
  }

  static checkLineId(id){
    if (!id) {
      return new NoConstraintViolation();  // may be optional as an IdRef
    } else {
      id = parseInt(id);  // convert to integer
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        return new RangeConstraintViolation(
            "The inLine ID must be a positive integer!");
      } else return new NoConstraintViolation();
    }
  };

  static async checkLineIdAsId(id) {
    let validationResult = InLine.checkLineId(id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the Line Id must be provided!");
      } else {
        const productDocSn = await getDoc(fsDoc(fsDb, "inLines", id));
        //console.log(productDocSn.exists())
        if (productDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
              "There is already a Line record with this ID!");
        } else {
          validationResult = new NoConstraintViolation();
        }
      }
    }
    return validationResult;
  };

  static async checkLineIdAsIdRef( id) {
    let constraintViolation = InLine.checkLineId( id);
    if ((constraintViolation instanceof NoConstraintViolation) && id) {
      const lineDocSn = await getDoc( fsDoc( fsDb, "inLines", String(id)));
      if (!lineDocSn.exists()) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
            `There is no line record with this line Id ${id}!`);
      }
    }
    return constraintViolation;
  };

  static checkAmount(amt){
    if(!amt){
      return new MandatoryValueConstraintViolation(
          `Amount must be provided!`);
    }else if(!isIntegerOrIntegerString(amt) && parseInt(amt)>0 ){
      return new RangeConstraintViolation(
          `Amount must a natural number`);
    }else {
      return new NoConstraintViolation();
    }
  };

}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/

InLine.converter = {
  toFirestore: function (line) {
    return {
      lineId: parseInt(line.lineId),
      productIdRef: line.productIdRef,
      productName: line.productName,
      amount: line.amount,
      total: Number(line.total)
    };
  },
  fromFirestore: function (snapshot, options) {
    const data = snapshot.data( options);
    return new InLine(data);
  }
};


/**
 * Create a Firestore document in the Firestore collection "products"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
InLine.add = async function (slots) {
  let line = null;
  //const productDocRef = fsDoc(fsDb, "products", slots.productIdRef).withConverter(Product.converter);
  try {
    // validate data by creating Product instance
    line = new InLine(slots);
    // invoke asynchronous ID/uniqueness check
    let validationResult = await InLine.checkLineIdAsId( line.lineId);
    if (!validationResult instanceof NoConstraintViolation) throw validationResult;
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    line = null;
  }
  if (line) {
    try {
      const lineDocRef = fsDoc( fsDb, "inLines", line.lineId).withConverter( InLine.converter);
      await setDoc( lineDocRef, line);
      console.log(`InLine record "${line.lineId}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    }
  }
};
/**
 * Load a product record from Firestore
 * @param productId: {object}
 * @returns {Promise<*>} productRecord: {array}
 */
InLine.retrieve = async function (lineId) {
  try {
    const lineRec = (await getDoc(fsDoc( fsDb, "inLines", lineId).withConverter( InLine.converter))).data();
    console.log(`InLine record "${lineRec.lineId}" retrieved.`);
    return lineRec;
  } catch( e) {
    console.error(`Error when retrieving product record: ${e}`);
    return null;
  }
};
/**
 * Load all product records from Firestore
 * @returns {Promise<*>} productRecords: {array}
 */
InLine.retrieveAll = async function (ord) {
  if (!ord) ord = "lineId";
  const linesCollRef = fsColl( fsDb, "inLines"),
      q = fsQuery( linesCollRef, orderBy(ord));
  try {
    const lineRecs = (await getDocs( q.withConverter( InLine.converter))).docs.map( d => d.data());
    console.log(`${lineRecs.length} inLines records retrieved ${ord ? "ordered by " + ord : ""}`);
    return lineRecs;
  } catch (e) {
    console.error(`Error retrieving InLines records: ${e}`);
  }
};

/**
 * inLine pagination
 */
InLine.retrieveBlock = async function (params){
  try {
    let linesCollRef = fsColl( fsDb, "inLines");
    // set limit and order in query
    linesCollRef = fsQuery( linesCollRef, limit( 21));
    if (params.order) linesCollRef = fsQuery( linesCollRef, orderBy( params.order));
    // set pagination "startAt" cursor
    if (params.cursor) {
      if (params.order === "lineId")
        linesCollRef = fsQuery( linesCollRef, startAt( params.cursor));
      else linesCollRef = fsQuery( linesCollRef, startAt( params.cursor));
    }
    const lineRecs = (await getDocs( linesCollRef
        .withConverter( InLine.converter))).docs.map( d => d.data());
    if (lineRecs.length) {
      console.log(`Block of line records retrieved! (cursor: ${lineRecs[0][params.order]})`);
    }
    return lineRecs;
  } catch (e) {
    console.error(`Error retrieving all line records: ${e}`);
  }
}


/**
 * Delete a Firestore document from the Firestore collection "products"
 * @param productId: {string}
 * @returns {Promise<void>}
 */
InLine.destroy = async function (lineId) {

  const ordersCollRef = fsColl( fsDb, "orders"),
      inLinesCollRef = fsColl( fsDb, "inLines"),
      inLineDocRef = (await getDoc(fsDoc( inLinesCollRef, lineId).withConverter( InLine.converter))).data()

  try {
    const inLineRef = {id: parseInt(lineId), amount: inLineDocRef.amount, name: inLineDocRef.productName,   price:inLineDocRef.total },
        q = fsQuery( ordersCollRef, where("orderLineIdRef", "array-contains", inLineRef)),
        orderQrySns = (await getDocs( q)),
        batch = writeBatch( fsDb); // initiate batch write
    // iterate and delete associations in order records
    await Promise.all( orderQrySns.docs.map( d => {
      let orderDocRef = fsDoc(ordersCollRef, d.id);
      batch.update(orderDocRef, {orderLineIdRef: arrayRemove(inLineRef)});
    }));
    batch.commit(); // commit batch write
    console.log(`inLine record ${lineId} deleted!`);
  } catch (e) {
    console.error(`Error deleting inLine record: ${e}`);
  }
  await deleteDoc(fsDoc( fsDb, "inLines", lineId));
};

InLine.update = async function(slots){
  console.log(slots)
  let noConstraintViolated = true,
      validationResult = null,
      linesBeforeUpdate = null;
  const ordersCollRef = fsColl (fsDb, "orders"),
      linesCollRef = fsColl( fsDb, "inLines"),
      q = fsQuery( linesCollRef, where("productIdRef", "==", slots.productId)),
      updatedSlots = {},
      updatedLine = {};
  const linesDocSn = (await getDocs( q));

  for( let i = 0; i <linesDocSn.docs.length; i++ ) {
    const lineDocRef = await  fsDoc(fsDb, "inLines",String(linesDocSn.docs[i].data().lineId))
    try {
      // retrieve up-to-date product record
      linesBeforeUpdate = linesDocSn.docs[i].data();
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
    try {
      if (linesBeforeUpdate.productName !== slots.name) {
        // I don't need to call checker at this stage because the name was already checked by Product class
        updatedSlots.productName = slots.name;
        updatedLine.productName = slots.name;
      }
      // I divide the total by the amount to get price of single product
      if ((linesBeforeUpdate.total / linesBeforeUpdate.amount) !== Number(slots.price)) {
        // no need to run checker since the code I received is already validated.
        // if the price is not equal then I save it, but before I need to multiply it with the amount of product in the line
        updatedSlots.price = Number(slots.price) * linesBeforeUpdate.amount;
        updatedLine.total = Number(slots.price) * linesBeforeUpdate.amount;
      }
    } catch (e) {
      noConstraintViolated = false;
      console.error(`${e.constructor.name}: ${e.message}`);
    }
    if (noConstraintViolated) {
      const updatedProperties = Object.keys(updatedSlots);


      if (updatedProperties.length) {
        try {
          const linesRefBefore
                  = {
                id: parseInt(linesBeforeUpdate.lineId),
                name: linesBeforeUpdate.productName,
                amount: linesBeforeUpdate.amount,
                price: linesBeforeUpdate.total
              },
              lineRefAfter = {
                id: parseInt(linesBeforeUpdate.lineId),
                name: slots.name,
                amount: linesBeforeUpdate.amount,
                price: slots.price * linesBeforeUpdate.amount
              },
              q = fsQuery(ordersCollRef, where("orderLineIdRef", "array-contains",
                  linesRefBefore)),
              bookQrySns = (await getDocs(q)),
              batch = writeBatch(fsDb); // initiate batch write
          // iterate and update associations in book records
          await Promise.all(bookQrySns.docs.map(d => {
            let orderDocRef = fsDoc(ordersCollRef, d.id);
            batch.update(orderDocRef, {orderLineIdRef: arrayRemove(linesRefBefore)});
            batch.update(orderDocRef, {orderLineIdRef: arrayUnion(lineRefAfter)});
          }));
          // update line object
          batch.update(lineDocRef, updatedLine);
          batch.commit(); // commit batch write
        } catch (e) {
          console.error(`${e.constructor.name}: ${e.message}`);
        }
        console.log(`Property(ies) "${updatedProperties.toString()}" modified for author record "${slots.name}"`);
      } else {
        console.log(`No property value changed for product record "${slots.productId}"!`);
      }
    }
  }
 // }
}


/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 * Create 5 records for every product record
 */
InLine.generateData = async function (product, testData) {
  try {
    console.log("Generating data...");
    // to fetch the least amount of data I use the descending order and limit the amount to 1
    // this way I will get the document with the highest lineId
    const lineCollRef = fsColl( fsDb, "inLines"),
        w = fsQuery( lineCollRef, orderBy("lineId", "desc", "limit(1)"));
    const lineRecs = (await getDocs( w.withConverter( InLine.converter))).docs.map( d => d.data());
    let id = 1;
    if(lineRecs.length>0 && testData === true){
      id = lineRecs.length + 1;
    }else if(testData === false && lineRecs.length>0){
      id = lineRecs[0].lineId +1;
    }
    for( let i = 1; i <6; i++ ){
      let slots = {
        lineId: String(id),
        productIdRef: product.productId,
        productName: product.name,
        amount: i,
        total: (i*product.price)
      }
     await InLine.add(slots)
      id = parseInt(id) +1;
    }
    console.log(`5 lines for Product Id: ${product.productId} under name: ${product.name} records saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 *
InLine.clearData = async function () {
  if (confirm("Do you really want to delete all product records?")) {
    try {
      const productCollRef = fsColl( fsDb, "products");
      console.log("Clearing test data...");
      const productQrySns = (await getDocs( productCollRef));
      await Promise.all( productQrySns.docs.map( d => Product.destroy( d.id)))
      console.log(`${productQrySns.docs.length} product records deleted.`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
  }
};



Product.observeChanges = async function (productId) {
  try {
    // listen document changes, returning a snapshot (snapshot) on every change
    const productDocRef = fsDoc( fsDb, "products", productId).withConverter( Product.converter);
    const productRec = (await getDoc( productDocRef)).data();
    return onSnapshot( productDocRef, function (snapshot) {
      // create object with original document data
      const originalData = { itemName: "product", description: `${productRec.productId} (ID: ${productRec.productId })`};
      if (!snapshot.data()) { // removed: if snapshot has not data
        originalData.type = "REMOVED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      } else if (JSON.stringify( productRec) !== JSON.stringify( snapshot.data())) {
        originalData.type = "MODIFIED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      }
    });
  } catch (e) {
    console.error(`${e.constructor.name} : ${e.message}`);
  }
}
 */


export default InLine;
