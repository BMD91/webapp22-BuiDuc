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
  orderBy, query as fsQuery, setDoc, updateDoc, writeBatch, startAt, limit,where, deleteField  }
  from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore-lite.js";
import {isIntegerOrIntegerString, createModalFromChange, isNonEmptyString}
  from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, ReferentialIntegrityConstraintViolation,
  RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation }
  from "../../lib/errorTypes.mjs";
import Enumeration from "../../lib/Enumeration.mjs";
import InLine from "./InLine.mjs";
import Order from "./Order.mjs";


const VaseSizeEL = new Enumeration(["small", "medium", "large", "x-large"]);
const CategoryEL = new Enumeration(["Plant", "Vase"]);

/**
 * Constructor function for the class Product
 * @constructor
 * @param {{productId:: string, vaseSize:: enum}} slots - Object creation slots.
 */
class Product {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({productId, vaseSize, category, name, price}) {
    this.productId = productId;
    this.vaseSize = vaseSize;
    this.category = category;
    this.name = name;
    this.price = price;
  };
  get productId(){
    return this._productId;
  };
  get vaseSize(){
    return this._vaseSize;
  }
  get category(){
    return this._category;
  }
  get name(){
    return this._name;
  }
  get price(){
    return this._price;
  }
  set productId(id){
    const validationResult = Product.checkProductId(id);
    if(validationResult instanceof NoConstraintViolation){
      this._productId = id;
    }else{
      throw validationResult;
    }
  };
  set vaseSize(size){
    const validationResult = Product.checkVaseSize(size);
    if(validationResult instanceof NoConstraintViolation){
      this._vaseSize = parseInt(size);
    }else{
      throw validationResult;
    }
  };
  set category(cat){
    const validationResult = Product.checkCategory(cat);
    if(validationResult instanceof  NoConstraintViolation){
      this._category = parseInt(cat);
    }else{
      throw validationResult;
    }
  }
  set name(nam){
    const validationResult = Product.checkName(nam);
    if(validationResult instanceof NoConstraintViolation){
      this._name = nam;
    }else{
      throw validationResult;
    }
  }
  set price(pri){
    const validationResult = Product.checkPrice(pri);
    if(validationResult instanceof NoConstraintViolation){
      this._price = pri;
    }else{
      throw validationResult;
    }
  }
  static checkProductId(id){
    if (!id) return new NoConstraintViolation();
    else if (typeof (id) !== "string" || id.trim() === "") {
      return new RangeConstraintViolation(
          "The product Id must be a non-empty string!");
    } else if (!(/^[0-9]+$/.test(id))) {
      return new PatternConstraintViolation("Product Id must be a string of numbers!");
    } else {
      return new NoConstraintViolation();
    }
  };

