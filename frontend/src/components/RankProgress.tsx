import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Lock } from 'lucide-react';

interface RankProgressProps {
    currentRank: string;
    nextRank: string;
    progress: number; // 0-100
    amountNeeded: number;
    currentEarnings: number;
    targetEarnings: number;
}

const RankProgress: React.FC<RankProgressProps> = ({
    currentRank,
    nextRank,
    progress,
    amountNeeded,
    currentEarnings,
    targetEarnings
}) => {
    // Config for styles
    const getRankColor = (rank: string) => {
        switch (rank) {
            case 'Bronze': return 'text-amber-700 bg-amber-100 dark:text-amber-500 dark:bg-amber-900/30';
            case 'Silver': return 'text-slate-500 bg-slate-100 dark:text-slate-300 dark:bg-slate-800';
            case 'Gold': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            case 'Diamond': return 'text-cyan-500 bg-cyan-100 dark:text-cyan-300 dark:bg-cyan-900/30';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    const isMaxRank = currentRank === 'Diamond';

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Trophy size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp size={18} className="text-yellow-500" />
                            Road to {isMaxRank ? 'Legend' : nextRank}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            {isMaxRank
                                ? "You've reached the pinnacle!"
                                : `Earn $${amountNeeded.toLocaleString()} more to rank up.`}
                        </p>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getRankColor(currentRank)}`}>
                        <Star size={12} /> {currentRank}
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="h-4 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2 border border-gray-200 dark:border-slate-600">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full ${isMaxRank ? 'bg-cyan-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'} relative`}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                    </motion.div>
                </div>

                {/* Labels */}
                <div className="flex justify-between text-xs font-medium text-gray-400 dark:text-slate-500">
                    <span>${currentEarnings.toLocaleString()}</span>
                    <span className="flex items-center gap-1">
                        {isMaxRank ? <Trophy size={10} /> : <Lock size={10} />}
                        ${targetEarnings.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* CSS for Shimmer */}
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
};

export default RankProgress;
