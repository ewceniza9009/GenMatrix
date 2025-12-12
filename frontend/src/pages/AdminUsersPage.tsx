import { useState } from 'react';
import { useGetAllUsersQuery, useUpdateUserRoleMutation } from '../store/api';
import { ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DataTable } from '../components/DataTable';

const AdminUsersPage = () => {
    const currentUser = useSelector((state: RootState) => state.auth.user) as any;

    // Query State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'enrollmentDate', direction: 'desc' });

    const { data, isLoading } = useGetAllUsersQuery({
        page,
        limit: 10,
        search,
        sortBy: sortConfig.key,
        order: sortConfig.direction
    });

    const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

    const handleRoleChange = async (userId: string, currentRole: string, username: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        if (userId === currentUser?._id) {
            alert("You cannot change your own role.");
            return;
        }

        if (!confirm(`Are you sure you want to change ${username}'s role to ${newRole.toUpperCase()}?`)) return;

        try {
            await updateRole({ userId, role: newRole }).unwrap();
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const columns = [
        {
            key: 'username',
            label: 'User',
            sortable: true,
            render: (user: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
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
