import React, { useState } from 'react';
import TreeVisualizer from '../components/TreeVisualizer';
import StatsCard from '../components/StatsCard';
import { DollarSign, Users, TrendingUp, Activity, ChevronUp, ChevronDown } from 'lucide-react';

import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetUplineQuery } from '../store/api';

const DashboardHome = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: uplineData } = useGetUplineQuery(user?.id, { skip: !user?.id });
  const sponsor = uplineData?.sponsor;

  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-3xl font-bold text-white">
            {isOverviewExpanded ? 'Overview' : 'Network Tree'}
        </h1>
        <button 
          onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors border border-slate-700 font-medium"
        >
          <span>{isOverviewExpanded ? 'Hide Stats' : 'Show Stats'}</span>
          {isOverviewExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      {/* Collapsible Section */}
      {isOverviewExpanded && (
        <div className="space-y-6 shrink-0 animation-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                title="Total Earnings" 
                value="$12,450.00" 
                icon={DollarSign} 
                trend="+12% from last month"
                trendUp={true}
                />
                <StatsCard 
                title="Direct Reports" 
                value="24" 
                icon={Users} 
                trend="+4 this week"
                trendUp={true}
                />
                <StatsCard 
                title="Network Volume" 
                value="45,200 PV" 
                icon={Activity} 
                trend="Left Leg Strong"
                trendUp={true}
                />
                <StatsCard 
                title="Next Rank" 
                value="85%" 
                icon={TrendingUp} 
                trend="Close to Platinum"
                trendUp={true}
                />
            </div>

            {/* Network Tools */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">Network Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referral Links */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400">Your Referral Links</h3>
                    <div className="flex space-x-2">
                        <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded text-sm transition-colors border border-slate-600">
                        Copy Left Leg Link
                        </button>
                        <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded text-sm transition-colors border border-slate-600">
                        Copy Right Leg Link
                        </button>
                    </div>
                </div>

                {/* Manual Actions */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400">Quick Actions</h3>
                    <div className="flex space-x-4 items-center">
                        <button 
                        onClick={() => window.location.href = '/enroll'}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                            <Users size={18} />
                            <span>Enroll New Member</span>
                        </button>
                        <div className="text-xs text-slate-500">
                            <div>Your Sponsor: <span className="text-teal-400">{sponsor ? `${sponsor.username}` : 'Loading...'}</span></div>
                            <div>Current Rank: <span className="text-yellow-500">Silver</span></div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
      )}

      {/* Tree Section - Fills remaining space */}
      <div className={`flex-1 flex flex-col min-h-[500px] transition-all duration-300 ${isOverviewExpanded ? '' : 'h-full'}`}>
        {!isOverviewExpanded && <h2 className="text-xl font-semibold text-white mb-4">Live Network Tree</h2>}
         {isOverviewExpanded && <h2 className="text-xl font-semibold text-white mb-4">Live Network Tree</h2>}
        
        <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative">
           <TreeVisualizer />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
