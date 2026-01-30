import { Router } from "express";
import {
    createOrder,
    getMyOrders,
    getMySales,
    getOrderById,
    updateOrderStatus
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

// All routes require authentication
orderRouter.use(verifyJWT);

orderRouter.route("/")
    .post(createOrder); // Place a new order

orderRouter.route("/my-purchases")
    .get(getMyOrders); // History of items bought

orderRouter.route("/my-sales")
    .get(getMySales); // Items user is selling/sold

orderRouter.route("/:id")
    .get(getOrderById); // View specific order

orderRouter.route("/:id/status")
    .patch(updateOrderStatus); // Update status (Delivered, etc.)

export default orderRouter;
