import React from 'react';
import { useGetAdminCommissionsQuery } from '../store/api';
import { Download, AlertCircle } from 'lucide-react';

const AdminCommissions = () => {
  const { data: commissions, isLoading, error } = useGetAdminCommissionsQuery(undefined, { pollingInterval: 10000 });
  
  if (isLoading) return <div className="text-white p-6">Loading commission history...</div>;
  if (error) return (
    <div className="text-red-500 p-6 flex items-center gap-2">
        <AlertCircle size={20} />
        <span>Error loading commissions. Ensure backend is running.</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Commission Runs</h1>
        <button className="bg-teal-600 text-white px-4 py-2 rounded font-medium hover:bg-teal-500 transition flex items-center gap-2">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-semibold">
                <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {commissions && commissions.length > 0 ? (
                    commissions.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-750 transition-colors">
                        <td className="px-6 py-4 text-sm">
                            {new Date(item.date).toLocaleDateString()} <span className="text-slate-500 text-xs">{new Date(item.date).toLocaleTimeString()}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">{item.username}</td>
                        <td className="px-6 py-4">
                            <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">
                                {item.type.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-green-400 font-mono font-bold">
                            ${item.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate" title={item.details}>
                            {item.details}
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold border border-green-500/20">
                                Paid
                            </span>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            No commission history found. Run a Payout Cycle to generate data.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCommissions;