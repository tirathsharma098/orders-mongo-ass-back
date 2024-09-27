const router = require("express").Router();

// Importing All routes
const orderRoute = require("./orderRoute");

// All routes
router.use("/order", orderRoute);

module.exports = router;