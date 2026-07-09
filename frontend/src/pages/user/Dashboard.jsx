import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from 'lucide-react';
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
  const [activeListingsList, setActiveListingsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch listing stats (for seller)
      const statsRes = await listingService.getStats().catch(() => null);
      setListingStats(statsRes?.data || statsRes);

      // Fetch order stats (for buyer/seller)
      const orderStatsRes = await orderService.getOrderStats().catch(() => null);
      setOrderStats(orderStatsRes?.data || orderStatsRes);

      // Fetch incoming interests (as seller)
      const incomingRes = await orderService.getIncomingInterests(1, 'pending').catch(() => null);
      setIncomingInterests(incomingRes?.data?.interests || []);

      // Fetch my interests (as buyer)
      const myInterestsRes = await orderService.getMyInterests(1, 'pending').catch(() => null);
      setMyInterests(myInterestsRes?.data?.interests || []);

      // Fetch active listings
      const listingsRes = await listingService.getMyListings(1, 'active').catch(() => null);
      const activeListingsArray = listingsRes?.data?.listings || listingsRes?.listings || [];
      setActiveListingsList(activeListingsArray.slice(0, 4));

      // Fetch recent orders (purchases + sales)
      const [purchasesRes, salesRes] = await Promise.all([
        orderService.getMyPurchases(1).catch(() => null),
        orderService.getMySales(1).catch(() => null)
      ]);
      
      const purchases = purchasesRes?.data?.orders || [];
      const sales = salesRes?.data?.orders || [];
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
      <div className="flex items-center justify-center py-20 bg-transparent">
        <Loader className="h-10 w-10 animate-spin text-[#10b981]" />
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
  const asSeller = orderStats?.asSeller || {};
  const totalEarned = asSeller.totalEarned || 0;
  const pendingSales = asSeller.awaiting_meetup || 0;

  return (
    <div className="page animate-[fadeIn_0.2s_ease]">
      {/* Page Header Actions / Badges */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <span style={{ background: '#111827', border: '1px solid #1f2937', padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', color: '#9ca3af' }}>Verified Student Seller</span>
          <span style={{ background: '#111827', border: '1px solid #1f2937', padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', color: '#9ca3af' }}>
            {user?.department || 'IIT Bhilai'} · {user?.gradYear || '2027'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/dashboard/products/add" className="btn-brand">+ Add Listing</Link>
          <Link to="/dashboard/my-listings" className="btn-surface">My Listings</Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="top-row">
            <span className="label">Active Listings</span>
            <span className="stat-icon ic-emerald">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></svg>
            </span>
          </div>
          <div className="value tnum">{activeListings}</div>
          <div className="foot">{soldListings} sold total</div>
        </div>

        <div className="stat-card">
          <div className="top-row">
            <span className="label">Total Views</span>
            <span className="stat-icon ic-blue">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </span>
          </div>
          <div className="value tnum">{totalViews.toLocaleString()}</div>
          <div className="foot">Avg. price ₹{averagePrice.toLocaleString()}</div>
        </div>

        <div className="stat-card">
          <div className="top-row">
            <span className="label">Pending Sales</span>
            <span className="stat-icon ic-amber">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2l1.5 5H16L17.5 2"/><path d="M3.5 7h17l-1.6 12.4a2 2 0 0 1-2 1.6H7.1a2 2 0 0 1-2-1.6L3.5 7z"/></svg>
            </span>
          </div>
          <div className="value tnum">{pendingSales}</div>
          <div className="foot">Awaiting meetup</div>
        </div>

        <div className="stat-card">
          <div className="top-row">
            <span className="label">Total Earned</span>
            <span className="stat-icon ic-purple">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
          </div>
          <div className="value tnum">₹{totalEarned.toLocaleString()}</div>
          <div className="foot">From completed sales</div>
        </div>
      </div>

      {/* Active Listings Grid */}
      <div className="section-title">
        <h2>My active listings</h2>
        <Link to="/dashboard/my-listings" className="link">View all {totalListings} →</Link>
      </div>
      {activeListingsList.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
          No active listings found. Click "+ Add Listing" to create one.
        </div>
      ) : (
        <div className="listing-grid">
          {activeListingsList.map((listing, i) => {
            const gradients = ['im1', 'im2', 'im3', 'im4'];
            const gradClass = gradients[i % 4];
            return (
              <Link key={listing._id} to={`/listings/${listing._id}`} className="listing-card">
                <div className={`listing-img ${gradClass}`}>
                  <span className="lstatus active">Active</span>
                  {listing.images?.[0]?.url ? (
                    <img src={listing.images[0].url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  )}
                </div>
                <div className="listing-body">
                  <div className="name truncate">{listing.title}</div>
                  <div className="cat">{listing.category?.name || 'Item'} · {listing.condition || 'Good'}</div>
                  <div className="listing-foot">
                    <span className="listing-price">₹{listing.price}</span>
                    <span className="listing-views">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {listing.views || 0}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Recent Activity: Orders + Interests */}
      <div className="section-title">
        <h2>Recent activity</h2>
        <Link to="/dashboard/transactions" className="link">Transaction history →</Link>
      </div>
      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <h3>Recent orders</h3>
            <span className="meta">Last 5</span>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ color: 'var(--text-faint)', fontSize: '13px', padding: '10px 0' }}>No orders yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const isBuyer = order.buyerId === user?._id;
                  const amountClass = isBuyer ? 'amt neg' : 'amt pos';
                  const amountSign = isBuyer ? '−' : '+';
                  const statusClass = order.status === 'completed' 
                    ? 'status-chip done' 
                    : order.status === 'awaiting_meetup' 
                      ? 'status-chip pending' 
                      : 'status-chip wait';
                  const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <tr key={order._id}>
                      <td>
                        <div className="item-cell">
                          <span className={`thumb ${isBuyer ? 'im1' : 'im2'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                          </span>
                          <div>
                            <div className="iname truncate max-w-[180px]">{order.listingId?.title || 'Item'}</div>
                            <div className="iwith">
                              {isBuyer 
                                ? `Bought from ${order.sellerId?.first_name || 'Seller'}` 
                                : `Sold to ${order.buyerId?.first_name || 'Buyer'}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`${amountClass} tnum`}>{amountSign}₹{order.finalPrice}</td>
                      <td><span className={statusClass}>{order.status.replace('_', ' ')}</span></td>
                      <td className="tnum" style={{ color: 'var(--text-faint)' }}>{dateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Pending interests</h3>
            <span className="meta">{incomingInterests.length + myInterests.length} pending</span>
          </div>
          <div className="activity-list">
            {incomingInterests.slice(0, 3).map(interest => (
              <div key={interest._id} className="activity-item">
                <span className="a-icon ic-pink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
                </span>
                <div className="a-body">
                  <div className="msg">
                    <b>{interest.buyerId?.first_name || 'Someone'}</b> is interested in your <b>{interest.listingId?.title || 'Item'}</b> — offered ₹{interest.offeredPrice}.
                  </div>
                  <div className="time">{new Date(interest.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {myInterests.slice(0, 2).map(interest => (
              <div key={interest._id} className="activity-item">
                <span className="a-icon ic-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" /></svg>
                </span>
                <div className="a-body">
                  <div className="msg">
                    You expressed interest in <b>{interest.listingId?.title || 'Item'}</b> — offered ₹{interest.offeredPrice}.
                  </div>
                  <div className="time">{new Date(interest.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {incomingInterests.length === 0 && myInterests.length === 0 && (
              <div style={{ color: 'var(--text-faint)', fontSize: '13px', padding: '10px 0', textAlign: 'center' }}>No pending interests.</div>
            )}
          </div>
        </div>
      </div>
      <div className="foot-note">Campus Marketplace · IIT Bhilai — buy, sell & trade within your campus community.</div>
    </div>
  );
};

export default Dashboard;