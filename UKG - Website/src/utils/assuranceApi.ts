import { resolveApiUrl, isNativeAndroidApp } from '../config/apiConfig';
import type { AssuranceApplicationStatus, RequirementPropertyType } from '../types';

export const ASSURANCE_STATUS_STEPS: AssuranceApplicationStatus[] = [
  'Application Received',
  'Under Document Review',
  'Physical Inspection',
  'Report Preparation',
  'Report Ready',
  'Completed',
];

export const ASSURANCE_PROPERTY_TYPES: RequirementPropertyType[] = [
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
];

export function formatAssuranceRupees(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) {
    return 'Custom Quotation';
  }
  return `₹${Math.round(Number(amount)).toLocaleString('en-IN')}`;
}

export function formatFileSize(bytes: number | undefined): string {
  const b = Number(bytes) || 0;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

export function assuranceFetch(endpoint: string, init: RequestInit = {}): Promise<Response> {
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((init.headers as Record<string, string>) || {}),
  };

  try {
    const token = localStorage.getItem('ukg_session_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Session-Token'] = token;
    }
  } catch {}

  return fetch(resolveApiUrl(endpoint), {
    ...init,
    credentials: isNativeAndroidApp() ? 'omit' : 'include',
    headers,
  });
}

export async function downloadProtectedAssuranceFile(
  fileId: string,
  fallbackFileName: string
): Promise<void> {
  const res = await assuranceFetch(`/api/assurance/files/${encodeURIComponent(fileId)}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    let errMsg = 'Unable to download protected file.';
    try {
      const errJson = await res.json();
      if (errJson?.error) errMsg = errJson.error;
    } catch {}
    throw new Error(errMsg);
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get('Content-Disposition') || '';
  const match = contentDisposition.match(/filename="([^"]+)"/i);
  const downloadName = match?.[1] || fallbackFileName || 'ukg-assurance-document.pdf';

  const blobUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  }
}