  static async checkProductIdAsId(id) {
    //console.log(id)
    let validationResult = Product.checkProductId(id);
    //console.log(validationResult)
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the Product Id must be provided!");
      } else {
        const productDocSn = await getDoc(fsDoc(fsDb, "products", id));
        //console.log(productDocSn.exists())
        if (productDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
              "There is already a product record with this ID!");
        } else {
          validationResult = new NoConstraintViolation();
        }
      }
    }
    //console.log(validationResult)
    return validationResult;
  };
  static async checkProductIdAsIdRef( id) {
    let constraintViolation = Product.checkProductId( id);
    if ((constraintViolation instanceof NoConstraintViolation) && id) {
      const authorDocSn = await getDoc( fsDoc( fsDb, "products", String(id)));
      if (!authorDocSn.exists()) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
            `There is no product record with this product ID ${id}!`);
      }
    }
    return constraintViolation;
  };
  static checkVaseSize(size){
    if(!size){
      return new MandatoryValueConstraintViolation(
          `Vase Size must be provided!`);
    }else if(!isIntegerOrIntegerString(size)|| parseInt(size) < 1 || parseInt(size) > VaseSizeEL.MAX ){
      return new RangeConstraintViolation(
          `Invalid value for vase size ${size}`);
    }else {
      return new NoConstraintViolation();
    }
  };
  static checkCategory(cat){
    if(!cat){
      return new MandatoryValueConstraintViolation(
          `Category is mandatory!`);
    }else if(!isIntegerOrIntegerString(cat)|| parseInt(cat) < 1 || parseInt(cat)>CategoryEL.MAX){
      return new RangeConstraintViolation(
          `Invalid value for category ${cat}`);
    }else{
      return new NoConstraintViolation();
    }
  };
  static checkName(nam){
    if(!nam){
      return new MandatoryValueConstraintViolation(
          "Name is mandatory!");
    }else if(!isNonEmptyString(nam)){
      return new RangeConstraintViolation(
          "Name has to be a non empty string");
    }else{
      return new NoConstraintViolation();
    }
  };
  static checkPrice(price){
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

Product.converter = {
  toFirestore: function (product) {
    return {
      productId: product.productId,
      vaseSize: parseInt(product.vaseSize),
      category: parseInt(product.category),
      name: product.name,
      price: Number(product.price)
    };
  },
  fromFirestore: function (snapshot, options) {
    const product = snapshot.data( options),
        data = {
          productId: product.productId,
          vaseSize: parseInt(product.vaseSize),
          category: parseInt(product.category),
          name: product.name,
          price: Number(product.price)
        };
    if (product.productId) data.productId = product.productId;

    return new Product(data);
  }
};


/**
 * Create a Firestore document in the Firestore collection "products"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Product.add = async function (slots) {
  let product = null;
  try {
    // validate data by creating Product instance
    product = new Product(slots);
    // invoke asynchronous ID/uniqueness check
    let validationResult = await Product.checkProductIdAsId( product.productId);
    if (!validationResult instanceof NoConstraintViolation) throw validationResult;
    validationResult = await Product.checkProductIdAsIdRef( product.productId);
    if (!validationResult instanceof NoConstraintViolation) throw validationResult;
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    product = null;
  }
  if (product) {
    try {
      const productDocRef = fsDoc( fsDb, "products", product.productId).withConverter( Product.converter);
      await setDoc( productDocRef, product);
      console.log(`Product record "${product.productId}" created!`);
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
Product.retrieve = async function (productId) {
  try {
    const productRec = (await getDoc(fsDoc( fsDb, "products", productId).withConverter( Product.converter))).data();
    console.log(`Product record "${productRec.productId}" retrieved.`);
    return productRec;
  } catch( e) {
    console.error(`Error when retrieving product record: ${e}`);
    return null;
  }
};
/**
 * Load all product records from Firestore
 * @returns {Promise<*>} productRecords: {array}
 */
Product.retrieveAll = async function (ord) {
  if (!ord) ord = "productId";
  const productsCollRef = fsColl( fsDb, "products"),
      q = fsQuery( productsCollRef, orderBy(ord));
  try {
    const productRecs = (await getDocs( q.withConverter( Product.converter))).docs.map( d => d.data());
    console.log(`${productRecs.length} product records retrieved ${ord ? "ordered by " + ord : ""}`);
    return productRecs;
  } catch (e) {
    console.error(`Error retrieving product records: ${e}`);
  }
};
/**
 * Product pagination
 */
Product.retrieveBlock = async function (params){
  try {
    let productCollRef = fsColl( fsDb, "products");
    // set limit and order in query
    productCollRef = fsQuery( productCollRef, limit( 21));
    if (params.order) productCollRef = fsQuery( productCollRef, orderBy( params.order));
    // set pagination "startAt" cursor
    if (params.cursor) {
      if (params.order === "productId")
        productCollRef = fsQuery( productCollRef, startAt( params.cursor));
      else productCollRef = fsQuery( productCollRef, startAt( params.cursor));
    }
    const productRecs = (await getDocs( productCollRef
        .withConverter( Product.converter))).docs.map( d => d.data());
    if (productRecs.length) {
      console.log(`Block of product records retrieved! (cursor: ${productRecs[0][params.order]})`);
    }
    return productRecs;
  } catch (e) {
    console.error(`Error retrieving all product records: ${e}`);
  }
}
/**
 * Update a Firestore document in the Firestore collection "products"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Product.update = async function (slots) {
  let noConstraintViolated = true,
      validationResult = null,
      productBeforeUpdate = null;
  const productDocRef = fsDoc( fsDb, "products", slots.productId).withConverter( Product.converter),
      updatedSlots = {};
  //productDocRef.price = Number(productDocRef.price)
  slots.price = Number(slots.price)
  try {
    // retrieve up-to-date product record
    const productDocSn = await getDoc( productDocRef);
    productBeforeUpdate = productDocSn.data();
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
  try {
    if(productBeforeUpdate.name !== slots.name){
      validationResult = Product.checkName(slots.name);
      if(validationResult instanceof NoConstraintViolation){
        updatedSlots.name = slots.name;
      }else throw validationResult;
    }
    if(productBeforeUpdate.vaseSize !== parseInt(slots.vaseSize)){
      validationResult = Product.checkVaseSize(slots.vaseSize);
      if(validationResult instanceof NoConstraintViolation){
        updatedSlots.vaseSize = parseInt(slots.vaseSize);
      }else throw validationResult;
    }
    if(productBeforeUpdate.category !== parseInt(slots.category)){
      validationResult = Product.checkCategory(slots.category);
      if(validationResult instanceof NoConstraintViolation){
        updatedSlots.category = parseInt(slots.category);
      }else throw validationResult;
    }
    if(productBeforeUpdate.price !== Number(slots.price)){
      validationResult = Product.checkPrice(slots.price);
      if(validationResult instanceof NoConstraintViolation){
        updatedSlots.price = slots.price;
      }else throw validationResult;
    }
  }catch (e){
    noConstraintViolated = false;
    console.error(`${e.constructor.name}: ${e.message}`);
  }
  if (noConstraintViolated) {
    const updatedProperties = Object.keys(updatedSlots);
    if (updatedProperties.length) {
      await updateDoc( productDocRef, updatedSlots);
      console.log(`Property(ies) "${updatedProperties.toString()}" modified for product record "${slots.productId}"`);
      // I use this if statement to check if name or price have been changed since these are the only
      // properties that are duplicated in inLine, therefore calling the update when any other property has been changed
      // is a waste of resources
      if(updatedProperties.includes("name") || updatedProperties.includes("price")){
      await InLine.update(slots);}
    } else {
      console.log(`No property value changed for product record "${slots.productId}"!`);
    }
  }
};
/**
 * Delete a Firestore document from the Firestore collection "products"
 * @param productId: {string}
 * @returns {Promise<void>}
 */
Product.destroy = async function (productId) {
  const linesCollRef = fsColl( fsDb, "inLines"),
      q = fsQuery( linesCollRef, where("productIdRef", "==", productId)),
      productDocRef = fsDoc( fsColl( fsDb, "products"), productId);
  try {
    const lineQrySns = (await getDocs( q)),
        batch = writeBatch( fsDb); // initiate batch write
    // iterate and delete associations with book records
    await Promise.all( lineQrySns.docs.map( d => {
      InLine.destroy(d.id);
    }));
    batch.delete( productDocRef); // delete publisher record
    batch.commit(); // finish batch write
    console.log(`Product record "${productId}" deleted!`);
  } catch (e) {
    console.error(`Error deleting publisher record: ${e}`);
  }
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 * Create test data
 */
Product.generateTestData = async function () {
  try {
    console.log("Generating test data...");
    const response = await fetch( "../../test-data/product.json");
    const productRecs = await response.json();
    console.log(productRecs)
    await Promise.all( productRecs.map( d => Product.add( d)));
    const newProdRec = await Product.retrieveAll(null);
    for( let i = 1; i <= newProdRec.length; i++ ) {
      await InLine.generateData(newProdRec[i-1], true);
    }
    console.log(`${productRecs.length} product records saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 */
Product.clearData = async function () {
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

export default Product;
export {VaseSizeEL, CategoryEL};
