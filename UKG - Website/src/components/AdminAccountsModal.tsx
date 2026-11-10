import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Search, 
  ShieldCheck, 
  Trash2, 
  Mail, 
  User as UserIcon, 
  CheckCircle2, 
  Crown,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth, StoredUserAccount } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AdminAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReports?: () => void;
  onDeleteAllProperties?: () => void;
  totalPropertiesCount?: number;
}

export const AdminAccountsModal: React.FC<AdminAccountsModalProps> = ({
  isOpen,
  onClose,
  onOpenReports,
  onDeleteAllProperties,
  totalPropertiesCount = 0,
}) => {
  const { getAllRegisteredUsers, deleteUserByOwner, currentUser } = useAuth();
  const { isHindi } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const allUsers: StoredUserAccount[] = getAllRegisteredUsers();

  const filteredUsers = allUsers.filter((u) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.contact.toLowerCase().includes(q)
    );
  });

  const handleDelete = (userId: string) => {
    const res = deleteUserByOwner(userId);
    setDeleteConfirmId(null);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#07241a] rounded-3xl shadow-2xl border-2 border-emerald-400 dark:border-emerald-700 flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-[#072c21] to-teal-900 text-white flex items-center justify-between border-b border-emerald-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {isHindi ? 'सभी पंजीकृत खाते (Owner Directory)' : 'All Registered Accounts Directory'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-200 text-xs font-mono font-bold">
                  {allUsers.length} total
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                {isHindi 
                  ? 'प्लेटफॉर्म ओनर (Amit Tyagi) के लिए सभी पंजीकृत खातों की वास्तविक सूची (लॉगिन स्थिति सहित)' 
                  : 'Official directory of every user account on the platform, whether currently logged in or not.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 border-b border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Platform Property Catalog Controls */}
        <div className="p-3.5 bg-gradient-to-r from-amber-50/90 to-rose-50/70 dark:from-[#1b1505] dark:to-[#1f0a0a] border-b border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
              {isHindi ? 'ऑनलाइन प्रॉपर्टी इन्वेंटरी:' : 'Live Properties Inventory:'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
              {totalPropertiesCount} {isHindi ? 'सक्रिय' : 'Active Online'}
            </span>
          </div>

          {onDeleteAllProperties && (
            <button
              type="button"
              onClick={onDeleteAllProperties}
              disabled={totalPropertiesCount === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all ${
                totalPropertiesCount > 0
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-rose-600/25 cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
              title={isHindi ? 'एडमिन: सभी ऑनलाइन संपत्तियां एक साथ हटाएं' : 'Admin: Delete all live properties at once'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isHindi ? `सभी संपत्तियां हटाएं (${totalPropertiesCount})` : `Delete All Properties (${totalPropertiesCount})`}</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#061e16] shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isHindi ? 'यूजरनेम या ईमेल द्वारा खोजें...' : 'Search by username or email address...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Accounts List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isSelf = user.username.trim().toLowerCase() === currentUser?.username?.trim().toLowerCase();
              const isOwnerUser = user.username.trim().toLowerCase() === 'amit tyagi' || user.contact.toLowerCase() === 'amit1986.delhi@gmail.com';
              const isCurrentSession = currentUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOwnerUser 
                      ? 'bg-amber-50/70 dark:bg-[#1f1906] border-amber-300 dark:border-amber-700/80 shadow-xs' 
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* User Info */}
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-xs ${
                        isOwnerUser 
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black' 
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {user.username}
                          </h4>

                          {isOwnerUser && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>Platform Owner</span>
                            </span>
                          )}

                          {isCurrentSession ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active Session (Logged In Now)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Registered Account
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono">{user.contact}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Registered: {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isOwnerUser && (
                        deleteConfirmId === user.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Delete this user account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete User</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-1">
              <Users className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p className="text-sm font-semibold">No accounts found matching your query.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#061e16] border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {isHindi 
              ? 'केवल प्लेटफॉर्म ओनर के लिए दृश्यमान (गोपनीय एडमिन डायरेक्टरी)' 
              : 'Owner-Only Confidential Administrative Access'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
