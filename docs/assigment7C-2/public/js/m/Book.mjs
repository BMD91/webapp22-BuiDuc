/**
 * @fileOverview  The model class Book with attribute definitions and storage management methods
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 * @copyright Copyright 2020-2022 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes,
 * Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { fsDb } from "../initFirebase.mjs";
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, setDoc, updateDoc }
  from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore-lite.js";

/**
 * Constructor function for the class Book
 * @constructor
 * @param {{isbn: string, title: string, year: number}} slots - Object creation slots.
 */
class Order {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({orderId, customerName, dateOfPurchase, deliveryAddress, finalPrice }) {
    this.orderId = orderId;
    this.customerName = customerName;
    this.dateOfPurchase = dateOfPurchase;
    this.deliveryAddress = deliveryAddress;
    this.finalPrice = finalPrice;
  }
}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 * Create a Firestore document in the Firestore collection "books"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Order.add = async function (slots) {
  const ordersCollRef = fsColl( fsDb, "orders"),
      orderDocRef = fsDoc (ordersCollRef, slots.orderId);
  slots.dateOfPurchase = new Date( slots.dateOfPurchase);  // convert from string to integer
  try {
    await setDoc( orderDocRef, slots);
    console.log(`Order record ${slots.orderId} created.`);
  } catch( e) {
    console.error(`Error when adding order record: ${e}`);
  }
};
/**
 * Load a book record from Firestore
 * @param isbn: {object}
 * @returns {Promise<*>} bookRecord: {array}
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
 * Load all book records from Firestore
 * @returns {Promise<*>} bookRecords: {array}
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
 * Update a Firestore document in the Firestore collection "books"
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
 * Delete a Firestore document from the Firestore collection "books"
 * @param isbn: {string}
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
  let orderRecs = [
    {
      orderId: "1",
      customerName: "John Doe",
      dateOfPurchase: "10/12/2012",
      deliveryAddress: "main street germany",
      finalPrice: 19.40
    },
    {
      orderId: "2",
      customerName: "Jane Miller",
      dateOfPurchase: "3-2-2021",
      deliveryAddress: "Bahnhoffstrasse Cottbus Germany",
      finalPrice: 20.32
    },
    {
      orderId: "3",
      customerName: "Tom Brady",
      dateOfPurchase: "12-3-2020",
      deliveryAddress: "Marktstrasse Cottbus Germany",
      finalPrice: 123.32
    }

  ];
  // save all order record/documents
  await Promise.all( orderRecs.map( d => Order.add( d)));
  console.log(`${Object.keys( orderRecs).length} order records saved.`);
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

export default Order;
