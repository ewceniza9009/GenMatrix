import React from 'react';
import { useGetFomoAlertsQuery } from '../store/api';
import { AlertTriangle, Lock, ArrowRight, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FomoAlerts = () => {
    const { data: alerts, isLoading } = useGetFomoAlertsQuery(undefined);

    if (isLoading || !alerts || alerts.length === 0) return null;

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {alerts.map((alert: any, index: number) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`
              relative overflow-hidden rounded-xl border p-4 shadow-sm flex items-start gap-4
              ${alert.severity === 'critical'
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200'
                                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200'
                            }
            `}
                    >
                        {/* Icon */}
                        <div className={`
              p-2 rounded-full shrink-0
              ${alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-800' : 'bg-amber-100 dark:bg-amber-800'}
            `}>
                            {alert.type === 'INACTIVE_LOSS' ? <Lock size={20} /> : <AlertTriangle size={20} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h4 className="font-bold flex items-center gap-2">
                                {alert.title}
                                {alert.severity === 'critical' && (
                                    <span className="text-[10px] uppercase tracking-wider bg-red-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                                        Urgent
                                    </span>
                                )}
                            </h4>
                            <p className="text-sm mt-1 opacity-90 leading-snug">
                                {alert.message}
                            </p>

                            {alert.actionUrl && (
                                <button
                                    onClick={() => window.location.href = alert.actionUrl}
                                    className={`
                    mt-3 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors
                    ${alert.severity === 'critical'
                                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/30'}
                  `}
                                >
                                    {alert.actionLabel} <ArrowRight size={14} />
                                </button>
                            )}
                        </div>

                        {/* Close (Optional, maybe dismiss) */}
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <XCircle size={18} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default FomoAlerts;
