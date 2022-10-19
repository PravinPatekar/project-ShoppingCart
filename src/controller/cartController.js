const mongoose = require('mongoose');
const productModel = require("../model/productModel");
const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const jwt = require('jsonwebtoken')

const { isValid, priceRegex, strRegex, isString, isValidObjectId, keyValid } = require('../validator/validator')  // IMPORTING VALIDATORS

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
const cartUpdate = async function (req, res) {
  try {

    let userId = req.params.userId

    let body = req.body

    let { cartId, productId, removeProduct } = body

    if (!keyValid(body)) return res.status(400).send({ status: false, message: "Please provide data to Remove product or decrement the quantity" })

    if (!mongoose.Types.ObjectId.isValid(productId)) { return res.status(400).send({ status: false, msg: "Invalid productId" }) }

    let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })

    if (!productDetails)
      return res.status(400).send({ status: false, message: "No product Exist with provided productId or might be deleted" })

    let productCart = await cartModel.findOne({ items: { $in: { productId: { $eq: productId } } } })

    if (!productCart) return res.status(400).send({ status: false, message: `No product Exist in cart with given productId ${productId}` })

    if (!mongoose.Types.ObjectId.isValid(cartId)) { return res.status(400).send({ status: false, msg: "Invalid cartId" }) }

    let cartDetails = await cartModel.findOne({ userId })

    if (!cartDetails) return res.status(400).send({ status: false, message: "No cart Exist with provided CartId" })

    if (cartDetails._id != cartId) return res.status(400).send({ status: false, message: "Unauthorized access!, You can't remove the other user cart" })

    if (!/^[0-1\|\(\)\&]$/.test(removeProduct)) return res.status(400).send({ status: false, message: "removeProduct should contains 1 for decrement of quantity by 1 || 0 for remove the product from cart" })

    let findProduct = cartDetails.items.find(x => x.productId.toString() == productId)

    if (removeProduct == 0) {
      let sumTotal = cartDetails.totalPrice - (productDetails.price * findProduct.quantity)

      await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })

      let sumItems = cartDetails.totalItems - 1

      let deletedItem = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: sumTotal, totalItems: sumItems } }, { new: true })

      return res.status(200).send({ status: true, message: "Successfully removed the product", data: deletedItem })
    }

    let sumTotal1 = cartDetails.totalPrice - productDetails.price

    let itemsArray = cartDetails.items

    for (let i = 0; i < itemsArray.length; i++) {
      if (itemsArray[i].productId.toString() == productId) {
        itemsArray[i].quantity = itemsArray[i].quantity - 1

        if (itemsArray[i].quantity < 1) {
          await cartModel.findByIdAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })

          let sumItems = cartDetails.totalItems - 1

          let data1 = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: sumTotal1, totalItems: sumItems } }, { new: true })

          return res.status(200).send({ status: true, message: "No product exists for productId", data: data1 })
        }
      }
    }
    let res1 = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { items: itemsArray, totalPrice: sumTotal1 } }, { new: true })

    return res.status(200).send({ status: true, message: "product quantity is reduced by 1", data: res1 })

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message })
  }
}




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



const deleteUser = async function (req, res) {
  try {
    let user_id = req.params.userId
    let a = []
    if (!mongoose.isValidObjectId(user_id))
      return res.status(400).send({ status: false, message: `${user_id} is not valid` })
    let result = await cartModel.findOne({ userId: user_id })
    if (!result)
      return res.status(404).send({ status: false, message: `cart is not  exist for this ${user_id} user` })
    let data = await cartModel.findOneAndUpdate({ userId: user_id }, { $set: { items: a, totalPrice: 0, totalItems: 0 } }, { returnOriginal: false })
    return res.status(204).send()
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

// Destructuring & Exporting
module.exports = { createCart, cartUpdate, getCartById, deleteUser }

