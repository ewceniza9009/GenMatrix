import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useUploadKYCMutation, useGenerate2FAMutation, useVerify2FAMutation, useDisable2FAMutation } from '../store/api';
import { Shield, CheckCircle, XCircle, Loader, Upload, Smartphone } from 'lucide-react';
import PageHeader from '../components/PageHeader';

import { useUI } from '../components/UIContext';

const SecuritySettings = () => {
    const { showConfirm, showAlert } = useUI();
    const user = useSelector((state: RootState) => state.auth.user);
    const [uploadKYC, { isLoading: isUploading }] = useUploadKYCMutation();
    const [generate2FA] = useGenerate2FAMutation();
    const [verify2FA] = useVerify2FAMutation();
    const [disable2FA] = useDisable2FAMutation();

    // KYC State
    const [file, setFile] = useState<File | null>(null);

    // 2FA State
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [token, setToken] = useState('');
    const [step, setStep] = useState<'idle' | 'scanning'>('idle');

    // KYC Handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUploadKYC = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('document', file);
        try {
            await uploadKYC(formData).unwrap();
            showAlert('Document uploaded successfully. Please wait for admin approval.', 'success');
            setFile(null);
        } catch (err: any) {
            console.error(err);
            showAlert(err?.data?.message || 'Upload failed', 'error');
        }
    };

    // 2FA Handlers
    const handleStart2FA = async () => {
        try {
            const data = await generate2FA({}).unwrap();
            setQrCode(data.qrCode);
            setStep('scanning');
        } catch (err) {
            console.error(err);
        }
    };

    const handleVerify2FA = async () => {
        if (!token) return;
        try {
            await verify2FA({ token }).unwrap();
            showAlert('2FA Enabled Successfully!', 'success');
            setStep('idle');
            setQrCode(null);
            setToken('');
        } catch (err) {
            showAlert('Invalid Code', 'error');
        }
    };

    const handleDisable2FA = async () => {
        showConfirm({
            title: 'Disable 2FA?',
            message: 'Are you sure? This will reduce your account security.',
            type: 'danger',
            confirmText: 'Verify & Disable',
            onConfirm: () => {
                const code = prompt('Enter your 2FA code to confirm:');
                if (!code) return;
                disable2FA({ token: code }).unwrap()
                    .then(() => showAlert('2FA Disabled', 'success'))
                    .catch(() => showAlert('Invalid Code', 'error'));
            }
        });
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Security & Compliance"
                subtitle="Manage your account security and verification."
                icon={<Shield size={24} />}
            />

            {/* KYC Section */}
            <div className="bg-white dark:bg-[#1a1b23] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-lg dark:text-white flex items-center gap-2">
                            <Shield className="text-teal-500" /> Identity Verification (KYC)
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Verify your identity to unlock withdrawals and higher limits.
                        </p>
                    </div>
                    {user?.kycStatus === 'approved' ? (
                        <div className="flex flex-col items-end text-green-500">
                            <CheckCircle size={24} />
                            <span className="text-xs font-bold uppercase mt-1">Verified</span>
                        </div>
                    ) : user?.kycStatus === 'pending' ? (
                        <div className="flex flex-col items-end text-amber-500">
                            <Loader size={24} className="animate-spin" />
                            <span className="text-xs font-bold uppercase mt-1">Pending Review</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-end text-red-500">
                            <XCircle size={24} />
                            <span className="text-xs font-bold uppercase mt-1">Not Verified</span>
                        </div>
                    )}
                </div>

                {user?.kycStatus !== 'approved' && user?.kycStatus !== 'pending' && (
                    <div className="mt-4 p-4 border border-dashed border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900/50">
                        {user?.kycStatus === 'rejected' && (
                            <div className="mb-4 text-red-500 text-sm bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
                                <strong>Reason for Rejection:</strong> {user?.kycComment || 'Document illegible or invalid.'}
                            </div>
                        )}
                        <label className="block text-sm font-medium dark:text-slate-300 mb-2">Upload Government ID (Passport, Driver License)</label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-500/10 dark:file:text-teal-400"
                            />
                            <button
                                onClick={handleUploadKYC}
                                disabled={!file || isUploading}
                                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                            >
                                {isUploading ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
                                Upload
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Max 15MB. JPEG, PNG, or PDF only.</p>
                    </div>
                )}
            </div>

            {/* 2FA Section */}
            <div className="bg-white dark:bg-[#1a1b23] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-lg dark:text-white flex items-center gap-2">
                            <Smartphone className="text-purple-500" /> Two-Factor Authentication (2FA)
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Secure your account with Google Authenticator.
                        </p>
                    </div>
                    {user?.twoFactorSecret?.enabled ? (
                        <div className="flex items-center gap-2">
                            <span className="text-green-500 font-bold text-xs uppercase border border-green-500 px-2 py-0.5 rounded-full">Active</span>
                            <button onClick={handleDisable2FA} className="text-red-500 text-xs hover:underline">Disable</button>
                        </div>

                    ) : (
                        <span className="text-gray-400 font-bold text-xs uppercase border border-gray-400 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                </div>

                {!user?.twoFactorSecret?.enabled && step === 'idle' && (
                    <button
                        onClick={handleStart2FA}
                        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
                    >
                        Enable 2FA
                    </button>
                )}

                {step === 'scanning' && qrCode && (
                    <div className="mt-4 flex flex-col md:flex-row gap-8 items-center bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 mix-blend-multiply" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">1. Scan QR Code</h4>
                                <p className="text-sm text-gray-500">Open Google Authenticator app on your phone and scan the image.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">2. Enter Code</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={token}
                                        onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        className="w-32 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                                    />
                                    <button
                                        onClick={handleVerify2FA}
                                        disabled={token.length !== 6}
                                        className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg transition font-bold"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecuritySettings;
