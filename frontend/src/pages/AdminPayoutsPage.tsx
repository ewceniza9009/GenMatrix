import { useState } from 'react';
import { useGetPendingWithdrawalsQuery, useProcessWithdrawalMutation } from '../store/api';
import { CheckCircle, XCircle, Search, Calendar, User, Wallet } from 'lucide-react';
import { useUI } from '../components/UIContext';
import PageHeader from '../components/PageHeader';

const AdminPayoutsPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 20;

    const { data, isLoading } = useGetPendingWithdrawalsQuery({ page, limit, search });
    const [processWithdrawal, { isLoading: isProcessing }] = useProcessWithdrawalMutation();
    const { showAlert } = useUI();

    const withdrawals = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const totalRequests = data?.total || 0;

    // Calculate sum of visible page (optional util)
    const visibleTotal = withdrawals.reduce((sum: number, w: any) => sum + Math.abs(w.amount), 0);

    const handleProcess = async (transactionId: string, userId: string, action: 'APPROVE' | 'REJECT') => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            await processWithdrawal({ userId, transactionId, action }).unwrap();
            showAlert(`Withdrawal ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`, 'success');
        } catch (err: any) {
            showAlert(err.data?.message || 'Processing Failed', 'error');
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animation-fade-in pb-10">

            {/* 1. Header Section */}
            <PageHeader
                title={<>Payout <span className="text-teal-600 dark:text-teal-400">Management</span></>}
                subtitle="Review and process pending withdrawal requests."
                icon={<Wallet size={24} />}
                actions={
                    <div className="grid grid-cols-2 w-full md:w-auto md:flex gap-4">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl flex flex-col justify-between shadow-sm min-w-[120px]">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending</p>
                            <p className="text-xl font-bold">{totalRequests}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl flex flex-col justify-between shadow-sm min-w-[120px]">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Page Total</p>
                            <p className="text-xl font-bold text-teal-600 dark:text-teal-400">${visibleTotal.toFixed(2)}</p>
                        </div>
                    </div>
                }
            />

            {/* 2. TABLE SECTION */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 overflow-hidden">

                {/* Toolbar */}
                <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-slate-700 dark:text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        Pending Requests
                    </h2>
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Mobile Card View (Visible < md) */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                    {withdrawals.length > 0 ? (
                        withdrawals.map((req: any) => (
                            <div key={req._id} className="p-5 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white dark:ring-slate-700">
                                            {req.username?.substring(0, 2).toUpperCase() || <User size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                {req.username}
                                            </p>
                                            <p className="text-xs text-slate-500">{req.user?.email}</p>
                                        </div>
                                    </div>
                                    <span className="inline-block font-mono font-bold text-lg text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">
                                        ${Math.abs(req.amount).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                                        <Calendar size={12} className="text-slate-400" />
                                        {new Date(req.date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        {req.transaction.description || 'Standard Withdrawal'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => handleProcess(req._id, req.user._id, 'REJECT')}
                                        disabled={isProcessing}
                                        className="flex-1 py-2.5 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl font-medium text-sm transition-colors flex justify-center items-center gap-2"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleProcess(req._id, req.user._id, 'APPROVE')}
                                        disabled={isProcessing}
                                        className="flex-1 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5"
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-center">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full"></div>
                                <div className="relative w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center">
                                    <CheckCircle className="text-teal-500" size={28} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">All Caught Up!</h3>
                            <p className="text-sm text-slate-500 max-w-xs">No pending requests.</p>
                        </div>
                    )}
                </div>

                {/* Table View (Hidden < md) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">User Identity</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Request Date</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Info</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {withdrawals.length > 0 ? (
                                withdrawals.map((req: any) => (
                                    <tr key={req._id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white dark:ring-slate-700">
                                                    {req.username?.substring(0, 2).toUpperCase() || <User size={16} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                        {req.username}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{req.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block font-mono font-bold text-lg text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">
                                                ${Math.abs(req.amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {new Date(req.date).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-slate-400 pl-5">{new Date(req.date).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-[200px] truncate text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                                                {req.transaction.description || 'Standard Withdrawal'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleProcess(req._id, req.user._id, 'REJECT')}
                                                    disabled={isProcessing}
                                                    className="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all disabled:opacity-50"
                                                    title="Reject Request"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleProcess(req._id, req.user._id, 'APPROVE')}
                                                    disabled={isProcessing}
                                                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                                                >
                                                    <CheckCircle size={16} /> Pay Now
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="relative mb-6">
                                                <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full"></div>
                                                <div className="relative w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center">
                                                    <CheckCircle className="text-teal-500" size={40} />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
                                            <p className="text-slate-500 max-w-sm mx-auto">
                                                There are no pending withdrawal requests to process at this time. Good job!
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Foot */}
                {withdrawals.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-50 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-500 font-medium">Page {page} of {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-50 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};

export default AdminPayoutsPage;
