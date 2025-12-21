import { useState } from 'react';
import { useGetDownlineQuery } from '../../store/api';
import { DataTable } from '../DataTable';
import { User, Shield, Activity } from 'lucide-react';

const ListView = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading, isFetching } = useGetDownlineQuery({
        page,
        limit: 20,
        search
    });

    const columns = [
        {
            label: 'Member',
            key: 'username',
            render: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {row.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">{row.username}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            label: 'Rank',
            key: 'rank',
            render: (row: any) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ring-1 ring-inset
                ${row.rank === 'Diamond' ? 'bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-900/30 dark:text-cyan-300' :
                        row.rank === 'Gold' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            row.rank === 'Silver' ? 'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300' :
                                row.rank === 'Bronze' ? 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400' :
                                    'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400'
                    }
            `}>
                    {row.rank || 'Member'}
                </span>
            )
        },
        {
            label: 'Sponsor',
            key: 'sponsorId',
            render: (row: any) => row.sponsorId?.username || 'System'
        },
        {
            label: 'Active',
            key: 'isActive',
            render: (row: any) => (
                row.isActive
                    ? <span className="text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1"><Activity size={12} /> Active</span>
                    : <span className="text-red-500 dark:text-red-400 text-xs font-bold flex items-center gap-1"><Shield size={12} /> Inactive</span>
            )
        },
        {
            label: 'Left PV',
            key: 'currentLeftPV',
            render: (row: any) => row.currentLeftPV?.toLocaleString() || '0'
        },
        {
            label: 'Right PV',
            key: 'currentRightPV',
            render: (row: any) => row.currentRightPV?.toLocaleString() || '0'
        },
        {
            label: 'Joined',
            key: 'enrollmentDate',
            render: (row: any) => new Date(row.enrollmentDate).toLocaleDateString()
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                    <User size={18} className="text-teal-500" /> Downline List
                </h3>
                <div className="w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search downline..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <DataTable
                    columns={columns}
                    data={data?.data || []}
                    isLoading={isLoading || isFetching}
                    total={data?.meta?.total || 0}
                    page={page}
                    totalPages={data?.meta?.totalPages || 1}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
};

export default ListView;
