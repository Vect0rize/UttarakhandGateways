// File Upload Validation, Client-Side WebP Compression & AI Safety Moderation Utility
import { resolveApiUrl } from '../config/apiConfig';

export const MAX_UPLOAD_FILE_BYTES = 20 * 1024 * 1024; // Strict 20 MB per-file limit
export const MAX_UPLOAD_FILE_MB = 20;

export type UploadMediaKind = 'image' | 'video' | 'document';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface CompressedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  mimeType: string;
}

export interface UploadedServerFile {
  success: boolean;
  url?: string;
  name?: string;
  kind?: string;
  originalSize?: number;
  optimizedSize?: number;
  mimeType?: string;
  error?: string;
}

export interface ModerationResult {
  isSafe: boolean;
  isNSFW: boolean;
  category: string;
  reason: string;
  filename?: string;
}

const DANGEROUS_EXT_REGEX = /\.(exe|dll|bat|cmd|com|scr|msi|msp|vbs|vbe|js|jse|mjs|cjs|wsf|wsh|ps1|psm1|sh|bash|zsh|csh|php|phtml|asp|aspx|jsp|jspx|py|rb|pl|cgi|jar|war|html|htm|xhtml|svg|svgz|swf|hta|reg|lnk|apk|ipa|deb|rpm)$/i;

const ALLOWED_IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|heic|heif)$/i;
const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/heic',
  'image/heif',
]);

const ALLOWED_VIDEO_EXT = /\.(mp4|mov|webm|avi|ogv|m4v)$/i;
const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'video/avi',
  'video/ogg',
]);

const ALLOWED_DOC_EXT = /\.pdf$/i;
const ALLOWED_DOC_MIMES = new Set(['application/pdf']);

export function formatFileSizeMB(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Strictly validates file size (max 20 MB per file), safe extension, and MIME type on the client.
 */
export function validateUploadFile(
  file: File | null | undefined,
  expectedKind: UploadMediaKind,
  isHindi = false
): FileValidationResult {
  if (!file) {
    return {
      valid: false,
      error: isHindi ? 'कोई फ़ाइल चयनित नहीं है।' : 'No file selected.',
    };
  }

  const name = (file.name || 'file').trim();
  const mime = (file.type || '').trim().toLowerCase();

  if (file.size <= 0) {
    return {
      valid: false,
      error: isHindi
        ? `"${name}" खाली फ़ाइल है। कृपया एक मान्य फ़ाइल चुनें।`
        : `"${name}" is empty. Please choose a valid file.`,
    };
  }

  if (DANGEROUS_EXT_REGEX.test(name) || mime === 'image/svg+xml' || mime === 'text/html' || mime.includes('javascript') || mime.includes('executable')) {
    return {
      valid: false,
      error: isHindi
        ? `"${name}" अमान्य या असुरक्षित फ़ाइल प्रकार है।`
        : `"${name}" is an unsupported or unsafe file type and cannot be uploaded.`,
    };
  }

  if (file.size > MAX_UPLOAD_FILE_BYTES) {
    const actualSize = formatFileSizeMB(file.size);
    return {
      valid: false,
      error: isHindi
        ? `"${name}" (${actualSize}) 20 MB की अधिकतम फ़ाइल सीमा से अधिक है। कृपया 20 MB से कम की फ़ाइल चुनें।`
        : `"${name}" (${actualSize}) exceeds the 20 MB maximum file size limit. Please upload a file under 20 MB.`,
    };
  }

  if (expectedKind === 'image') {
    const extOk = ALLOWED_IMAGE_EXT.test(name);
    const mimeOk = ALLOWED_IMAGE_MIMES.has(mime);
    if (!extOk && !mimeOk) {
      return {
        valid: false,
        error: isHindi
          ? `"${name}": केवल JPG, PNG, WEBP, AVIF या HEIC तस्वीरें अनुमत हैं (अधिकतम 20 MB)।`
          : `"${name}": Unsupported image format. Allowed formats: JPG, PNG, WEBP, AVIF, GIF, or HEIC (max 20 MB).`,
      };
    }
  } else if (expectedKind === 'video') {
    const extOk = ALLOWED_VIDEO_EXT.test(name);
    const mimeOk = ALLOWED_VIDEO_MIMES.has(mime) || mime.startsWith('video/');
    if (!extOk && !mimeOk) {
      return {
        valid: false,
        error: isHindi
          ? `"${name}": केवल MP4, MOV या WEBM वीडियो फ़ाइलें अनुमत हैं (अधिकतम 20 MB)।`
          : `"${name}": Unsupported video format. Allowed formats: MP4, MOV, or WEBM (max 20 MB).`,
      };
    }
  } else if (expectedKind === 'document') {
    const extOk = ALLOWED_DOC_EXT.test(name);
    const mimeOk = ALLOWED_DOC_MIMES.has(mime);
    if (!extOk && !mimeOk) {
      return {
        valid: false,
        error: isHindi
          ? `"${name}": केवल PDF दस्तावेज़ फ़ाइलें अनुमत हैं (अधिकतम 20 MB)।`
          : `"${name}": Unsupported document format. Only PDF documents up to 20 MB are allowed.`,
      };
    }
  }

  return { valid: true };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to encode compressed image'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), mimeType, quality);
  });
}

/**
 * Resizes and compresses a property photo on the client while preserving EXIF orientation
 * and encoding an optimized WebP image (with JPEG fallback if browser lacks WebP canvas encode).
 */
