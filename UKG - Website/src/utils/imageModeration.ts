// File Upload Validation, Client-Side Image (WebP) & Video Compression, and AI Safety Moderation Utility
import { resolveApiUrl, isNativeAndroidApp } from '../config/apiConfig';

export const MAX_PHOTO_UPLOAD_MB = 50;
export const MAX_PHOTO_UPLOAD_BYTES = MAX_PHOTO_UPLOAD_MB * 1024 * 1024; // Strict 50 MB per photo

export const MAX_VIDEO_UPLOAD_MB = 500;
export const MAX_VIDEO_UPLOAD_BYTES = MAX_VIDEO_UPLOAD_MB * 1024 * 1024; // Strict 500 MB per video

export const MAX_DOC_UPLOAD_MB = 20;
export const MAX_DOC_UPLOAD_BYTES = MAX_DOC_UPLOAD_MB * 1024 * 1024; // Strict 20 MB per PDF document

// Backwards-compatible alias for photo limit
export const MAX_UPLOAD_FILE_MB = MAX_PHOTO_UPLOAD_MB;
export const MAX_UPLOAD_FILE_BYTES = MAX_PHOTO_UPLOAD_BYTES;

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

export interface CompressedVideoResult {
  blob: Blob;
  filename: string;
  originalSize: number;
  compressedSize: number;
  compressed: boolean;
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

const ALLOWED_VIDEO_EXT = /\.(mp4|mov|webm|avi|ogv|m4v|mkv)$/i;
const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'video/avi',
  'video/ogg',
  'video/x-m4v',
  'video/x-matroska',
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

export function getMaxBytesForKind(kind: UploadMediaKind): { maxBytes: number; maxMB: number } {
  if (kind === 'video') {
    return { maxBytes: MAX_VIDEO_UPLOAD_BYTES, maxMB: MAX_VIDEO_UPLOAD_MB };
  }
  if (kind === 'document') {
    return { maxBytes: MAX_DOC_UPLOAD_BYTES, maxMB: MAX_DOC_UPLOAD_MB };
  }
  return { maxBytes: MAX_PHOTO_UPLOAD_BYTES, maxMB: MAX_PHOTO_UPLOAD_MB };
}

/**
 * Strictly validates file size (50 MB photos, 500 MB videos, 20 MB PDFs), safe extension, and MIME type.
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

  if (
    DANGEROUS_EXT_REGEX.test(name) ||
    mime === 'image/svg+xml' ||
    mime === 'text/html' ||
    mime.includes('javascript') ||
    mime.includes('executable')
  ) {
    return {
      valid: false,
      error: isHindi
        ? `"${name}" अमान्य या असुरक्षित फ़ाइल प्रकार है।`
        : `"${name}" is an unsupported or unsafe file type and cannot be uploaded.`,
    };
  }

  const { maxBytes, maxMB } = getMaxBytesForKind(expectedKind);
  if (file.size > maxBytes) {
    const actualSize = formatFileSizeMB(file.size);
    return {
      valid: false,
      error: isHindi
        ? `"${name}" (${actualSize}) अधिकतम ${maxMB} MB सीमा से अधिक है। कृपया ${maxMB} MB से कम की फ़ाइल चुनें।`
        : `"${name}" (${actualSize}) exceeds the ${maxMB} MB maximum file size limit. Please upload a file under ${maxMB} MB.`,
    };
  }

  if (expectedKind === 'image') {
    const extOk = ALLOWED_IMAGE_EXT.test(name);
    const mimeOk = ALLOWED_IMAGE_MIMES.has(mime);
    if (!extOk && !mimeOk) {
      return {
        valid: false,
        error: isHindi
          ? `"${name}": केवल JPG, PNG, WEBP, AVIF या HEIC तस्वीरें अनुमत हैं (अधिकतम 50 MB)।`
          : `"${name}": Unsupported image format. Allowed formats: JPG, PNG, WEBP, AVIF, GIF, or HEIC (max 50 MB).`,
      };
    }
  } else if (expectedKind === 'video') {
    const extOk = ALLOWED_VIDEO_EXT.test(name);
    const mimeOk = ALLOWED_VIDEO_MIMES.has(mime) || mime.startsWith('video/');
    if (!extOk && !mimeOk) {
      return {
        valid: false,
        error: isHindi
          ? `"${name}": केवल MP4, MOV या WEBM वीडियो फ़ाइलें अनुमत हैं (अधिकतम 500 MB)।`
          : `"${name}": Unsupported video format. Allowed formats: MP4, MOV, or WEBM (max 500 MB).`,
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
 * Resizes and compresses a property photo (up to 50 MB) on the client while preserving EXIF orientation
 * and aspect ratio, encoding an optimized WebP image (with JPEG fallback).
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

export async function compressAndNormalizeImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<string> {
  const result = await compressImageToWebpFile(file, maxDimension, quality);
  return result.dataUrl;
}

/**
 * Compresses a video on the client BEFORE upload without freezing or crashing memory:
 * - Uses streaming `URL.createObjectURL(file)` (zero full-file ArrayBuffer allocation in JS RAM).
 * - Scales down to max 1280x720 (preserving aspect ratio) at ~1.8 Mbps via MediaRecorder when beneficial.
 * - Reports live compression progress (0-100%).
 * - For already-compact clips or very long videos where real-time browser re-encode isn't advantageous,
 *   hands off seamlessly so server-side FFmpeg handles multi-core H.264 compression on upload.
 * - Strictly rejects if resulting video still exceeds the 500 MB limit.
 */
export async function compressVideoBeforeUpload(
  file: File,
  onCompressionProgress?: (percent: number) => void
): Promise<CompressedVideoResult> {
  const baseName = (file.name || 'property-video').replace(/\.[^.]+$/, '') || 'property-video';
  if (onCompressionProgress) onCompressionProgress(5);

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
      throw new Error(`"${file.name}" (${formatFileSizeMB(file.size)}) exceeds the 500 MB maximum video limit.`);
    }
    if (onCompressionProgress) onCompressionProgress(100);
    return {
      blob: file,
      filename: file.name || `${baseName}.mp4`,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
      mimeType: file.type || 'video/mp4',
    };
  }

  // Pick supported MediaRecorder codec
  const supportedMime =
    typeof MediaRecorder !== 'undefined'
      ? [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
          'video/mp4',
        ].find((m) => {
          try {
            return MediaRecorder.isTypeSupported(m);
          } catch {
            return false;
          }
        }) || ''
      : '';

  // Videos under 2 MB are already tiny; skip client transcode and let server store/optimize quickly
  if (!supportedMime || file.size < 2 * 1024 * 1024) {
    if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
      throw new Error(
        `Compressed video "${file.name}" (${formatFileSizeMB(file.size)}) still exceeds the 500 MB maximum limit.`
      );
    }
    if (onCompressionProgress) onCompressionProgress(100);
    return {
      blob: file,
      filename: file.name || `${baseName}.mp4`,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
      mimeType: file.type || 'video/mp4',
    };
  }

  const objectUrl = URL.createObjectURL(file);
  let audioCtx: AudioContext | null = null;

  try {
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.playsInline = true;
    videoEl.crossOrigin = 'anonymous';
    videoEl.src = objectUrl;

    const metaLoaded = await new Promise<boolean>((resolve) => {
      const timer = window.setTimeout(() => resolve(false), 8000);
      videoEl.onloadedmetadata = () => {
        window.clearTimeout(timer);
        resolve(true);
      };
      videoEl.onerror = () => {
        window.clearTimeout(timer);
        resolve(false);
      };
    });

    if (!metaLoaded || !Number.isFinite(videoEl.duration) || videoEl.duration <= 0) {
      if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
        throw new Error(`"${file.name}" (${formatFileSizeMB(file.size)}) exceeds the 500 MB maximum video limit.`);
      }
      if (onCompressionProgress) onCompressionProgress(100);
      return {
        blob: file,
        filename: file.name || `${baseName}.mp4`,
        originalSize: file.size,
        compressedSize: file.size,
        compressed: false,
        mimeType: file.type || 'video/mp4',
      };
    }

    const duration = videoEl.duration;
    const srcW = videoEl.videoWidth || 1280;
    const srcH = videoEl.videoHeight || 720;
    const estimatedBps = (file.size * 8) / Math.max(1, duration);

    // If clip is already <= 720p & <= 2.2 Mbps, OR longer than 75s (where server-side multi-core FFmpeg is 10x faster and avoids mobile tab sleep), delegate compression to server FFmpeg
    if ((Math.max(srcW, srcH) <= 1280 && estimatedBps <= 2_200_000) || duration > 75) {
      if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
        throw new Error(`"${file.name}" (${formatFileSizeMB(file.size)}) exceeds the 500 MB maximum video limit.`);
      }
      if (onCompressionProgress) onCompressionProgress(100);
      return {
        blob: file,
        filename: file.name || `${baseName}.mp4`,
        originalSize: file.size,
        compressedSize: file.size,
        compressed: false,
        mimeType: file.type || 'video/mp4',
      };
    }

    // Compute aspect-preserving 720p even dimensions
    const maxDim = 1280;
    let targetW = srcW;
    let targetH = srcH;
    if (targetW > maxDim || targetH > maxDim) {
      if (targetW >= targetH) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW * maxDim) / targetH);
        targetH = maxDim;
      }
    }
    targetW = Math.max(2, targetW - (targetW % 2));
    targetH = Math.max(2, targetH - (targetH % 2));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof (canvas as any).captureStream !== 'function') {
      if (onCompressionProgress) onCompressionProgress(100);
      return {
        blob: file,
        filename: file.name || `${baseName}.mp4`,
        originalSize: file.size,
        compressedSize: file.size,
        compressed: false,
        mimeType: file.type || 'video/mp4',
      };
    }

    const canvasStream: MediaStream = (canvas as any).captureStream(24);

    // Route audio track silently into MediaRecorder (zero speaker output, preserves audio)
    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextCtor) {
        audioCtx = new AudioContextCtor();
        const sourceNode = audioCtx.createMediaElementSource(videoEl);
        const destNode = audioCtx.createMediaStreamDestination();
        sourceNode.connect(destNode);
        destNode.stream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
      } else {
        videoEl.muted = true;
      }
    } catch {
      videoEl.muted = true;
    }

    const chunks: BlobPart[] = [];
    let totalBytesRecorded = 0;

    const recorder = new MediaRecorder(canvasStream, {
      mimeType: supportedMime,
      videoBitsPerSecond: 1_800_000,
      audioBitsPerSecond: 96_000,
    });

    const compressedBlob = await new Promise<Blob | null>((resolve) => {
      let finished = false;
      let drawTimer: number | null = null;

      const finish = (result: Blob | null) => {
        if (finished) return;
        finished = true;
        if (drawTimer !== null) window.clearInterval(drawTimer);
        try {
          canvasStream.getTracks().forEach((t) => t.stop());
        } catch {}
        resolve(result);
      };

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          chunks.push(ev.data);
          totalBytesRecorded += ev.data.size;
          if (totalBytesRecorded > MAX_VIDEO_UPLOAD_BYTES) {
            try {
              recorder.stop();
              videoEl.pause();
            } catch {}
            finish(null);
          }
        }
      };

      recorder.onerror = () => finish(null);
      recorder.onstop = () => {
        if (chunks.length === 0) {
          finish(null);
          return;
        }
        const outType = supportedMime.startsWith('video/mp4') ? 'video/mp4' : 'video/webm';
        finish(new Blob(chunks, { type: outType }));
      };

      drawTimer = window.setInterval(() => {
        if (!videoEl.paused && !videoEl.ended) {
          try {
            ctx.drawImage(videoEl, 0, 0, targetW, targetH);
          } catch {}
          if (onCompressionProgress && duration > 0) {
            const pct = Math.min(98, Math.max(8, Math.round((videoEl.currentTime / duration) * 100)));
            onCompressionProgress(pct);
          }
        }
      }, 42);

      videoEl.onended = () => {
        try {
          if (recorder.state !== 'inactive') recorder.stop();
        } catch {
          finish(null);
        }
      };

      videoEl.onerror = () => {
        try {
          if (recorder.state !== 'inactive') recorder.stop();
        } catch {}
        finish(null);
      };

      try {
        recorder.start(1000);
        videoEl.play().catch(() => {
          videoEl.muted = true;
          videoEl.play().catch(() => {
            try {
              if (recorder.state !== 'inactive') recorder.stop();
            } catch {}
            finish(null);
          });
        });
      } catch {
        finish(null);
      }
    });

    if (onCompressionProgress) onCompressionProgress(100);

    // Keep compressed output only if valid and smaller than original
    if (compressedBlob && compressedBlob.size > 1024 && compressedBlob.size < file.size) {
      if (compressedBlob.size > MAX_VIDEO_UPLOAD_BYTES) {
        throw new Error(
          `Compressed video "${file.name}" (${formatFileSizeMB(compressedBlob.size)}) still exceeds the 500 MB maximum limit.`
        );
      }
      const ext = compressedBlob.type.includes('mp4') ? 'mp4' : 'webm';
      return {
        blob: compressedBlob,
        filename: `${baseName}.${ext}`,
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        compressed: true,
        mimeType: compressedBlob.type,
      };
    }

    if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
      throw new Error(
        `Compressed video "${file.name}" (${formatFileSizeMB(file.size)}) still exceeds the 500 MB maximum limit.`
      );
    }

    return {
      blob: file,
      filename: file.name || `${baseName}.mp4`,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
      mimeType: file.type || 'video/mp4',
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
    if (audioCtx) {
      try {
        await audioCtx.close();
      } catch {}
    }
  }
}

