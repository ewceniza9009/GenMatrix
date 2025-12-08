import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, trendUp }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        {trend && (
          <p className={`text-sm mt-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
          </p>
        )}
      </div>
      <div className="p-3 bg-slate-700 rounded-full">
        <Icon className="text-teal-400 w-6 h-6" />
      </div>
    </div>
  );
};

export default StatsCard;
