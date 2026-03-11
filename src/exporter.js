/**
 * MarkMask — Exporter
 * Handles downloading processed images and copying to clipboard.
 */
import { exportToDataURL, exportToBlob } from './canvas.js';

/**
 * Download the processed image as PNG
 * @param {Function} showToast
 */
export function downloadImage(showToast) {
  try {
    const dataUrl = exportToDataURL('png');
    if (!dataUrl) {
      showToast('导出失败：没有可导出的图片', 'error');
      return;
    }

    const link = document.createElement('a');
    link.download = `MarkMask_${formatTimestamp()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✅ 图片已下载', 'success');
  } catch (err) {
    console.error('Download failed:', err);
    showToast('导出失败，请重试', 'error');
  }
}

/**
 * Copy the processed image to clipboard
 * @param {Function} showToast
 */
export async function copyToClipboard(showToast) {
  try {
    if (!navigator.clipboard?.write) {
      showToast('您的浏览器不支持复制到剪贴板', 'error');
      return;
    }

    exportToBlob(async (blob) => {
      if (!blob) {
        showToast('复制失败', 'error');
        return;
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        showToast('✅ 已复制到剪贴板', 'success');
      } catch (err) {
        console.error('Clipboard write failed:', err);
        showToast('复制失败，请检查浏览器权限', 'error');
      }
    });
  } catch (err) {
    console.error('Copy failed:', err);
    showToast('复制失败，请重试', 'error');
  }
}

function formatTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function pad(n) {
  return n.toString().padStart(2, '0');
}
