import { useState } from 'react';
import { useGetPendingKYCQuery, useUpdateKYCStatusMutation } from '../store/api';
import { CheckCircle, XCircle, Eye, Calendar } from 'lucide-react';

const AdminKYCPage = () => {
    const { data: kycs, isLoading } = useGetPendingKYCQuery();
    const [updateStatus] = useUpdateKYCStatusMutation();

    const [rejectComment, setRejectComment] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Helper to get full URL or handle base64 if we used that (we used path)
    const getDocUrl = (path: string) => {
        // Assuming server serves 'uploads' statically
        // Base URL usually ends with /api/v1/, but uploads are at root /uploads
        // So we need to strip /api/v1/ if present, or just use the hostname
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1/';
        const rootUrl = apiBase.replace('/api/v1/', '');
        return `${rootUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const handleAction = async (userId: string, status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !rejectComment) {
            alert('Please provide a reason for rejection.');
            return;
        }
        if (!confirm(`Are you sure you want to ${status} this user?`)) return;

        try {
            await updateStatus({ userId, status, comment: rejectComment }).unwrap();
            setSelectedUser(null);
            setRejectComment('');
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending KYC Requests</h1>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center text-gray-500">Loading requests...</div>
                ) : kycs?.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-[#1a1b23] rounded-xl border border-dashed border-gray-300 dark:border-white/10">
                        No pending KYC requests found.
                    </div>
                ) : (
                    kycs?.map((user: any) => (
                        <div key={user._id} className="bg-white dark:bg-[#1a1b23] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm flex flex-col">
                            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                                    {user.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{user.username}</h3>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="p-4 flex-1 space-y-4">
                                <div className="bg-gray-50 dark:bg-black/20 rounded-lg p-2 text-center">
                                    <a
                                        href={getDocUrl(user.kycDocs[user.kycDocs.length - 1])}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-teal-500 hover:text-teal-400 text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <Eye size={16} /> View Document
                                    </a>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {user.kycDocs[user.kycDocs.length - 1].split('/').pop()}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar size={12} /> Joined: {new Date(user.enrollmentDate).toLocaleDateString()}
                                </div>

                                {selectedUser === user._id && (
                                    <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <textarea
                                            value={rejectComment}
                                            onChange={(e) => setRejectComment(e.target.value)}
                                            placeholder="Reason for rejection..."
                                            className="w-full text-xs p-2 rounded bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 outline-none text-red-800 dark:text-red-200 mb-2"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(user._id, 'rejected')}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1.5 rounded font-bold"
                                            >
                                                Confirm Reject
                                            </button>
                                            <button
                                                onClick={() => setSelectedUser(null)}
                                                className="bg-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded font-bold"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedUser !== user._id && (
                                <div className="p-4 border-t border-gray-100 dark:border-white/5 flex gap-3">
                                    <button
                                        onClick={() => handleAction(user._id, 'approved')}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                                    >
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                    <button
                                        onClick={() => setSelectedUser(user._id)}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                                    >
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminKYCPage;
