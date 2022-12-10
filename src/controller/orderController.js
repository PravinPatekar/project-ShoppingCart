const cartModel = require("../model/cartModel");
const userModel = require("../model/userModel");
const orderModel = require("../model/orderModel")


const { keyValue, isValidObjectId, isValid, isValidstatus } = require("../validator/validator");  // IMPORTING VALIDATORS


/////////////////////////////// CREATE ORDER API ///////////////////////////////////


const createOrder = async function (req, res) {
    try {

        //request userId from path params
        const { userId } = req.params

        // Checking dublicate order 
        // const dublicateOrder = await cartModel.findById({ userId: userId });
        // if(dublicateOrder)  return res.status(400).send({ status: false, message: "Order is Already Created" });

        //userId must be a valid objectId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please provide valid User Id!" });

        // Destructuring
        const { cartId, status, cancellable } = req.body
        //request body must not be empty
        if (!keyValue(req.body)) return res.status(400).send({ status: false, message: "Please enter something!" });

        //cartId validation => cartId is mandatory and must not be empty
        if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Please provide cartId!" });
        //cartId must be a valid objectId
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please provide valid cartId!" });

        //DB call => find cart details from cartModel by userId and cartId
        const cartItems = await cartModel.findOne({ _id: cartId, userId: userId, isDeleted: false })
        //userId not present in the DB
        if (cartItems.userId != userId) return res.status(404).send({ status: false, message: `${userId} is not present in the DB!` });
        // cart not present in the DB or empty
        if (!cartItems) return res.status(400).send({ status: false, message: "Either cart is empty or does not exist!" });

        //products quantity update
        let items = cartItems.items
        let totalQuantity = 0
        for (let i = 0; i < items.length; i++) {
            totalQuantity += items[i].quantity
        }

        // cancellable validation => if key is present value must not be empty
        if (cancellable) {

            //cancellable must be true or false
            if (typeof cancellable !== "boolean") {
                return res.status(400).send({ status: false, message: "Cancellable can be either true or false!" });
            }
        }

        // status validation => if key is present value must not be empty
        if (status) {
            if (!isValidstatus(status)) return res.status(400).send({ status: false, message: "status should be on of 'pending','completed','cancelled' " })

        }

        // Destructuring
        let order = { userId: userId, items: cartItems.items, totalPrice: cartItems.totalPrice, totalItems: cartItems.totalItems, totalQuantity: totalQuantity, cancellable: cancellable, status: status }

        //Create order for the user and store in DB
        let orderCreation = await orderModel.create(order)
        //update cart on successfully complition of order and set cart as empty
        await cartModel.findOneAndUpdate({ userId: userId, isDeleted: false }, { $set: { items: [], totalPrice: 0, totalItems: 0 } })
        //Successfull oreder details return response to body
        return res.status(201).send({ status: true, message: `Success`, data: orderCreation });
    }
    catch (error) {
        res.status(500).send({ status: false, data: error.message });
    }
};

const updateOrder = async function (req, res) {
    try {
        //-----------------------------user validation-----------------------------------------//
        const userId = req.params.userId
        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId." })
        }
        const checkUser = await userModel.findById(userId)
        if (checkUser == null) {
            return res.status(404).send({ status: false, message: "user not found or it may be deleted" })
        }
        //-----------------------------------------------------------------------------------------//
        const { orderId, status } = req.body

        if (!status || !isValidstatus(status)) {
            return res.status(400).send({ status: false, message: "Please Provide value for status[pending,completed or cancled]" })
        }
        //----------------------------------------order validation---------------------------//
        if (!orderId || !isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid orderId." })
        }
        const checkOrder = await orderModel.findById(orderId)
        if (checkOrder == null || checkOrder.isDeleted == true) {
            return res.status(404).send({ status: false, message: "order not found or it may be deleted" })
        }
        //-----------------------------------checking cancellable order or not ------------------------------------------------------//
        if (checkOrder.cancellable == false && (status == 'cancled')) {
            return res.status(400).send({ status: false, message: "This order cannot cancled or already cancled" })
        }

        if (checkOrder.status == "completed") {
            return res.status(400).send({ status: false, message: "This order was completed" })
        }
        //---------------------------updating status--------------------------------------------------------------//

        const updateOrderStatus = await orderModel.findByIdAndUpdate(
            { _id: orderId },
            { $set: { "status": status } },
            { new: true }
        )

        return res.status(200).send({ status: true, message: "Success", data: updateOrderStatus })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


module.exports = { createOrder,updateOrder }
