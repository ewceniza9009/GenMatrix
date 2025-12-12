import { useState } from 'react';
import { useGetPendingWithdrawalsQuery, useProcessWithdrawalMutation } from '../store/api';
import { CheckCircle, XCircle, CreditCard, Calendar } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { useUI } from '../components/UIContext';

const AdminWithdrawalsPage = () => {
    const { showConfirm, showAlert } = useUI();
    // Query State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

    const { data, isLoading } = useGetPendingWithdrawalsQuery({
        page,
        limit: 10,
        search,
        sortBy: sortConfig.key,
        order: sortConfig.direction
    });

    const [processWithdrawal] = useProcessWithdrawalMutation();

    const handleProcess = async (item: any, action: 'APPROVE' | 'REJECT') => {
        const isApprove = action === 'APPROVE';
        const actionText = isApprove ? 'approve' : 'reject';

        showConfirm({
            title: `${isApprove ? 'Approve' : 'Reject'} Withdrawal?`,
            message: `Are you sure you want to ${actionText} this withdrawal for $${Math.abs(item.amount)}?`,
            type: isApprove ? 'info' : 'danger',
            confirmText: isApprove ? 'Yes, Pay' : 'Yes, Reject',
            onConfirm: async () => {
                try {
                    await processWithdrawal({
                        userId: item.user._id,
                        transactionId: item.transaction._id,
                        action
                    }).unwrap();
                    showAlert(`Withdrawal ${actionText}d successfully`, 'success');
                } catch (err) {
                    console.error('Failed to process withdrawal', err);
                    showAlert('Failed to process withdrawal. Check console.', 'error');
                }
            }
        });
    };

    const columns = [
        {
            key: 'username',
            label: 'User',
            sortable: true,
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {item.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{item.username}</div>
                        <div className="text-xs text-gray-500">{item.user.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (item: any) => (
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                    ${Math.abs(item.amount).toFixed(2)}
                </span>
            )
        },
        {
            key: 'description',
            label: 'Method / Details',
            render: (item: any) => (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <CreditCard size={16} className="text-gray-400" />
                    {item.transaction?.description || 'Unknown Transaction'}
                </div>
            )
        },
        {
            key: 'date',
            label: 'Requested Date',
            sortable: true,
            render: (item: any) => (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    {new Date(item.date).toLocaleDateString()}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (item: any) => (
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
            )
        }
    ];

    return (
        <div className="space-y-6 animation-fade-in">
            <DataTable
                title="Withdrawal Requests"
                columns={columns}
                data={data?.data?.map((item: any, i: number) => ({ ...item, _id: item._id || `${item.walletId}_${i}` })) || []}
                total={data?.total || 0}
                page={page}
                totalPages={data?.totalPages || 1}
                onPageChange={setPage}
                onSearch={setSearch}
                onSort={(key, direction) => setSortConfig({ key, direction })}
                isLoading={isLoading}
                searchPlaceholder="Search user..."
            />
        </div>
    );
};

export default AdminWithdrawalsPage;
