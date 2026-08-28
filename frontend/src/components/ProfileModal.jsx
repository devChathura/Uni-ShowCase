import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Building2, Mail, Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const ProfileModal = ({ isOpen, onClose }) => {
  const { token, user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    contactNumber: '',
    organization: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        contactNumber: user.contactNumber || '',
        organization: user.organization || ''
      });
      setError('');
      setSuccess('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/users/me`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#121214] border border-zinc-800/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative"
        >
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/20">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="text-indigo-400 w-5 h-5" />
              My Profile
            </h3>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-full hover:bg-zinc-800"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800/50">
              <img 
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`} 
                alt="Profile" 
                className="w-16 h-16 rounded-full border border-zinc-700 object-cover"
              />
              <div>
                <div className="text-lg font-semibold text-white">{user.name}</div>
                <div className="text-sm text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <Mail size={14} />
                  {user.email} <span className="text-xs ml-1 bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">(Username)</span>
                </div>
                <div className="text-xs text-indigo-400 font-medium mt-1">Role: {user.role}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-2">
                  <Phone size={14} className="text-zinc-400" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="e.g. +1 234 567 8900"
                  className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-zinc-100 transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-2">
                  <Building2 size={14} className="text-zinc-400" />
                  Organization / Business Name <span className="text-zinc-500 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Acme Corp or University Name"
                  className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-zinc-100 transition-all text-sm"
                />
              </div>

              {error && <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
              {success && <div className="text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">{success}</div>}

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileModal;
