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
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, onSnapshot,setDoc, updateDoc }
  from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore-lite.js";
import { isNonEmptyString, createModalFromChange }
  from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation }
  from "../../lib/errorTypes.mjs";

/**
 * Constructor function for the class Order
 * @constructor
 * @param {slots - Object creation slots.
 */
class Order {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({orderId, customerName, dateOfPurchase, deliveryAddress, finalPrice}) {
    this.orderId = orderId;
    this.customerName = customerName;
    this.dateOfPurchase = dateOfPurchase;
    this.deliveryAddress = deliveryAddress;
    this.finalPrice = finalPrice;
  }

  /**
   * geters
   */

  get orderId() {
    return this._orderId;
  }

  get customerName(){
    return this._customerName;
  }
  get dateOfPurchase() {
    return this._dateOfPurchase;
  }
  get deliveryAddress(){
    return this._deliveryAddress;
  }
  get finalPrice(){
    return this._finalPrice;
  }


  /**
   * setters
   */

  set orderId(id) {
    const validationResult = Order.checkOrderId(id);
    if (validationResult instanceof NoConstraintViolation) {
      this._orderId = id;
    } else {
      throw validationResult;
    }
  }

  set customerName(name){
    const validationResult = Order.checkCustomerName(name);
    if(validationResult instanceof NoConstraintViolation){
      this._customerName = name;
    }else {
      throw validationResult;
    }
  };
  set dateOfPurchase(date){
    const validationResult = Order.checkDateOfPurchase(date);
    if(validationResult instanceof NoConstraintViolation){
      this._dateOfPurchase = date;
    }else{
      throw validationResult;
    }
  };
  set deliveryAddress(address){
    const validationResult = Order.checkDeliveryAddress(address);
    if(validationResult instanceof NoConstraintViolation){
      this._deliveryAddress = address;
    }else{
      throw validationResult;
    }
  };
  set finalPrice(price){
    const validationResult = Order.checkFinalPrice(price);
    if(validationResult instanceof NoConstraintViolation){
      this._finalPrice = price;
    }else{
      throw validationResult;
    }
  };


  /**
   * checkers
   */
  static checkOrderId(id) {
    if (!id) return new NoConstraintViolation();
    else if (typeof (id) !== "string" || id.trim() === "") {
      return new RangeConstraintViolation(
          "The orderId must be a non-empty string!");
    } else if (!(/^[0-9]+$/.test(id))) {
      return new PatternConstraintViolation("Order Id must be a string of numbers!");
    } else {
      return new NoConstraintViolation();
    }
  };

