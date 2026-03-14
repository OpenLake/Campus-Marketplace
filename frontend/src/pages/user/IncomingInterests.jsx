// src/pages/user/IncomingInterests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
 import { Package, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import InterestCard from '../../components/listings/InterestedCard';

const IncomingInterests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [meetupModal, setMeetupModal] = useState({ open: false, interestId: null });

  useEffect(() => {
    fetchInterests();
  }, [filter]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const response = await orderService.getIncomingInterests(1, filter);
      setInterests(response.data.interests || []);
    } catch (error) {
      toast.error('Failed to fetch interests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (interestId, meetupDetails = {}) => {
    try {
      const response = await orderService.acceptInterest(interestId, meetupDetails);
      toast.success('Interest accepted! Order created.');
      fetchInterests();
      
      // Navigate to the new order
      if (response.data.order) {
        navigate(`/dashboard/sales/${response.data.order._id}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to accept interest');
    }
  };

  const handleReject = async (interestId) => {
    if (!window.confirm('Are you sure you want to reject this interest?')) return;
    
    try {
      await orderService.rejectInterest(interestId);
      toast.success('Interest rejected');
      fetchInterests();
    } catch (error) {
      toast.error(error.message || 'Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Incoming Interests</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['pending', 'accepted', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 capitalize ${
              filter === status
                ? 'border-b-2 border-emerald-600 text-emerald-600 font-medium'
                : 'text-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {interests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No interests found</h3>
          <p className="text-gray-600">
            {filter === 'pending' 
              ? "No one has expressed interest in your listings yet"
              : `No ${filter} interests`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interests.map(interest => (
            <InterestCard
              key={interest._id}
              interest={interest}
              isSeller={true}
              onAccept={() => {
                const location = prompt('Enter meetup location:');
                if (location) {
                  handleAccept(interest._id, { location });
                }
              }}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingInterests;