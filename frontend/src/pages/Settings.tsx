import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetConfigQuery, useUpdateConfigMutation, useUpdateProfileMutation } from '../store/api';
import { Sliders, Shield, Network, Settings as SettingsIcon, Save, User } from 'lucide-react';
import { motion } from 'framer-motion';
import PersonalSettings from '../components/settings/PersonalSettings';
import SecuritySettings from './SecuritySettings';

import { useUI } from '../components/UIContext';

const Settings = () => {
  const { showAlert } = useUI();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateProfile] = useUpdateProfileMutation();

  // Tab State
  const [activeTab, setActiveTab] = useState('personal');

  // Admin Config State
  const { data: configData } = useGetConfigQuery(undefined, { skip: user?.role !== 'admin' });
  const [updateConfig] = useUpdateConfigMutation();

  const [adminForm, setAdminForm] = useState({
    pairRatio: '1:1',
    commissionValue: 10,
    dailyCapAmount: 500,
    pairUnit: 100,
    referralBonusPercentage: 10,
    matchingBonusGenerations: '10, 5, 2',
    holdingTankMode: true
  });

  useEffect(() => {
    if (configData) {
      setAdminForm({
        pairRatio: configData.pairRatio,
        commissionValue: configData.commissionValue,
        dailyCapAmount: configData.dailyCapAmount,
        pairUnit: configData.pairUnit,
        referralBonusPercentage: configData.referralBonusPercentage || 10,
        matchingBonusGenerations: configData.matchingBonusGenerations ? configData.matchingBonusGenerations.join(', ') : '10, 5, 2',
        holdingTankMode: configData.holdingTankMode ?? true
      });
    }
  }, [configData]);

  // User Config State
  const [preference, setPreference] = useState('weaker_leg');
  const [enableHoldingTank, setEnableHoldingTank] = useState('system'); // Default to system

  useEffect(() => {
    if (user) {
      if (user.spilloverPreference) setPreference(user.spilloverPreference);
      if (user.enableHoldingTank) setEnableHoldingTank(user.enableHoldingTank);
    }
  }, [user]);

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        spilloverPreference: preference,
        enableHoldingTank,
      }).unwrap();

      showAlert('Profile Updated', 'success');
    } catch (err) {
      showAlert('Error updating profile', 'error');
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...adminForm,
        matchingBonusGenerations: adminForm.matchingBonusGenerations.split(',').map(s => Number(s.trim()))
      };
      await updateConfig(payload).unwrap();
      showAlert('System Configuration Updated', 'success');
    } catch (err) {
      showAlert('Error updating config', 'error');
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal & Account', icon: User },
    { id: 'security', label: 'Security & 2FA', icon: Shield },
    { id: 'network', label: 'Placement Logic', icon: Network }, // Moved Network here
    { id: 'admin', label: 'System Rules', icon: Sliders, adminOnly: true },
  ];

  return (
    <div className="w-full mx-auto space-y-6 md:space-y-8 pb-12 animate-fade-in-up">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-teal-500/10 p-3 rounded-2xl">
          <SettingsIcon size={32} className="text-teal-500" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Settings & Preferences</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your account and system security</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-200 dark:border-white/10 pb-1">
        {tabs.map(tab => {
          if (tab.adminOnly && user?.role !== 'admin') return null;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'personal' && <PersonalSettings />}
        {activeTab === 'security' && <SecuritySettings />}

        {activeTab === 'network' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 p-4 md:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-teal-50 dark:bg-teal-500/20 p-2 rounded-lg">
                <Network className="text-teal-500" size={24} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Placement Strategy</h2>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">Automatic Placement</label>
                <select
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="weaker_leg">Auto Balance (Weaker Leg)</option>
                  <option value="left">Extreme Left</option>
                  <option value="right">Extreme Right</option>
                  <option value="balanced">Alternate (1 Left, 1 Right)</option>
                </select>
                <p className="text-xs text-slate-400 mt-2">Determines where new signups from your referral link are placed.</p>
              </div>

              <div className="mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Holding Tank Preference</label>
                <select
                  value={enableHoldingTank}
                  onChange={(e) => setEnableHoldingTank(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="system">Use System Default</option>
                  <option value="enabled">Always Enabled (Override)</option>
                  <option value="disabled">Always Disabled (Override)</option>
                </select>
                <p className="text-xs text-slate-400 mt-2">
                  "System Default" follows the admin setting. <br />
                  "Always Enabled/Disabled" overrides the admin setting for YOUR recruits.
                </p>
              </div>
              <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20">
                <Save size={18} /> Save Preference
              </button>
            </form>
          </div>
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-3xl p-4 md:p-8 text-gray-900 dark:text-white shadow-xl dark:shadow-2xl relative overflow-hidden border border-gray-100 dark:border-slate-700"
          >
            {/* Decorative Background - Dark Mode Only */}
            <div className="hidden dark:block absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-teal-50 dark:bg-teal-500/20 p-2 rounded-lg">
                  <Sliders className="text-teal-600 dark:text-teal-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Rules</h2>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Control the financial and network engine.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleSaveAdmin(e as any)}
                className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 active:scale-[0.99] transition-transform flex items-center justify-center gap-2 text-sm"
              >
                <Shield size={18} /> Update Rules
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
              {/* Binary Settings Group */}
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/50 pb-2">Binary Engine</h3>
                <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white">Global Holding Tank Mode</label>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Default setting for all users. <span className="text-teal-500 font-bold">ON</span> = Recruits go to Tank.
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full cursor-pointer">
                    <input
                      type="checkbox"
                      className="absolute w-full h-full opacity-0 cursor-pointer z-10 left-0 top-0"
                      checked={adminForm.holdingTankMode}
                      onChange={(e) => setAdminForm({ ...adminForm, holdingTankMode: e.target.checked })}
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${adminForm.holdingTankMode ? 'bg-teal-500' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-200 ease-in-out ${adminForm.holdingTankMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Binary Pair Ratio</label>
                <select
                  value={adminForm.pairRatio}
                  onChange={(e) => setAdminForm({ ...adminForm, pairRatio: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-gray-900 dark:text-white outline-none"
                >
                  <option value="1:1">1:1 (Balanced)</option>
                  <option value="1:2">1:2 (Power Leg)</option>
                  <option value="2:1">2:1 (Power Leg)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Pair Unit (PV)</label>
                <input
                  type="number"
                  value={adminForm.pairUnit}
                  onChange={(e) => setAdminForm({ ...adminForm, pairUnit: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Commission per Pair ($)</label>
                <input
                  type="number"
                  value={adminForm.commissionValue}
                  onChange={(e) => setAdminForm({ ...adminForm, commissionValue: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Daily Cap Amount ($)</label>
                <input
                  type="number"
                  value={adminForm.dailyCapAmount}
                  onChange={(e) => setAdminForm({ ...adminForm, dailyCapAmount: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="md:col-span-2 mt-4">
                <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/50 pb-2">Bonuses</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Referral Bonus (%)</label>
                <input
                  type="number"
                  value={adminForm.referralBonusPercentage}
                  onChange={(e) => setAdminForm({ ...adminForm, referralBonusPercentage: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Matching Generations</label>
                <input
                  type="text"
                  placeholder="10, 5, 2"
                  value={adminForm.matchingBonusGenerations}
                  onChange={(e) => setAdminForm({ ...adminForm, matchingBonusGenerations: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="hidden"></div>
            </form>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Settings;