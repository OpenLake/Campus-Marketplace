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
      completed: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-850 rounded-none',
      pending: 'bg-yellow-105 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-850 rounded-none',
      failed: 'bg-red-105 dark:bg-red-950/40 text-red-800 dark:text-red-405 border border-red-200 dark:border-red-850 rounded-none',
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-none';
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100">
      <div className="flex"> 
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transaction History</h1>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Calendar size={18} />
                <span>Filter by date</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-none hover:bg-emerald-700 transition-colors">
                <Filter size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-none border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">₹5,010</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-none border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-500">3</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-none border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-500">1</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-none border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-500">1</p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-gray-900 rounded-none border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-55 dark:hover:bg-gray-800/40">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{tx.id}</td>
                    <td className="px-6 py-4 text-gray-750 dark:text-gray-300">{tx.customer}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-450">{tx.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">₹{tx.amount}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-450">{tx.method}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium ${getStatusBadge(tx.status)}`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 text-sm font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-750 rounded-none bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm disabled:opacity-50">Previous</button>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-none bg-emerald-600 text-white text-sm">1</button>
                <button className="w-8 h-8 rounded-none border border-gray-300 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm">2</button>
                <button className="w-8 h-8 rounded-none border border-gray-300 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm">3</button>
              </div>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-750 rounded-none bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-305 text-sm">Next</button>
            </div>
          </div>
        </main>
      </div> 
    </div>
  );
};

export default TransactionHistory;