  static async checkOrderIdAsId(id) {
    //console.log(id)
    let validationResult = Order.checkOrderId(id);
    if ((validationResult instanceof NoConstraintViolation)) {
      //console.log(id)
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the order Id must be provided!");
      } else {
        const productDocSn = await getDoc(fsDoc(fsDb, "orders", id));
        //console.log(productDocSn.exists())
        if (productDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
              "There is already a order record with this ID!");
        } else {
          validationResult = new NoConstraintViolation();
        }
      }
    }
    //console.log(validationResult)
    return validationResult;
  };


  static checkCustomerName(name){
    if(!name){
      return new MandatoryValueConstraintViolation("A name must be provided");
    } else if (!isNonEmptyString(name)){
      return new RangeConstraintViolation(
          "Name must be a non empty string");
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkDateOfPurchase(date){
    if(!date){
      return new MandatoryValueConstraintViolation("A date must be provided");
    }else{
      return new NoConstraintViolation();
    }
  };
  static checkDeliveryAddress(address){
    if(!address){
      return new MandatoryValueConstraintViolation("An address must be provided");
    } else if (!isNonEmptyString(address)) {
      return new RangeConstraintViolation(
          "address must be a non empty string");
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkFinalPrice(price){
    if (!price) {
      return new MandatoryValueConstraintViolation("price must be defined")
    }else if (isNaN(price)) {
      return new RangeConstraintViolation("price must be a number")
    }else if (parseFloat(price)<0){
      return new RangeConstraintViolation("must be higher then 0")
    }else{
      return new NoConstraintViolation();
    }
  }
}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/

Order.converter = {
  toFirestore: function (order) {
    return {
      orderId: order.orderId,
      customerName: order.customerName,
      dateOfPurchase: order.dateOfPurchase,
      deliveryAddress: order.deliveryAddress,
      finalPrice: order.finalPrice
    };
  },
  fromFirestore: function (snapshot, options) {
    const data = snapshot.data(options);
    return new Order(data);
  }

};
/**
 * Create a Firestore document in the Firestore collection "orders"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Order.add = async function (slots) {
  let order = null;
  try {
    slots.dateOfPurchase = new Date(slots.dateOfPurchase)
    // validate data by creating order instance
    order = new Order( slots);
    // invoke asynchronous ID/uniqueness check
    let validationResult = await Order.checkOrderIdAsId( order.orderId);
    if (!validationResult instanceof NoConstraintViolation) throw validationResult;
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    order = null;
  }
  if (order) {
    try {
      const orderDocRef = fsDoc( fsDb, "orders", order.orderId).withConverter( Order.converter);;
      await setDoc( orderDocRef, order);
      console.log(`Order record "${order.orderId}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    }
  }

};
/**
 * Load a order record from Firestore
 * @param orderId: {object}
 * @returns {Promise<*>} orderRecord: {array}
 */
Order.retrieve = async function (orderId) {
  let orderDocSn = null;
  try {
    const orderDocRef = fsDoc( fsDb, "orders", orderId);
    orderDocSn = await getDoc( orderDocRef);
  } catch( e) {
    console.error(`Error when retrieving order record: ${e}`);
    return null;
  }
  const orderRec = orderDocSn.data();
  return orderRec;
};
/**
 * Load all order records from Firestore
 * @returns {Promise<*>} orderRecords: {array}
 */
Order.retrieveAll = async function () {
  let ordersQrySn = null;
  try {
    const ordersCollRef = fsColl( fsDb, "orders");
    ordersQrySn = await getDocs( ordersCollRef);
  } catch( e) {
    console.error(`Error when retrieving order records: ${e}`);
    return null;
  }
  const orderDocs = ordersQrySn.docs,
      orderRecs = orderDocs.map( d => d.data());
  console.log(`${orderRecs.length} order records retrieved.`);
  return orderRecs;
};
/**
 * Update a Firestore document in the Firestore collection "orders"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Order.update = async function (slots) {
  const updSlots = {};
  // retrieve up-to-date order record
  const orderRec = await Order.retrieve( slots.orderId);
  // convert from string to integer
  if (slots.dateOfPurchase) slots.dateOfPurchase = new Date( slots.dateOfPurchase);
  // update only those slots that have changed
  if (orderRec.customerName !== slots.customerName) updSlots.customerName = slots.customerName;
  if (orderRec.dateOfPurchase !== slots.dateOfPurchase) updSlots.dateOfPurchase = slots.dateOfPurchase;
  if (orderRec.deliveryAddress !== slots.deliveryAddress) updSlots.deliveryAddress = slots.deliveryAddress;
  if(orderRec.finalPrice !== slots.finalPrice) updSlots.finalPrice = slots.finalPrice;
  if (Object.keys( updSlots).length > 0) {
    try {
      const orderDocRef = fsDoc( fsDb, "orders", slots.orderId);
      await updateDoc( orderDocRef, updSlots);
      console.log(`Order record ${slots.orderId} modified.`);
    } catch( e) {
      console.error(`Error when updating order record: ${e}`);
    }
  }
};
/**
 * Delete a Firestore document from the Firestore collection "orders"
 * @param orderId: {string}
 * @returns {Promise<void>}
 */
Order.destroy = async function (orderId) {
  try {
    await deleteDoc( fsDoc( fsDb, "orders", orderId));
    console.log(`Order record ${orderId} deleted.`);
  } catch( e) {
    console.error(`Error when deleting order record: ${e}`);
  }
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 * Create test data
 */
Order.generateTestData = async function () {
  try {
    console.log("Generating test data...");
    const response = await fetch( "../../test-data/orders.json");
    const orderRecs = await response.json();
    await Promise.all( orderRecs.map( d => Order.add( d)));
    console.log(`${orderRecs.length} order records saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 */
Order.clearData = async function () {
  if (confirm("Do you really want to delete all order records?")) {
    // retrieve all order documents from Firestore
    const orderRecs = await Order.retrieveAll();
    // delete all documents
    await Promise.all( orderRecs.map( d => Order.destroy( d.orderId)));
    // ... and then report that they have been deleted
    console.log(`${Object.values( orderRecs).length} order records deleted.`);
  }
};


Order.observeChanges = async function (orderId) {
  try {
    // listen document changes, returning a snapshot (snapshot) on every change
    const orderDocRef = fsDoc( fsDb, "orders", orderId).withConverter( Order.converter);
    const orderRec = (await getDoc( orderDocRef)).data();
    return onSnapshot( orderDocRef, function (snapshot) {
      // create object with original document data
      const originalData = { itemName: "order", description: `${orderRec.customerName} (ID: ${orderRec.orderId })`};
      if (!snapshot.data()) { // removed: if snapshot has not data
        originalData.type = "REMOVED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      } else if (JSON.stringify( orderRec) !== JSON.stringify( snapshot.data())) {
        originalData.type = "MODIFIED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      }
    });
  } catch (e) {
    console.error(`${e.constructor.name} : ${e.message}`);
  }
}

export default Order;
