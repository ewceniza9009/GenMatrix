import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUpdateProfileMutation } from '../../store/api';
import { setCredentials } from '../../store/authSlice';
import { Save } from 'lucide-react';

import { useUI } from '../UIContext';

const PersonalSettings = () => {
    const { showAlert } = useUI();
    const dispatch = useDispatch();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [middleName, setMiddleName] = useState(user?.middleName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [occupation, setOccupation] = useState(user?.occupation || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Address
    const [street, setStreet] = useState(user?.address?.street || '');
    const [city, setCity] = useState(user?.address?.city || '');
    const [state, setState] = useState(user?.address?.state || '');
    const [zip, setZip] = useState(user?.address?.zip || '');
    const [country, setCountry] = useState(user?.address?.country || '');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            showAlert("Passwords do not match", 'warning');
            return;
        }

        try {
            const updatedUser = await updateProfile({
                firstName: isEditing ? firstName : undefined,
                middleName: isEditing ? middleName : undefined,
                lastName: isEditing ? lastName : undefined,
                occupation: isEditing ? occupation : undefined,
                phone: isEditing ? phone : undefined,
                address: isEditing ? { street, city, state, zip, country } : undefined,
                email: isEditing ? email : undefined,
                password: isEditing && password ? password : undefined
            }).unwrap();

            // Push changes to Redux Store so UI updates immediately
            if (token) {
                dispatch(setCredentials({ user: updatedUser, token }));
            }

            showAlert('Profile Updated', 'success');
            setIsEditing(false);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            showAlert('Error updating profile', 'error');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-4 mb-6 justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                        {user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 capitalize">
                            {user?.role}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEditing && (
                        <button
                            type="submit"
                            form="personal-form"
                            disabled={isLoading}
                            className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Save size={16} /> Save
                        </button>
                    )}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-slate-400 hover:text-teal-500 transition-colors bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg text-sm font-medium"
                        type="button"
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            <form id="personal-form" onSubmit={handleSave} className="space-y-6">

                {/* Personal Information Section */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/10">Personal Information</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">First Name</label>
                            {isEditing ? (
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="First Name" />
                            ) : <div className="text-sm font-medium">{user?.firstName || '-'}</div>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Middle Name</label>
                            {isEditing ? (
                                <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="Middle Name" />
                            ) : <div className="text-sm font-medium">{user?.middleName || '-'}</div>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Last Name</label>
                            {isEditing ? (
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="Last Name" />
                            ) : <div className="text-sm font-medium">{user?.lastName || '-'}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Occupation</label>
                            {isEditing ? (
                                <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="Occupation" />
                            ) : <div className="text-sm font-medium">{user?.occupation || '-'}</div>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Phone Number</label>
                            {isEditing ? (
                                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="Phone Number" />
                            ) : <div className="text-sm font-medium">{user?.phone || '-'}</div>}
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/10">Address Details</h4>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Street Address</label>
                            {isEditing ? (
                                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="123 Main St" />
                            ) : <div className="text-sm font-medium">{user?.address?.street || '-'}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">City</label>
                            {isEditing ? (
                                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="City" />
                            ) : <div className="text-sm font-medium">{user?.address?.city || '-'}</div>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">State/Province</label>
                            {isEditing ? (
                                <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="State" />
                            ) : <div className="text-sm font-medium">{user?.address?.state || '-'}</div>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Zip/Postal</label>
                            {isEditing ? (
                                <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="Zip Code" />
                            ) : <div className="text-sm font-medium">{user?.address?.zip || '-'}</div>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Country</label>
                            {isEditing ? (
                                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" placeholder="Country" />
                            ) : <div className="text-sm font-medium">{user?.address?.country || '-'}</div>}
                        </div>
                    </div>
                </div>

                {/* Account Section */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/10">Account Settings</h4>
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
                        </>
                    )}

                    {!isEditing && (
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Member ID</label>
                            <div className="text-gray-700 dark:text-slate-300 font-medium font-mono text-sm">{user?.id}</div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default PersonalSettings;