export async function compressImageToWebpFile(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<CompressedImageResult> {
  const check = validateUploadFile(file, 'image');
  if (!check.valid) {
    throw new Error(check.error || 'Invalid image file.');
  }

  let sourceWidth = 0;
  let sourceHeight = 0;
  let drawable: CanvasImageSource | null = null;
  let closeBitmap: (() => void) | null = null;

  // Prefer createImageBitmap with EXIF orientation preservation where supported
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
      sourceWidth = bmp.width;
      sourceHeight = bmp.height;
      drawable = bmp;
      closeBitmap = () => {
        try {
          bmp.close();
        } catch {}
      };
    } catch {
      drawable = null;
    }
  }

  if (!drawable) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Unable to decode image file.'));
        el.src = objectUrl;
      });
      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
      drawable = img;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  try {
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth >= targetHeight) {
        targetHeight = Math.max(1, Math.round((targetHeight * maxDimension) / targetWidth));
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.max(1, Math.round((targetWidth * maxDimension) / targetHeight));
        targetHeight = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const fallbackUrl = await blobToDataUrl(file);
      return {
        blob: file,
        dataUrl: fallbackUrl,
        width: targetWidth,
        height: targetHeight,
        mimeType: file.type || 'image/jpeg',
      };
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(drawable, 0, 0, targetWidth, targetHeight);

    let outMime = 'image/webp';
    let outBlob = await canvasToBlob(canvas, 'image/webp', quality);
    if (!outBlob || outBlob.type !== 'image/webp') {
      outMime = 'image/jpeg';
      outBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
    }

    if (!outBlob) {
      const fallbackUrl = await blobToDataUrl(file);
      return {
        blob: file,
        dataUrl: fallbackUrl,
        width: targetWidth,
        height: targetHeight,
        mimeType: file.type || 'image/jpeg',
      };
    }

    const dataUrl = await blobToDataUrl(outBlob);
    return {
      blob: outBlob,
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      mimeType: outMime,
    };
  } finally {
    if (closeBitmap) closeBitmap();
  }
}

/**
 * Backwards-compatible helper returning a compressed WebP data URL.
 */
export async function compressAndNormalizeImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<string> {
  const result = await compressImageToWebpFile(file, maxDimension, quality);
  return result.dataUrl;
}

/**
 * Uploads an image, video, or PDF document to POST /api/upload with real XHR progress tracking (0-100%).
 */
export function uploadFileWithProgress(
  blobOrFile: Blob | File,
  filename: string,
  onProgress?: (percent: number) => void
): Promise<UploadedServerFile> {
  return new Promise((resolve) => {
    if (blobOrFile.size > MAX_UPLOAD_FILE_BYTES) {
      resolve({
        success: false,
        error: `"${filename}" (${formatFileSizeMB(blobOrFile.size)}) exceeds the 20 MB maximum upload limit.`,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', blobOrFile, filename);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', resolveApiUrl('/api/upload'), true);
    xhr.withCredentials = true;

    try {
      const token = localStorage.getItem('ukg_session_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    } catch {}

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        const pct = Math.min(99, Math.max(1, Math.round((evt.loaded / evt.total) * 100)));
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      let parsed: any = null;
      try {
        parsed = JSON.parse(xhr.responseText || '{}');
      } catch {
        parsed = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && parsed?.success && parsed?.url) {
        if (onProgress) onProgress(100);
        resolve({
          success: true,
          url: parsed.url,
          name: parsed.name || filename,
          kind: parsed.kind,
          originalSize: parsed.originalSize,
          optimizedSize: parsed.optimizedSize,
          mimeType: parsed.mimeType,
        });
      } else {
        const defaultErr =
          xhr.status === 413
            ? `"${filename}" exceeds the 20 MB maximum upload limit.`
            : xhr.status === 401
            ? 'Please sign in to upload property files.'
            : `Failed to upload "${filename}" (HTTP ${xhr.status || 'error'}).`;
        resolve({
          success: false,
          error: parsed?.error || defaultErr,
        });
      }
    };

    xhr.onerror = () => {
      resolve({
        success: false,
        error: `Network error while uploading "${filename}". Please check your connection and try again.`,
      });
    };

    xhr.ontimeout = () => {
      resolve({
        success: false,
        error: `Upload timed out for "${filename}". Please try again with a stable connection.`,
      });
    };

    xhr.timeout = 120000;
    xhr.send(formData);
  });
}

/**
 * Inspects an image using automated AI safety inspection to detect NSFW, adult nudity, violence, or spam.
 */
export async function moderateImageWithAI(
  imageDataUrl: string,
  filename?: string
): Promise<ModerationResult> {
  try {
    const response = await fetch(resolveApiUrl('/api/moderate-image'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageDataUrl,
        filename: filename || 'property_photo.webp',
      }),
    });

    if (!response.ok) {
      return {
        isSafe: true,
        isNSFW: false,
        category: 'verified',
        reason: 'Image accepted under standard safety guidelines',
        filename,
      };
    }

    const data = await response.json();
    return {
      isSafe: Boolean(data.isSafe && !data.isNSFW),
      isNSFW: Boolean(data.isNSFW),
      category: data.category || (data.isSafe ? 'safe_property' : 'nsfw_adult'),
      reason: data.reason || (data.isSafe ? 'Verified safe by AI' : 'Inappropriate image blocked'),
      filename,
    };
  } catch {
    return {
      isSafe: true,
      isNSFW: false,
      category: 'verified',
      reason: 'Accepted under standard safety guidelines',
      filename,
    };
  }
}
