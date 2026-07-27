// src/pages/user/IncomingRequests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import RequestCard from '../../components/listings/RequestCard';

const IncomingRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [accepting, setAccepting] = useState(null); // track which request is being accepted
  const [acceptModal, setAcceptModal] = useState({ open: false, requestId: null, message: '' });

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await orderService.getIncomingRequests(1, filter);
      setRequests(response.data.requests || []);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId, message) => {
    setAcceptModal({ open: false, requestId: null, message: '' });
    setAccepting(requestId);
    try {
      const response = await orderService.acceptRequest(requestId, { notes: message });
      toast.success('Request accepted! The buyer has been notified.');
      fetchRequests();

      // Navigate to the new order if created
      if (response.data?.order?._id) {
        navigate(`/dashboard/sales/${response.data.order._id}`);
      }
    } catch (error) {
      const msg = error?.message || error?.data?.message || 'Failed to accept request';
      toast.error(msg);
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;

    try {
      await orderService.rejectRequest(requestId);
      toast.success('Request rejected');
      fetchRequests();
    } catch (error) {
      toast.error(error.message || 'Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  return (
    <div className="page animate-[fadeIn_0.2s_ease]">
      {/* Filter Tabs */}
      <div className="border-b border-[#232c38] mb-6 flex gap-4">
        {['pending', 'accepted', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`pb-3 px-1 font-semibold text-sm transition-colors relative capitalize ${
              filter === status
                ? 'text-[#10b981] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#10b981]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="panel text-center py-16 flex flex-col items-center justify-center">
          <Package className="h-12 w-12 text-[#5d6b7d] mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-1">No requests found</h3>
          <p className="text-sm text-gray-500">
            {filter === 'pending'
              ? 'No one has requested your listings yet.'
              : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <RequestCard
              key={request._id}
              request={request}
              isSeller={true}
              onAccept={() => setAcceptModal({ open: true, requestId: request._id, message: '' })}
              onReject={handleReject}
              isAccepting={accepting === request._id}
            />
          ))}
        </div>
      )}

      {/* Accept Modal */}
      {acceptModal.open && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#121922] rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-[#232c38] shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Accept Request</h3>
            <p className="text-sm text-gray-600 dark:text-[#93a2b3] mb-4">
              Add a short message for the buyer. This will be sent along with the acceptance notification.
            </p>
            <textarea
              className="w-full bg-gray-50 dark:bg-[#0d1218] border border-gray-300 dark:border-[#232c38] text-gray-900 dark:text-white rounded-xl p-3 mb-4 focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none resize-none"
              rows={3}
              placeholder="e.g. You can collect it from BH-1 tonight at 8 PM."
              value={acceptModal.message}
              onChange={(e) => setAcceptModal(prev => ({ ...prev, message: e.target.value }))}
              maxLength={500}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAcceptModal({ open: false, requestId: null, message: '' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#1a222c] hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAccept(acceptModal.requestId, acceptModal.message)}
                className="px-4 py-2 text-sm font-medium text-[#04140e] bg-[#10b981] hover:bg-[#0ea271] rounded-xl transition-colors"
              >
                Accept Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomingRequests;