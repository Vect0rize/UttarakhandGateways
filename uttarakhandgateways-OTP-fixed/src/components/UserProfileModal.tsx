import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Camera, 
  Check, 
  Edit3, 
  Trash2, 
  LogOut, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  Phone,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  { id: 'peaks', label: 'Snow Peak', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&auto=format&fit=crop&q=80' },
  { id: 'pines', label: 'Pine Forest', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=200&auto=format&fit=crop&q=80' },
  { id: 'sunset', label: 'Sunset Glow', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&auto=format&fit=crop&q=80' },
  { id: 'cottage', label: 'Wood Cottage', url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&auto=format&fit=crop&q=80' },
  { id: 'falcon', label: 'Himalayan Bird', url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&auto=format&fit=crop&q=80' },
  { id: 'deodar', label: 'Deodar Grove', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&auto=format&fit=crop&q=80' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, deleteAccount, logout } = useAuth();
  const { isHindi } = useLanguage();

  const [username, setUsername] = useState(currentUser?.username || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [showPfpPicker, setShowPfpPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  const handleSaveUsername = () => {
    if (!username.trim() || username.trim().length < 2) {
      setErrorMsg(isHindi ? 'यूजरनेम कम से कम 2 अक्षरों का होना चाहिए।' : 'Username must be at least 2 characters.');
      return;
    }

    const res = updateProfile({ username: username.trim() });
    if (res.success) {
      setIsEditingUsername(false);
      setErrorMsg(null);
      showToast(isHindi ? 'यूजरनेम सफलतापूर्वक अपडेट किया गया!' : 'Username updated successfully!');
    } else {
      setErrorMsg(res.error || 'Failed to update username');
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    updateProfile({ avatar: url });
    setShowPfpPicker(false);
    showToast(isHindi ? 'प्रोफ़ाइल फोटो अपडेट की गई!' : 'Profile picture updated!');
  };

  const handleRemoveAvatar = () => {
    updateProfile({ avatar: undefined });
    setShowPfpPicker(false);
    showToast(isHindi ? 'डिफ़ॉल्ट फोटो पर सेट किया गया' : 'Reset to default avatar');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(isHindi ? 'कृपया एक वैध फोटो फ़ाइल चुनें।' : 'Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateProfile({ avatar: dataUrl });
      setShowPfpPicker(false);
      showToast(isHindi ? 'कस्टम फोटो अपलोड की गई!' : 'Custom photo uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccountConfirmed = () => {
    deleteAccount(currentUser.contact);
    setShowDeleteConfirm(false);
    onClose();
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#071c14] rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-900/80 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {isHindi ? 'आपकी प्रोफ़ाइल' : 'My Account Profile'}
              </h3>
              <p className="text-[11px] text-emerald-300/80">
                {isHindi ? 'खाता विवरण व सेटिंग्स' : 'Manage identity & credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {successToast && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Profile Photo (PFP) & Quick Edit */}
          <div className="flex flex-col items-center justify-center pt-1 text-center">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full ring-4 ring-emerald-500/30 overflow-hidden shadow-lg bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white text-2xl font-black uppercase">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.username} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span>{currentUser.username.charAt(0)}</span>
                )}
              </div>

              {/* Edit PFP Trigger Button */}
              <button
                type="button"
                onClick={() => setShowPfpPicker(!showPfpPicker)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95 cursor-pointer border-2 border-white dark:border-slate-900"
                title={isHindi ? 'फ़ोटो बदलें (Edit PFP)' : 'Edit Profile Picture'}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowPfpPicker(!showPfpPicker)}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isHindi ? 'प्रोफ़ाइल फ़ोटो बदलें (Edit PFP)' : 'Change Profile Picture'}</span>
              </button>
            </div>

            {/* PFP Picker Dropdown / Drawer */}
            {showPfpPicker && (
              <div className="mt-3 w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b261b] border border-emerald-200 dark:border-emerald-800 text-left animate-in fade-in space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>{isHindi ? 'हिमालयन अवतार चुनें या फोटो अपलोड करें:' : 'Choose Preset Avatar or Upload:'}</span>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(preset.url)}
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-emerald-500 hover:scale-105 transition-all shadow-xs cursor-pointer"
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-emerald-900/60">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 cursor-pointer text-center"
                  >
                    {isHindi ? 'डिवाइस से अपलोड करें' : 'Upload From Device'}
                  </button>

                  {currentUser.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="py-1.5 px-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 cursor-pointer"
                    >
                      {isHindi ? 'फ़ोटो हटाएं' : 'Remove PFP'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Username Edit */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#072016] border border-emerald-100 dark:border-emerald-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {isHindi ? 'यूजरनेम (Username)' : 'Username'}
              </span>
              {!isEditingUsername && (
                <button
                  type="button"
                  onClick={() => setIsEditingUsername(true)}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'संपादित करें' : 'Edit'}</span>
                </button>
              )}
            </div>

            {isEditingUsername ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-emerald-400 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveUsername}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isHindi ? 'सहेजें' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername(currentUser.username);
                    setIsEditingUsername(false);
                    setErrorMsg(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  {isHindi ? 'रद्द' : 'Cancel'}
                </button>
              </div>
            ) : (
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>{currentUser.username}</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {isHindi ? 'सत्यापित' : 'Active'}
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Contact & Verification Details */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#072016] border border-emerald-100 dark:border-emerald-900/60 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                {currentUser.contactType === 'email' ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                <span>{isHindi ? 'पंजीकृत संपर्क' : 'Verified Contact'}</span>
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {currentUser.contact}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-emerald-900/40">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{isHindi ? 'सदस्य बने' : 'Member Since'}</span>
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(currentUser.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-emerald-900/40">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isHindi ? 'सुरक्षा स्थिति' : 'Security Status'}</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                {isHindi ? 'ओटीपी सत्यापित' : 'OTP Verified ✓'}
              </span>
            </div>
          </div>

          {/* Section 4: Log Out & Danger Zone (Delete Account) */}
          <div className="pt-2 border-t border-slate-200 dark:border-emerald-900/80 space-y-2">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isHindi ? 'लॉग आउट करें (Sign Out)' : 'Sign Out'}</span>
            </button>

            {/* Delete Account Button (ONLY ACCESSIBLE WHEN LOGGED IN) */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'खाता स्थायी रूप से हटाएं (Delete Account)' : 'Delete Account'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#071c14] border border-rose-300 dark:border-rose-900 rounded-3xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900 dark:text-white mb-1.5">
              {isHindi ? 'खाता हमेशा के लिए हटाएं?' : 'Delete Account Permanently?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-5 leading-relaxed">
              {isHindi 
                ? `क्या आप वाकई "${currentUser.username}" (${currentUser.contact}) का खाता हटाना चाहते हैं? आपका लॉगिन और सहेजा गया डेटा इस डिवाइस से हटा दिया जाएगा।`
                : `Are you sure you want to delete your account (${currentUser.username} - ${currentUser.contact})? You will be signed out and your local profile data will be cleared.`
              }
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                {isHindi ? 'हां, खाता हटाएं' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