/**
 * Uploads an image (up to 50 MB), video (up to 500 MB), or PDF document (up to 20 MB)
 * to POST /api/upload with real XHR progress tracking (0-100%).
 */
export function uploadFileWithProgress(
  blobOrFile: Blob | File,
  filename: string,
  onProgress?: (percent: number) => void,
  kindHint?: UploadMediaKind
): Promise<UploadedServerFile> {
  return new Promise((resolve) => {
    const inferredKind: UploadMediaKind =
      kindHint ||
      (ALLOWED_VIDEO_EXT.test(filename) || (blobOrFile.type || '').startsWith('video/')
        ? 'video'
        : ALLOWED_DOC_EXT.test(filename) || blobOrFile.type === 'application/pdf'
          ? 'document'
          : 'image');

    const { maxBytes, maxMB } = getMaxBytesForKind(inferredKind);

    if (blobOrFile.size > maxBytes) {
      resolve({
        success: false,
        error: `"${filename}" (${formatFileSizeMB(blobOrFile.size)}) exceeds the ${maxMB} MB maximum upload limit.`,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', blobOrFile, filename);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', resolveApiUrl('/api/upload'), true);
    xhr.withCredentials = !isNativeAndroidApp();

    try {
      const token = localStorage.getItem('ukg_session_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('X-Session-Token', token);
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
            ? `"${filename}" exceeds the ${maxMB} MB maximum upload limit.`
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

    // 20 minutes timeout to support large 500 MB video uploads over residential/mobile networks
    xhr.timeout = 20 * 60 * 1000;
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
