const celebrate = require("celebrate").celebrate;
const Joi = require("joi");
const Order = require("../../../models/order");
const Product = require("../../../models/product");
const { VALIDATOR, CONTROLLER } = require("../../utils/constants");

const getTotalProducts = {
    [CONTROLLER]: async (req, res) => {
        try{
            const totalProduct = await Product.countDocuments();
            return res.status(200).json({message: "Total of products got successfully", success: true, data: totalProduct})
        } catch (err){
            console.log(err);
            res.status(400).json({message: "Something went wrong", success: false, data: {}})
        }
}
}


const getTotalOfSales = {
    [CONTROLLER]: async (req, res) => {
        try{
            const totalProduct = await Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalSalePrice: { $sum: "$sale_price" },
                        totalAdminPrice: { $sum: "$admin_price" },
                        totalOrders: { $sum: 1 },
                    }
                }
            ]);
            
            const { totalSalePrice, totalAdminPrice, totalOrders } = totalProduct[0] || { totalSalePrice: 0, totalAdminPrice: 0, totalOrders: 0 };
            const data = {totalSalePrice, totalAdminPrice, totalOrders}
            return res.status(200).json({message: "Sale data got successfully", success: true, data: data})
        } catch (err){
            console.log(err);
            res.status(400).json({message: "Something went wrong", success: false, data: {}})
        }
}
}

const getOrderList = {
    [VALIDATOR]: celebrate({
        query: Joi.object()
            .keys({
                search_term: Joi.string().lowercase().trim().allow("", null),
                order_date: Joi.date().allow(null),
                min_sale_price: Joi.number().allow(null, ''),
                max_sale_price: Joi.number().allow(null, ''),
                sort_field: Joi.string().trim().allow(null, ""),
                sort_order: Joi.string().valid("asc", "desc").trim().allow(""),
                per_page: Joi.number().integer().min(1).max(1000).required(),
                page_number: Joi.number().integer().min(1).max(1000).required(),
            })
            .required(),
    }),
    [CONTROLLER]: async (req, res) => {
        try{
            const {
                search_term = "",
                order_date,
                min_sale_price,
                max_sale_price,
                sort_field = "createdAt",
                sort_order = "desc",
                per_page = 10,
                page_number = 1,
            } = req.query;
            const query = {};
            if (search_term) {
                console.log(">>>", search_term)
                query.product_name = { $regex: new RegExp(search_term, "i") };
            }
            if (order_date ) {
                query.order_date = order_date;
            }
            if (min_sale_price && max_sale_price) {
                query.sale_price = { $gte: min_sale_price, $lte: max_sale_price };
            } else if (min_sale_price) {
                query.sale_price = { $gte: min_sale_price };
            } else if (max_sale_price) {
                query.sale_price = { $lte: max_sale_price };
            }
            const sortOptions = {};
            sortOptions[sort_field] = sort_order === "asc" ? 1 : -1;
            const limit = parseInt(per_page, 10);
            const skip = (parseInt(page_number, 10) - 1) * limit;
            const allOrders = await Order.find(query)
                .select([
                    "_id",
                    'product_id',
                    'product_name',
                    "admin_price",
                    "sale_price",
                    "quantity",
                    "order_date",
                ])
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);
            const allOrderCount = await Order.countDocuments(query);
            const result = {
                items: allOrders,
                total_items: allOrderCount,
                page_number: parseInt(page_number, 10),
                per_page: limit,
            };
            return res.status(200).json({message: "Orders got successfully", success: true, data: result})
        } catch (err){
            console.log(err);
            res.status(400).json({message: "Something went wrong", success: false, data: {}})
        }
    },
};

module.exports = {
    getOrderList,
    getTotalProducts,
    getTotalOfSales
};
