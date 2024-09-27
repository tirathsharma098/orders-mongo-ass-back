const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Product = require("../../models/product");
const Order = require("../../models/order");
const path = require("path");

main().catch((err) => console.log("Database Error Occured", err));
async function main() {
    await mongoose.connect("mongodb://localhost:27017/techno-product-order");
    console.log("connected to database Successfully.");

    try {
        const filePath = path.resolve(__dirname, "./products_orders.csv");
        console.log("Starting CSV data import...");
        await importOrders(filePath);
        console.log("Data import completed.");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error occurred while inserting order data", error);
        mongoose.connection.close();
    }
}

let products = new Map();
let orders = [];

async function insertProducts() {
    const productsToInsert = Array.from(products.values());
    if (productsToInsert.length > 0) {
        await Product.insertMany(productsToInsert);
        console.log(
            `${productsToInsert.length} products inserted successfully`
        );
    } else {
        console.log("Products not found");
    }
}

async function insertOrders(size = 5000) {
    let totalOrders = orders.length;
    let insertedOrders = 0;
    while (insertedOrders < totalOrders) {
        const ordersToInsert = orders.slice(
            insertedOrders,
            insertedOrders + size
        );
        await Order.insertMany(ordersToInsert);
        insertedOrders += ordersToInsert.length;
        console.log(
            `${insertedOrders}/${totalOrders} orders inserted successfully.`
        );
    }
    console.log("Orders inserted successfully");
}

function importOrders(filePath) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                const newProductId = new mongoose.Types.ObjectId();
                let currentP = products.get(Number(row.product_id));
                if (!currentP) {
                    products.set(Number(row.product_id), {
                        _id: newProductId,
                        product_name: row.product_name,
                        product_id: row.product_id,
                    });
                    currentP = {
                        _id: newProductId,
                    };
                }

                orders.push({
                    product_id: row.product_id,
                    product_name: row.product_name,
                    admin_price: Number(row.admin_price),
                    sale_price: Number(row.sale_price),
                    quantity: Number(row.quantity),
                    order_date: new Date(row.order_date),
                });
            })
            .on("end", async () => {
                console.log("Product and Orders added successfully");
                await insertProducts();
                await insertOrders();
                resolve();
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}
