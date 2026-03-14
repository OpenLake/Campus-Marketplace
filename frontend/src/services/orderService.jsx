// src/services/orderService.js
import api from "./api";

class OrderService {
  /* ========== INTEREST METHODS (NEW) ========== */
  
  /**
   * Express interest in a listing
   * @param {Object} data - { listingId, offeredPrice, message, buyerImages }
   * @returns {Promise} Created interest
   */
  async expressInterest(data) {
    try {
      const response = await api.post("/orders/st/interest", data);
      return response.data;
    } catch (error) {
      console.error("Error expressing interest:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get my interests (as buyer)
   * @param {number} page - Page number
   * @param {string} status - Filter by status (pending/accepted/rejected/withdrawn)
   * @returns {Promise} Paginated interests
   */
  async getMyInterests(page = 1, status = '') {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page);
      
      const response = await api.get(`/orders/st/my-interests?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching interests:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get incoming interests on my listings (as seller)
   * @param {number} page - Page number
   * @param {string} status - Filter by status (default: pending)
   * @returns {Promise} Paginated interests
   */
  async getIncomingInterests(page = 1, status = 'pending') {
    try {
      const params = new URLSearchParams();
      params.append('status', status);
      params.append('page', page);
      
      const response = await api.get(`/orders/st/incoming-interests?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching incoming interests:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Accept an interest (creates order, rejects others)
   * @param {string} interestId - Interest ID to accept
   * @param {Object} meetupDetails - { location, time, notes }
   * @returns {Promise} Created order and updated interest
   */
  async acceptInterest(interestId, meetupDetails = {}) {
    try {
      const response = await api.post(`/orders/st/accept-interest/${interestId}`, { meetupDetails });
      return response.data;
    } catch (error) {
      console.error("Error accepting interest:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Reject an interest
   * @param {string} interestId - Interest ID to reject
   * @returns {Promise} Updated interest
   */
  async rejectInterest(interestId) {
    try {
      const response = await api.patch(`/orders/st/reject-interest/${interestId}`);
      return response.data;
    } catch (error) {
      console.error("Error rejecting interest:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Withdraw my interest (as buyer)
   * @param {string} interestId - Interest ID to withdraw
   * @returns {Promise} Updated interest
   */
  async withdrawInterest(interestId) {
    try {
      const response = await api.patch(`/orders/st/withdraw-interest/${interestId}`);
      return response.data;
    } catch (error) {
      console.error("Error withdrawing interest:", error);
      throw error.response?.data || error;
    }
  }

  /* ========== ORDER METHODS (UPDATED) ========== */

  /**
   * Create student order (Buy Now) - Legacy, redirects to interest
   * @deprecated Use expressInterest instead
   */
  async createSTOrder(orderData) {
    console.warn("createSTOrder is deprecated. Use expressInterest instead.");
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
   * @returns {Promise} Updated order
   */
  async updateOrderStatus(orderId, status, note = '') {
    try {
      const response = await api.patch(`/orders/st/${orderId}/status`, { status, note });
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