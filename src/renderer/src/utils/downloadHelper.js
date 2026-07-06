export async function downloadByFetching(url, filename) {
  if (!url) return { ok: false, error: 'no-url' };
  // If running inside Electron and preload exposes download API, use it to let main handle the download
  try {
    const api = window?.api?.download;
    if (api && api.start) {
      try {
        const ret = await api.start({ url, filename });
        if (ret && ret.ok) return { ok: true, electron: true };
      } catch (e) {
        console.warn('electron download API failed', e);
      }
    }
  } catch (e) { /* ignore */ }
  try {
    // try fetch first
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch: ${resp.status}`);
    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename || url.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // revoke after short delay
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    return { ok: true };
  } catch (e) {
    console.warn('downloadByFetching failed, trying fallback', e);
    try {
      // fallback: try programmatic anchor (may be ignored for cross-origin)
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || url.split('/').pop() || 'download';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return { ok: true, fallback: true };
    } catch (e2) {
      console.warn('anchor fallback failed, opening new tab', e2);
      try {
        window.open(url, '_blank', 'noopener');
        return { ok: true, opened: true };
      } catch (e3) {
        console.error('all download fallbacks failed', e3);
        return { ok: false, error: String(e3) };
      }
    }
  }
}

export function filenameFromTitle(title, ext = 'mp4') {
  if (!title) return `download.${ext}`;
  const safe = title.replace(/[^a-z0-9\-_\. ]/gi, '_').trim();
  return `${safe}.${ext}`;
}
