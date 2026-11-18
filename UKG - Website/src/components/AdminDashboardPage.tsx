import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Building2,
  Users,
  Flag,
  Settings,
  BarChart3,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
  Edit3,
  Plus,
  Search,
  RefreshCw,
  Crown,
  Ban,
  Unlock,
  Clock,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Save,
  X,
  AlertTriangle,
  Phone,
  Mail,
  Upload,
} from 'lucide-react';
import { Property, PropertyCategory, PropertyType, UttarakhandCity } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isAppOwner, formatPropertyViewsCount } from '../utils/propertyOwnership';
import { getPropertySlugPath } from '../data/programmaticSeo';

interface AdminStats {
  totalProperties: number;
  activeListings: number;
  pendingApprovals: number;
  rejectedListings: number;
  hiddenListings: number;
  featuredListings: number;
  soldListings: number;
  registeredUsers: number;
  suspendedUsers: number;
  openReports: number;
  totalReports: number;
  totalPropertyViews: number;
  totalInquiries: number;
  totalShares: number;
  categoriesBreakdown: Record<string, number>;
}

interface AdminOwnedPropertySummary {
  id: string;
  title: string;
  city: string;
  type: string;
  category: string;
  price: number;
  priceDisplay: string;
  views: number;
  approvalStatus: 'approved' | 'pending' | 'rejected';
  isHidden: boolean;
  featured: boolean;
  isSold: boolean;
  createdAt?: string;
}

interface AdminUserRecord {
  id: string;
  username: string;
  contact: string;
  phone?: string;
  notes?: string;
  role: string;
  isOwner: boolean;
  isSuspended: boolean;
  suspendedAt?: string;
  suspendedReason?: string;
  createdAt: string;
  propertiesCount: number;
  totalViews: number;
  ownedProperties: AdminOwnedPropertySummary[];
}

interface AdminReportRecord {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  reason: string;
  details?: string;
  reporterContact?: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
  propertyExists?: boolean;
  propertyOwnerName?: string;
  propertyCity?: string;
  propertyViews?: number;
  propertyApprovalStatus?: string;
  propertyIsHidden?: boolean;
}

interface PlatformSettings {
  enabledCategories: string[];
  requireApprovalForNewListings: boolean;
  showFeaturedSection: boolean;
  featuredMode: 'manual_and_top' | 'manual_only';
  updatedAt?: string;
}

interface AdminPropertyRecord extends Property {
  fullSellerName?: string;
  publicMaskedSellerName?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  isHidden?: boolean;
}

interface AdminDashboardPageProps {
  onBackToMain: () => void;
  onOpenAddProperty?: () => void;
  onOpenFullEditModal?: (property: Property) => void;
  onCatalogChanged?: () => void;
}

const PROPERTY_CATEGORIES: PropertyCategory[] = ['Residential', 'Commercial', 'Agriculture'];
const PROPERTY_TYPES: PropertyType[] = [
  'Plot',
  'Land',
  'House',
  'Villa',
  'Duplex',
  'Flat',
  'Apartment',
  'Studio',
  'Cottage',
  'Farmhouse',
  'Homestay',
  'Resort',
  'Hotel',
  'Shop',
  'Showroom',
  'Office',
  'PG',
  'Rent/Lease',
];
const CITIES: UttarakhandCity[] = [
  'Dehradun',
  'Rishikesh',
  'Haridwar',
  'Nainital',
  'Mussoorie',
  'Haldwani',
  'Mukteshwar',
  'Bhimtal',
  'Almora',
  'Ranikhet',
  'Lansdowne',
  'Dhanaulti',
  'Kanatal',
  'Kausani',
  'Chakrata',
  'Tehri Garhwal',
  'Devprayag',
  'Rudraprayag',
  'Uttarkashi',
  'Kotdwar',
  'Bhowali',
  'Auli',
];

