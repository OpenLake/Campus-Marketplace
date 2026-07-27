import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Import club order controllers
import {
    createOrder,
    getMyOrders,
    getMySales,
    getOrderById,
    updateOrderStatus,
} from "../controllers/order.controller.js";

// Import student marketplace controllers
import {
    requestItem,
    getMyRequests,
    getIncomingRequests,
    acceptRequest,
    rejectRequest,
    withdrawRequest,
    getBuyerSTOrders,
    getSellerSTOrders,
    getSTOrderDetails,
    updateSTOrderStatus,
    getSTOrderStats,
    createSTOrder
} from "../controllers/order.controller.js";

const orderRouter = Router();

// ALL ROUTES REQUIRE AUTHENTICATION
orderRouter.use(verifyJWT);

/* ========== CLUB/VENDOR ORDER ROUTES ========== */
orderRouter.post("/", createOrder);
orderRouter.get("/my-purchases", getMyOrders);
orderRouter.get("/my-sales", getMySales);
orderRouter.get("/:id", getOrderById);               // <-- This is for club orders, but note the parameter
orderRouter.patch("/:id/status", updateOrderStatus);

/* ========== STUDENT MARKETPLACE ROUTES ========== */

// --- STATIC ROUTES FIRST (no parameters) ---
orderRouter.post("/st/request", requestItem);
orderRouter.get("/st/my-requests", getMyRequests);
orderRouter.get("/st/incoming-requests", getIncomingRequests);
orderRouter.get("/st/my-purchases", getBuyerSTOrders);
orderRouter.get("/st/my-sales", getSellerSTOrders);
orderRouter.get("/st/stats", getSTOrderStats);

// --- ROUTES WITH PARAMETERS (must come after static routes) ---

orderRouter.patch("/st/withdraw-request/:requestId", withdrawRequest);
orderRouter.post("/st/accept-request/:requestId", acceptRequest);
orderRouter.patch("/st/reject-request/:requestId", rejectRequest);
orderRouter.get("/st/:id", getSTOrderDetails);               // <-- Parameter route LAST
orderRouter.patch("/st/:id/status", updateSTOrderStatus);
orderRouter.post("/st/buy-now", createSTOrder);               // legacy

export default orderRouter;