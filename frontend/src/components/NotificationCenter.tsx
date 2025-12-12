import { useState } from 'react';
import { Bell, X, Check, Info, AlertTriangle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
    useSeedNotificationsMutation
} from '../store/api';
import { formatDistanceToNow } from 'date-fns';

import { useUI } from './UIContext';

const NotificationCenter = () => {
    const { showAlert } = useUI();
    const [isOpen, setIsOpen] = useState(false);

    // Live Data
    const { data: notifications = [], isLoading } = useGetNotificationsQuery(undefined, {
        pollingInterval: 30000,
    });
    const [markRead] = useMarkNotificationReadMutation();
    const [markAllRead] = useMarkAllNotificationsReadMutation();
    const [seedNotifications] = useSeedNotificationsMutation();

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await markRead(id).unwrap();
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllRead({}).unwrap();
        } catch (err) {
            console.error('Failed to mark all read', err);
        }
    };

    const handleSeed = async () => {
        try {
            await seedNotifications({}).unwrap();
            showAlert('Test notifications created!', 'success');
        } catch (err) {
            console.error('Failed to seed', err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
            case 'error': return <X size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-teal-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for mobile */}
                        <div
                            className="fixed inset-0 z-40 bg-black/20 md:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-20 left-4 right-4 md:absolute md:top-full md:left-auto md:right-0 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden mt-0 md:mt-2"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-400"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-8 flex justify-center">
                                        <Loader className="animate-spin text-teal-500" />
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-slate-400 text-sm">
                                        <p>No new notifications</p>
                                        <button onClick={handleSeed} className="mt-4 text-xs text-teal-500 underline">
                                            Generate Test Data
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                        {notifications.map((item: any) => (
                                            <div
                                                key={item._id}
                                                onClick={() => handleMarkAsRead(item._id)}
                                                className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer flex gap-3 ${!item.isRead ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''}`}
                                            >
                                                <div className={`mt-1 p-2 rounded-full h-fit shrink-0 ${item.type === 'success' ? 'bg-green-100 dark:bg-green-500/20' :
                                                    item.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-500/20' :
                                                        item.type === 'error' ? 'bg-red-100 dark:bg-red-500/20' :
                                                            'bg-teal-100 dark:bg-teal-500/20'
                                                    }`}>
                                                    {getIcon(item.type)}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${!item.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-300'}`}>
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                                        {item.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-medium">
                                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {!item.isRead && (
                                                    <div className="mt-2 text-teal-500">
                                                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 text-center">
                                <button className="text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                                    View All Activity
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
