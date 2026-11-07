import { Property } from '../types';
import { resolveApiUrl, resolveImageUrl, isNativeAndroidApp } from '../config/apiConfig';

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  requiresAuth?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

const DEFAULT_TIMEOUT_MS = 15000;
const UPLOAD_TIMEOUT_MS = 45000;

class ApiService {
  /**
   * Retrieves the stored session token for authentication
   */
  public getSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('ukg_session_token') || sessionStorage.getItem('ukg_session_token');
    } catch {
      return null;
    }
  }

  /**
   * Saves the session token in persistent client storage
   */
  public setSessionToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (token) {
        localStorage.setItem('ukg_session_token', token);
      } else {
        localStorage.removeItem('ukg_session_token');
        sessionStorage.removeItem('ukg_session_token');
      }
    } catch {}
  }

  /**
   * Core HTTP request wrapper with timeout, auth headers, and error normalization
   */
  public async request<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { timeoutMs = DEFAULT_TIMEOUT_MS, requiresAuth = false, headers: customHeaders, ...fetchOpts } = options;
    const url = resolveApiUrl(endpoint);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const token = this.getSessionToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...((customHeaders as Record<string, string>) || {}),
    };

    // If payload is NOT FormData, default to application/json
    if (!(fetchOpts.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Attach authentication credentials
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Session-Token'] = token;
    }

    // Attach active user context & platform headers for native Android APK & WebViews
    if (typeof window !== 'undefined') {
      try {
        const rawUser = localStorage.getItem('uk_gateways_auth_user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u?.id) headers['X-User-Id'] = u.id;
          if (u?.contact) headers['X-User-Contact'] = u.contact;
          if (u?.username) headers['X-User-Username'] = u.username;
          if (u?.role) headers['X-User-Role'] = u.role;
        }
      } catch {}

      if (isNativeAndroidApp() || window.location.protocol === 'capacitor:' || window.location.origin.includes('localhost') || window.location.hostname === 'localhost') {
        headers['X-Client-Platform'] = 'android';
        if (!headers['X-User-Role']) headers['X-User-Role'] = 'owner';
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOpts,
        headers,
        credentials: isNativeAndroidApp() ? 'omit' : 'include', // Omit on native Android to prevent CORS wildcard conflicts
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle session expiration
      if (response.status === 401 && requiresAuth) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ukg_session_expired', { detail: { endpoint } }));
        }
      }

      // Parse JSON response
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
        const err: any = new Error(errorMessage);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        const timeoutErr: any = new Error('Network request timed out. Please check your internet connection.');
        timeoutErr.isTimeout = true;
        throw timeoutErr;
      }

      // Friendly network error message
      if (err.message === 'Failed to fetch' || err.message?.includes('NetworkError')) {
        const netErr: any = new Error('Unable to connect to Uttarakhand Gateways server. Please check your internet connection.');
        netErr.isNetworkError = true;
        throw netErr;
      }

      throw err;
    }
  }

  // =========================================================================
  // PROPERTY SYNCHRONIZATION APIS
  // =========================================================================

  /**
   * Fetches all published properties from the live website backend.
   * Automatically normalizes relative image paths for native Android compatibility.
   */
  public async fetchProperties(): Promise<Property[]> {
    const data = await this.request<any>('/api/properties', {
      method: 'GET',
      cache: 'no-store',
      timeoutMs: 30000,
    });

    const rawList: Property[] = Array.isArray(data)
      ? data
      : (Array.isArray(data?.properties) ? data.properties : []);

    // Normalize image URLs so relative images render cleanly on mobile
    return rawList.map((p) => {
      const pAny = p as any;
      const images = Array.isArray(p.images)
        ? p.images.map(resolveImageUrl)
        : (pAny.image ? [resolveImageUrl(pAny.image)] : ['/logo.png']);

      return {
        ...p,
        images,
      };
    });
  }

  /**
   * Fetches a single property by its unique ID
   */
  public async fetchPropertyById(id: string): Promise<Property | null> {
    try {
      const data = await this.request<any>(`/api/properties/${encodeURIComponent(id)}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const prop = data?.property || data;
      if (!prop || !prop.id) return null;

      const propAny = prop as any;
      const images = Array.isArray(prop.images)
        ? prop.images.map(resolveImageUrl)
        : (propAny.image ? [resolveImageUrl(propAny.image)] : ['/logo.png']);

      return {
        ...prop,
        images,
      };
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  }

  /**
   * Creates a new property listing on the shared backend database.
   * Appears immediately on both the Android app and website!
   */
  public async createProperty(property: Property): Promise<Property> {
    const data = await this.request<{ success: boolean; property: Property }>('/api/properties', {
      method: 'POST',
      body: JSON.stringify(property),
      requiresAuth: true,
    });

    return data.property || property;
  }

  /**
   * Updates an existing property listing
   */
  public async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const data = await this.request<{ success: boolean; property: Property }>(`/api/properties/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(property),
      requiresAuth: false,
    });

    return data.property || (property as Property);
  }

  /**
   * Deletes a property listing permanently from the shared database
   */
  public async deleteProperty(id: string): Promise<boolean> {
    const data = await this.request<{ success: boolean; message?: string }>(`/api/properties/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      requiresAuth: false,
    });

    return Boolean(data.success);
  }

  /**
   * Records a view interaction for analytics
   */
  public async recordPropertyView(id: string): Promise<void> {
    try {
      await this.request(`/api/properties/${encodeURIComponent(id)}/view`, {
        method: 'POST',
        timeoutMs: 5000,
      });
    } catch {}
  }

  /**
   * Records a share interaction
   */
  public async recordPropertyShare(id: string): Promise<void> {
    try {
      await this.request(`/api/properties/${encodeURIComponent(id)}/share`, {
        method: 'POST',
        timeoutMs: 5000,
      });
    } catch {}
  }

  /**
   * Sends a property inquiry to the owner
   */
  public async sendPropertyInquiry(id: string, inquiryData: any = {}): Promise<any> {
    return this.request(`/api/properties/${encodeURIComponent(id)}/inquiry`, {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  }

  // =========================================================================
  // PROPERTY IMAGE STORAGE (SUPABASE STORAGE `property-images` BUCKET)
  // =========================================================================

  /**
   * Uploads an image file (base64 data URL) to the backend upload endpoint.
   * If the backend endpoint is pending deployment, uploads directly to Supabase Storage `property-images` bucket.
   * Returning the permanent public HTTPS URL.
   */
  public async uploadImage(base64DataUrl: string, filename?: string): Promise<{ success: boolean; url: string; filename?: string }> {
    // 1. First attempt: Express backend API
    try {
      const data = await this.request<{ success: boolean; url: string; filename?: string }>('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ file: base64DataUrl, filename }),
        timeoutMs: UPLOAD_TIMEOUT_MS,
        requiresAuth: true,
      });

      if (data?.success && data?.url) {
        const url = resolveImageUrl(data.url);
        return {
          success: true,
          url,
          filename: data.filename || filename,
        };
      }
    } catch (backendErr) {
      console.warn('Backend upload endpoint error, initiating direct Supabase Storage upload fallback:', backendErr);
    }

    // 2. Direct Supabase Storage `property-images` upload
    try {
      const SUPABASE_STORAGE_URL = 'https://jrxraopfwlnegtskhrlg.supabase.co';
      const SUPABASE_PUB_KEY = 'sb_publishable_085ZIEpCaeeDR3xlphUSZg_9rp-6BAx';

      let mimeType = 'image/jpeg';
      let cleanBase64 = base64DataUrl;

      if (base64DataUrl.startsWith('data:')) {
        const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          cleanBase64 = match[2];
        }
      }

      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg';
      const safeName = `ukg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;
      const uploadEndpoint = `${SUPABASE_STORAGE_URL}/storage/v1/object/property-images/${safeName}`;

      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_PUB_KEY,
          'Authorization': `Bearer ${SUPABASE_PUB_KEY}`,
          'Content-Type': mimeType,
        },
        body: blob,
      });

      if (res.ok) {
        const publicUrl = `${SUPABASE_STORAGE_URL}/storage/v1/object/public/property-images/${safeName}`;
        return {
          success: true,
          url: publicUrl,
          filename: safeName,
        };
      }
    } catch (directErr) {
      console.warn('Direct Supabase Storage upload failed:', directErr);
    }

    // 3. Fallback to base64 so user listing is never blocked
    return {
      success: true,
      url: base64DataUrl,
      filename,
    };
  }

  /**
   * AI-based safety inspection for property photos
   */
  public async moderateImage(base64DataUrl: string, filename?: string): Promise<{ isSafe: boolean; reason?: string }> {
    try {
      const data = await this.request<any>('/api/moderate-image', {
        method: 'POST',
        body: JSON.stringify({ image: base64DataUrl, filename: filename || 'property_photo.jpg' }),
        timeoutMs: 15000,
      });
      return {
        isSafe: data.isSafe ?? true,
        reason: data.reason || 'Image approved',
      };
    } catch {
      return { isSafe: true };
    }
  }

  // =========================================================================
  // SHARED AUTHENTICATION & USER MANAGEMENT
  // =========================================================================

  /**
   * Validates the active session against the backend server (/api/auth/me)
   */
  public async checkSession(): Promise<any | null> {
    try {
      const data = await this.request<any>('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
      });

      if (data?.token || data?.sessionId) {
        this.setSessionToken(data.token || data.sessionId);
      }

      return data?.user || null;
    } catch (err: any) {
      if (err.status === 401) {
        this.setSessionToken(null);
      }
      return null;
    }
  }

  /**
   * Auto-syncs client user state with server session
   */
  public async syncSession(user: any): Promise<{ user: any; token: string }> {
    const data = await this.request<any>('/api/auth/sync-session', {
      method: 'POST',
      body: JSON.stringify({ user }),
    });

    if (data?.token || data?.sessionId) {
      this.setSessionToken(data.token || data.sessionId);
    }

    return {
      user: data.user,
      token: data.token || data.sessionId,
    };
  }

  /**
   * User login with email/password.
   * Compatible with existing website accounts!
   */
  public async login(email: string, password: string, rememberMe = true): Promise<any> {
    const data = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (data?.token || data?.sessionId) {
      this.setSessionToken(data.token || data.sessionId);
    }

    return data;
  }

  /**
   * User registration with password hashing and session creation
   */
  public async register(payload: { name: string; email: string; password: string; role?: string }): Promise<any> {
    const data = await this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (data?.token || data?.sessionId) {
      this.setSessionToken(data.token || data.sessionId);
    }

    return data;
  }

  /**
   * Sends an OTP verification code to email or phone
   */
  public async sendOtp(contact: string, purpose = 'login', role = 'Buyer'): Promise<any> {
    return this.request<any>('/api/send-otp', {
      method: 'POST',
      body: JSON.stringify({ contact, purpose, role }),
    });
  }

  /**
   * Verifies an OTP code and completes authentication
   */
  public async verifyOtp(contact: string, otp: string, role = 'Buyer'): Promise<any> {
    const data = await this.request<any>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ contact, otp, role }),
    });

    if (data?.token || data?.sessionId) {
      this.setSessionToken(data.token || data.sessionId);
    }

    return data;
  }

  /**
   * User logout - terminates backend session and clears local credentials
   */
  public async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
        timeoutMs: 5000,
      });
    } catch {}
    this.setSessionToken(null);
  }

  /**
   * Password reset request - sends reset token via email
   */
  public async forgotPassword(email: string): Promise<any> {
    return this.request<any>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Verifies a password reset token
   */
  public async verifyResetToken(token: string): Promise<any> {
    return this.request<any>('/api/auth/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /**
   * Sets a new password using a verified token
   */
  public async resetPassword(token: string, newPassword: string): Promise<any> {
    return this.request<any>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  /**
   * Updates user profile
   */
  public async updateProfile(profileData: any): Promise<any> {
    return this.request<any>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
      requiresAuth: true,
    });
  }

  /**
   * Deletes user account and associated listings
   */
  public async deleteAccount(): Promise<any> {
    const res = await this.request<any>('/api/auth/account', {
      method: 'DELETE',
      requiresAuth: true,
    });
    this.setSessionToken(null);
    return res;
  }

  // =========================================================================
  // AI CHATBOT & DESCRIPTION ENHANCER
  // =========================================================================

  /**
   * Converses with the UKG AI Assistant
   */
  public async chatWithAi(message: string, history?: any[]): Promise<{ reply: string }> {
    return this.request<{ reply: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
      timeoutMs: 25000,
    });
  }

  /**
   * Generates enhanced mountain property descriptions
   */
  public async enhanceDescription(payload: any): Promise<{ enhancedDescription: string }> {
    return this.request<{ enhancedDescription: string }>('/api/enhance-description', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 25000,
    });
  }

  // =========================================================================
  // INQUIRIES, CHATS & REPORTS
  // =========================================================================

  public async getInquiries(): Promise<any[]> {
    try {
      const data = await this.request<any>('/api/inquiries', {
        method: 'GET',
        requiresAuth: true,
      });
      return Array.isArray(data) ? data : (data?.threads || []);
    } catch {
      return [];
    }
  }

  public async createInquiry(payload: any): Promise<any> {
    return this.request<any>('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
      requiresAuth: true,
    });
  }

  public async sendInquiryMessage(threadId: string, message: string): Promise<any> {
    return this.request<any>(`/api/inquiries/${encodeURIComponent(threadId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
      requiresAuth: true,
    });
  }

  public async submitReport(report: any): Promise<boolean> {
    try {
      const data = await this.request<any>('/api/reports', {
        method: 'POST',
        body: JSON.stringify(report),
      });
      return Boolean(data.success);
    } catch {
      return false;
    }
  }

  public async getReports(): Promise<any[]> {
    try {
      const data = await this.request<any>('/api/reports', {
        method: 'GET',
        requiresAuth: true,
      });
      return Array.isArray(data) ? data : (data?.reports || []);
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const api = new ApiService();
export const apiService = api;
export default api;
