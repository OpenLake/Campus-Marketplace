// src/services/orderService.js
import api from "./api";

class OrderService {
  /* ========== REQUEST METHODS (NEW) ========== */
  
  /**
   * Request an item
   * @param {Object} data - { listingId, offeredPrice, message, buyerImages }
   * @returns {Promise} Created request
   */
  async requestItem(data) {
    try {
      const response = await api.post("/orders/st/request", data);
      return response.data;
    } catch (error) {
      console.error("Error requesting item:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get my requests (as buyer)
   * @param {number} page - Page number
   * @param {string} status - Filter by status (pending/accepted/rejected/withdrawn)
   * @returns {Promise} Paginated requests
   */
  async getMyRequests(page = 1, status = '') {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page);
      
      const response = await api.get(`/orders/st/my-requests?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching requests:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get incoming requests on my listings (as seller)
   * @param {number} page - Page number
   * @param {string} status - Filter by status (default: pending)
   * @returns {Promise} Paginated requests
   */
  async getIncomingRequests(page = 1, status = 'pending') {
    try {
      const params = new URLSearchParams();
      params.append('status', status);
      params.append('page', page);
      
      const response = await api.get(`/orders/st/incoming-requests?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Accept a request (creates order, rejects others)
   * @param {string} requestId - Request ID to accept
   * @param {Object} meetupDetails - { location, time, notes }
   * @returns {Promise} Created order and updated request
   */
  async acceptRequest(requestId, meetupDetails = {}) {
    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await api.post(`/orders/st/accept-request/${requestId}`, { meetupDetails }, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error accepting request:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Reject a request
   * @param {string} requestId - Request ID to reject
   * @returns {Promise} Updated request
   */
  async rejectRequest(requestId) {
    try {
      const response = await api.patch(`/orders/st/reject-request/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Error rejecting request:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Withdraw my request (as buyer)
   * @param {string} requestId - Request ID to withdraw
   * @returns {Promise} Updated request
   */
  async withdrawRequest(requestId) {
    try {
      const response = await api.patch(`/orders/st/withdraw-request/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Error withdrawing request:", error);
      throw error.response?.data || error;
    }
  }

  /* ========== ORDER METHODS (UPDATED) ========== */

  /**
   * Create student order (Buy Now) - Legacy, redirects to requestItem
   * @deprecated Use requestItem instead
   */
  async createSTOrder(orderData) {
    console.warn("createSTOrder is deprecated. Use requestItem instead.");
    try {
      const response = await api.post("/orders/st/buy-now", orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get my purchases (as buyer)
   * @param {number} page - Page number
   * @param {string} status - Filter by status
   * @returns {Promise} Paginated orders
   */
  async getMyPurchases(page = 1, status = '') {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page);
      
      const response = await api.get(`/orders/st/my-purchases?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchases:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get my sales (as seller)
   * @param {number} page - Page number
   * @param {string} status - Filter by status
   * @returns {Promise} Paginated orders
   */
  async getMySales(page = 1, status = '') {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page);
      
      const response = await api.get(`/orders/st/my-sales?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get order details
   * @param {string} orderId - Order ID
   * @returns {Promise} Order details
   */
  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/st/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status (awaiting_meetup/completed/cancelled/disputed)
   * @param {string} note - Optional note
   * @param {string} cancelReason - Optional cancel reason (mutual, timeout, etc.)
   * @returns {Promise} Updated order
   */
  async updateOrderStatus(orderId, status, note = '', cancelReason = '') {
    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await api.patch(`/orders/st/${orderId}/status`, { status, note, cancelReason }, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get order stats
   * @returns {Promise} Order statistics
   */
  async getOrderStats() {
    try {
      const response = await api.get("/orders/st/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching order stats:", error);
      throw error.response?.data || error;
    }
  }
}

export default new OrderService();