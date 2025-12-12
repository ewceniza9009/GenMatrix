import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Filter, Loader } from 'lucide-react';

interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string; // Tailwind classes for column alignment e.g. 'text-right'
    mobileLabel?: string; // Optional label for mobile card view
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSearch?: (query: string) => void;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    isLoading?: boolean;
    title?: string;
    searchPlaceholder?: string;
    actions?: React.ReactNode; // Extra buttons like "Add Product"
    mobileRenderer?: (item: T) => React.ReactNode; // Custom mobile card renderer
}

export function DataTable<T extends { _id: string | number }>({
    columns,
    data,
    total,
    page,
    totalPages,
    onPageChange,
    onSearch,
    onSort,
    isLoading,
    title,
    searchPlaceholder = 'Search...',
    actions,
    mobileRenderer
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) onSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    const handleSort = (key: string) => {
        if (!onSort) return;
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        onSort(key, direction);
    };

    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {title && <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>}
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        Showing {data.length} of {total} results
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {onSearch && (
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1b23] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm dark:text-white transition-all"
                            />
                        </div>
                    )}
                    {actions}
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-[#1a1b23] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden relative min-h-[500px] flex flex-col">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader className="animate-spin text-teal-500" size={32} />
                            <span className="text-sm font-bold text-gray-600 dark:text-slate-300">Loading Data...</span>
                        </div>
                    </div>
                )}

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                        className={`px-6 py-4 font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider ${col.className || ''} ${col.sortable ? 'cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 select-none' : ''}`}
                                    >
                                        <div className={`flex items-center gap-1.5 ${col.className?.includes('text-right') ? 'justify-end' : ''}`}>
                                            {col.label}
                                            {col.sortable && (
                                                <span className="text-gray-400">
                                                    {sortConfig?.key === col.key ? (
                                                        sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                                    ) : (
                                                        <ArrowUpDown size={12} />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                                        No results found.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        {columns.map((col) => (
                                            <td key={`${item._id}-${col.key}`} className={`px-6 py-4 text-gray-600 dark:text-slate-300 ${col.className || ''}`}>
                                                {col.render ? col.render(item) : (item as any)[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex-1">
                    {data.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No results found.</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {data.map((item) => (
                                <div key={item._id} className="p-4">
                                    {mobileRenderer ? mobileRenderer(item) : (
                                        <div className="space-y-2">
                                            {columns.map(col => (
                                                <div key={col.key} className="flex justify-between items-start">
                                                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">{col.mobileLabel || col.label}</span>
                                                    <div className="text-sm text-gray-900 dark:text-white text-right">
                                                        {col.render ? col.render(item) : (item as any)[col.key]}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 grid grid-cols-3 items-center bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="flex justify-start">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1 || isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <span className="text-xs font-medium text-gray-400 dark:text-slate-500">
                            Page {page}/{totalPages || 1}
                        </span>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages || isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
