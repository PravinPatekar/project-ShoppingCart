const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<====================  THIRD SCHEMA  ==================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\\

const cartSchema = new mongoose.Schema(
    {

        userId: {
            type: ObjectId,
            ref: "user",
            required: true,
            trim: true,
            unique: true
        },

        items: [{
            productId: {
                type: ObjectId,
                ref: "product",
                required: true,
                trim: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }],

        totalPrice: {
            type: Number,
            required: true,
            trim: true,
        },

        totalItems: {
            type: Number,
            required: true,
            trim: true,
        }

    }, { timestamps: true }
)


module.exports = mongoose.model("cart", cartSchema)