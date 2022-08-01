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
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, onSnapshot,
  orderBy, query as fsQuery, setDoc, updateDoc, writeBatch,Timestamp, startAt, limit,where, deleteField  }
  from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore-lite.js";
import { isNonEmptyString, createModalFromChange, date2IsoDateString }
  from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation }
  from "../../lib/errorTypes.mjs";
import InLine from "./InLine.mjs";
import Product from "./Product.mjs";

/**
 * Constructor function for the class Order
 * @constructor
 * @param {slots - Object creation slots.
 */
class Order {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({orderId, customerName, dateOfPurchase, deliveryAddress, orderLineIdRef, finalPrice}) {
    this.orderId = orderId;
    this.customerName = customerName;
    this.dateOfPurchase = dateOfPurchase;
    this.deliveryAddress = deliveryAddress;
    this.orderLineIdRef = orderLineIdRef;
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
  get orderLineIdRef(){
    return this._orderLineIdRef;
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

  set orderLineIdRef(line){
    this._orderLineIdRef = line;
  }

  addOrderLine(line){
    this._orderLineIdRef.push(line);
  }

  removeOrderLine(line){
    this._orderLineIdRef = this._orderLineIdRef.filter( d=> d.id !== line.id);
  }


  /**
   * checkers
   */
  static checkOrderId(id) {
    if (!id) return new MandatoryValueConstraintViolation("Order Id must be provided");
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
  static async checkOrderIdAsIdRef ( id) {
    let validationResult = Order.checkOrderId(id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the OrderId must be provided!");
      } else {
        const orderDocSn = await getDoc(fsDoc(fsDb, "orders", id));
        if (!orderDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
              `There is no Order record with this orderId ${id}!`);
        } else validationResult = new NoConstraintViolation();
      }
    }
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
      dateOfPurchase: Timestamp.fromDate( new Date(order.dateOfPurchase)),
      deliveryAddress: order.deliveryAddress,
      orderLineIdRef:  order.orderLineIdRef,
      finalPrice: order.finalPrice
    };
  },
  fromFirestore: function (snapshot, options) {
    const order = snapshot.data(options);
    const data = {
      orderId: order.orderId,
      customerName: order.customerName,
      dateOfPurchase: order.dateOfPurchase.toDate().toLocaleDateString(),
      deliveryAddress: order.deliveryAddress,
      orderLineIdRef:  order.orderLineIdRef,
      finalPrice: order.finalPrice
    };
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
    slots.finalPrice = 1;
    order = new Order( slots);
    // invoke asynchronous ID/uniqueness check
    let validationResult = await Order.checkOrderIdAsId( order.orderId);
    if (!validationResult instanceof NoConstraintViolation) throw validationResult;
    let total = 0.00;
    for (const ord of order.orderLineIdRef){
      const validationResult = await InLine.checkLineIdAsIdRef(String(ord.id));
      total = total + ord.price;
      if(!validationResult instanceof NoConstraintViolation){
        throw validationResult;
      }
    }
    order.finalPrice = total;
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    order = null;
  }
  if (order) {
    order.dateOfPurchase = new Date(order.dateOfPurchase)
    try {
      const orderDocRef = fsDoc( fsDb, "orders", order.orderId).withConverter( Order.converter);;
      await setDoc( orderDocRef, order);
      console.log(orderDocRef)
      console.log(order)
      console.log(`Order record "${order.orderId}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    }
  }

};
/**
 * count the new total Price
 */
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
 * Order pagination
 */
Order.retrieveBlock = async function (params){
  try {
    let orderCollRef = fsColl( fsDb, "orders");
    // set limit and order in query
    orderCollRef = fsQuery( orderCollRef, limit( 21));
    if (params.order) orderCollRef = fsQuery( orderCollRef, orderBy( params.order));
    // set pagination "startAt" cursor
    if (params.cursor) {
      if (params.order === "orderId")
        orderCollRef = fsQuery( orderCollRef, startAt( params.cursor));
      else orderCollRef = fsQuery( orderCollRef, startAt( params.cursor));
    }
    const orderRecs = (await getDocs( orderCollRef
        .withConverter( Order.converter))).docs.map( d => d.data());
    if (orderRecs.length) {
      console.log(`Block of order records retrieved! (cursor: ${orderRecs[0][params.order]})`);
    }
    return orderRecs;
  } catch (e) {
    console.error(`Error retrieving all order records: ${e}`);
  }
}
/**
 * Update a Firestore document in the Firestore collection "orders"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Order.update = async function (orderId, customerName, dateOfPurchase, deliveryAddress, orderLineIdRefToAdd, orderLineIdRefToRemove, finalPrice) {
  let orderBeforeUpdate = null;
  let validationResult = null;
  const updatedSlots = {}
  // retrieve up-to-date order record
  const orderDocRef = fsDoc(fsDb, "orders", orderId).withConverter(Order.converter);
  // convert from string to integer
  try {
    orderBeforeUpdate = (await getDoc(orderDocRef)).data();
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
  if (orderBeforeUpdate) {
    if (orderBeforeUpdate.dateOfPurchase!== (new Date(dateOfPurchase)).toLocaleDateString()) updatedSlots.dateOfPurchase = dateOfPurchase;
    if (orderBeforeUpdate.customerName !== customerName) updatedSlots.customerName = customerName;
    if (orderBeforeUpdate.deliveryAddress !== deliveryAddress) updatedSlots.deliveryAddress = deliveryAddress;
    if (orderLineIdRefToAdd){
      updatedSlots.finalPrice = Number(orderBeforeUpdate.finalPrice)

      for (const orderIdRef of orderLineIdRefToAdd) {
        orderBeforeUpdate.addOrderLine(orderIdRef);
        updatedSlots.finalPrice = updatedSlots.finalPrice + (Number(orderIdRef.price));
      }

    }
    if (orderLineIdRefToRemove) {
      if(!updatedSlots.finalPrice){
        updatedSlots.finalPrice = Number(orderBeforeUpdate.finalPrice)
      }
      for (const orderIdRef of orderLineIdRefToRemove){
        orderBeforeUpdate.removeOrderLine(orderIdRef);

        updatedSlots.finalPrice = updatedSlots.finalPrice - (Number(orderIdRef.price));
      }
    }
    if (orderLineIdRefToAdd || orderLineIdRefToRemove) updatedSlots.orderLineIdRef = orderBeforeUpdate.orderLineIdRef;
  }
  const updatedProperties = Object.keys(updatedSlots);
  if (updatedProperties.length ) {
    try {
      if (updatedSlots.dateOfPurchase) {
        validationResult = Order.checkDateOfPurchase(dateOfPurchase);
        updatedSlots.dateOfPurchase = new Date(updatedSlots.dateOfPurchase)
        if (!validationResult instanceof NoConstraintViolation) throw validationResult;
      }
      if (updatedSlots.customerName) {
        validationResult = Order.checkCustomerName(customerName);
        if (!validationResult instanceof NoConstraintViolation) throw validationResult;
      }
      if (updatedSlots.deliveryAddress) {
        validationResult = Order.checkDeliveryAddress(deliveryAddress);
        if (!validationResult instanceof NoConstraintViolation) throw validationResult;
      }
      if (updatedSlots.finalPrice) {
        updatedSlots.finalPrice = Number(updatedSlots.finalPrice);
        validationResult = Order.checkFinalPrice(finalPrice);
        if (!validationResult instanceof NoConstraintViolation) throw validationResult;
      }
      if (orderLineIdRefToAdd) {
        await Promise.all(orderLineIdRefToAdd.map(async ord => {
          validationResult = await InLine.checkLineIdAsIdRef(ord.id);
          if (!validationResult instanceof NoConstraintViolation) throw validationResult;
        }));
      }
      updateDoc(orderDocRef, updatedSlots);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
    console.log(`Property(ies) " ${updatedProperties.toString()}" modified for Order record " ${orderId} "`);
  } else {
    console.log(`No property value changed for order record "${orderId}"!`);
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
