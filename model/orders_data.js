const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const Schema = mongoose.Schema;

const orderData = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    orderId: {
        type: String,
        unique: true,
        required: true,
        default: `order_id_${uuidv4()}`, // generate a custom order ID using uuid
    },
    deliveryAddress: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    product: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            productTotal: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
    },
    paymentType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'pending',
    },
});

module.exports = mongoose.model('order',orderData)