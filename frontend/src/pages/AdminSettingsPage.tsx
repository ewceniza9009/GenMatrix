import { useState, useEffect } from 'react';
import { useGetSettingsQuery, useUpdateSettingMutation } from '../store/api';
import { Settings, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

const AdminSettingsPage = () => {
    const { data: settings, isLoading } = useGetSettingsQuery();
    const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

    // Local state for immediate UI feedback
    const [requireKYC, setRequireKYC] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (settings) {
            setRequireKYC(settings.withdrawals_require_kyc === true);
        }
    }, [settings]);

    const handleToggleKYC = async () => {
        const newValue = !requireKYC;
        setRequireKYC(newValue); // Optimistic update

        try {
            await updateSetting({ key: 'withdrawals_require_kyc', value: newValue }).unwrap();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update setting', error);
            setRequireKYC(!newValue); // Revert on error
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animation-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="text-teal-500" /> System Settings
                </h1>
                <p className="text-gray-500 dark:text-slate-400">Configure global application behaviors.</p>
            </div>

            {/* Settings Sections */}
            <div className="grid gap-6">

                {/* Security Settings Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
                        <Shield className="text-indigo-500" size={24} />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security & Compliance</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Setting Item: KYC for Withdrawals */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Require KYC for Withdrawals</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                    If enabled, users must have "Approved" KYC status to request a payout.
                                </p>
                            </div>

                            <button
                                onClick={handleToggleKYC}
                                disabled={isUpdating}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${requireKYC ? 'bg-teal-500' : 'bg-gray-200 dark:bg-slate-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${requireKYC ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {requireKYC && (
                            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
                                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Users without approved documents will see a denial message when attempting to withdraw.
                                </p>
                            </div>
                        )}

                        {/* Success Message toast */}
                        {showSuccess && (
                            <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce-in">
                                <CheckCircle2 size={18} /> Settings Saved
                            </div>
                        )}

                    </div>
                </div>

                {/* More settings sections can go here (e.g., General, Fees, etc.) */}

            </div>
        </div>
    );
};

export default AdminSettingsPage;
