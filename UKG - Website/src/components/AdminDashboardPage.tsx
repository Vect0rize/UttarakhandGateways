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
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Save,
  X,
  AlertTriangle,
  Phone,
  Mail,
  Upload,
  RotateCcw,
  Archive,
  History,
  CheckSquare,
  Square,
  Globe,
  Tag,
  SlidersHorizontal,
  ClipboardList,
} from 'lucide-react';
import { Property, PropertyCategory, PropertyType, UttarakhandCity, Region, PropertyRequirement, RequirementType, RequirementPropertyType } from '../types';
import { compressImageToWebpFile, uploadFileWithProgress, validateUploadFile } from '../utils/imageModeration';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isAppOwner, formatPropertyViewsCount, formatPropertyAge } from '../utils/propertyOwnership';
import { getPropertySlugPath } from '../data/programmaticSeo';
import { resolveApiUrl, isNativeAndroidApp } from '../config/apiConfig';

interface AdminStats {
  totalProperties: number;
  totalIncludingDeleted?: number;
  activeListings: number;
  publishedListings?: number;
  unpublishedListings?: number;
  pendingApprovals: number;
  rejectedListings: number;
  hiddenListings: number;
  featuredListings: number;
  soldListings: number;
  deletedListings?: number;
  registeredUsers: number;
  suspendedUsers: number;
  openReports: number;
  totalReports: number;
  pendingRequirements?: number;
  totalRequirements?: number;
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
  isPublished?: boolean;
  isHidden: boolean;
  featured: boolean;
  isSold: boolean;
  createdAt?: string;
  updatedAt?: string;
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

interface AdminAuditLogRecord {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  targetType: 'property' | 'user' | 'report' | 'settings' | 'bulk' | 'requirement';
  targetId: string;
  targetTitle?: string;
  details: string;
  createdAt: string;
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
  isPublished?: boolean;
  isHidden?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  updatedAt?: string;
}

interface AdminDashboardPageProps {
  onBackToMain: () => void;
  onOpenAddProperty?: () => void;
  onOpenFullEditModal?: (property: Property) => void;
  onCatalogChanged?: () => void;
}

type PropertyControlView =
  | 'all'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'hidden'
  | 'featured'
  | 'sold'
  | 'deleted';

type PropertySortOption = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'most-viewed';

type DateRangeFilter = 'all' | 'today' | '7d' | '30d' | '90d' | 'custom';

type EditorSectionTab = 'core' | 'location' | 'specs' | 'content' | 'media' | 'owner';

const PROPERTY_CATEGORIES: PropertyCategory[] = ['Residential', 'Commercial', 'Agriculture'];

const PROPERTY_TYPES: PropertyType[] = [
  'Plot',
  'Land',
  'House',
  'Villa',
  'Duplex',
  'Flat',
  'Apartment',
  'Penthouse',
  'Studio',
  'Cottage',
  'Farmhouse',
  'Homestay',
  'Hostel',
  'Resort',
  'Hotel',
  'Restaurant',
  'Cafe',
  'Shop',
  'Showroom',
  'Office',
  'Warehouse',
  'PG',
  'Rent',
  'Lease',
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

const AREA_UNITS = ['gaj', 'sqft', 'nali', 'bigha', 'acre', 'sqm', 'mutthi'];

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

function formatDateTimeShort(iso?: string): string {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onBackToMain,
  onOpenFullEditModal,
  onCatalogChanged,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const { isHindi } = useLanguage();

  const isAdmin = isAppOwner(currentUser);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'properties' | 'requirements' | 'users' | 'reports' | 'platform' | 'audit'
  >('properties');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [properties, setProperties] = useState<AdminPropertyRecord[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [reports, setReports] = useState<AdminReportRecord[]>([]);
  const [requirements, setRequirements] = useState<PropertyRequirement[]>([]);
  const [reqFilter, setReqFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'fulfilled'>('all');
  const [editingAdminReq, setEditingAdminReq] = useState<PropertyRequirement | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogRecord[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    enabledCategories: ['Residential', 'Commercial', 'Agriculture'],
    requireApprovalForNewListings: false,
    showFeaturedSection: true,
    featuredMode: 'manual_and_top',
  });

  // Central Property Control Panel Filters & Sorting
  const [propSearch, setPropSearch] = useState('');
  const [propStatusView, setPropStatusView] = useState<PropertyControlView>('all');
  const [propCategoryFilter, setPropCategoryFilter] = useState<string>('all');
  const [propDateFilter, setPropDateFilter] = useState<DateRangeFilter>('all');
  const [customDateFrom, setCustomDateFrom] = useState<string>('');
  const [customDateTo, setCustomDateTo] = useState<string>('');
  const [propSortBy, setPropSortBy] = useState<PropertySortOption>('newest');

  // Bulk Selection & Confirmation State
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [pendingBulkConfirm, setPendingBulkConfirm] = useState<{
    action: string;
    label: string;
    destructive?: boolean;
  } | null>(null);

  // User, Report & Audit Filters
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'owners' | 'suspended'>('all');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [reportFilter, setReportFilter] = useState<'all' | 'open' | 'resolved' | 'dismissed'>('all');
  const [auditSearch, setAuditSearch] = useState('');

  // Complete All-Fields Property Editor Modal State
  const [editorProperty, setEditorProperty] = useState<Partial<AdminPropertyRecord> | null>(null);
  const [editorSection, setEditorSection] = useState<EditorSectionTab>('core');
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [replacingImageIdx, setReplacingImageIdx] = useState<number | null>(null);
  const [replaceImageUrlValue, setReplaceImageUrlValue] = useState('');
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [savingProperty, setSavingProperty] = useState(false);

  // User & Confirmation Modals
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserNotes, setEditUserNotes] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  const [suspendingUser, setSuspendingUser] = useState<AdminUserRecord | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [hideListingsOnSuspend, setHideListingsOnSuspend] = useState(true);

  const [confirmDeleteProp, setConfirmDeleteProp] = useState<{
    property: AdminPropertyRecord;
    permanent: boolean;
  } | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<AdminUserRecord | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4200);
  };

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('ukg_session_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-Session-Token'] = token;
      }
    } catch {}
    return headers;
  }, []);

  const adminFetch = useCallback(
    (endpoint: string, init: RequestInit = {}) => {
      return fetch(resolveApiUrl(endpoint), {
        ...init,
        credentials: isNativeAndroidApp() ? 'omit' : 'include',
        headers: {
          ...getAuthHeaders(),
          ...((init.headers as Record<string, string>) || {}),
        },
      });
    },
    [getAuthHeaders]
  );

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
      setSessionExpired(false);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const res = await adminFetch('/api/admin/overview', {
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setSessionExpired(true);
          setErrorMsg('Your administrator session expired. Please sign in again to load live controls.');
          return;
        }
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || `Failed to load admin dashboard (${res.status})`);
        }
        setStats(data.stats);
        setProperties(Array.isArray(data.properties) ? data.properties : []);
        setUsers(Array.isArray(data.users) ? data.users : []);
        setReports(Array.isArray(data.reports) ? data.reports : []);
        setRequirements(Array.isArray(data.requirements) ? data.requirements : []);
        setAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
        if (data.settings) setSettings(data.settings);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err?.name === 'AbortError') {
          setErrorMsg('Admin overview request timed out. Tap Refresh to try again.');
        } else {
          setErrorMsg(err?.message || 'Unable to load administrator data.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAdmin, adminFetch]
  );

  useEffect(() => {
    void loadAdminOverview(false);
  }, [loadAdminOverview]);

  // Quick Property Status Update (Approve, Reject, Publish, Unpublish, Hide, Unhide, Feature, Sold, Archive/Restore)
  const handleQuickPropertyPatch = async (
    propId: string,
    patch: {
      approvalStatus?: 'approved' | 'pending' | 'rejected';
      isPublished?: boolean;
      isHidden?: boolean;
      featured?: boolean;
      isSold?: boolean;
      isDeleted?: boolean;
    },
    successLabel: string
  ) => {
    try {
      const res = await adminFetch(`/api/admin/properties/${encodeURIComponent(propId)}/status`, { method: 'PATCH',
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

  // Restore Soft-Deleted Property
  const handleRestoreProperty = async (prop: AdminPropertyRecord) => {
    try {
      const res = await adminFetch(`/api/admin/properties/${encodeURIComponent(prop.id)}/restore`, { method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to restore property.');
      }
      showToast(`Restored "${prop.title}" to active marketplace!`);
      notifyPublicCatalogChanged();
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to restore property.');
    }
  };

  // Archive (Soft-Delete) or Permanently Delete Property
  const handleConfirmDeleteProperty = async () => {
    if (!confirmDeleteProp) return;
    const { property: target, permanent } = confirmDeleteProp;
    setConfirmDeleteProp(null);
    try {
      const query = permanent ? '?permanent=true' : '';
      const res = await adminFetch(`/api/admin/properties/${encodeURIComponent(target.id)}${query}`, { method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to remove property.');
      }
      setSelectedPropertyIds((prev) => prev.filter((id) => id !== target.id));
      showToast(
        permanent
          ? `Permanently deleted "${target.title}"`
          : `Archived "${target.title}" (can be restored from Deleted / Archived)`
      );
      notifyPublicCatalogChanged();
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete property.');
    }
  };

  // Bulk Action Execution
  const executeBulkAction = async (action: string, label: string) => {
    if (selectedPropertyIds.length === 0) return;
    setBulkBusy(true);
    setPendingBulkConfirm(null);
    try {
      const res = await adminFetch('/api/admin/properties/bulk', { method: 'POST',
        body: JSON.stringify({
          propertyIds: selectedPropertyIds,
          action,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Bulk operation failed.');
      }
      showToast(`${label} applied to ${data.affectedCount ?? selectedPropertyIds.length} propert${(data.affectedCount ?? selectedPropertyIds.length) === 1 ? 'y' : 'ies'}.`);
      setSelectedPropertyIds([]);
      notifyPublicCatalogChanged();
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Bulk operation failed.');
    } finally {
      setBulkBusy(false);
    }
  };

  // Open Complete All-Fields Property Editor (Create Mode)
  const openCreatePropertyEditor = () => {
    setIsCreatingProperty(true);
    setEditorSection('core');
    setNewImageUrl('');
    setReplacingImageIdx(null);
    setNewHighlightInput('');
    setNewAmenityInput('');
    setEditorProperty({
      title: '',
      tagline: '',
      category: 'Residential',
      type: 'Plot',
      purpose: 'sale',
      price: 0,
      priceDisplay: '',
      pricingUnit: 'total',
      ratePerSqFt: '',
      ratePerGajOrNali: '',
      city: 'Rishikesh',
      district: 'Dehradun',
      region: 'Garhwal',
      location: '',
      address: '',
      altitudeMsl: '',
      coordinates: { lat: 30.0869, lng: 78.2676 },
      distanceFromAirport: '',
      distanceFromRailway: '',
      areaSqFt: 0,
      areaValue: 0,
      areaUnit: 'gaj',
      areaDisplay: '',
      landMeasureInNali: 0,
      configuration: 'Residential Plot',
      bedrooms: 0,
      bathrooms: 0,
      balconies: 0,
      furnishing: 'Unfurnished',
      facing: 'East',
      possession: 'Immediate Registry',
      reraStatus: '143 Converted Clear Title',
      reraId: '',
      roadAccess: '20 ft Motorable Road',
      bhooKanoonStatus: 'Municipal / MDDA Freehold',
      waterSource: 'Jal Sansthan (Govt Tap Water)',
      legalStatus: 'Clear Freehold Title',
      himalayanPeakView: false,
      peakName: '',
      homestaySubsidyEligible: false,
      description: '',
      sellerName: currentUser?.username || '',
      ownerUsername: currentUser?.username || '',
      sellerPhone: '',
      sellerEmail: currentUser?.contact || '',
      ownerContact: currentUser?.contact || '',
      sellerType: 'Owner',
      images: [],
      videoUrl: '',
      amenities: ['Water Supply', 'Electricity Connection'],
      highlights: ['NO PLATFORM FEE'],
      approvalStatus: 'approved',
      isPublished: true,
      isHidden: false,
      featured: false,
      isSold: false,
      isDeleted: false,
    });
  };

  // Open Complete All-Fields Property Editor (Edit ANY Property Mode)
  const openEditPropertyEditor = (prop: AdminPropertyRecord) => {
    setIsCreatingProperty(false);
    setEditorSection('core');
    setNewImageUrl('');
    setReplacingImageIdx(null);
    setNewHighlightInput('');
    setNewAmenityInput('');
    setEditorProperty({
      ...prop,
      sellerName: prop.fullSellerName || prop.sellerName || prop.ownerUsername || '',
      ownerUsername: prop.ownerUsername || prop.fullSellerName || prop.sellerName || '',
      sellerEmail: prop.sellerEmail || prop.ownerContact || '',
      ownerContact: prop.ownerContact || prop.sellerEmail || '',
      images: Array.isArray(prop.images) ? [...prop.images] : [],
      highlights: Array.isArray(prop.highlights) ? [...prop.highlights] : [],
      amenities: Array.isArray(prop.amenities) ? [...prop.amenities] : [],
      approvalStatus: prop.approvalStatus || 'approved',
      isPublished: prop.isPublished !== false,
      isHidden: Boolean(prop.isHidden),
      featured: Boolean(prop.featured),
      isSold: Boolean(prop.isSold),
      isDeleted: Boolean(prop.isDeleted),
    });
  };

  // Image Upload / Replace / Reorder Helpers (20 MB limit + WebP compression)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, replaceAtIndex?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selected = Array.from(files);
    e.target.value = '';
    setErrorMsg(null);

    if (typeof replaceAtIndex === 'number') {
      const file = selected[0];
      if (!file) return;
      const check = validateUploadFile(file, 'image');
      if (!check.valid) {
        setErrorMsg(check.error || 'Invalid image file.');
        return;
      }
      try {
        const compressed = await compressImageToWebpFile(file, 1600, 0.82);
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'admin-photo';
        const uploaded = await uploadFileWithProgress(compressed.blob, `${baseName}.webp`);
        const finalUrl = uploaded.success && uploaded.url ? uploaded.url : compressed.dataUrl;
        setEditorProperty((prev) => {
          if (!prev) return prev;
          const nextImages = [...(prev.images || [])];
          nextImages[replaceAtIndex] = finalUrl;
          return { ...prev, images: nextImages };
        });
        setReplacingImageIdx(null);
        showToast('Image optimized to WebP and updated.');
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to optimize replacement image.');
      }
      return;
    }

    const addedUrls: string[] = [];
    const errors: string[] = [];
    for (const file of selected.slice(0, 12)) {
      const check = validateUploadFile(file, 'image');
      if (!check.valid) {
        errors.push(check.error || `Invalid file: ${file.name}`);
        continue;
      }
      try {
        const compressed = await compressImageToWebpFile(file, 1600, 0.82);
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'admin-photo';
        const uploaded = await uploadFileWithProgress(compressed.blob, `${baseName}.webp`);
        if (uploaded.success && uploaded.url) {
          addedUrls.push(uploaded.url);
        } else if (uploaded.error) {
          errors.push(uploaded.error);
        }
      } catch (err: any) {
        errors.push(err?.message || `Failed to process ${file.name}`);
      }
    }

    if (addedUrls.length > 0) {
      setEditorProperty((prev) => {
        if (!prev) return prev;
        const existing = Array.isArray(prev.images) ? prev.images : [];
        return { ...prev, images: [...existing, ...addedUrls].slice(0, 20) };
      });
      showToast(`Uploaded ${addedUrls.length} optimized WebP photo(s).`);
    }
    if (errors.length > 0) {
      setErrorMsg(errors.join(' '));
    }
  };

  const moveEditorImage = (fromIdx: number, toIdx: number) => {
    setEditorProperty((prev) => {
      if (!prev || !Array.isArray(prev.images)) return prev;
      if (toIdx < 0 || toIdx >= prev.images.length) return prev;
      const arr = [...prev.images];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return { ...prev, images: arr };
    });
  };

  const setEditorCoverImage = (idx: number) => {
    if (idx <= 0) return;
    moveEditorImage(idx, 0);
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

      const res = await adminFetch(url, { method,
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save property.');
      }

      setEditorProperty(null);
      showToast(isCreatingProperty ? 'New property published!' : `Saved all changes to "${title}"!`);
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
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(editingUser.id)}`, { method: 'PUT',
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
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(target.id)}`, { method: 'PUT',
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
      const res = await adminFetch(`/api/admin/users/${encodeURIComponent(target.id)}`, { method: 'DELETE',
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
      const res = await adminFetch(`/api/admin/reports/${encodeURIComponent(reportId)}`, { method: 'PATCH',
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
      const res = await adminFetch(`/api/admin/reports/${encodeURIComponent(reportId)}`, { method: 'DELETE',
      });
      if (res.ok) {
        showToast('Report record deleted.');
        await loadAdminOverview(true);
      }
    } catch {}
  };

  // Admin Requirement Management Actions (Approve, Reject, Edit, Fulfill, Renew, Delete)
  const handleAdminReqStatus = async (
    reqId: string,
    patch: { approvalStatus?: 'pending' | 'approved' | 'rejected'; isFulfilled?: boolean; renew?: boolean },
    label: string
  ) => {
    try {
      const res = await adminFetch(`/api/requirements/${encodeURIComponent(reqId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update requirement.');
      }
      showToast(label);
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Requirement update failed.');
    }
  };

  const handleAdminSaveReqEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminReq) return;
    try {
      const res = await adminFetch(`/api/requirements/${encodeURIComponent(editingAdminReq.id)}`, {
        method: 'PUT',
        body: JSON.stringify(editingAdminReq),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save requirement changes.');
      }
      setEditingAdminReq(null);
      showToast('Requirement updated by administrator.');
      await loadAdminOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save requirement.');
    }
  };

  const handleAdminDeleteReq = async (reqId: string) => {
    try {
      const res = await adminFetch(`/api/requirements/${encodeURIComponent(reqId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Requirement removed.');
        await loadAdminOverview(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete requirement.');
    }
  };

  // Platform Settings Save
  const handleSaveSettings = async (nextSettings: PlatformSettings) => {
    setSavingSettings(true);
    try {
      const res = await adminFetch('/api/admin/settings', { method: 'PUT',
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

  // Status Counts for the 8 Central Control Panel Tabs
  const statusCounts = useMemo(() => {
    const nonDeleted = properties.filter((p) => !p.isDeleted);
    return {
      all: nonDeleted.length,
      pending: nonDeleted.filter((p) => p.approvalStatus === 'pending').length,
      published: nonDeleted.filter(
        (p) => (p.approvalStatus || 'approved') === 'approved' && p.isPublished !== false && !p.isHidden
      ).length,
      rejected: nonDeleted.filter((p) => p.approvalStatus === 'rejected').length,
      hidden: nonDeleted.filter((p) => p.isHidden || p.isPublished === false).length,
      featured: nonDeleted.filter((p) => p.featured).length,
      sold: nonDeleted.filter((p) => p.isSold).length,
      deleted: properties.filter((p) => p.isDeleted).length,
    };
  }, [properties]);

  // Filtered & Sorted Properties
  const filteredProperties = useMemo(() => {
    const q = propSearch.trim().toLowerCase();
    const now = Date.now();

    return properties
      .filter((p) => {
        const isDeleted = Boolean(p.isDeleted);
        const status = p.approvalStatus || 'approved';
        const isPublished = p.isPublished !== false && !isDeleted;

        if (propStatusView === 'deleted') {
          if (!isDeleted) return false;
        } else {
          if (isDeleted) return false;
          if (propStatusView === 'pending' && status !== 'pending') return false;
          if (propStatusView === 'published' && (status !== 'approved' || !isPublished || p.isHidden)) return false;
          if (propStatusView === 'rejected' && status !== 'rejected') return false;
          if (propStatusView === 'hidden' && !p.isHidden && p.isPublished !== false) return false;
          if (propStatusView === 'featured' && !p.featured) return false;
          if (propStatusView === 'sold' && !p.isSold) return false;
        }

        if (propCategoryFilter !== 'all' && p.category !== propCategoryFilter) return false;

        if (propDateFilter !== 'all') {
          const ts = p.createdAt ? new Date(p.createdAt).getTime() : 0;
          if (!ts || isNaN(ts)) return false;
          if (propDateFilter === 'today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            if (ts < startOfDay.getTime()) return false;
          } else if (propDateFilter === '7d') {
            if (now - ts > 7 * 24 * 60 * 60 * 1000) return false;
          } else if (propDateFilter === '30d') {
            if (now - ts > 30 * 24 * 60 * 60 * 1000) return false;
          } else if (propDateFilter === '90d') {
            if (now - ts > 90 * 24 * 60 * 60 * 1000) return false;
          } else if (propDateFilter === 'custom') {
            if (customDateFrom) {
              const fromTs = new Date(`${customDateFrom}T00:00:00`).getTime();
              if (!isNaN(fromTs) && ts < fromTs) return false;
            }
            if (customDateTo) {
              const toTs = new Date(`${customDateTo}T23:59:59.999`).getTime();
              if (!isNaN(toTs) && ts > toTs) return false;
            }
          }
        }

        if (q) {
          const hay = [
            p.id,
            p.title,
            p.tagline,
            p.city,
            p.district,
            p.location,
            p.address,
            p.type,
            p.category,
            p.fullSellerName,
            p.sellerName,
            p.ownerUsername,
            p.ownerContact,
            p.sellerEmail,
            p.sellerPhone,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (propSortBy === 'newest') {
          return (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0);
        }
        if (propSortBy === 'oldest') {
          return (new Date(a.createdAt || 0).getTime() || 0) - (new Date(b.createdAt || 0).getTime() || 0);
        }
        if (propSortBy === 'price-high') {
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        }
        if (propSortBy === 'price-low') {
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        if (propSortBy === 'most-viewed') {
          return (Number(b.views) || 0) - (Number(a.views) || 0);
        }
        return 0;
      });
  }, [
    properties,
    propSearch,
    propStatusView,
    propCategoryFilter,
    propDateFilter,
    customDateFrom,
    customDateTo,
    propSortBy,
  ]);

  const allFilteredSelected =
    filteredProperties.length > 0 &&
    filteredProperties.every((p) => selectedPropertyIds.includes(p.id));

  const toggleSelectProperty = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredProperties.map((p) => p.id));
      setSelectedPropertyIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const merged = Array.from(new Set([...selectedPropertyIds, ...filteredProperties.map((p) => p.id)]));
      setSelectedPropertyIds(merged);
    }
  };

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

  const filteredAuditLogs = useMemo(() => {
    const q = auditSearch.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter((log) =>
      [log.action, log.adminName, log.adminEmail, log.targetTitle, log.targetId, log.details]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [auditLogs, auditSearch]);

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
      {/* Top Admin Command Header (Safe-Area & Mobile Optimized) */}
      <header
        className="sticky top-0 z-40 bg-[#0E3A2B] text-white border-b border-emerald-800 shadow-lg"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={onBackToMain}
                className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Back</span>
              </button>

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h1 className="text-sm sm:text-lg font-black tracking-tight truncate">
                    <span className="sm:hidden">Admin Control Panel</span>
                    <span className="hidden sm:inline">Uttarakhand Gateways Central Control Panel</span>
                  </h1>
                  <span className="hidden xs:inline-block text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase shrink-0">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-200/85 truncate">
                  {currentUser.username} ({currentUser.contact})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void loadAdminOverview(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                title="Refresh live data"
                aria-label="Refresh live data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={openCreatePropertyEditor}
                className="px-2.5 sm:px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md transition cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add Property</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          {[
            { id: 'properties', label: `Properties Control (${statusCounts.all})`, icon: Building2 },
            { id: 'requirements', label: `Requirements (${requirements.filter((r) => r.approvalStatus === 'pending').length} Pending)`, icon: ClipboardList },
            { id: 'overview', label: 'Marketplace Stats', icon: BarChart3 },
            { id: 'users', label: `Users & Owners (${stats?.registeredUsers ?? users.length})`, icon: Users },
            { id: 'reports', label: `Reports (${stats?.openReports ?? 0} Open)`, icon: Flag },
            { id: 'platform', label: 'Platform & Featured', icon: Settings },
            { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: History },
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
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 space-y-4 sm:space-y-6 overflow-x-hidden">
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
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-bold flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </span>
            <div className="flex items-center gap-2">
              {sessionExpired && (
                <button
                  type="button"
                  onClick={() =>
                    openAuthModal('login', 'Sign in with your administrator account to continue.', () => {
                      void loadAdminOverview(false);
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
                >
                  Sign In Again
                </button>
              )}
              <button type="button" onClick={() => setErrorMsg(null)} className="opacity-80 hover:opacity-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Loading marketplace administration data...
          </div>
        ) : (
          <>
            {/* ================= TAB: CENTRAL PROPERTY CONTROL PANEL ================= */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {/* 8 Status View Tabs */}
                <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
                    {(
                      [
                        { id: 'all', label: `All Properties (${statusCounts.all})` },
                        { id: 'pending', label: `Pending Approvals (${statusCounts.pending})` },
                        { id: 'published', label: `Published (${statusCounts.published})` },
                        { id: 'rejected', label: `Rejected (${statusCounts.rejected})` },
                        { id: 'hidden', label: `Hidden / Unpublished (${statusCounts.hidden})` },
                        { id: 'featured', label: `Featured (${statusCounts.featured})` },
                        { id: 'sold', label: `Sold (${statusCounts.sold})` },
                        { id: 'deleted', label: `Deleted / Archived (${statusCounts.deleted})` },
                      ] as { id: PropertyControlView; label: string }[]
                    ).map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => {
                          setPropStatusView(pill.id);
                          setSelectedPropertyIds([]);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                          propStatusView === pill.id
                            ? 'bg-[#0E3A2B] text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs'
                            : 'bg-slate-100 dark:bg-[#051811] text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  {/* Search, Category, Submission Date & Sort Controls */}
                  <div className="grid grid-cols-2 md:grid-cols-12 gap-2">
                    <div className="relative col-span-2 md:col-span-5">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={propSearch}
                        onChange={(e) => setPropSearch(e.target.value)}
                        placeholder="Search by property name, owner, email, phone, location, city, ID..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051810] text-xs sm:text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <select
                        value={propCategoryFilter}
                        onChange={(e) => setPropCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] text-xs font-bold cursor-pointer"
                        aria-label="Filter by Category"
                      >
                        <option value="all">All Categories</option>
                        {PROPERTY_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <select
                        value={propDateFilter}
                        onChange={(e) => setPropDateFilter(e.target.value as DateRangeFilter)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] text-xs font-bold cursor-pointer"
                        aria-label="Filter by Submission Date"
                      >
                        <option value="all">All Dates</option>
                        <option value="today">Submitted Today</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="custom">Custom Date Range</option>
                      </select>
                    </div>

                    <div className="col-span-2 md:col-span-3">
                      <select
                        value={propSortBy}
                        onChange={(e) => setPropSortBy(e.target.value as PropertySortOption)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] text-xs font-bold cursor-pointer"
                        aria-label="Sort Properties"
                      >
                        <option value="newest">Sort: Newest First</option>
                        <option value="oldest">Sort: Oldest First</option>
                        <option value="price-high">Sort: Highest Price</option>
                        <option value="price-low">Sort: Lowest Price</option>
                        <option value="most-viewed">Sort: Most Viewed</option>
                      </select>
                    </div>
                  </div>

                  {propDateFilter === 'custom' && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <label className="flex items-center gap-1.5 font-bold">
                        <span>From:</span>
                        <input
                          type="date"
                          value={customDateFrom}
                          onChange={(e) => setCustomDateFrom(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 font-bold">
                        <span>To:</span>
                        <input
                          type="date"
                          value={customDateTo}
                          onChange={(e) => setCustomDateTo(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                        />
                      </label>
                    </div>
                  )}

                  {/* Select All & Active Filter Summary Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={toggleSelectAllFiltered}
                      className="inline-flex items-center gap-2 font-bold text-slate-700 dark:text-emerald-200 hover:text-emerald-700 cursor-pointer"
                    >
                      {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Select All Shown ({filteredProperties.length})</span>
                    </button>

                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span>
                        Showing <strong className="text-slate-900 dark:text-white">{filteredProperties.length}</strong> listing(s)
                      </span>
                      {(propSearch || propCategoryFilter !== 'all' || propDateFilter !== 'all' || propStatusView !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setPropSearch('');
                            setPropCategoryFilter('all');
                            setPropDateFilter('all');
                            setCustomDateFrom('');
                            setCustomDateTo('');
                            setPropStatusView('all');
                            setPropSortBy('newest');
                          }}
                          className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bulk Actions Toolbar */}
                {selectedPropertyIds.length > 0 && (
                  <div className="sticky top-[106px] z-30 p-3.5 rounded-2xl bg-[#0E3A2B] text-white border border-amber-400/60 shadow-xl flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-black">
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950">
                        {selectedPropertyIds.length} Selected
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPropertyIds([])}
                        className="text-emerald-200 hover:text-white underline font-semibold cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {propStatusView !== 'deleted' ? (
                        <>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('approve', 'Bulk Approve')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() =>
                              setPendingBulkConfirm({ action: 'reject', label: 'Reject Selected Properties', destructive: true })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('publish', 'Bulk Publish')}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Publish
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('unpublish', 'Bulk Unpublish')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer"
                          >
                            Unpublish
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('hide', 'Bulk Hide')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer"
                          >
                            Hide
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('unhide', 'Bulk Unhide')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Unhide
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('feature', 'Bulk Feature')}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
                          >
                            ★ Feature
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('unfeature', 'Bulk Unfeature')}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-200 text-xs font-bold cursor-pointer"
                          >
                            Unfeature
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('mark_sold', 'Bulk Mark Sold')}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Mark Sold
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('mark_available', 'Bulk Mark Available')}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Mark Available
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() =>
                              setPendingBulkConfirm({
                                action: 'delete',
                                label: 'Archive / Soft-Delete Selected Properties',
                                destructive: true,
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Delete (Archive)
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => void executeBulkAction('restore', 'Bulk Restore')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer"
                          >
                            Restore Selected
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() =>
                              setPendingBulkConfirm({
                                action: 'permanent_delete',
                                label: 'Permanently Purge Selected Properties',
                                destructive: true,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Permanent Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Properties List */}
                {filteredProperties.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 text-sm text-slate-500">
                    No properties match the selected filter criteria.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProperties.map((prop) => {
                      const status = prop.approvalStatus || 'approved';
                      const isDeleted = Boolean(prop.isDeleted);
                      const isPublished = prop.isPublished !== false && !isDeleted;
                      const isSelected = selectedPropertyIds.includes(prop.id);
                      const img =
                        Array.isArray(prop.images) && prop.images[0]
                          ? prop.images[0]
                          : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80';
                      const createdDate = formatDateTimeShort(prop.createdAt);
                      const updatedDate = formatDateTimeShort(prop.updatedAt || prop.createdAt);

                      return (
                        <div
                          key={prop.id}
                          className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#082218] border shadow-xs flex flex-col lg:flex-row gap-3.5 sm:gap-4 justify-between transition ${
                            isSelected
                              ? 'border-amber-400 ring-2 ring-amber-400/30'
                              : isDeleted
                                ? 'border-rose-300/70 dark:border-rose-900/60 opacity-90'
                                : 'border-emerald-200/80 dark:border-emerald-800/80'
                          }`}
                        >
                          <div className="space-y-2.5 min-w-0 flex-1">
                            {/* Top Row: Checkbox + Thumbnail + Title/Price/Location */}
                            <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
                              <button
                                type="button"
                                onClick={() => toggleSelectProperty(prop.id)}
                                className="mt-1 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                                aria-label={`Select ${prop.title}`}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                              </button>

                              <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-emerald-800">
                                <img src={img} alt={prop.title} className="w-full h-full object-cover" />
                                {Array.isArray(prop.images) && prop.images.length > 1 && (
                                  <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/75 text-white text-[8.5px] font-bold">
                                    {prop.images.length}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white line-clamp-2 sm:truncate leading-snug">
                                    {prop.title}{' '}
                                    <span className="text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                      • {prop.priceDisplay}
                                    </span>
                                  </h3>
                                  <span
                                    className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-bold flex items-center gap-1 tabular-nums shrink-0 whitespace-nowrap"
                                    title="100% Real Unique Visitor Views"
                                  >
                                    <Eye className="w-3 h-3" />
                                    {formatPropertyViewsCount(prop.views, false)}
                                  </span>
                                </div>

                                <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className="inline-flex items-center gap-1 min-w-0">
                                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span className="truncate">{[prop.location, prop.district, prop.city].filter(Boolean).join(', ')}</span>
                                  </span>
                                  <span>•</span>
                                  <span className="font-medium">
                                    {prop.type} ({prop.category}) • {prop.areaDisplay || `${prop.areaSqFt || 0} Sq.Ft`}
                                    {prop.bedrooms ? ` • ${prop.bedrooms} BHK` : ''}
                                    {prop.facing ? ` • ${prop.facing} Facing` : ''}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Full-Width Status Badges & Timestamps */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-emerald-900/50">
                              {isDeleted ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white">
                                  Deleted / Archived
                                </span>
                              ) : (
                                <>
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

                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      isPublished && !prop.isHidden
                                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    {isPublished && !prop.isHidden ? 'Published' : 'Unpublished'}
                                  </span>
                                </>
                              )}

                              {prop.isHidden && !isDeleted && (
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
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-600 text-white">
                                  Sold
                                </span>
                              )}

                              <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-auto">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>{createdDate}</span>
                              </span>
                            </div>

                            {/* Full-Width Unmasked Owner Contact Box */}
                            <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-200/70 dark:border-emerald-900/60 text-[11px] text-slate-700 dark:text-emerald-200 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span>
                                <strong>Owner:</strong> {prop.fullSellerName || prop.sellerName || 'N/A'} ({prop.sellerType || 'Owner'})
                              </span>
                              {prop.sellerPhone && (
                                <a href={`tel:${prop.sellerPhone}`} className="font-mono font-bold text-emerald-700 dark:text-emerald-300 hover:underline">
                                  📞 {prop.sellerPhone}
                                </a>
                              )}
                              {(prop.ownerContact || prop.sellerEmail) && (
                                <span className="text-slate-500 dark:text-slate-400 break-all">
                                  ✉️ {prop.sellerEmail || prop.ownerContact}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Admin Action Controls */}
                          <div className="flex flex-col justify-end gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-emerald-900/50">
                            {isDeleted ? (
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => void handleRestoreProperty(prop)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restore Listing</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditPropertyEditor(prop)}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteProp({ property: prop, permanent: true })}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Permanent Delete</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-wrap gap-1.5">
                                  {status !== 'approved' && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleQuickPropertyPatch(
                                          prop.id,
                                          { approvalStatus: 'approved', isPublished: true, isHidden: false },
                                          `Approved & published "${prop.title}"`
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
                                        { isPublished: !isPublished, ...(isPublished ? {} : { isHidden: false, approvalStatus: 'approved' }) },
                                        isPublished ? `Unpublished "${prop.title}"` : `Published "${prop.title}"`
                                      )
                                    }
                                    className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleQuickPropertyPatch(
                                        prop.id,
                                        { isHidden: !prop.isHidden },
                                        prop.isHidden ? `Restored "${prop.title}" visibility` : `Hid "${prop.title}"`
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

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleQuickPropertyPatch(
                                        prop.id,
                                        { isSold: !prop.isSold },
                                        prop.isSold ? `Marked "${prop.title}" Available` : `Marked "${prop.title}" Sold`
                                      )
                                    }
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer ${
                                      prop.isSold
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                    }`}
                                  >
                                    <Tag className="w-3.5 h-3.5" />
                                    <span>{prop.isSold ? 'Mark Available' : 'Mark Sold'}</span>
                                  </button>
                                </div>

                                <div className="flex flex-wrap gap-1.5 lg:justify-end">
                                  <button
                                    type="button"
                                    onClick={() => openEditPropertyEditor(prop)}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit All Fields</span>
                                  </button>

                                  {onOpenFullEditModal && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenFullEditModal(prop)}
                                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-emerald-950 cursor-pointer"
                                      title="Open Full Wizard Form"
                                    >
                                      Wizard
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
                                    onClick={() => setConfirmDeleteProp({ property: prop, permanent: false })}
                                    className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB: BUYER & TENANT REQUIREMENTS CONTROL ================= */}
            {activeTab === 'requirements' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {(
                      [
                        { id: 'all', label: `All (${requirements.length})` },
                        { id: 'pending', label: `Pending (${requirements.filter((r) => r.approvalStatus === 'pending').length})` },
                        { id: 'approved', label: `Approved (${requirements.filter((r) => r.approvalStatus === 'approved' && !r.isFulfilled).length})` },
                        { id: 'fulfilled', label: `Fulfilled (${requirements.filter((r) => r.isFulfilled).length})` },
                        { id: 'rejected', label: `Rejected (${requirements.filter((r) => r.approvalStatus === 'rejected').length})` },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setReqFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                          reqFilter === f.id
                            ? 'bg-[#0E3A2B] text-white dark:bg-amber-400 dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-[#051811] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {requirements.filter((r) => {
                  if (reqFilter === 'fulfilled') return r.isFulfilled;
                  if (reqFilter === 'pending') return r.approvalStatus === 'pending';
                  if (reqFilter === 'approved') return r.approvalStatus === 'approved' && !r.isFulfilled;
                  if (reqFilter === 'rejected') return r.approvalStatus === 'rejected';
                  return true;
                }).length === 0 ? (
                  <div className="p-10 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 text-center text-xs sm:text-sm text-slate-500">
                    No property requirements in this filter yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requirements
                      .filter((r) => {
                        if (reqFilter === 'fulfilled') return r.isFulfilled;
                        if (reqFilter === 'pending') return r.approvalStatus === 'pending';
                        if (reqFilter === 'approved') return r.approvalStatus === 'approved' && !r.isFulfilled;
                        if (reqFilter === 'rejected') return r.approvalStatus === 'rejected';
                        return true;
                      })
                      .map((reqItem) => (
                        <div
                          key={reqItem.id}
                          className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white">
                                  {reqItem.requirementType} • {reqItem.propertyType}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    reqItem.approvalStatus === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : reqItem.approvalStatus === 'rejected'
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                                >
                                  {reqItem.approvalStatus}
                                </span>
                                {reqItem.isFulfilled && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-600 text-white">
                                    Fulfilled
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-500">
                                  Posted {formatDateTimeShort(reqItem.createdAt)} • Expires {formatDateTimeShort(reqItem.expiresAt)}
                                </span>
                              </div>

                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                                {reqItem.preferredLocation} — ₹{Number(reqItem.minBudget || 0).toLocaleString('en-IN')} to ₹
                                {Number(reqItem.maxBudget || 0).toLocaleString('en-IN')}
                              </h3>

                              <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-3">
                                {reqItem.bedrooms ? <span>Bedrooms: {reqItem.bedrooms} BHK</span> : null}
                                {reqItem.requiredSize ? <span>Size: {reqItem.requiredSize}</span> : null}
                                <span>Responses: {reqItem.responsesCount || 0}</span>
                              </div>

                              {reqItem.description && (
                                <p className="text-xs text-slate-700 dark:text-slate-300 pt-1">{reqItem.description}</p>
                              )}

                              <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-200/70 dark:border-emerald-900/60 text-[11px] flex flex-wrap gap-3">
                                <span>
                                  <strong>User:</strong> {reqItem.userName || 'User'}
                                </span>
                                {reqItem.userEmail && <span className="break-all">✉️ {reqItem.userEmail}</span>}
                                {reqItem.userPhone && <span className="font-mono">📞 {reqItem.userPhone}</span>}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              {reqItem.approvalStatus !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleAdminReqStatus(
                                      reqItem.id,
                                      { approvalStatus: 'approved' },
                                      'Requirement approved & published!'
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {reqItem.approvalStatus !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleAdminReqStatus(
                                      reqItem.id,
                                      { approvalStatus: 'rejected' },
                                      'Requirement rejected.'
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 text-xs font-bold cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setEditingAdminReq({ ...reqItem })}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleAdminReqStatus(
                                    reqItem.id,
                                    { isFulfilled: !reqItem.isFulfilled },
                                    reqItem.isFulfilled ? 'Requirement reopened.' : 'Marked fulfilled.'
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 text-xs font-bold cursor-pointer"
                              >
                                {reqItem.isFulfilled ? 'Reopen' : 'Mark Fulfilled'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleAdminReqStatus(reqItem.id, { renew: true }, 'Extended expiry by 30 days.')
                                }
                                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold cursor-pointer"
                              >
                                Renew 30d
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleAdminDeleteReq(reqItem.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB: OVERVIEW & MARKETPLACE STATISTICS ================= */}
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
                      {stats?.deletedListings ?? 0} archived · {stats?.soldListings ?? 0} sold
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
                        Open Property Control Panel →
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-emerald-900/50">
                      {[...properties]
                        .filter((p) => !p.isDeleted)
                        .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
                        .slice(0, 6)
                        .map((p) => (
                          <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {p.title}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {p.city} • Owner:{' '}
                                <strong className="text-slate-700 dark:text-slate-200">
                                  {p.fullSellerName || p.sellerName}
                                </strong>
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

            {/* ================= TAB: USERS & PROPERTY OWNERS ================= */}
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
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                                <span className="flex items-center gap-1 break-all">
                                  <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                                  {u.contact}
                                </span>
                                {u.phone && (
                                  <span className="flex items-center gap-1 font-mono">
                                    <Phone className="w-3 h-3 text-emerald-600" />
                                    {u.phone}
                                  </span>
                                )}
                                <span className="text-slate-400">Joined: {formatDateTimeShort(u.createdAt)}</span>
                              </div>

                              {u.isSuspended && u.suspendedReason && (
                                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                                  Suspension Reason: {u.suspendedReason}
                                </p>
                              )}
                              {u.notes && <p className="text-xs text-slate-500 italic">Admin Note: {u.notes}</p>}
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
                                            className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold cursor-pointer"
                                          >
                                            Edit All Fields
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

            {/* ================= TAB: REPORTED PROPERTIES & MODERATION ================= */}
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
                                Listing Archived / Removed
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
                                    'Archived reported listing & resolved report.'
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5" />
                                <span>Archive Listing</span>
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
                                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => void handleDeleteReport(rep.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete Report Record"
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

            {/* ================= TAB: PLATFORM & FEATURED CURATION ================= */}
            {activeTab === 'platform' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-5">
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    <span>Platform Categories & Visibility Controls</span>
                  </h2>

                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Enabled Property Categories
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
                      <span>Homepage Featured Properties ({statusCounts.featured})</span>
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    Toggle properties below to pin or remove them from the Homepage Featured showcase.
                  </p>

                  <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100 dark:divide-emerald-900/50 pr-1">
                    {properties
                      .filter((p) => !p.isDeleted)
                      .map((p) => (
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

            {/* ================= TAB: ADMIN AUDIT TRAIL ================= */}
            {activeTab === 'audit' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-600" />
                      <span>Administrator Audit Trail</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Chronological security log of administrative property edits, status changes, bulk operations, and user actions.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      placeholder="Filter audit logs..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {filteredAuditLogs.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 text-sm text-slate-500">
                    No administrative actions logged yet.
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs divide-y divide-slate-100 dark:divide-emerald-900/50 overflow-hidden">
                    {filteredAuditLogs.map((log) => (
                      <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                              {log.action}
                            </span>
                            {log.targetTitle && (
                              <strong className="text-slate-900 dark:text-white truncate">{log.targetTitle}</strong>
                            )}
                            <span className="text-[11px] text-slate-400 font-mono">({log.targetId})</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                        </div>
                        <div className="text-[11px] text-slate-500 sm:text-right shrink-0">
                          <div className="font-bold text-slate-700 dark:text-emerald-200">
                            {log.adminName} ({log.adminEmail})
                          </div>
                          <div>{new Date(log.createdAt).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ================= MODAL: ADMIN REQUIREMENT EDITOR ================= */}
      {editingAdminReq && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingAdminReq(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#082218] rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#0E3A2B] text-white flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black">Edit User Requirement</h3>
              <button type="button" onClick={() => setEditingAdminReq(null)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdminSaveReqEdit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold block mb-1">Requirement Type</label>
                  <select
                    value={editingAdminReq.requirementType}
                    onChange={(e) =>
                      setEditingAdminReq({ ...editingAdminReq, requirementType: e.target.value as RequirementType })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                  >
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Property Type</label>
                  <select
                    value={editingAdminReq.propertyType}
                    onChange={(e) =>
                      setEditingAdminReq({
                        ...editingAdminReq,
                        propertyType: e.target.value as RequirementPropertyType,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                  >
                    {[
                      'Plot',
                      'Land',
                      'Agricultural Land',
                      'Commercial Plot',
                      'Industrial Land',
                      'House',
                      'Villa',
                      'Flat',
                      'Apartment',
                      'Cottage',
                      'Farmhouse',
                      'Homestay',
                      'Duplex',
                      'Penthouse',
                      'Studio',
                      'PG',
                      'Hostel',
                      'Shop',
                      'Showroom',
                      'Office',
                      'Commercial',
                      'Hotel',
                      'Resort',
                      'Restaurant',
                      'Cafe',
                      'Warehouse',
                      'Other',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Preferred Location</label>
                <input
                  type="text"
                  value={editingAdminReq.preferredLocation}
                  onChange={(e) => setEditingAdminReq({ ...editingAdminReq, preferredLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold block mb-1">Min Budget (₹)</label>
                  <input
                    type="number"
                    value={editingAdminReq.minBudget}
                    onChange={(e) =>
                      setEditingAdminReq({ ...editingAdminReq, minBudget: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Max Budget (₹)</label>
                  <input
                    type="number"
                    value={editingAdminReq.maxBudget}
                    onChange={(e) =>
                      setEditingAdminReq({ ...editingAdminReq, maxBudget: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingAdminReq.description || ''}
                  onChange={(e) => setEditingAdminReq({ ...editingAdminReq, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAdminReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                >
                  Save Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: COMPLETE ALL-FIELDS ADMIN PROPERTY EDITOR ================= */}
      {editorProperty && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
          onClick={() => setEditorProperty(null)}
        >
          <div
            className="w-full max-w-4xl bg-white dark:bg-[#082218] rounded-none sm:rounded-3xl border-0 sm:border border-emerald-300 dark:border-emerald-800 shadow-2xl overflow-hidden h-[100dvh] sm:h-auto sm:max-h-[94vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="px-4 sm:px-6 py-3.5 bg-[#0E3A2B] text-white flex items-center justify-between gap-3 shrink-0"
              style={{ paddingTop: 'max(0.85rem, env(safe-area-inset-top, 0px))' }}
            >
              <div className="min-w-0">
                <h3 className="font-black text-sm sm:text-base flex items-center gap-2 truncate">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {isCreatingProperty
                      ? 'Admin: Create New Property Listing'
                      : `Admin Full Control Editor: ${editorProperty.title || editorProperty.id}`}
                  </span>
                </h3>
                {!isCreatingProperty && (
                  <p className="text-[11px] text-emerald-200/80 truncate">
                    Listing ID: {editorProperty.id} • Submitted by: {editorProperty.sellerName || editorProperty.ownerContact || 'User'}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setEditorProperty(null)}
                className="p-1.5 hover:bg-white/10 rounded-xl cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section Sub-Tabs inside Editor */}
            <div className="px-4 sm:px-6 pt-2.5 bg-emerald-50/70 dark:bg-[#051811] border-b border-emerald-200/80 dark:border-emerald-900 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'core', label: '1. Core & Pricing' },
                  { id: 'location', label: '2. Location & Address' },
                  { id: 'specs', label: '3. Land, Specs & Legal' },
                  { id: 'content', label: '4. Description & Amenities' },
                  { id: 'media', label: `5. Images & Reorder (${editorProperty.images?.length || 0})` },
                  { id: 'owner', label: '6. Owner & Status' },
                ] as { id: EditorSectionTab; label: string }[]
              ).map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setEditorSection(sec.id)}
                  className={`px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 whitespace-nowrap cursor-pointer transition ${
                    editorSection === sec.id
                      ? 'bg-white dark:bg-[#082218] text-[#0E3A2B] dark:text-amber-300 border-emerald-600 dark:border-amber-400'
                      : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-emerald-700'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSavePropertyEditor} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm flex-1">
              {/* SECTION 1: CORE & PRICING */}
              {editorSection === 'core' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-bold block mb-1">Property Title / Name *</label>
                    <input
                      type="text"
                      required
                      value={editorProperty.title || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={editorProperty.tagline || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, tagline: e.target.value })}
                      placeholder="e.g. Valley Facing Freehold Plot"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Listing Purpose</label>
                    <select
                      value={editorProperty.purpose || 'sale'}
                      onChange={(e) =>
                        setEditorProperty({ ...editorProperty, purpose: e.target.value as 'sale' | 'rent' })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    >
                      <option value="sale">For Sale (Outright)</option>
                      <option value="rent">For Rent / Lease</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Category</label>
                    <select
                      value={editorProperty.category || 'Residential'}
                      onChange={(e) =>
                        setEditorProperty({ ...editorProperty, category: e.target.value as PropertyCategory })
                      }
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
                    <label className="font-bold block mb-1">Pricing Unit</label>
                    <input
                      type="text"
                      value={editorProperty.pricingUnit || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, pricingUnit: e.target.value })}
                      placeholder="total / monthly_rent / per_gaj"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Rate per Sq.Ft</label>
                    <input
                      type="text"
                      value={editorProperty.ratePerSqFt || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, ratePerSqFt: e.target.value })}
                      placeholder="e.g. ₹4,500 / sq.ft"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Rate per Gaj / Nali</label>
                    <input
                      type="text"
                      value={editorProperty.ratePerGajOrNali || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, ratePerGajOrNali: e.target.value })}
                      placeholder="e.g. ₹35,000 / Gaj"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Available From</label>
                    <input
                      type="text"
                      value={editorProperty.availableFrom || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, availableFrom: e.target.value })}
                      placeholder="Immediate / Ready"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  {(editorProperty.purpose === 'rent' || editorProperty.type === 'Rent/Lease') && (
                    <>
                      <div>
                        <label className="font-bold block mb-1">Monthly Rent (INR)</label>
                        <input
                          type="number"
                          min={0}
                          value={editorProperty.monthlyRent ?? editorProperty.price ?? 0}
                          onChange={(e) =>
                            setEditorProperty({ ...editorProperty, monthlyRent: Number(e.target.value) || 0 })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Security Deposit</label>
                        <input
                          type="text"
                          value={editorProperty.securityDeposit ?? ''}
                          onChange={(e) => setEditorProperty({ ...editorProperty, securityDeposit: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Maintenance Charges</label>
                        <input
                          type="text"
                          value={editorProperty.maintenanceCharges ?? ''}
                          onChange={(e) => setEditorProperty({ ...editorProperty, maintenanceCharges: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SECTION 2: LOCATION, CITY, DISTRICT & ADDRESS */}
              {editorSection === 'location' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold block mb-1">City / Town</label>
                    <select
                      value={editorProperty.city || 'Dehradun'}
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
                    <label className="font-bold block mb-1">District</label>
                    <input
                      type="text"
                      value={editorProperty.district || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, district: e.target.value })}
                      placeholder="e.g. Dehradun / Nainital / Tehri Garhwal"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Region</label>
                    <select
                      value={editorProperty.region || 'Garhwal'}
                      onChange={(e) => setEditorProperty({ ...editorProperty, region: e.target.value as Region })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    >
                      <option value="Garhwal">Garhwal</option>
                      <option value="Kumaon">Kumaon</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold block mb-1">Locality / Area / Micro-Market</label>
                    <input
                      type="text"
                      value={editorProperty.location || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, location: e.target.value })}
                      placeholder="e.g. Rajpur Road / Tapovan / Near AIIMS Rishikesh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Altitude (MSL)</label>
                    <input
                      type="text"
                      value={editorProperty.altitudeMsl || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, altitudeMsl: e.target.value })}
                      placeholder="e.g. 6,500 ft MSL"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="font-bold block mb-1">Full Street Address / Landmark Details</label>
                    <input
                      type="text"
                      value={editorProperty.address || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, address: e.target.value })}
                      placeholder="Full address, plot/khasra reference, or landmark..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editorProperty.coordinates?.lat ?? ''}
                      onChange={(e) =>
                        setEditorProperty({
                          ...editorProperty,
                          coordinates: {
                            lat: Number(e.target.value) || 0,
                            lng: Number(editorProperty.coordinates?.lng) || 0,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editorProperty.coordinates?.lng ?? ''}
                      onChange={(e) =>
                        setEditorProperty({
                          ...editorProperty,
                          coordinates: {
                            lat: Number(editorProperty.coordinates?.lat) || 0,
                            lng: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Distance from Airport</label>
                    <input
                      type="text"
                      value={editorProperty.distanceFromAirport || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, distanceFromAirport: e.target.value })}
                      placeholder="e.g. 18 km from Jolly Grant"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Distance from Railway Station</label>
                    <input
                      type="text"
                      value={editorProperty.distanceFromRailway || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, distanceFromRailway: e.target.value })}
                      placeholder="e.g. 5 km from Yog Nagari Rishikesh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: LAND AREA, PLOT SIZE, BEDROOMS, BATHROOMS & LEGAL SPECS */}
              {editorSection === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold block mb-1">Area / Plot Size Value</label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={editorProperty.areaValue ?? ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, areaValue: Number(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Area Unit</label>
                    <select
                      value={editorProperty.areaUnit || 'gaj'}
                      onChange={(e) => setEditorProperty({ ...editorProperty, areaUnit: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    >
                      {AREA_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Area Display Label</label>
                    <input
                      type="text"
                      value={editorProperty.areaDisplay || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, areaDisplay: e.target.value })}
                      placeholder="e.g. 200 Gaj / 1.5 Nali"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Total Area (Sq.Ft)</label>
                    <input
                      type="number"
                      min={0}
                      value={editorProperty.areaSqFt ?? 0}
                      onChange={(e) => setEditorProperty({ ...editorProperty, areaSqFt: Number(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Land Measure in Nali</label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={editorProperty.landMeasureInNali ?? ''}
                      onChange={(e) =>
                        setEditorProperty({ ...editorProperty, landMeasureInNali: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Configuration Summary</label>
                    <input
                      type="text"
                      value={editorProperty.configuration || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, configuration: e.target.value })}
                      placeholder="e.g. 3 BHK Villa / Residential Plot"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Bedrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={editorProperty.bedrooms ?? 0}
                      onChange={(e) => setEditorProperty({ ...editorProperty, bedrooms: Number(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Bathrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={editorProperty.bathrooms ?? 0}
                      onChange={(e) => setEditorProperty({ ...editorProperty, bathrooms: Number(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Balconies</label>
                    <input
                      type="number"
                      min={0}
                      value={editorProperty.balconies ?? 0}
                      onChange={(e) => setEditorProperty({ ...editorProperty, balconies: Number(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Furnishing</label>
                    <select
                      value={editorProperty.furnishing || 'Unfurnished'}
                      onChange={(e) =>
                        setEditorProperty({
                          ...editorProperty,
                          furnishing: e.target.value as 'Furnished' | 'Semi-Furnished' | 'Unfurnished',
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    >
                      <option value="Unfurnished">Unfurnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Furnished">Furnished</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Facing Direction</label>
                    <select
                      value={editorProperty.facing || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, facing: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    >
                      <option value="">Select Facing (Optional)</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="North-East">North-East</option>
                      <option value="North-West">North-West</option>
                      <option value="South-East">South-East</option>
                      <option value="South-West">South-West</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Possession Status</label>
                    <input
                      type="text"
                      value={editorProperty.possession || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, possession: e.target.value })}
                      placeholder="Ready to Move / Immediate Registry"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">RERA / Approval Status</label>
                    <input
                      type="text"
                      value={editorProperty.reraStatus || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, reraStatus: e.target.value })}
                      placeholder="RERA Approved / 143 Converted / MDDA"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">RERA Registration ID</label>
                    <input
                      type="text"
                      value={editorProperty.reraId || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, reraId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Road Access</label>
                    <input
                      type="text"
                      value={editorProperty.roadAccess || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, roadAccess: e.target.value })}
                      placeholder="e.g. 30 ft Motorable Road"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Bhoo-Kanoon Eligibility</label>
                    <input
                      type="text"
                      value={editorProperty.bhooKanoonStatus || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, bhooKanoonStatus: e.target.value })}
                      placeholder="Municipal Freehold / Section 143 / Under 250 sq.m"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Water Source</label>
                    <input
                      type="text"
                      value={editorProperty.waterSource || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, waterSource: e.target.value })}
                      placeholder="Jal Sansthan / Boring / Natural Spring"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Legal / Title Status</label>
                    <input
                      type="text"
                      value={editorProperty.legalStatus || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, legalStatus: e.target.value })}
                      placeholder="Clear Freehold Registry & Mutation"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div className="sm:col-span-3 flex flex-wrap items-center gap-5 pt-2">
                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editorProperty.himalayanPeakView)}
                        onChange={(e) => setEditorProperty({ ...editorProperty, himalayanPeakView: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span>Himalayan Peak View</span>
                    </label>

                    {editorProperty.himalayanPeakView && (
                      <input
                        type="text"
                        value={editorProperty.peakName || ''}
                        onChange={(e) => setEditorProperty({ ...editorProperty, peakName: e.target.value })}
                        placeholder="Peak name (e.g. Trishul, Nanda Devi)"
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                      />
                    )}

                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editorProperty.homestaySubsidyEligible)}
                        onChange={(e) =>
                          setEditorProperty({ ...editorProperty, homestaySubsidyEligible: e.target.checked })
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span>Homestay Subsidy Eligible</span>
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION 4: DESCRIPTION, HIGHLIGHTS & AMENITIES */}
              {editorSection === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold block mb-1">Property Description</label>
                    <textarea
                      rows={5}
                      value={editorProperty.description || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, description: e.target.value })}
                      placeholder="Detailed property description..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2">
                    <label className="font-bold block">Key Highlights ({editorProperty.highlights?.length || 0})</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHighlightInput}
                        onChange={(e) => setNewHighlightInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!newHighlightInput.trim()) return;
                            setEditorProperty({
                              ...editorProperty,
                              highlights: [...(editorProperty.highlights || []), newHighlightInput.trim()],
                            });
                            setNewHighlightInput('');
                          }
                        }}
                        placeholder="Add highlight (e.g. Corner Plot, Ganga View)..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newHighlightInput.trim()) return;
                          setEditorProperty({
                            ...editorProperty,
                            highlights: [...(editorProperty.highlights || []), newHighlightInput.trim()],
                          });
                          setNewHighlightInput('');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(editorProperty.highlights || []).map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold"
                        >
                          <span>{h}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditorProperty({
                                ...editorProperty,
                                highlights: (editorProperty.highlights || []).filter((_, idx) => idx !== i),
                              })
                            }
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2">
                    <label className="font-bold block">Amenities ({editorProperty.amenities?.length || 0})</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAmenityInput}
                        onChange={(e) => setNewAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!newAmenityInput.trim()) return;
                            setEditorProperty({
                              ...editorProperty,
                              amenities: [...(editorProperty.amenities || []), newAmenityInput.trim()],
                            });
                            setNewAmenityInput('');
                          }
                        }}
                        placeholder="Add amenity (e.g. Car Parking, Gated Society, Power Backup)..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newAmenityInput.trim()) return;
                          setEditorProperty({
                            ...editorProperty,
                            amenities: [...(editorProperty.amenities || []), newAmenityInput.trim()],
                          });
                          setNewAmenityInput('');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(editorProperty.amenities || []).map((am, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#051811] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-emerald-900 text-xs font-semibold"
                        >
                          <span>{am}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditorProperty({
                                ...editorProperty,
                                amenities: (editorProperty.amenities || []).filter((_, idx) => idx !== i),
                              })
                            }
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: PROPERTY IMAGES (ADD, REMOVE, REORDER, REPLACE) & VIDEO */}
              {editorSection === 'media' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Property Images ({editorProperty.images?.length || 0}) — Add, Reorder, Replace or Remove</span>
                    </label>
                    <span className="text-[11px] text-slate-500">First image (#1) is displayed as the main cover photo.</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Paste image https:// URL..."
                      className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
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
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                    >
                      + Add URL
                    </button>
                    <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photos</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageFileUpload} className="hidden" />
                    </label>
                  </div>

                  {Array.isArray(editorProperty.images) && editorProperty.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                      {editorProperty.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl overflow-hidden border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] flex flex-col"
                        >
                          <div className="relative h-36 bg-slate-200 dark:bg-slate-900">
                            <img src={imgUrl} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-black">
                              {idx === 0 ? '★ Cover (#1)' : `#${idx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditorProperty({
                                  ...editorProperty,
                                  images: (editorProperty.images || []).filter((_, i) => i !== idx),
                                })
                              }
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Reorder & Replace Controls */}
                          <div className="p-2 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveEditorImage(idx, idx - 1)}
                                className="p-1.5 rounded-lg bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 disabled:opacity-35 cursor-pointer"
                                title="Move Left"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (editorProperty.images?.length || 1) - 1}
                                onClick={() => moveEditorImage(idx, idx + 1)}
                                className="p-1.5 rounded-lg bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 disabled:opacity-35 cursor-pointer"
                                title="Move Right"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setEditorCoverImage(idx)}
                                  className="px-2 py-1 rounded-lg bg-amber-400 text-slate-950 font-black cursor-pointer"
                                >
                                  Set Cover
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplacingImageIdx(replacingImageIdx === idx ? null : idx);
                                  setReplaceImageUrlValue(imgUrl.startsWith('data:') ? '' : imgUrl);
                                }}
                                className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold cursor-pointer"
                              >
                                Replace
                              </button>
                              <label className="px-2 py-1 rounded-lg bg-slate-700 text-white font-bold cursor-pointer">
                                File
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(ev) => handleImageFileUpload(ev, idx)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>

                          {replacingImageIdx === idx && (
                            <div className="px-2 pb-2 flex gap-1">
                              <input
                                type="url"
                                value={replaceImageUrlValue}
                                onChange={(e) => setReplaceImageUrlValue(e.target.value)}
                                placeholder="New https:// image URL..."
                                className="flex-1 px-2 py-1 rounded-lg border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#082218] text-[11px]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!replaceImageUrlValue.trim()) return;
                                  const nextImgs = [...(editorProperty.images || [])];
                                  nextImgs[idx] = replaceImageUrlValue.trim();
                                  setEditorProperty({ ...editorProperty, images: nextImgs });
                                  setReplacingImageIdx(null);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-emerald-800 text-center text-xs text-slate-500">
                      No images uploaded yet. Add an image URL or upload photos above.
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 dark:border-emerald-900">
                    <label className="font-bold block mb-1">Property Video URL (Optional)</label>
                    <input
                      type="text"
                      value={editorProperty.videoUrl || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, videoUrl: e.target.value })}
                      placeholder="https://... or /uploads/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 6: OWNER DETAILS & PUBLISHING STATUS */}
              {editorSection === 'owner' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold block mb-1">Owner / Lister Full Name</label>
                    <input
                      type="text"
                      value={editorProperty.sellerName || ''}
                      onChange={(e) =>
                        setEditorProperty({
                          ...editorProperty,
                          sellerName: e.target.value,
                          ownerUsername: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Lister Role</label>
                    <select
                      value={editorProperty.sellerType || 'Owner'}
                      onChange={(e) =>
                        setEditorProperty({ ...editorProperty, sellerType: e.target.value as 'Owner' | 'Broker' })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Broker">Broker / Dealer</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Owner Phone / WhatsApp Number</label>
                    <input
                      type="text"
                      value={editorProperty.sellerPhone || ''}
                      onChange={(e) => setEditorProperty({ ...editorProperty, sellerPhone: e.target.value })}
                      placeholder="Enter mobile number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Owner Email / Account Contact</label>
                    <input
                      type="email"
                      value={editorProperty.sellerEmail || editorProperty.ownerContact || ''}
                      onChange={(e) =>
                        setEditorProperty({
                          ...editorProperty,
                          sellerEmail: e.target.value,
                          ownerContact: e.target.value,
                        })
                      }
                      placeholder="owner@example.com"
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

                  <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <label className="p-3 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900 flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editorProperty.isPublished !== false}
                        onChange={(e) => setEditorProperty({ ...editorProperty, isPublished: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span>Published</span>
                    </label>

                    <label className="p-3 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900 flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editorProperty.isHidden)}
                        onChange={(e) => setEditorProperty({ ...editorProperty, isHidden: e.target.checked })}
                        className="w-4 h-4 accent-slate-600"
                      />
                      <span>Hidden</span>
                    </label>

                    <label className="p-3 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900 flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editorProperty.featured)}
                        onChange={(e) => setEditorProperty({ ...editorProperty, featured: e.target.checked })}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <span>Featured</span>
                    </label>

                    <label className="p-3 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900 flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editorProperty.isSold)}
                        onChange={(e) => setEditorProperty({ ...editorProperty, isSold: e.target.checked })}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span>Sold / Unavailable</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div
                className="pt-3.5 border-t border-slate-200 dark:border-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
              >
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  Changes take effect immediately across all public pages upon saving.
                </div>
                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
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
                    <span>{savingProperty ? 'Saving...' : isCreatingProperty ? 'Publish Property' : 'Save All Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM BULK ACTION ================= */}
      {pendingBulkConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPendingBulkConfirm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#082218] rounded-3xl p-6 border border-rose-300 dark:border-rose-900 shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">{pendingBulkConfirm.label}?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apply this action to <strong>{selectedPropertyIds.length}</strong> selected property listing(s)?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingBulkConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void executeBulkAction(pendingBulkConfirm.action, pendingBulkConfirm.label)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
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

      {/* ================= MODAL: CONFIRM ARCHIVE / PERMANENT DELETE PROPERTY ================= */}
      {confirmDeleteProp && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteProp(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#082218] rounded-3xl p-6 border border-rose-300 dark:border-rose-900 shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900 dark:text-white">
              {confirmDeleteProp.permanent ? 'Permanently Purge Listing?' : 'Delete / Archive Property Listing?'}
            </h3>
            <p className="text-xs text-center text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmDeleteProp.permanent ? (
                <>
                  Permanently delete <strong>"{confirmDeleteProp.property.title}"</strong> from the database? This cannot be undone.
                </>
              ) : (
                <>
                  Archive <strong>"{confirmDeleteProp.property.title}"</strong>? It will be immediately removed from all public pages and can be restored anytime from the <strong>Deleted / Archived</strong> tab.
                </>
              )}
            </p>

            {!confirmDeleteProp.property.isDeleted && (
              <label className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmDeleteProp.permanent}
                  onChange={(e) =>
                    setConfirmDeleteProp({
                      ...confirmDeleteProp,
                      permanent: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-rose-600"
                />
                <span>Delete permanently instead of archiving</span>
              </label>
            )}

            <div className="flex gap-2 pt-1">
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
                {confirmDeleteProp.permanent ? 'Permanently Delete' : 'Archive Listing'}
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
