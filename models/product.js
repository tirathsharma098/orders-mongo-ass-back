const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema({
    product_id: {
        type: Number,
        required: true,
        unique: true,
    },
    product_name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const Product = model("Product", productSchema);

module.exports = Product;
