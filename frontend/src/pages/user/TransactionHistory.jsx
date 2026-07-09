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
      completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    return styles[status] || 'bg-gray-800 text-gray-300 border border-gray-700';
  };

  return (
    <div className="page animate-[fadeIn_0.2s_ease]">
      {/* Page Actions */}
      <div className="flex justify-end gap-3 mb-6">
        <button className="btn-surface flex items-center gap-2">
          <Calendar size={16} />
          <span>Filter by date</span>
        </button>
        <button className="btn-brand flex items-center gap-2">
          <Filter size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="panel">
          <div className="text-2xl font-bold text-gray-150">₹5,010</div>
          <div className="text-xs text-gray-500 font-medium">Total Revenue</div>
        </div>
        <div className="panel">
          <div className="text-2xl font-bold text-emerald-400">3</div>
          <div className="text-xs text-gray-500 font-medium">Completed</div>
        </div>
        <div className="panel">
          <div className="text-2xl font-bold text-amber-400">1</div>
          <div className="text-xs text-gray-500 font-medium">Pending</div>
        </div>
        <div className="panel">
          <div className="text-2xl font-bold text-red-400">1</div>
          <div className="text-xs text-gray-500 font-medium">Failed</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="panel p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#232c38]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18222f]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#121922] transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-200">{tx.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{tx.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#10b981]">₹{tx.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-450">{tx.method}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-[#10b981] hover:text-[#10b981]/80 font-semibold transition-colors">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#232c38] flex justify-between items-center bg-[#080d14]">
          <button className="btn-surface py-1.5 px-3 text-xs disabled:opacity-50" disabled>Previous</button>
          <div className="flex gap-1.5">
            <button className="btn-brand w-7 h-7 flex items-center justify-center text-xs p-0">1</button>
            <button className="btn-surface w-7 h-7 flex items-center justify-center text-xs p-0">2</button>
            <button className="btn-surface w-7 h-7 flex items-center justify-center text-xs p-0">3</button>
          </div>
          <button className="btn-surface py-1.5 px-3 text-xs">Next</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;