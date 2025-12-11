import { useState } from 'react';
import { useGetPendingWithdrawalsQuery, useProcessWithdrawalMutation } from '../store/api';
import { CheckCircle, XCircle, Search, CreditCard, Calendar } from 'lucide-react';

const AdminWithdrawalsPage = () => {
    const { data: withdrawals, isLoading } = useGetPendingWithdrawalsQuery();
    const [processWithdrawal] = useProcessWithdrawalMutation();

    const [search, setSearch] = useState('');

    const filteredWithdrawals = withdrawals?.filter((item: any) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            item.user?.username?.toLowerCase().includes(s) ||
            item.user?.email?.toLowerCase().includes(s)
        );
    });

    const handleProcess = async (item: any, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Are you sure you want to ${action} this withdrawal for $${Math.abs(item.transaction.amount)}?`)) return;

        try {
            await processWithdrawal({
                userId: item.user._id,
                transactionId: item.transaction._id,
                action
            }).unwrap();
        } catch (err) {
            console.error('Failed to process withdrawal', err);
            alert('Failed to process withdrawal. Check console.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawal Requests</h1>
                    <p className="text-gray-500 dark:text-slate-400">Approve or reject pending payout requests.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-white w-full md:w-64 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a1b23] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="hidden md:table w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Amount</th>
                                <th className="p-4 font-semibold">Method / Details</th>
                                <th className="p-4 font-semibold">Requested Date</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading requests...</td></tr>
                            ) : filteredWithdrawals?.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No pending withdrawals found.</td></tr>
                            ) : (
                                filteredWithdrawals?.map((item: any) => (
                                    <tr key={item.transaction._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                                    {item.user?.username?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{item.user?.username}</div>
                                                    <div className="text-xs text-gray-500">{item.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-gray-900 dark:text-white text-lg">
                                                ${Math.abs(item.transaction.amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                                                <CreditCard size={16} className="text-gray-400" />
                                                {item.transaction.description}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={16} />
                                                {new Date(item.transaction.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleProcess(item, 'APPROVE')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition"
                                                >
                                                    <CheckCircle size={14} /> Pay
                                                </button>
                                                <button
                                                    onClick={() => handleProcess(item, 'REJECT')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 text-xs font-bold rounded-lg transition"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Mobile List View */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">Loading requests...</div>
                        ) : filteredWithdrawals?.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No pending withdrawals found.</div>
                        ) : (
                            filteredWithdrawals?.map((item: any) => (
                                <div key={item.transaction._id} className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                {item.user?.username?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{item.user?.username}</div>
                                                <div className="text-xs text-gray-500">{item.user?.email}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-gray-900 dark:text-white text-xl block">
                                                ${Math.abs(item.transaction.amount).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{new Date(item.transaction.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5 flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                                        <CreditCard size={16} className="text-gray-400" />
                                        {item.transaction.description}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleProcess(item, 'APPROVE')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition"
                                        >
                                            <CheckCircle size={16} /> Approve & Pay
                                        </button>
                                        <button
                                            onClick={() => handleProcess(item, 'REJECT')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 text-sm font-bold rounded-lg transition"
                                        >
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminWithdrawalsPage;
