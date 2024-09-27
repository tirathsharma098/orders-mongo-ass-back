if (process.env.NODE_ENV != "production") require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const apiRoutes = require("./src/api/routes");

const isCelebrateError = require("celebrate").CelebrateError;
const helmet = require("helmet");
app.use(cors());
app.all("*", function (req, res, next) {
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With, content-type, Authorization, Accept"
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Expose-Headers", "Authorization");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    next();
});
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);
app.use(express.json());

// Connecting to database
main().catch((err) => console.log("Database Error Occured", err));
async function main() {
    await mongoose.connect("mongodb://localhost:27017/techno-product-order");
    console.log("connected to database Successfully.");
}

app.use(mongoSanitize());

// ROUTE here...

app.get("/", (req, res) => {
    res.json({
        message: "🏡 Hello 🏡",
    });
});
app.use("/api/v1", apiRoutes);

app.all("*", (req, res, next) => {
    const err = { message: "Requested page is Not FOUND", stack: "" };
    res.status(404).json(err);
});

app.use((err, req, res, next) => {
    console.log(">> ERROR OCCURRED IN ERROR HANDLER: ", err);
    const isValidationError = new isCelebrateError(err);
    const { status = 500 } = err;
    if (isValidationError) {
        const errorBody = err.details.get("body")
            ? err.details.get("body")
            : err.details.get("params")
            ? err.details.get("params")
            : err.details.get("query");
        const {
            details: [errorDetails],
        } = errorBody;
        const message = errorDetails.message;
        return res.status(status).json({ message, success: false });
    }
    let message = "O Ooo! Something Went Wrong!";
    if (err.message) message = err.message;
    return res.status(status).json({ message, success: false });
});

app.listen(3720, () => {
    console.log("Started Listening to port 3720");
});
