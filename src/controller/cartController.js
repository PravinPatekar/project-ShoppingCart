const mongoose = require('mongoose');
const productModel = require("../model/productModel");
const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const jwt = require('jsonwebtoken')

const { isValid, priceRegex, strRegex, isString, isValidObjectId } = require('../validator/validator')  // IMPORTING VALIDATORS

const createCart = async function (req, res) {
  try {

    //request userId from path params
    const userId = req.params.userId;

    //userIdId validation => userIdId is valid ObjcetId or not
    if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please provide valid User Id!" });

    // Destructuring
    let { quantity, productId, cartId } = req.body;

    //request body validation => request body must not be empty
    if (!isValid(req.body)) return res.status(400).send({ status: false, message: "Please provide valid request body!" });

    //productId validation => productId is valid ObjectId or not
    if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please provide valid Product Id!" });

    //quantity validation => if not given in request body, consider 1
    if (!quantity) {
      quantity = 1;
    }
    else {
      //quantity must be a valid number and greater than 1
      if (quantity < 1) {
        return res.status(400).send({ status: false, message: "Quantity cannot be less than 1" })
      }
    }

    //DB call => find user from userModel by userId
    const findUser = await userModel.findById({ _id: userId });

    //user not found in DB
    if (!findUser) {
      return res.status(404).send({ status: false, message: `User doesn't exist by ${userId}!` });
    }

    //DB call => find product from productModel by productId
    const findProduct = await productModel.findById({ _id: productId });

    //product not found in DB
    if (!findProduct) {
      return res.status(404).send({ status: false, message: `Product doesn't exist by ${productId}!` });
    }

    //cart validation => if cartId given in request body 
    if (cartId) {

      //cartId must be a valid objectId
      if (!isValidObjectId(cartId)) {
        return res.status(400).send({ status: false, message: "Please provide valid cartId!" });
      }

      //Unique cart Validation => checking from DB that cart present in DB or not
      let duplicateCart = await cartModel.findOne({ userId: userId })

      //cart not present in the DB
      if (!duplicateCart) {
        return res.status(404).send({ status: false, message: "cart does not exists!" })
      }
    }
    //if cartId not given in request body
    //DB call => find cart from cartModel by userId
    const findCartOfUser = await cartModel.findOne({ userId: userId })
    //if cart not found for user
    if (!findCartOfUser) {
      //create cart for the user
      // Destructuring
      let cartData = {
        userId: userId,
        items: [
          {
            productId: productId,
            quantity: quantity,
          },
        ],
        totalPrice: findProduct.price * quantity,
        totalItems: 1,
      };

      //Create cart for the user and store in DB
      const createCart = await cartModel.create(cartData);

      //successfull creation of a new cart for user response
      return res.status(201).send({ status: true, message: `Cart created successfully`, data: createCart });
    }

    //if cart found in DB for the user
    if (findCartOfUser) {
      // price update => previously present price sum with newly added product price with respect to their quantity 
      let price = findCartOfUser.totalPrice + quantity * findProduct.price;
      //declare a array by select items from cart
      let arr = findCartOfUser.items;
      //add new product to the cart and also update previously present product count
      for (i in arr) {
        ///checking product by productId from cart and also from request body
        if (arr[i].productId.toString() === productId) {
          //update quantity by adding new quantity
          arr[i].quantity += quantity;
          // Destructuring => items, total price and total items
          let updatedCart = {
            items: arr,
            totalPrice: price,
            totalItems: arr.length,    // 
          };

          //DB call and Update => update product details in cart by requested body parameters 
          let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true });
          //Successfull upadte products in cart details return response to body
          return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData });

        }
      }

      //add products and update cart
      arr.push({ productId: productId, quantity: quantity });
      //Destructuring
      let updatedCart = { items: arr, totalPrice: price, totalItems: arr.length };
      //DB call and Update => update product details in cart by requested body parameters
      let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true });
      //Successfull upadate products in cart details return response to body
      return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData });
    }
  }
  catch (error) {
    res.status(500).send({ status: false, data: error.message });
  }
};


 const getCartById = async (req, res) => {
  try {
    let userId = req.params.userId
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "Please provide a valid userId." })
    }
    let user = await userModel.findById(userId)
    if (!user) {
      return res.status(400).send({ status: false, message: "this user doesnot exists" })
    }
    let cart = await cartModel.findOne({ "userId": userId })
    if (!cart) {
      return res.status(400).send({ status: false, message: "this user doesnot have any cart exists" })
    }
    // console.log(cart)
    let productId = cart.items[0].productId.toString()
    let product = await productModel.findById(productId)
    let cartData = { cart: cart, product: product }
       return res.status(200).send({ status: true, message: "Success", data: cartData })

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

// Destructuring & Exporting
module.exports = { createCart, getCartById}

