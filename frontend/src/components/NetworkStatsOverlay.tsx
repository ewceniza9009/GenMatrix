import React from 'react';
import { Activity, Zap, Award, Layers } from 'lucide-react';

interface NetworkStatsOverlayProps {
    nodeData: any;
}

const NetworkStatsOverlay: React.FC<NetworkStatsOverlayProps> = ({ nodeData }) => {
    if (!nodeData || !nodeData.attributes) return null;

    const { groupVolume, leftPV, rightPV, rank, personalPV } = nodeData.attributes;

    return (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-slate-700/50 shadow-xl min-w-[200px] animate-in slide-in-from-left-4 fade-in duration-500">
                <div className="flex items-center gap-2 mb-3 border-b border-gray-100 dark:border-slate-700/50 pb-2">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                        <Activity size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Network Stats</h3>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{nodeData.name}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Group Volume */}
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                                <Layers size={12} /> Group Volume
                            </span>
                            <span className="text-lg font-black text-indigo-700 dark:text-indigo-400">
                                {(groupVolume || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Left PV */}
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg text-center">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Left PV</span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{(leftPV || 0).toLocaleString()}</span>
                        </div>

                        {/* Right PV */}
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg text-center">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Right PV</span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{(rightPV || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-md border border-amber-100 dark:border-amber-500/20">
                            <Award size={12} className="text-amber-500" />
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{rank || 'Member'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 dark:bg-teal-500/10 rounded-md border border-teal-100 dark:border-teal-500/20">
                            <Zap size={12} className="text-teal-500" />
                            <span className="text-xs font-bold text-teal-700 dark:text-teal-400">PPV: {personalPV || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkStatsOverlay;
