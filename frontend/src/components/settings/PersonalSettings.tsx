import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUpdateProfileMutation } from '../../store/api';
import { Save } from 'lucide-react';

const PersonalSettings = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            await updateProfile({
                email: isEditing ? email : undefined,
                password: isEditing && password ? password : undefined
            }).unwrap();

            alert('Profile Updated');
            setIsEditing(false);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            alert('Error updating profile');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-4 mb-6 justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.username}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 capitalize">
                            {user?.role}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-slate-400 hover:text-teal-500 transition-colors"
                    type="button"
                >
                    {isEditing ? 'Cancel' : 'Edit'}
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Email Address</label>
                    {isEditing ? (
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    ) : (
                        <div className="text-gray-700 dark:text-slate-300 font-medium">{email}</div>
                    )}
                </div>

                {isEditing && (
                    <>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">New Password (Optional)</label>
                            <input
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <button
                            disabled={isLoading}
                            className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    </>
                )}

                {!isEditing && (
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Member ID</label>
                        <div className="text-gray-700 dark:text-slate-300 font-medium font-mono text-sm">{user?.id}</div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default PersonalSettings;
