import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import api from '../api';
import { Settings, Shield, Save, Key, User, CheckCircle, AlertCircle, Globe } from 'lucide-react';

const SettingsPage = () => {
  const { user, checkAuthStatus } = useAuth();
  const { websiteName, refreshSiteSettings } = useSite();

  // Profile details state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });

  // Password details state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Site details state
  const [siteForm, setSiteForm] = useState({
    websiteName: '',
  });

  // Actions feedbacks
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [siteLoading, setSiteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
    if (websiteName) {
      setSiteForm({
        websiteName: websiteName,
      });
    }
  }, [user, websiteName]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSiteChange = (e) => {
    const { name, value } = e.target;
    setSiteForm((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    // Validate inputs
    const errors = {};
    if (!profileForm.name.trim()) errors.name = 'Name is required';
    if (!profileForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/updatedetails', profileForm);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Profile updated successfully!');
        await checkAuthStatus(); // refresh context states
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Validate passwords
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/updatepassword', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.data.success) {
        setSuccessMsg('Your security credentials have been updated successfully.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Credentials update failed. Ensure your current password is correct.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSiteSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!siteForm.websiteName.trim()) {
      setValidationErrors({ websiteName: 'Website name is required' });
      return;
    }

    setSiteLoading(true);
    try {
      const res = await api.put('/content/general', {
        additionalData: { websiteName: siteForm.websiteName },
        heading: siteForm.websiteName // fallback
      });

      if (res.data.success) {
        setSuccessMsg('Website configuration updated successfully.');
        await refreshSiteSettings();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update website configuration.');
    } finally {
      setSiteLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-slate-900 pb-5">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary-500" /> Platform Configuration
          </h1>
          <p className="text-slate-400 text-xs mt-1">Configure profile notifications details and rotate access passwords.</p>
        </div>

        {/* Action Feedbacks */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-450 rounded-xl flex items-start gap-3 text-xs font-semibold animate-fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-455 rounded-xl flex items-start gap-3 text-xs font-semibold animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Layout Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left Panel: Profile settings */}
          <form onSubmit={handleProfileSubmit} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-left text-white">
              <User className="w-5 h-5 text-primary-550" />
              <h2 className="font-bold text-sm">Profile Configuration</h2>
            </div>

            {/* Profile Name */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Administrator Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                className={`w-full px-4 py-2.5 bg-slate-950 border ${
                  validationErrors.name ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all`}
              />
              {validationErrors.name && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.name}</p>}
            </div>

            {/* Profile Email */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Admin Email Address</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className={`w-full px-4 py-2.5 bg-slate-950 border ${
                  validationErrors.email ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all`}
              />
              {validationErrors.email && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.email}</p>}
            </div>

            {/* Save Profile Button */}
            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-primary-500/10 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {profileLoading ? 'Saving...' : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Preserve Profile
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Panel: Password settings */}
          <form onSubmit={handlePasswordSubmit} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-left text-white">
              <Key className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-sm">Security Credentials</h2>
            </div>

            {/* Current Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2.5 bg-slate-950 border ${
                  validationErrors.currentPassword ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all`}
              />
              {validationErrors.currentPassword && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.currentPassword}</p>}
            </div>

            {/* New Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Minimum 6 characters"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2.5 bg-slate-950 border ${
                  validationErrors.newPassword ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all`}
              />
              {validationErrors.newPassword && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.newPassword}</p>}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2.5 bg-slate-950 border ${
                  validationErrors.confirmPassword ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all`}
              />
              {validationErrors.confirmPassword && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.confirmPassword}</p>}
            </div>

            {/* Update Password Button */}
            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center gap-2 bg-amber-650 hover:bg-amber-550 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {passwordLoading ? 'Rotating...' : (
                  <>
                    <Key className="w-3.5 h-3.5" /> Update Credentials
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Website Configuration */}
          <form onSubmit={handleSiteSubmit} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-5 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-left text-white">
              <Globe className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-sm">Website Configuration</h2>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Website Name</label>
              <input
                type="text"
                name="websiteName"
                placeholder="ProductHub"
                value={siteForm.websiteName}
                onChange={handleSiteChange}
                className={`w-full px-4 py-2.5 bg-slate-950 border ${
                  validationErrors.websiteName ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all`}
              />
              {validationErrors.websiteName && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.websiteName}</p>}
              <p className="text-[10px] text-slate-500 mt-1">This name will appear on the navigation bar, footer, and browser title.</p>
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={siteLoading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {siteLoading ? 'Updating...' : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Update Website Name
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
