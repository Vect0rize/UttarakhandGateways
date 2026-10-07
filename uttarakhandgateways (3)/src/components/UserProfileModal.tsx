import React, { useState, useRef, useEffect } from 'react';
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
  AlertTriangle,
  Crown,
  Users,
  Building2,
  Lock,
  Plus
} from 'lucide-react';
import { useAuth, StoredUserAccount } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Property } from '../types';
import { isPropertyOwner } from '../utils/propertyOwnership';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProperties?: Property[];
  onSelectProperty?: (property: Property) => void;
  onEditProperty?: (property: Property) => void;
  onDeleteProperty?: (id: string) => void;
  onOpenSellModal?: () => void;
  onOpenRentalModal?: () => void;
  onOpenSwitchAccount?: () => void;
}

const AVATAR_PRESETS = [
  { id: 'peaks', label: 'Snow Peak', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&auto=format&fit=crop&q=80' },
  { id: 'pines', label: 'Pine Forest', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=200&auto=format&fit=crop&q=80' },
  { id: 'sunset', label: 'Sunset Glow', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&auto=format&fit=crop&q=80' },
  { id: 'cottage', label: 'Wood Cottage', url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&auto=format&fit=crop&q=80' },
  { id: 'falcon', label: 'Himalayan Bird', url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&auto=format&fit=crop&q=80' },
  { id: 'deodar', label: 'Deodar Grove', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&auto=format&fit=crop&q=80' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose,
  allProperties = [],
  onEditProperty,
  onDeleteProperty,
  onOpenSellModal,
  onOpenRentalModal,
  onOpenSwitchAccount,
}) => {
  const { 
    currentUser, 
    isOwner, 
    updateProfile, 
    deleteAccount, 
    logout,
    getAllRegisteredUsers,
    deleteUserByOwner
  } = useAuth();
  
  const { isHindi } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'properties' | 'owner'>('profile');
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const [username, setUsername] = useState(currentUser?.username || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [showPfpPicker, setShowPfpPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Owner management state
  const [registeredUsersList, setRegisteredUsersList] = useState<StoredUserAccount[]>([]);
  const [accountToDeleteByOwner, setAccountToDeleteByOwner] = useState<StoredUserAccount | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const myProperties = (allProperties || []).filter((p) => isPropertyOwner(p, currentUser));

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOwner && isOpen) {
      setRegisteredUsersList(getAllRegisteredUsers());
    }
  }, [isOwner, isOpen, getAllRegisteredUsers]);

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

  const handleDeleteUserByOwnerConfirmed = () => {
    if (!accountToDeleteByOwner) return;
    deleteUserByOwner(accountToDeleteByOwner.contact);
    setRegisteredUsersList((prev) => prev.filter((u) => u.id !== accountToDeleteByOwner.id));
    setAccountToDeleteByOwner(null);
    showToast(isHindi ? 'खाता व संपत्तियां सफलतापूर्वक हटाई गईं।' : `Account (${accountToDeleteByOwner.username}) deleted.`);
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Recent username changes count
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const recentChangesCount = (currentUser.usernameChangeTimestamps || []).filter(
    (ts) => Date.now() - ts < ONE_WEEK_MS
  ).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#071c14] rounded-3xl shadow-2xl border border-emerald-300 dark:border-emerald-900/80 overflow-hidden my-auto max-h-[92vh] flex flex-col modal-animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isOwner 
                ? 'bg-amber-500/20 text-amber-400 border-amber-400/40' 
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
            }`}>
              {isOwner ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold leading-tight">
                  {isHindi ? 'आपकी प्रोफ़ाइल' : 'Account Profile'}
                </h3>
                {isOwner && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-xs">
                    👑 Owner Access
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-300/80">
                {isOwner 
                  ? (isHindi ? 'अमित त्यागी · पूर्ण स्वामित्व अधिकार' : 'Amit Tyagi · Platform Founder & Owner')
                  : (isHindi ? 'खाता विवरण व सेटिंग्स' : 'Manage identity & credentials')
                }
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

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-1 border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#051810] flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'profile' 
                ? 'border-emerald-600 text-emerald-900 dark:text-emerald-300' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            {isHindi ? 'मेरी प्रोफ़ाइल' : 'My Profile'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'properties' 
                ? 'border-emerald-600 text-emerald-900 dark:text-emerald-300' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isHindi ? 'मेरी लिस्टिंग' : 'My Listings'} ({myProperties.length})</span>
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('owner');
                setRegisteredUsersList(getAllRegisteredUsers());
              }}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'owner' 
                  ? 'border-amber-500 text-amber-800 dark:text-amber-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? 'खाते प्रबंधन (Owner)' : 'All Accounts (Owner)'}</span>
            </button>
          )}
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
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MY LISTINGS / PROPERTIES VIEW */}
          {activeTab === 'properties' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isHindi ? `आपकी लिस्ट की गई संपत्तियां (${myProperties.length})` : `Your Listed Properties (${myProperties.length})`}
                </span>
                <div className="flex items-center gap-1.5">
                  {onOpenSellModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSellModal();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isHindi ? 'बेचें' : 'Sell'}</span>
                    </button>
                  )}
                  {onOpenRentalModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRentalModal();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isHindi ? 'किराया दें' : 'Rent'}</span>
                    </button>
                  )}
                </div>
              </div>

              {myProperties.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-emerald-900/60 bg-slate-50/50 dark:bg-[#061e15] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {isHindi ? 'आपने अभी तक कोई प्रॉपर्टी लिस्ट नहीं की है' : 'No properties listed yet'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      {isHindi 
                        ? 'अपनी प्रॉपर्टी बेचें या किराये पर दें सीधे 0% ब्रोकरेज के साथ। खरीदार और किरायेदार आपसे सीधे संपर्क करेंगे।' 
                        : 'List your property for sale or rent with 0% brokerage. Buyers & tenants connect directly with you.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {onOpenSellModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenSellModal();
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        {isHindi ? 'प्रॉपर्टी बेचें' : 'Sell Property'}
                      </button>
                    )}
                    {onOpenRentalModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenRentalModal();
                        }}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        {isHindi ? 'किराये हेतु लिस्ट करें' : 'List Rental'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {myProperties.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b261b] border border-slate-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-emerald-400 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'}
                          alt={prop.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-emerald-200 dark:border-emerald-800"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase">
                              {prop.type}
                            </span>
                            {prop.isSold ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                {isHindi ? 'बिक चुका (Sold)' : 'Marked as Sold'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                <span>{isHindi ? 'सक्रिय (Live)' : 'Active / Live'}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {prop.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300">{prop.priceDisplay}</span>
                            <span>•</span>
                            <span className="truncate">{prop.city}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Edit Property & Delete */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {onEditProperty && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onEditProperty(prop);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                            title={isHindi ? 'यह प्रॉपर्टी संपादित करें' : 'Edit Property Details'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isHindi ? 'संपादित करें' : 'Edit Property'}</span>
                          </button>
                        )}
                        {onDeleteProperty && (
                          <button
                            type="button"
                            onClick={() => setPropertyToDelete(prop)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs transition-all cursor-pointer"
                            title={isHindi ? 'प्रॉपर्टी हटाएं' : 'Delete listing'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : isOwner && activeTab === 'owner' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200">
                <span className="font-bold block mb-1">👑 Platform Owner Access (Amit Tyagi)</span>
                <span>You can delete any user account and manage listings. When an account is deleted, all properties uploaded by that account are automatically purged.</span>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
                  Registered Accounts ({registeredUsersList.length})
                </span>

                {registeredUsersList.length > 0 ? (
                  registeredUsersList.map((user) => {
                    const isSelf = user.id === currentUser.id;
                    return (
                      <div
                        key={user.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0b261b] border border-slate-200 dark:border-emerald-900/60 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {user.username}
                            </span>
                            {isSelf ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded flex items-center gap-1 border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Logged In (Active)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                                Registered Account (Not currently logged in)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {user.contact} · Registered: {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => setAccountToDeleteByOwner(user)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">
                    No other registered accounts found.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* STANDARD PROFILE VIEW */
            <>
              {/* Section 1: Profile Photo (PFP) & Quick Edit */}
              <div className="flex flex-col items-center justify-center pt-1 text-center">
                <div className="relative group">
                  <div className={`w-20 h-20 rounded-full ring-4 overflow-hidden shadow-lg bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white text-2xl font-black uppercase ${
                    isOwner ? 'ring-amber-400/60 shadow-amber-500/20' : 'ring-emerald-500/30'
                  }`}>
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

                {/* PFP Picker Dropdown */}
                {showPfpPicker && (
                  <div className="mt-3 w-full p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-[#0b261b] border border-emerald-200 dark:border-emerald-800 text-left animate-in fade-in space-y-3">
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

              {/* Section 2: Username Edit with 2 changes/week limit */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#072016] border border-emerald-200/80 dark:border-emerald-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300 font-bold">
                      {isHindi ? 'यूजरनेम (Username)' : 'Username'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      ({recentChangesCount}/2 {isHindi ? 'इस सप्ताह' : 'changes this week'})
                    </span>
                  </div>
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
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-emerald-400 dark:border-emerald-700 bg-white dark:bg-[#0a271d] text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      ℹ️ {isHindi ? 'सुरक्षा नियमों के अनुसार यूजरनेम प्रति सप्ताह केवल 2 बार बदला जा सकता है।' : 'Rule: Username can be changed at most 2 times per week.'}
                    </p>
                  </div>
                ) : (
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>{currentUser.username}</span>
                      {isOwner && (
                        <Crown className="w-3.5 h-3.5 text-amber-500 inline" />
                      )}
                    </span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {isOwner ? 'Platform Owner' : (isHindi ? 'सत्यापित' : 'Active')}
                    </span>
                  </div>
                )}
              </div>

              {/* Section 3: Contact & Verification Details */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#072016] border border-emerald-200/80 dark:border-emerald-900/60 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'सत्यापित ईमेल' : 'Verified Email'}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {currentUser.contact}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'सदस्य बने' : 'Member Since'}</span>
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(currentUser.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'सुरक्षा स्थिति' : 'Security Status'}</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    {isHindi ? 'ओटीपी सत्यापित' : 'OTP Verified ✓'}
                  </span>
                </div>
              </div>

              {/* Section 4: Switch Account & Log Out */}
              <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/80 space-y-2">
                {onOpenSwitchAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSwitchAccount();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-[#0b281d] hover:bg-emerald-100 dark:hover:bg-[#0f3829] border border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-200 font-bold text-xs transition-all flex items-center justify-between shadow-xs cursor-pointer active:scale-95"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{isHindi ? 'खाता बदलें (Switch Account)' : 'Switch Account'}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                      {isHindi ? 'बदलें →' : 'Switch →'}
                    </span>
                  </button>
                )}

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

                {/* Delete Account Button */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'खाता स्थायी रूप से हटाएं (Delete Account)' : 'Delete Account'}</span>
                </button>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  ⚠️ {isHindi ? 'खाता हटाने पर आपकी लिस्ट की गई सभी संपत्तियां भी हटा दी जाएंगी।' : 'Note: Deleting your account will also remove all your listed properties.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete User by Owner Confirmation Modal */}
      {accountToDeleteByOwner && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#071c14] border border-rose-300 dark:border-rose-900 rounded-3xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 modal-animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900 dark:text-white mb-1.5">
              Delete User & Properties?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-5 leading-relaxed">
              Are you sure you want to permanently delete user <strong>{accountToDeleteByOwner.username}</strong> ({accountToDeleteByOwner.contact})? All their listed properties will also be permanently deleted.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAccountToDeleteByOwner(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUserByOwnerConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Own Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#071c14] border border-rose-300 dark:border-rose-900 rounded-3xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 modal-animate-pop"
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
                ? `क्या आप वाकई "${currentUser.username}" (${currentUser.contact}) का खाता हटाना चाहते हैं? आपका खाता और इस खाते द्वारा लिस्ट की गई सभी संपत्तियां हमेशा के लिए हटा दी जाएंगी।`
                : `Are you sure you want to delete your account (${currentUser.username} - ${currentUser.contact})? All your listed properties and local profile data will be permanently deleted.`
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
                {isHindi ? 'हाँ, सब हटाएं' : 'Delete Account & Properties'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Property Confirmation Dialog */}
      {propertyToDelete && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#071c14] border border-rose-300 dark:border-rose-900 rounded-3xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 modal-animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900 dark:text-white mb-1.5">
              {isHindi ? 'प्रॉपर्टी लिस्टिंग हटाएं?' : 'Delete Property Listing?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-5 leading-relaxed">
              {isHindi 
                ? `क्या आप वाकई "${propertyToDelete.title}" को हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।`
                : `Are you sure you want to permanently delete "${propertyToDelete.title}"? This property listing will be removed from the marketplace.`
              }
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (propertyToDelete) {
                    onDeleteProperty?.(propertyToDelete.id);
                    setPropertyToDelete(null);
                    showToast(isHindi ? 'प्रॉपर्टी सफलतापूर्वक हटा दी गई।' : 'Property deleted successfully.');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                {isHindi ? 'हाँ, हटाएं' : 'Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
