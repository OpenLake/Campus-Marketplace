import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  ShoppingBag,
  Eye,
  Heart,
  MessageCircle,
  PlusCircle,
  List,
  Loader
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import listingService from '../../services/listingService';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [listingStats, setListingStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [incomingInterests, setIncomingInterests] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch listing stats (for seller)
      const statsRes = await listingService.getStats();
      setListingStats(statsRes.data || statsRes);

      // Fetch order stats (for buyer/seller)
      const orderStatsRes = await orderService.getOrderStats();
      setOrderStats(orderStatsRes.data || orderStatsRes);

      // Fetch incoming interests (as seller)
      const incomingRes = await orderService.getIncomingInterests(1, 'pending');
      setIncomingInterests(incomingRes.data?.interests || []);

      // Fetch my interests (as buyer)
      const myInterestsRes = await orderService.getMyInterests(1, 'pending');
      setMyInterests(myInterestsRes.data?.interests || []);

      // Fetch recent orders (purchases + sales)
      const [purchasesRes, salesRes] = await Promise.all([
        orderService.getMyPurchases(1),
        orderService.getMySales(1)
      ]);
      
      const purchases = purchasesRes.data?.orders || [];
      const sales = salesRes.data?.orders || [];
      // Combine and sort by date (newest first)
      const combined = [...purchases, ...sales]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5); // show only 5 most recent
      setRecentOrders(combined);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Stats from listingStats (seller)
  const totalListings = listingStats?.overview?.totalListings || 0;
  const activeListings = listingStats?.overview?.activeListings || 0;
  const soldListings = listingStats?.overview?.soldListings || 0;
  const totalViews = listingStats?.overview?.totalViews || 0;
  const averagePrice = listingStats?.overview?.averagePrice || 0;

  // Stats from orderStats (buyer/seller)
  const asBuyer = orderStats?.asBuyer || {};
  const asSeller = orderStats?.asSeller || {};
  const totalSpent = asBuyer.totalSpent || 0;
  const totalEarned = asSeller.totalEarned || 0;
  const pendingPurchases = asBuyer.awaiting_meetup || 0;
  const pendingSales = asSeller.awaiting_meetup || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Welcome back, {user?.first_name || 'User'}!
          </h1>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              to="/dashboard/products/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <PlusCircle size={18} />
              Add New Listing
            </Link>
            <Link
              to="/dashboard/my-listings"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <List size={18} />
              My Listings
            </Link>
            <Link
              to="/dashboard/my-interests"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <Heart size={18} />
              My Interests {myInterests.length > 0 && `(${myInterests.length})`}
            </Link>
            <Link
              to="/dashboard/incoming-interests"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <MessageCircle size={18} />
              Incoming Interests {incomingInterests.length > 0 && `(${incomingInterests.length})`}
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* As Seller */}
            <StatCard
              title="Active Listings"
              value={activeListings}
              subtext={`${soldListings} sold total`}
              icon={Package}
              color="emerald"
            />
            <StatCard
              title="Total Views"
              value={totalViews.toLocaleString()}
              subtext={`Avg. price ₹${averagePrice.toLocaleString()}`}
              icon={Eye}
              color="blue"
            />
            <StatCard
              title="Pending Sales"
              value={pendingSales}
              subtext={`Awaiting meetup`}
              icon={ShoppingBag}
              color="amber"
            />
            <StatCard
              title="Total Earned"
              value={`₹${totalEarned.toLocaleString()}`}
              subtext="From completed sales"
              icon={DollarSign}
              color="purple"
            />
          </div>

          {/* Second row: As Buyer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="My Interests"
              value={myInterests.length}
              subtext="Pending responses"
              icon={Heart}
              color="rose"
            />
            <StatCard
              title="Purchases"
              value={asBuyer.completed || 0}
              subtext={`${pendingPurchases} pending meetup`}
              icon={ShoppingBag}
              color="indigo"
            />
            <StatCard
              title="Total Spent"
              value={`₹${totalSpent.toLocaleString()}`}
              subtext="On completed purchases"
              icon={DollarSign}
              color="orange"
            />
            <StatCard
              title="Incoming Interests"
              value={incomingInterests.length}
              subtext="On your listings"
              icon={Users}
              color="teal"
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <Link
                      key={order._id}
                      to={`/dashboard/${order.buyerId === user?.user_id ? 'purchases' : 'sales'}/${order._id}`}
                      className="flex justify-between items-center border-b border-gray-100 pb-3 hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {order.listingId?.title || 'Item'} • ₹{order.finalPrice}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'awaiting_meetup' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Interests */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Pending Interests</h3>
              {myInterests.length === 0 && incomingInterests.length === 0 ? (
                <p className="text-sm text-gray-500">No pending interests.</p>
              ) : (
                <div className="space-y-4">
                  {/* My interests (as buyer) */}
                  {myInterests.slice(0, 3).map(interest => (
                    <div key={interest._id} className="border-b border-gray-100 pb-3">
                      <p className="font-medium">You offered on {interest.listingId?.title}</p>
                      <p className="text-sm text-gray-500">₹{interest.offeredPrice} • {interest.status}</p>
                    </div>
                  ))}
                  {/* Incoming interests (as seller) */}
                  {incomingInterests.slice(0, 3).map(interest => (
                    <div key={interest._id} className="border-b border-gray-100 pb-3">
                      <p className="font-medium">Someone offered on {interest.listingId?.title}</p>
                      <p className="text-sm text-gray-500">₹{interest.offeredPrice} • {interest.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon: Icon, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;