import { useState } from 'react';
import StatsCard from '../components/StatsCard';
import { DollarSign, Users, PlayCircle, Activity, AlertCircle, CheckCircle, Info, ArrowUpDown, Clock, FileWarning } from 'lucide-react';
import { useRunCommissionsMutation, useGetSystemLogsQuery, useGetAdminStatsQuery, useGetSystemAnalyticsQuery } from '../store/api';
import { useUI } from '../components/UIContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
  const { showConfirm, showAlert } = useUI();

  const [runCommissions, { isLoading: processing }] = useRunCommissionsMutation();
  const { data: statsData, isLoading: statsLoading } = useGetAdminStatsQuery(undefined, { pollingInterval: 30000 });
  const { data: analyticsData } = useGetSystemAnalyticsQuery(undefined, { pollingInterval: 60000 });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('timestamp');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const limit = 10;

  // Debounce search could be added here, but for now direct state is fine or use a debounced value
  const { data: logsData, isLoading: loadingLogs, error: logsError } = useGetSystemLogsQuery({
    page,
    limit,
    search,
    sortBy,
    order
  }, { pollingInterval: 5000 });

  const logs = logsData?.data || [];
  const totalPages = logsData?.totalPages || 1;

  const [lastRun, setLastRun] = useState<string | null>(null);

  const handleRunCommissions = () => {
    showConfirm({
      title: 'Run Payout Cycle?',
      message: 'This will process commissions for all eligible users. Are you sure you want to proceed?',
      confirmText: 'Yes, Run Payouts',
      type: 'info',
      onConfirm: async () => {
        try {
          const res = await runCommissions({}).unwrap();
          const msg = `Completed: ${res.usersProcessed} users processed.`;
          setLastRun(msg);
          showAlert(msg, 'success');
        } catch (err: any) {
          console.error(err);
          const errorMsg = err.data?.message || 'Payout Failed';
          setLastRun(`Failed: ${errorMsg}`);
          showAlert(errorMsg, 'error');
        }
      }
    });
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams({ format: 'csv', search, sortBy, order });
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1/';
    window.location.href = `${baseUrl}admin/logs?${params.toString()}`;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="text-gray-400" />;
    return order === 'asc' ? <ArrowUpDown size={14} className="text-teal-600 rotate-180 transition-transform" /> : <ArrowUpDown size={14} className="text-teal-600 transition-transform" />;
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'ERROR': return <AlertCircle size={18} className="text-red-500" />;
      case 'SUCCESS': return <CheckCircle size={18} className="text-green-500" />;
      case 'WARNING': return <AlertCircle size={18} className="text-yellow-500" />;
      default: return <Info size={18} className="text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin<span className="text-teal-600">Control</span></h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">System Overview & Management</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-mono text-gray-400 dark:text-slate-500">SYSTEM STATUS: <span className="text-green-500 font-bold">ONLINE</span></p>
          <p className="text-[10px] text-gray-400 dark:text-slate-600">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Payouts"
          value={statsLoading ? "..." : `$${(statsData?.totalCommissions || 0).toLocaleString()}`}
          icon={DollarSign}
          trend="+12.5%"
          trendUp={true}
          variant="primary"
          description="Lifetime system commission"
        />
        <StatsCard
          title="Active Users"
          value={statsLoading ? "..." : (statsData?.totalUsers || 0).toLocaleString()}
          icon={Users}
          trend="+5"
          trendUp={true}
          description="Total active memberships"
        />

        {/* Conditional "Need Attention" Cards take priority spots if active */}
        {statsData?.pendingWithdrawalsCount > 0 ? (
          <StatsCard
            title="Pending Withdrawals"
            value={statsData.pendingWithdrawalsCount}
            icon={Clock}
            variant="warning"
            description="Requests awaiting approval"
          />
        ) : (
          <StatsCard
            title="System Health"
            value="98.9%"
            icon={Activity}
            variant="default"
            description="Uptime (Last 30 Days)"
          />
        )}

        {statsData?.pendingKYCCount > 0 ? (
          <StatsCard
            title="Pending KYC"
            value={statsData.pendingKYCCount}
            icon={FileWarning}
            variant="info"
            description="Verifications required"
          />
        ) : (
          <StatsCard
            title="Total Revenue"
            value="$452,100"
            icon={DollarSign}
            variant="default"
            description="Gross Volume (Est)"
          />
        )}
      </div>

      {/* Main Content Split: Chart (Main) & Control Panel (Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={20} className="text-teal-600" />
              Revenue Trends
            </h2>
            <select className="bg-gray-50 dark:bg-slate-700 border-none text-xs rounded-lg px-3 py-1 text-gray-600 dark:text-gray-300">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>

          <div className="h-[350px] w-full">
            {analyticsData?.payouts ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.payouts}>
                  <defs>
                    <linearGradient id="colorAmountPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#2dd4bf' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Payout']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#0d9488"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAmountPrimary)"
                    activeDot={{ r: 6, fill: "#0f766e", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Action Control Panel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg flex flex-col relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-10 -translate-y-10"></div>

          <h2 className="text-lg font-bold mb-1 z-10">Commission Engine</h2>
          <p className="text-slate-400 text-xs mb-6 z-10">Manage system payouts and calculations.</p>

          <div className="space-y-4 z-10 flex-grow">
            <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-slate-300">NEXT PAYOUT</span>
                <span className="text-xs font-bold text-teal-400">READY</span>
              </div>
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 w-full animate-pulse"></div>
              </div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Users Qualified</span>
                <span className="text-sm font-bold text-white">{statsData?.totalUsers || 0}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunCommissions}
            disabled={processing}
            className={`
              mt-6 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg
              ${processing
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-400 text-white shadow-teal-900/50'}
            `}
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                <PlayCircle size={20} fill="currentColor" className="text-teal-900/50" />
                Run Payout Cycle
              </>
            )}
          </button>

          {lastRun && (
            <div className={`mt-4 text-xs text-center p-2 rounded-lg ${lastRun.includes('Failed') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
              {lastRun}
            </div>
          )}
        </div>
      </div>

      {/* System Activities Log Visualization (Console Style) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-slate-800/50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Logs
          </h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter logs..."
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={handleExportCSV} className="text-xs font-medium text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors">
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {logsError ? (
            <div className="p-12 text-center">
              <p className="text-red-500 mb-2">Failed to load logs</p>
            </div>
          ) : loadingLogs ? (
            <div className="p-12 text-center text-gray-400">Loading system activity...</div>
          ) : !logs || logs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No activity recorded.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700/50">
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('type')}>Type</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('action')}>Action</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-1/2 cursor-pointer" onClick={() => handleSort('details')}>Message</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right cursor-pointer" onClick={() => handleSort('timestamp')}>Timestamp</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {logs.map((log: any, index: number) => (
                  <tr key={log._id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/30 dark:bg-slate-800/50'}`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.type)}
                        <span className={`font-bold ${log.type === 'ERROR' ? 'text-red-600' : log.type === 'WARNING' ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}>{log.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-800 dark:text-slate-200">
                      {log.action}
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-slate-400 truncate max-w-xs group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-lg group-hover:z-10 relative">
                      {log.details}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Console Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <span className="text-[10px] text-gray-400 font-mono">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 rounded border border-gray-200 dark:border-slate-600 text-[10px] bg-white dark:bg-slate-700 disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded border border-gray-200 dark:border-slate-600 text-[10px] bg-white dark:bg-slate-700 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;