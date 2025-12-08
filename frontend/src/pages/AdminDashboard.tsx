import React, { useState } from 'react';
import StatsCard from '../components/StatsCard';
import { DollarSign, Users, PlayCircle, CheckCircle } from 'lucide-react';
import { useGetTreeQuery } from '../store/api'; // Placeholder, ideally use admin-specific API

const AdminDashboard = () => {
  const [processing, setProcessing] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const handleRunCommissions = async () => {
    setProcessing(true);
    try {
        // Call backend API (assuming fetch or axios here for simplicity, or add to store)
        const res = await fetch('http://localhost:5000/api/v1/admin/run-commissions', { method: 'POST' });
        const data = await res.json();
        setLastRun(`Completed at ${new Date().toLocaleTimeString()} - ${data.usersProcessed} users processed.`);
    } catch (err) {
        setLastRun('Failed to run commissions');
    } finally {
        setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Control Center</h1>
      
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total System Payout" 
          value="$124,500" 
          icon={DollarSign} 
          trend="All Time"
          trendUp={true}
        />
        <StatsCard 
          title="Total Users" 
          value="1,240" 
          icon={Users} 
          trend="+45 today"
          trendUp={true}
        />
        <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700 flex flex-col justify-between">
           <div>
             <p className="text-slate-400 text-sm font-medium">Commission Engine</p>
             <h3 className="text-xl font-bold text-white mt-1">Binary Pairing</h3>
           </div>
           
           <button 
             onClick={handleRunCommissions}
             disabled={processing}
             className={`mt-4 w-full flex items-center justify-center space-x-2 p-3 rounded font-bold transition-colors ${
                processing ? 'bg-slate-600 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-500'
             }`}
           >
             {processing ? (
                <span>Processing...</span>
             ) : (
                <>
                  <PlayCircle size={20} />
                  <span>Run Payout Cycle</span>
                </>
             )}
           </button>
           {lastRun && <p className="text-xs text-slate-400 mt-2 text-center">{lastRun}</p>}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Recent System Activities</h2>
        <p className="text-slate-400">Log visualization coming soon...</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
