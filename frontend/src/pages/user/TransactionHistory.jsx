import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { Calendar, Filter } from 'lucide-react';

const TransactionHistory = () => {
  const transactions = [
    { id: '#T1001', customer: 'Rahul K.', date: '2024-02-15', amount: 450, status: 'completed', method: 'UPI' },
    { id: '#T1002', customer: 'Anjali P.', date: '2024-02-14', amount: 1250, status: 'pending', method: 'Card' },
    { id: '#T1003', customer: 'Vikram S.', date: '2024-02-13', amount: 320, status: 'completed', method: 'Cash' },
    { id: '#T1004', customer: 'Priya M.', date: '2024-02-12', amount: 890, status: 'failed', method: 'UPI' },
    { id: '#T1005', customer: 'Arjun N.', date: '2024-02-11', amount: 2100, status: 'completed', method: 'Card' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
 
      <div className="flex"> 
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Calendar size={18} />
                <span>Filter by date</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                <Filter size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">₹5,010</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-green-600">3</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">1</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-xl font-bold text-red-600">1</p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{tx.id}</td>
                    <td className="px-6 py-4 text-gray-700">{tx.customer}</td>
                    <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">₹{tx.amount}</td>
                    <td className="px-6 py-4 text-gray-500">{tx.method}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button className="px-3 py-1 border rounded-md text-sm disabled:opacity-50">Previous</button>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-md bg-emerald-600 text-white text-sm">1</button>
                <button className="w-8 h-8 rounded-md border text-sm">2</button>
                <button className="w-8 h-8 rounded-md border text-sm">3</button>
              </div>
              <button className="px-3 py-1 border rounded-md text-sm">Next</button>
            </div>
          </div>
        </main>
      </div> 
    </div>
  );
};

export default TransactionHistory;