function formatPriceIndian(price: number, isRent: boolean): string {
  if (!price || price <= 0) return 'Price on Request';
  if (isRent) return `₹${price.toLocaleString('en-IN')} / month`;
  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${cr} Cr`;
  }
  if (price >= 100000) {
    const lk = (price / 100000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${lk} Lakh`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onBackToMain,
  onOpenFullEditModal,
  onCatalogChanged,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const { isHindi } = useLanguage();

  const isAdmin = isAppOwner(currentUser);

  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'users' | 'reports' | 'platform'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [properties, setProperties] = useState<AdminPropertyRecord[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [reports, setReports] = useState<AdminReportRecord[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    enabledCategories: ['Residential', 'Commercial', 'Agriculture'],
    requireApprovalForNewListings: false,
    showFeaturedSection: true,
    featuredMode: 'manual_and_top',
  });

  // Filters
  const [propSearch, setPropSearch] = useState('');
  const [propStatusFilter, setPropStatusFilter] = useState<
    'all' | 'active' | 'pending' | 'hidden' | 'rejected' | 'featured' | 'sold'
  >('all');
  const [propCategoryFilter, setPropCategoryFilter] = useState<string>('all');

  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'owners' | 'suspended'>('all');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [reportFilter, setReportFilter] = useState<'all' | 'open' | 'resolved' | 'dismissed'>('all');

  // Modals inside Admin Dashboard
  const [editorProperty, setEditorProperty] = useState<Partial<AdminPropertyRecord> | null>(null);
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [savingProperty, setSavingProperty] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserNotes, setEditUserNotes] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  const [suspendingUser, setSuspendingUser] = useState<AdminUserRecord | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [hideListingsOnSuspend, setHideListingsOnSuspend] = useState(true);

  const [confirmDeleteProp, setConfirmDeleteProp] = useState<AdminPropertyRecord | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<AdminUserRecord | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('ukg_session_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch {}
    return headers;
  }, []);

  const notifyPublicCatalogChanged = useCallback(() => {
    onCatalogChanged?.();
    try {
      window.dispatchEvent(new CustomEvent('uk_gateways_properties_updated'));
    } catch {}
    try {
      const bc = new BroadcastChannel('uk_gateways_properties_channel');
      bc.postMessage({ type: 'PROPERTIES_UPDATED' });
      bc.close();
    } catch {}
  }, [onCatalogChanged]);

  const loadAdminOverview = useCallback(
    async (silent = false) => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setErrorMsg(null);

      try {
        const res = await fetch('/api/admin/overview', {
          credentials: 'include',
          headers: getAuthHeaders(),
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || `Failed to load admin dashboard (${res.status})`);
        }
        setStats(data.stats);
        setProperties(Array.isArray(data.properties) ? data.properties : []);
        setUsers(Array.isArray(data.users) ? data.users : []);
        setReports(Array.isArray(data.reports) ? data.reports : []);
        if (data.settings) setSettings(data.settings);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Unable to load administrator data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAdmin, getAuthHeaders]
  );

  useEffect(() => {
    void loadAdminOverview(false);
  }, [loadAdminOverview]);

  // Quick Property Status Update (Approve, Reject, Hide, Unhide, Feature, Unfeature, Sold)
  const handleQuickPropertyPatch = async (
    propId: string,
    patch: {
      approvalStatus?: 'approved' | 'pending' | 'rejected';
      isHidden?: boolean;
      featured?: boolean;
      isSold?: boolean;
    },
    successLabel: string
  ) => {
    try {
      const res = await fetch(`/api/admin/properties/${encodeURIComponent(propId)}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update listing status.');
      }
      showToast(successLabel);
      notifyPublicCatalogChanged();
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Action failed.');
    }
  };

  // Delete Property
  const handleConfirmDeleteProperty = async () => {
    if (!confirmDeleteProp) return;
    const target = confirmDeleteProp;
    setConfirmDeleteProp(null);
    try {
      const res = await fetch(`/api/admin/properties/${encodeURIComponent(target.id)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to delete property.');
      }
      showToast(`Deleted property "${target.title}"`);
      notifyPublicCatalogChanged();
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete property.');
    }
  };

  // Open Admin Add/Edit Property Drawer
  const openCreatePropertyEditor = () => {
    setIsCreatingProperty(true);
    setNewImageUrl('');
    setEditorProperty({
      title: '',
      category: 'Residential',
      type: 'Plot',
      purpose: 'sale',
      price: 2500000,
      priceDisplay: '₹25 Lakh',
      city: 'Rishikesh',
      region: 'Garhwal',
      location: '',
      areaSqFt: 900,
      areaValue: 100,
      areaUnit: 'gaj',
      areaDisplay: '100 Gaj',
      configuration: 'Residential Plot',
      bedrooms: 0,
      bathrooms: 0,
      description: '',
      sellerName: currentUser?.username || 'Amit Tyagi',
      sellerPhone: '',
      sellerType: 'Owner',
      images: [],
      amenities: ['Water Supply', 'Electricity Connection'],
      highlights: ['0% Brokerage'],
      approvalStatus: 'approved',
      isHidden: false,
      featured: false,
      isSold: false,
    });
  };

  const openEditPropertyEditor = (prop: AdminPropertyRecord) => {
    setIsCreatingProperty(false);
    setNewImageUrl('');
    setEditorProperty({
      ...prop,
      sellerName: prop.fullSellerName || prop.sellerName || prop.ownerUsername || '',
      images: Array.isArray(prop.images) ? [...prop.images] : [],
      approvalStatus: prop.approvalStatus || 'approved',
      isHidden: Boolean(prop.isHidden),
      featured: Boolean(prop.featured),
      isSold: Boolean(prop.isSold),
    });
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).slice(0, 8).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setEditorProperty((prev) => {
          if (!prev) return prev;
          const existing = Array.isArray(prev.images) ? prev.images : [];
          return { ...prev, images: [...existing, dataUrl].slice(0, 15) };
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSavePropertyEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorProperty) return;
    const title = (editorProperty.title || '').trim();
    if (title.length < 3) {
      setErrorMsg('Property title must be at least 3 characters.');
      return;
    }

    setSavingProperty(true);
    setErrorMsg(null);
    try {
      const numericPrice = Math.max(0, Number(editorProperty.price) || 0);
      const isRent = editorProperty.purpose === 'rent' || editorProperty.type === 'Rent/Lease';
      const payload = {
        ...editorProperty,
        title,
        price: numericPrice,
        priceDisplay:
          editorProperty.priceDisplay && editorProperty.priceDisplay.trim()
            ? editorProperty.priceDisplay.trim()
            : formatPriceIndian(numericPrice, isRent),
        isAvailableForRent: isRent,
        images:
          Array.isArray(editorProperty.images) && editorProperty.images.length > 0
            ? editorProperty.images
            : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
      };

      const url = isCreatingProperty
        ? '/api/admin/properties'
        : `/api/admin/properties/${encodeURIComponent(String(editorProperty.id))}`;
      const method = isCreatingProperty ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save property.');
      }

      setEditorProperty(null);
      showToast(isCreatingProperty ? 'New property published!' : `Updated "${title}" successfully!`);
      notifyPublicCatalogChanged();
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save property.');
    } finally {
      setSavingProperty(false);
    }
  };

  // User Edit & Suspension Actions
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(editingUser.id)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: editUserName.trim(),
          phone: editUserPhone.trim(),
          notes: editUserNotes.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update user.');
      }
      setEditingUser(null);
      showToast('User details updated.');
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update user.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleSuspendUser = async (
    target: AdminUserRecord,
    suspend: boolean,
    reason?: string,
    hideListings?: boolean
  ) => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(target.id)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          isSuspended: suspend,
          suspendedReason: reason || 'Policy violation',
          hideUserListings: Boolean(hideListings),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update account status.');
      }
      setSuspendingUser(null);
      setSuspendReason('');
      showToast(suspend ? `Suspended account "${target.username}"` : `Reactivated account "${target.username}"`);
      if (hideListings) notifyPublicCatalogChanged();
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update account status.');
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    const target = confirmDeleteUser;
    setConfirmDeleteUser(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(target.id)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to delete user.');
      }
      showToast(`Deleted user "${target.username}" and removed ${data.deletedListings || 0} listings.`);
      notifyPublicCatalogChanged();
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete user.');
    }
  };

  // Report Moderation Actions
  const handleReportAction = async (
    reportId: string,
    payload: { status?: 'open' | 'resolved' | 'dismissed'; action?: 'remove_property' | 'hide_property' },
    label: string
  ) => {
    try {
      const res = await fetch(`/api/admin/reports/${encodeURIComponent(reportId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to process report.');
      }
      showToast(label);
      if (payload.action) notifyPublicCatalogChanged();
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Report action failed.');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${encodeURIComponent(reportId)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showToast('Report record deleted.');
        await loadAdminOverview(true);
      }
    } catch {}
  };

  // Platform Settings Save
  const handleSaveSettings = async (nextSettings: PlatformSettings) => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(nextSettings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save platform settings.');
      }
      setSettings(data.settings);
      showToast('Platform settings saved!');
      notifyPublicCatalogChanged();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Lists
  const filteredProperties = useMemo(() => {
    const q = propSearch.trim().toLowerCase();
    return properties.filter((p) => {
      const status = p.approvalStatus || 'approved';
      if (propStatusFilter === 'active' && (status !== 'approved' || p.isHidden || p.isSold)) return false;
      if (propStatusFilter === 'pending' && status !== 'pending') return false;
      if (propStatusFilter === 'rejected' && status !== 'rejected') return false;
      if (propStatusFilter === 'hidden' && !p.isHidden) return false;
      if (propStatusFilter === 'featured' && !p.featured) return false;
      if (propStatusFilter === 'sold' && !p.isSold) return false;
      if (propCategoryFilter !== 'all' && p.category !== propCategoryFilter) return false;

      if (q) {
        const hay = [
          p.id,
          p.title,
          p.city,
          p.location,
          p.type,
          p.category,
          p.fullSellerName,
          p.sellerName,
          p.ownerUsername,
          p.ownerContact,
          p.sellerPhone,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [properties, propSearch, propStatusFilter, propCategoryFilter]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (userFilter === 'owners' && u.propertiesCount === 0) return false;
      if (userFilter === 'suspended' && !u.isSuspended) return false;
      if (q) {
        const hay = [u.username, u.contact, u.phone, u.id, u.notes].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, userSearch, userFilter]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (reportFilter !== 'all' && r.status !== reportFilter) return false;
      return true;
    });
  }, [reports, reportFilter]);

  // Strict Access Gate for Non-Admin Visitors
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f4f5f2] dark:bg-[#051a12] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#082218] rounded-3xl p-8 border border-emerald-200 dark:border-emerald-800 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            {isHindi ? 'केवल एडमिनिस्ट्रेटर प्रवेश' : 'Administrator Access Only'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {!currentUser
              ? 'Please sign in with an authorized Uttarakhand Gateways administrator account to access this console.'
              : 'Your account does not have administrator permissions to access platform management controls.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={onBackToMain}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950 cursor-pointer"
            >
              Back to Marketplace
            </button>
            {!currentUser && (
              <button
                type="button"
                onClick={() => openAuthModal('login', 'Sign in with your administrator account.')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Admin Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f2] dark:bg-[#051a12] text-slate-900 dark:text-slate-100">
      {/* Top Admin Command Header */}
      <header className="sticky top-0 z-40 bg-[#0E3A2B] text-white border-b border-emerald-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToMain}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Marketplace</span>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <span>Uttarakhand Gateways Admin Console</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase">
                    Full Power
                  </span>
                </h1>
                <p className="text-[11px] text-emerald-200/80">
                  Signed in as {currentUser.username} ({currentUser.contact})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadAdminOverview(true)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Refresh live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={openCreatePropertyEditor}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'overview', label: 'Overview & Stats', icon: BarChart3 },
            { id: 'properties', label: `Properties (${stats?.totalProperties ?? properties.length})`, icon: Building2 },
            { id: 'users', label: `Users & Owners (${stats?.registeredUsers ?? users.length})`, icon: Users },
            {
              id: 'reports',
              label: `Reports (${stats?.openReports ?? 0} Open)`,
              icon: Flag,
            },
            { id: 'platform', label: 'Platform & Featured', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#f4f5f2] dark:bg-[#051a12] text-[#0E3A2B] dark:text-amber-300 border-amber-400'
                    : 'text-emerald-100/80 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {toastMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toastMsg}</span>
            </span>
            <button type="button" onClick={() => setToastMsg(null)} className="opacity-80 hover:opacity-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </span>
            <button type="button" onClick={() => setErrorMsg(null)} className="opacity-80 hover:opacity-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Loading marketplace administration data...
          </div>
        ) : (
          <>
            {/* ================= TAB 1: OVERVIEW & MARKETPLACE STATISTICS ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300/80 block">
                      Total Properties
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block tabular-nums">
                      {(stats?.totalProperties ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {stats?.soldListings ?? 0} marked sold
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      Active Listings
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block tabular-nums">
                      {(stats?.activeListings ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {stats?.featuredListings ?? 0} featured
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-amber-200 dark:border-amber-800/70 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                      Pending Approvals
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 mt-1 block tabular-nums">
                      {(stats?.pendingApprovals ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {stats?.hiddenListings ?? 0} hidden · {stats?.rejectedListings ?? 0} rejected
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300/80 block">
                      Registered Users
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block tabular-nums">
                      {(stats?.registeredUsers ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">
                      {stats?.suspendedUsers ?? 0} suspended
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 block">
                      Total Property Views
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-300 mt-1 block tabular-nums">
                      {(stats?.totalPropertyViews ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {stats?.totalInquiries ?? 0} inquiries · {stats?.totalShares ?? 0} shares
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-rose-200 dark:border-rose-900/60 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                      Open Reports
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 block tabular-nums">
                      {(stats?.openReports ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {stats?.totalReports ?? 0} total submitted
                    </span>
                  </div>
                </div>

                {/* Category Breakdown & Most Viewed Listings */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>Category Distribution</span>
                    </h2>
                    <div className="space-y-2.5">
                      {PROPERTY_CATEGORIES.map((cat) => {
                        const count = stats?.categoriesBreakdown?.[cat] ?? 0;
                        const enabled = settings.enabledCategories.includes(cat);
                        return (
                          <div
                            key={cat}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-[#061811] border border-slate-200/70 dark:border-emerald-900/60 flex items-center justify-between"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">{cat}</span>
                              <span className={`text-[10px] font-bold ${enabled ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {enabled ? 'Visible on Marketplace' : 'Hidden Category'}
                              </span>
                            </div>
                            <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-600" />
                        <span>Top Viewed Properties</span>
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('properties')}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Manage All Listings →
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-emerald-900/50">
                      {[...properties]
                        .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
                        .slice(0, 5)
                        .map((p) => (
                          <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {p.title}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {p.city} • Owner: <strong className="text-slate-700 dark:text-slate-200">{p.fullSellerName || p.sellerName}</strong>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 tabular-nums">
                                <Eye className="w-3 h-3" />
                                <span>{formatPropertyViewsCount(p.views, false)}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => openEditPropertyEditor(p)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-emerald-950 hover:bg-emerald-100 text-slate-700 dark:text-emerald-200 cursor-pointer"
                                title="Edit Property"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: PROPERTY MANAGEMENT ================= */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="p-4 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={propSearch}
                        onChange={(e) => setPropSearch(e.target.value)}
                        placeholder="Search by title, city, ID, full owner name, email, or phone..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051810] text-xs sm:text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                    <select
                      value={propCategoryFilter}
                      onChange={(e) => setPropCategoryFilter(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] text-xs font-bold"
                    >
                      <option value="all">All Categories</option>
                      {PROPERTY_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: `All (${properties.length})` },
                      {
                        id: 'active',
                        label: `Active (${properties.filter((p) => (p.approvalStatus || 'approved') === 'approved' && !p.isHidden && !p.isSold).length})`,
                      },
                      {
                        id: 'pending',
                        label: `Pending (${properties.filter((p) => p.approvalStatus === 'pending').length})`,
                      },
                      {
                        id: 'featured',
                        label: `Featured (${properties.filter((p) => p.featured).length})`,
                      },
                      {
                        id: 'hidden',
                        label: `Hidden (${properties.filter((p) => p.isHidden).length})`,
                      },
                      {
                        id: 'rejected',
                        label: `Rejected (${properties.filter((p) => p.approvalStatus === 'rejected').length})`,
                      },
                      {
                        id: 'sold',
                        label: `Sold (${properties.filter((p) => p.isSold).length})`,
                      },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setPropStatusFilter(pill.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          propStatusFilter === pill.id
                            ? 'bg-[#0E3A2B] text-white dark:bg-amber-400 dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-[#051811] text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Properties List */}
                {filteredProperties.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 text-sm text-slate-500">
                    No properties match the selected filter.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProperties.map((prop) => {
                      const status = prop.approvalStatus || 'approved';
                      const img =
                        Array.isArray(prop.images) && prop.images[0]
                          ? prop.images[0]
                          : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80';
                      const submittedDate = prop.createdAt
                        ? new Date(prop.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/A';

                      return (
                        <div
                          key={prop.id}
                          className="p-4 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex flex-col lg:flex-row gap-4 justify-between"
                        >
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <img
                              src={img}
                              alt={prop.title}
                              className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-emerald-800"
                            />
                            <div className="space-y-1.5 min-w-0 flex-1">
                              {/* Status Badges */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    status === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : status === 'pending'
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  }`}
                                >
                                  {status}
                                </span>

                                {prop.isHidden && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                    Hidden
                                  </span>
                                )}

                                {prop.featured && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                                    Featured
                                  </span>
                                )}

                                {prop.isSold && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white">
                                    Sold
                                  </span>
                                )}

                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Submitted: {submittedDate}
                                </span>

                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 tabular-nums">
                                  <Eye className="w-3 h-3" />
                                  {formatPropertyViewsCount(prop.views, false)}
                                </span>
                              </div>

                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                                {prop.title}{' '}
                                <span className="text-emerald-700 dark:text-emerald-400">• {prop.priceDisplay}</span>
                              </h3>

                              <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                  {prop.location || prop.city}, {prop.city}
                                </span>
                                <span>•</span>
                                <span>
                                  {prop.type} ({prop.category}) • {prop.areaDisplay}
                                </span>
                              </div>

                              {/* Complete Unmasked Owner Details for Admin */}
                              <div className="pt-1 text-xs text-slate-700 dark:text-emerald-200 flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span>
                                  <strong>Full Owner Name:</strong> {prop.fullSellerName || prop.sellerName || 'N/A'}
                                  {prop.publicMaskedSellerName && prop.publicMaskedSellerName !== (prop.fullSellerName || prop.sellerName) && (
                                    <span className="text-[11px] text-slate-500 ml-1">
                                      (Public: {prop.publicMaskedSellerName})
                                    </span>
                                  )}
                                </span>
                                {prop.sellerPhone && (
                                  <span className="font-mono text-emerald-700 dark:text-emerald-300">
                                    📞 {prop.sellerPhone}
                                  </span>
                                )}
                                {prop.ownerContact && (
                                  <span className="text-slate-500 dark:text-slate-400">✉️ {prop.ownerContact}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Admin Action Controls */}
                          <div className="flex flex-wrap lg:flex-col justify-end gap-1.5 shrink-0">
                            <div className="flex flex-wrap gap-1.5">
                              {status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleQuickPropertyPatch(
                                      prop.id,
                                      { approvalStatus: 'approved', isHidden: false },
                                      `Approved "${prop.title}"`
                                    )
                                  }
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleQuickPropertyPatch(
                                      prop.id,
                                      { approvalStatus: 'rejected' },
                                      `Rejected "${prop.title}"`
                                    )
                                  }
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  void handleQuickPropertyPatch(
                                    prop.id,
                                    { isHidden: !prop.isHidden },
                                    prop.isHidden ? `Unhid "${prop.title}"` : `Hid "${prop.title}" from public`
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {prop.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span>{prop.isHidden ? 'Unhide' : 'Hide'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleQuickPropertyPatch(
                                    prop.id,
                                    { featured: !prop.featured },
                                    prop.featured ? `Removed "${prop.title}" from Featured` : `Featured "${prop.title}"`
                                  )
                                }
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer ${
                                  prop.featured
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                }`}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{prop.featured ? 'Unfeature' : 'Feature'}</span>
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditPropertyEditor(prop)}
                                className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Details & Images</span>
                              </button>

                              {onOpenFullEditModal && (
                                <button
                                  type="button"
                                  onClick={() => onOpenFullEditModal(prop)}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-emerald-950 cursor-pointer"
                                  title="Open Full Wizard Form"
                                >
                                  Full Form
                                </button>
                              )}

                              <a
                                href={`${getPropertySlugPath(prop)}?preview=admin`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 text-xs font-bold flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-emerald-950"
                                title="Admin Preview (Does not count as public view)"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => setConfirmDeleteProp(prop)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 3: USERS & PROPERTY OWNERS ================= */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users & owners by name, email, or phone..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051810] text-xs sm:text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'all', label: `All Users (${users.length})` },
                      { id: 'owners', label: `Property Owners (${users.filter((u) => u.propertiesCount > 0).length})` },
                      { id: 'suspended', label: `Suspended (${users.filter((u) => u.isSuspended).length})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setUserFilter(f.id as any)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                          userFilter === f.id
                            ? 'bg-[#0E3A2B] text-white dark:bg-amber-400 dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-[#051811] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredUsers.map((u) => {
                    const isExpanded = expandedUserId === u.id;
                    return (
                      <div
                        key={u.id}
                        className="rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs overflow-hidden"
                      >
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm uppercase text-white shrink-0 ${
                                u.isOwner
                                  ? 'bg-amber-500 text-slate-950'
                                  : u.isSuspended
                                    ? 'bg-rose-600'
                                    : 'bg-emerald-700'
                              }`}
                            >
                              {u.username?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                                  {u.username}
                                </span>
                                {u.isOwner && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                                    Platform Admin
                                  </span>
                                )}
                                {u.isSuspended ? (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
                                    Suspended
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase">
                                    Active
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-emerald-600" />
                                  {u.contact}
                                </span>
                                {u.phone && (
                                  <span className="flex items-center gap-1 font-mono">
                                    <Phone className="w-3 h-3 text-emerald-600" />
                                    {u.phone}
                                  </span>
                                )}
                                <span className="text-slate-400">
                                  Joined: {new Date(u.createdAt).toLocaleDateString('en-IN')}
                                </span>
                              </div>

                              {u.isSuspended && u.suspendedReason && (
                                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                                  Suspension Reason: {u.suspendedReason}
                                </p>
                              )}
                              {u.notes && (
                                <p className="text-xs text-slate-500 italic">Admin Note: {u.notes}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{u.propertiesCount} Properties</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(u);
                                setEditUserName(u.username || '');
                                setEditUserPhone(u.phone || '');
                                setEditUserNotes(u.notes || '');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {!u.isOwner && (
                              <>
                                {u.isSuspended ? (
                                  <button
                                    type="button"
                                    onClick={() => void handleToggleSuspendUser(u, false)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Reactivate</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSuspendingUser(u);
                                      setSuspendReason('');
                                      setHideListingsOnSuspend(true);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Suspend</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteUser(u)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Owned Properties Drawer */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 bg-slate-50 dark:bg-[#051811] border-t border-slate-200/70 dark:border-emerald-900/60 space-y-2">
                            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-emerald-300">
                              Properties Owned by {u.username} ({u.ownedProperties.length}) • Total Views: {u.totalViews}
                            </div>
                            {u.ownedProperties.length === 0 ? (
                              <p className="text-xs text-slate-500 py-2">This user has not submitted any properties.</p>
                            ) : (
                              <div className="divide-y divide-slate-200/70 dark:divide-emerald-900/50">
                                {u.ownedProperties.map((op) => {
                                  const fullProp = properties.find((p) => p.id === op.id);
                                  return (
                                    <div key={op.id} className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                                      <div className="min-w-0">
                                        <span className="font-bold text-slate-900 dark:text-white">{op.title}</span>{' '}
                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                          ({op.priceDisplay})
                                        </span>{' '}
                                        <span className="text-slate-500">• {op.city}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 tabular-nums">
                                          👁 {formatPropertyViewsCount(op.views, false)}
                                        </span>
                                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                          {op.isHidden ? 'Hidden' : op.approvalStatus}
                                        </span>
                                        {fullProp && (
                                          <button
                                            type="button"
                                            onClick={() => openEditPropertyEditor(fullProp)}
                                            className="px-2 py-1 rounded bg-blue-600 text-white font-bold cursor-pointer"
                                          >
                                            Edit
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 4: REPORTED PROPERTIES & MODERATION ================= */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: `All Reports (${reports.length})` },
                    { id: 'open', label: `Open (${reports.filter((r) => r.status === 'open').length})` },
                    { id: 'resolved', label: `Resolved (${reports.filter((r) => r.status === 'resolved').length})` },
                    { id: 'dismissed', label: `Dismissed (${reports.filter((r) => r.status === 'dismissed').length})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setReportFilter(f.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        reportFilter === f.id
                          ? 'bg-[#0E3A2B] text-white dark:bg-amber-400 dark:text-slate-950'
                          : 'bg-white dark:bg-[#082218] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredReports.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 text-sm text-slate-500">
                    No reported properties in this view.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-4 rounded-3xl bg-white dark:bg-[#082218] border border-rose-200/80 dark:border-rose-900/50 shadow-xs flex flex-col lg:flex-row justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                rep.status === 'open'
                                  ? 'bg-rose-600 text-white'
                                  : rep.status === 'resolved'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {rep.status}
                            </span>
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {rep.propertyTitle || rep.propertyId}
                            </h3>
                            {!rep.propertyExists && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                Listing Already Removed
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Reason: {rep.reason}</p>
                          {rep.details && <p className="text-xs text-slate-600 dark:text-slate-300">{rep.details}</p>}
                          <div className="text-[11px] text-slate-500 flex flex-wrap gap-3">
                            <span>Reporter: {rep.reporterContact || 'Anonymous'}</span>
                            {rep.propertyOwnerName && <span>Owner: {rep.propertyOwnerName}</span>}
                            <span>Reported: {new Date(rep.createdAt).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {rep.propertyExists && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleReportAction(
                                    rep.id,
                                    { action: 'remove_property', status: 'resolved' },
                                    'Removed fraudulent listing & resolved report.'
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Listing</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleReportAction(
                                    rep.id,
                                    { action: 'hide_property', status: 'resolved' },
                                    'Hid listing & resolved report.'
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide Listing</span>
                              </button>
                            </>
                          )}

                          {rep.status === 'open' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleReportAction(rep.id, { status: 'resolved' }, 'Report marked resolved.')
                                }
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                              >
                                Resolve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleReportAction(rep.id, { status: 'dismissed' }, 'Report dismissed.')
                                }
                                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-emerald-800 text-xs font-bold cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => void handleDeleteReport(rep.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete report entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 5: PLATFORM, CATEGORIES & HOMEPAGE FEATURED ================= */}
            {activeTab === 'platform' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Controls */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-5">
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    <span>Categories & Listing Visibility Controls</span>
                  </h2>

                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Active Property Categories
                    </span>
                    {PROPERTY_CATEGORIES.map((cat) => {
                      const checked = settings.enabledCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900 cursor-pointer"
                        >
                          <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white block">{cat}</span>
                            <span className="text-[11px] text-slate-500">
                              Allow public browsing and new submissions in {cat}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={savingSettings}
                            onChange={(e) => {
                              const nextCats = e.target.checked
                                ? Array.from(new Set([...settings.enabledCategories, cat]))
                                : settings.enabledCategories.filter((c) => c !== cat);
                              if (nextCats.length === 0) return;
                              void handleSaveSettings({ ...settings, enabledCategories: nextCats });
                            }}
                            className="w-5 h-5 accent-emerald-600"
                          />
                        </label>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-emerald-900 space-y-3">
                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900 cursor-pointer">
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block">
                          Require Admin Approval for New Listings
                        </span>
                        <span className="text-[11px] text-slate-500">
                          When enabled, new user submissions enter Pending Approval until approved by Admin.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.requireApprovalForNewListings}
                        disabled={savingSettings}
                        onChange={(e) =>
                          void handleSaveSettings({ ...settings, requireApprovalForNewListings: e.target.checked })
                        }
                        className="w-5 h-5 accent-emerald-600"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900 cursor-pointer">
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block">
                          Display Homepage Featured Carousel
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Show or hide the Featured Properties showcase on the homepage.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showFeaturedSection}
                        disabled={savingSettings}
                        onChange={(e) =>
                          void handleSaveSettings({ ...settings, showFeaturedSection: e.target.checked })
                        }
                        className="w-5 h-5 accent-emerald-600"
                      />
                    </label>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900 space-y-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        Homepage Featured Curation Mode
                      </span>
                      <select
                        value={settings.featuredMode}
                        disabled={savingSettings}
                        onChange={(e) =>
                          void handleSaveSettings({
                            ...settings,
                            featuredMode: e.target.value as 'manual_and_top' | 'manual_only',
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#082218] text-xs font-bold"
                      >
                        <option value="manual_and_top">Admin-Featured First + Recent Top Properties</option>
                        <option value="manual_only">Strictly Admin-Featured Properties Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Homepage Featured Properties Selector */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span>Homepage Featured Properties ({properties.filter((p) => p.featured).length})</span>
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    Toggle properties below to pin or remove them from the Homepage Featured showcase.
                  </p>

                  <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100 dark:divide-emerald-900/50 pr-1">
                    {properties.map((p) => (
                      <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {p.city} • {p.priceDisplay} • 👁 {formatPropertyViewsCount(p.views, false)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            void handleQuickPropertyPatch(
                              p.id,
                              { featured: !p.featured },
                              p.featured ? `Unfeatured "${p.title}"` : `Featured "${p.title}"`
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${
                            p.featured
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-100 dark:bg-[#051811] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {p.featured ? '★ Featured' : 'Feature'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ================= MODAL: ADMIN PROPERTY ADD / EDIT (DETAILS, IMAGES, OWNER, STATUS) ================= */}
      {editorProperty && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setEditorProperty(null)}
        >
          <div
            className="w-full max-w-3xl bg-white dark:bg-[#082218] rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#0E3A2B] text-white flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>{isCreatingProperty ? 'Admin: Add New Property' : `Admin Edit: ${editorProperty.title}`}</span>
              </h3>
              <button type="button" onClick={() => setEditorProperty(null)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePropertyEditor} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={editorProperty.title || ''}
                    onChange={(e) => setEditorProperty({ ...editorProperty, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Purpose</label>
                  <select
                    value={editorProperty.purpose || 'sale'}
                    onChange={(e) => setEditorProperty({ ...editorProperty, purpose: e.target.value as 'sale' | 'rent' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={editorProperty.category || 'Residential'}
                    onChange={(e) => setEditorProperty({ ...editorProperty, category: e.target.value as PropertyCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  >
                    {PROPERTY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Property Type</label>
                  <select
                    value={editorProperty.type || 'Plot'}
                    onChange={(e) => setEditorProperty({ ...editorProperty, type: e.target.value as PropertyType })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">City</label>
                  <select
                    value={editorProperty.city || 'Rishikesh'}
                    onChange={(e) => setEditorProperty({ ...editorProperty, city: e.target.value as UttarakhandCity })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Locality / Address</label>
                  <input
                    type="text"
                    value={editorProperty.location || ''}
                    onChange={(e) => setEditorProperty({ ...editorProperty, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Numeric Price (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={editorProperty.price ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      const isRent = editorProperty.purpose === 'rent' || editorProperty.type === 'Rent/Lease';
                      setEditorProperty({
                        ...editorProperty,
                        price: val,
                        priceDisplay: formatPriceIndian(val, isRent),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Display Price Text</label>
                  <input
                    type="text"
                    value={editorProperty.priceDisplay || ''}
                    onChange={(e) => setEditorProperty({ ...editorProperty, priceDisplay: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Area Display (e.g. 150 Gaj / 1,200 Sq.Ft)</label>
                  <input
                    type="text"
                    value={editorProperty.areaDisplay || ''}
                    onChange={(e) => setEditorProperty({ ...editorProperty, areaDisplay: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Owner Full Name (Database)</label>
                  <input
                    type="text"
                    value={editorProperty.sellerName || ''}
                    onChange={(e) => setEditorProperty({ ...editorProperty, sellerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Owner Phone Number</label>
                  <input
                    type="text"
                    value={editorProperty.sellerPhone || ''}
                    onChange={(e) => setEditorProperty({ ...editorProperty, sellerPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Approval Status</label>
                  <select
                    value={editorProperty.approvalStatus || 'approved'}
                    onChange={(e) =>
                      setEditorProperty({
                        ...editorProperty,
                        approvalStatus: e.target.value as 'approved' | 'pending' | 'rejected',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Approval</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editorProperty.featured)}
                      onChange={(e) => setEditorProperty({ ...editorProperty, featured: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span>Featured</span>
                  </label>
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editorProperty.isHidden)}
                      onChange={(e) => setEditorProperty({ ...editorProperty, isHidden: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <span>Hidden</span>
                  </label>
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editorProperty.isSold)}
                      onChange={(e) => setEditorProperty({ ...editorProperty, isSold: e.target.checked })}
                      className="w-4 h-4 accent-rose-600"
                    />
                    <span>Sold Out</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={editorProperty.description || ''}
                    onChange={(e) => setEditorProperty({ ...editorProperty, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                  />
                </div>

                {/* Property Images Management */}
                <div className="sm:col-span-2 space-y-2.5">
                  <label className="font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Property Images ({editorProperty.images?.length || 0})</span>
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Paste image https:// URL..."
                      className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newImageUrl.trim()) return;
                        setEditorProperty({
                          ...editorProperty,
                          images: [...(editorProperty.images || []), newImageUrl.trim()],
                        });
                        setNewImageUrl('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                    >
                      + Add URL
                    </button>
                    <label className="px-3.5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageFileUpload} className="hidden" />
                    </label>
                  </div>

                  {Array.isArray(editorProperty.images) && editorProperty.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                      {editorProperty.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 h-20">
                          <img src={imgUrl} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setEditorProperty({
                                ...editorProperty,
                                images: (editorProperty.images || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-[9px] font-bold">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-emerald-900 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditorProperty(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProperty}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProperty ? 'Saving...' : isCreatingProperty ? 'Publish Property' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER ================= */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingUser(null)}
        >
          <form
            onSubmit={handleSaveUserEdit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#082218] rounded-3xl p-6 border border-emerald-300 dark:border-emerald-800 shadow-2xl space-y-4 text-xs sm:text-sm"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Edit User Account ({editingUser.contact})
            </h3>
            <div>
              <label className="font-bold block mb-1">Full Name / Username</label>
              <input
                type="text"
                required
                minLength={2}
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Phone Number</label>
              <input
                type="text"
                value={editUserPhone}
                onChange={(e) => setEditUserPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Internal Admin Notes</label>
              <textarea
                rows={2}
                value={editUserNotes}
                onChange={(e) => setEditUserNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingUser}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
              >
                {savingUser ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: SUSPEND USER ================= */}
      {suspendingUser && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSuspendingUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#082218] rounded-3xl p-6 border border-amber-300 dark:border-amber-800 shadow-2xl space-y-4 text-xs sm:text-sm"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Suspend Account: {suspendingUser.username}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Suspending revokes active sessions immediately and blocks login and property submissions.
            </p>
            <div>
              <label className="font-bold block mb-1">Reason for Suspension</label>
              <input
                type="text"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Spam or fraudulent listings..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
              />
            </div>
            <label className="flex items-center gap-2 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={hideListingsOnSuspend}
                onChange={(e) => setHideListingsOnSuspend(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <span>Also hide all properties owned by this user ({suspendingUser.propertiesCount})</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  void handleToggleSuspendUser(
                    suspendingUser,
                    true,
                    suspendReason.trim() || 'Suspended by administrator',
                    hideListingsOnSuspend
                  )
                }
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer"
              >
                Confirm Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE PROPERTY ================= */}
      {confirmDeleteProp && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteProp(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#082218] rounded-3xl p-6 border border-rose-300 dark:border-rose-900 shadow-2xl text-center space-y-4"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white">Remove Property Listing?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Permanently remove <strong>"{confirmDeleteProp.title}"</strong> from the marketplace?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteProp(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDeleteProperty()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE USER ================= */}
      {confirmDeleteUser && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#082218] rounded-3xl p-6 border border-rose-300 dark:border-rose-900 shadow-2xl text-center space-y-4"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white">Delete User Account?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Permanently delete <strong>{confirmDeleteUser.username}</strong> ({confirmDeleteUser.contact}) and remove all{' '}
              <strong>{confirmDeleteUser.propertiesCount}</strong> of their listings?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDeleteUser()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
