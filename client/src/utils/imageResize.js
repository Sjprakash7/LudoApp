/**
 * Turn an uploaded portrait into a small JPEG data URL suitable for JSON storage.
 */
export function resizeImageFileToDataUrl(
  file,
  { maxDim = 280, quality = 0.82, maxChars = 100000 } = {}
) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith?.('image/')) {
      reject(new Error('Choose an image file (JPG or PNG).'));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      const tw = Math.max(24, Math.round(w * scale));
      const th = Math.max(24, Math.round(h * scale));

      const c = document.createElement('canvas');
      c.width = tw;
      c.height = th;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, tw, th);

      let dataUrl = c.toDataURL('image/jpeg', quality);
      let q = quality;
      while (dataUrl.length > maxChars && q > 0.35) {
        q -= 0.08;
        dataUrl = c.toDataURL('image/jpeg', q);
      }
      if (dataUrl.length > maxChars) {
        reject(new Error('Image still too large after compression — try a smaller photo.'));
        return;
      }
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    img.src = url;
  });
}
