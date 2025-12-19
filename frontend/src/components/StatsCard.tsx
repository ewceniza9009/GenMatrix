import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: 'default' | 'primary' | 'warning' | 'danger' | 'info';
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, trendUp, variant = 'default', description }) => {
  const getGradient = () => {
    switch (variant) {
      case 'primary': return 'from-teal-500/10 to-teal-500/5 border-teal-200 dark:border-teal-500/20';
      case 'warning': return 'from-orange-500/10 to-orange-500/5 border-orange-200 dark:border-orange-500/20';
      case 'danger': return 'from-red-500/10 to-red-500/5 border-red-200 dark:border-red-500/20';
      case 'info': return 'from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-500/20';
      default: return 'from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/80 border-gray-200 dark:border-slate-700';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary': return 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-500/10';
      case 'warning': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10';
      case 'danger': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10';
      case 'info': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10';
      default: return 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-white/5 group-hover:bg-teal-500 group-hover:text-white';
    }
  };

  return (
    <div className={`
      relative overflow-hidden p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group h-full border
      bg-gradient-to-br ${getGradient()}
    `}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl transition-colors duration-300 ${getIconColor()}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </div>
          )}
        </div>

        <div>
          <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</h3>
          {description && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 font-medium">{description}</p>
          )}
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-current opacity-[0.03] transform group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
    </div>
  );
};

export default StatsCard;
