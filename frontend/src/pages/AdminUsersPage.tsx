import { useState } from 'react';
import { useGetAllUsersQuery, useUpdateUserRoleMutation } from '../store/api';
import { Search, User, Loader, ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const AdminUsersPage = () => {
    const currentUser = useSelector((state: RootState) => state.auth.user) as any;
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { data, isLoading } = useGetAllUsersQuery({ page, limit: 10, search: debouncedSearch });
    const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

    // Debounce Search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1); // Reset to page 1
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const handleRoleChange = async (userId: string, currentRole: string, username: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        if (userId === currentUser?._id) {
            alert("You cannot change your own role.");
            return;
        }

        if (!confirm(`Are you sure you want to change ${username}'s role to ${newRole.toUpperCase()}?`)) return;

        try {
            await updateRole({ userId, role: newRole }).unwrap();
            // Toast or alert handled by UI updates or implementing toast system later
        } catch (err) {
            alert('Failed to update role');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-teal-500" /> User Management
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400">Manage user accounts and privileges.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1b23] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm dark:text-white"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a1b23] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-slate-400 font-medium border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <Loader className="animate-spin inline-block mr-2" size={16} /> Loading users...
                                    </td>
                                </tr>
                            ) : data?.users?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                data?.users?.map((user: any) => (
                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {user.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{new Date(user.enrollmentDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                                                    <ShieldCheck size={12} /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-400 border border-gray-200 dark:border-white/10">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
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
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">
                            <Loader className="animate-spin inline-block mr-2" size={16} /> Loading users...
                        </div>
                    ) : data?.users?.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No users found.</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {data?.users?.map((user: any) => (
                                <div key={user._id} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{user.username}</h3>
                                                <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                        {user.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                                                <ShieldCheck size={10} /> Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-400 border border-gray-200 dark:border-white/10">
                                                User
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-gray-400">Joined: {new Date(user.enrollmentDate).toLocaleDateString()}</span>
                                        <button
                                            onClick={() => handleRoleChange(user._id, user.role, user.username)}
                                            disabled={isUpdating || user._id === currentUser?._id}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${user.role === 'admin'
                                                ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
                                                : 'bg-teal-50 text-teal-600 border border-teal-100 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400'
                                                } disabled:opacity-50`}
                                        >
                                            {user.role === 'admin' ? 'Demote' : 'Promote'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {data?.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="text-sm text-gray-500 disabled:opacity-50 hover:text-teal-600 font-medium"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-400">Page {page} of {data.totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                            disabled={page === data.totalPages}
                            className="text-sm text-gray-500 disabled:opacity-50 hover:text-teal-600 font-medium"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
