const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<=================== FOURTH SCHEMA ==================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\\

const orderSchema = new mongoose.Schema(
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
        },

        totalQuantity: {
            type: Number,
            required: true,
            trim: true,
        },

        cancellable: {
            type: Boolean,
            default: true
        },

        status: {
            type: String,
            default: "pending",
            enum: ["pending", "completed", "cancelled"]
        },

        deletedAt: { type: Date, default: null },

        isDeleted: { type: Boolean, default: false },

    }, { timestamps: true }
)


module.exports = mongoose.model("order", orderSchema)