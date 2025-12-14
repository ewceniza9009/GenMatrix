import { useState } from 'react';
import { useGetAllUsersQuery, useUpdateUserRoleMutation, useToggleUserStatusMutation } from '../store/api';
import { ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DataTable } from '../components/DataTable';

import { useUI } from '../components/UIContext';

const AdminUsersPage = () => {
    const { showConfirm, showAlert } = useUI();
    const currentUser = useSelector((state: RootState) => state.auth.user) as any;

    // Query State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'enrollmentDate', direction: 'desc' });

    const [isActiveFilter, setIsActiveFilter] = useState<string>(''); // ''=All, 'true'=Active, 'false'=Inactive

    const { data, isLoading } = useGetAllUsersQuery({
        page,
        limit: 10,
        search,
        sortBy: sortConfig.key,
        order: sortConfig.direction,
        isActive: isActiveFilter
    });

    const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
    const [toggleStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();

    const handleRoleChange = async (userId: string, currentRole: string, username: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        if (userId === currentUser?._id) {
            showAlert("You cannot change your own role.", 'warning');
            return;
        }

        showConfirm({
            title: `Change Role to ${newRole.toUpperCase()}?`,
            message: `Are you sure you want to change ${username}'s role to ${newRole.toUpperCase()}?`,
            type: newRole === 'admin' ? 'info' : 'danger',
            confirmText: 'Yes, Change Role',
            onConfirm: async () => {
                try {
                    await updateRole({ userId, role: newRole }).unwrap();
                    showAlert(`User role updated to ${newRole}`, 'success');
                } catch (err) {
                    showAlert('Failed to update role', 'error');
                }
            }
        });
    };

    const handleStatusChange = async (userId: string, currentStatus: boolean, username: string) => {
        const newStatus = !currentStatus;

        if (userId === currentUser?._id) {
            showAlert("You cannot deactivate your own account.", 'warning');
            return;
        }

        showConfirm({
            title: newStatus ? 'Activate User?' : 'Deactivate User?',
            message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${username}?`,
            type: newStatus ? 'info' : 'danger',
            confirmText: newStatus ? 'Yes, Activate' : 'Yes, Deactivate',
            onConfirm: async () => {
                try {
                    await toggleStatus({ userId, isActive: newStatus }).unwrap();
                    showAlert(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
                } catch (err) {
                    showAlert('Failed to update status', 'error');
                }
            }
        });
    };

    const columns = [
        {
            key: 'username',
            label: 'User',
            sortable: true,
            render: (user: any) => (
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.isActive
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-gray-400'
                        }`}>
                        {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className={`font-medium ${user.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {user.username}
                        </div>
                        {!user.isActive && <span className="text-[10px] text-red-500 font-bold uppercase">Inactive</span>}
                    </div>
                </div>
            )
        },
        { key: 'email', label: 'Email', sortable: true },
        {
            key: 'enrollmentDate',
            label: 'Joined',
            sortable: true,
            render: (user: any) => new Date(user.enrollmentDate).toLocaleDateString()
        },
        {
            key: 'isActive',
            label: 'Status',
            sortable: true,
            render: (user: any) => (
                <button
                    onClick={() => handleStatusChange(user._id, user.isActive, user.username)}
                    disabled={isToggling || user._id === currentUser?._id}
                    className={`px-2 py-1 rounded-full text-xs font-bold border transition-colors ${user.isActive
                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 hover:bg-green-200 dark:hover:bg-green-500/20'
                        : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/20'
                        }`}
                >
                    {user.isActive ? 'Active' : 'Inactive'}
                </button>
            )
        },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (user: any) => user.role === 'admin' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                    <ShieldCheck size={12} /> Admin
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-400 border border-gray-200 dark:border-white/10">
                    User
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (user: any) => (
                <button
                    onClick={() => handleRoleChange(user._id, user.role, user.username)}
                    disabled={isUpdating || user._id === currentUser?._id}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${user.role === 'admin'
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50'
                        : 'text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 disabled:opacity-50'
                        }`}
                >
                    {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6 animation-fade-in">
            <div className="flex justify-end gap-2">
                <select
                    value={isActiveFilter}
                    onChange={(e) => setIsActiveFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">All Statuses</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>
            </div>
            <DataTable
                title="User Management"
                columns={columns}
                data={data?.data || []}
                total={data?.total || 0}
                page={page}
                totalPages={data?.totalPages || 1}
                onPageChange={setPage}
                onSearch={setSearch}
                onSort={(key, direction) => setSortConfig({ key, direction })}
                isLoading={isLoading}
                searchPlaceholder="Search users by name or email..."
            />
        </div>
    );
};

export default AdminUsersPage;
