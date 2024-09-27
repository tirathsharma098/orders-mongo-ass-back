const router = require("express").Router();
const { getOrderList,getTotalProducts,getTotalOfSales } = require("../controllers/order");

router.get(
    "/get-list",
    getOrderList.validator ,
    getOrderList.controller
);
router.get(
    "/total-product",
    getTotalProducts.controller
);
router.get(
    "/total-sales",
    getTotalOfSales.controller
);

module.exports = router;
