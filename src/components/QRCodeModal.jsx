import React, { useEffect, useMemo, useState } from 'react';
import Button from './ui/Button';
import { FiCopy, FiDownload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const DEFAULT_FOREGROUND = '#1f2937';
const DEFAULT_BACKGROUND = '#ffffff';
const DEFAULT_SIZE = 280;

const QRCodeModal = ({ isOpen, table, onClose }) => {
  const [content, setContent] = useState('');
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeDescription, setIncludeDescription] = useState(false);
  const [format, setFormat] = useState('png');

  useEffect(() => {
    if (!isOpen || !table) {
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const basePath = `/table/${table.id}`;
    setContent(`${origin}${basePath}`);
    setSize(DEFAULT_SIZE);
    setForeground(DEFAULT_FOREGROUND);
    setBackground(DEFAULT_BACKGROUND);
    setIncludeLocation(Boolean(table.location));
    setIncludeDescription(Boolean(table.description));
    setFormat('png');
  }, [isOpen, table]);

  const qrPayload = useMemo(() => {
    if (!table) return content;

    const meta = [
      `Table: ${table.tableNumber}`,
      `Capacity: ${table.capacity}`,
      `Status: ${table.status}`,
    ];

    if (includeLocation && table.location) {
      meta.push(`Location: ${table.location}`);
    }

    if (includeDescription && table.description) {
      meta.push(`Notes: ${table.description}`);
    }

    const sanitizedContent = content.trim();
    const suffix = meta.length ? `\n${meta.join('\n')}` : '';

    return `${sanitizedContent}${suffix}`;
  }, [content, includeDescription, includeLocation, table]);

  const qrUrl = useMemo(() => {
    if (!qrPayload) return '';
    const light = background.replace('#', '').slice(0, 6) || 'ffffff';
    const dark = foreground.replace('#', '').slice(0, 6) || '1f2937';

    const params = new URLSearchParams({
      text: qrPayload,
      size: String(size),
      format,
      light,
      dark,
      margin: '2',
    });

    return `https://quickchart.io/qr?${params.toString()}`;
  }, [background, foreground, format, qrPayload, size]);

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(qrPayload);
      toast.success('QR content copied to clipboard');
    } catch (error) {
      console.error('Failed to copy QR content:', error);
      toast.error('Failed to copy QR content');
    }
  };

  const handleDownload = async () => {
    if (!qrUrl || !table) return;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `table-${table.tableNumber}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded');
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  if (!isOpen || !table) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-0">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Generate QR Code</h2>
            <p className="mt-1 text-sm text-gray-500">
              Create a shareable QR code for `{table.tableNumber}` with custom styling.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="grid gap-8 px-6 py-6 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`QR code for table ${table.tableNumber}`}
                  className="h-auto w-full max-w-xs"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center text-sm text-gray-400">
                  Unable to render QR code
                </div>
              )}
            </div>
            <div className="flex w-full flex-wrap items-center justify-center gap-3">
              <Button onClick={handleDownload} className="inline-flex items-center gap-2">
                <FiDownload className="h-4 w-4" />
                Download
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyContent}
                className="inline-flex items-center gap-2"
              >
                <FiCopy className="h-4 w-4" />
                Copy content
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="qr-content" className="block text-sm font-medium text-gray-700">
                QR content
              </label>
              <textarea
                id="qr-content"
                rows={3}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="https://yourrestaurant.com/table/123"
              />
              <p className="mt-1 text-xs text-gray-500">
                Default value points to this table&apos;s page. You can customize the message or URL.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Size ({size}px)</label>
                <input
                  type="range"
                  min="180"
                  max="480"
                  step="20"
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Format</label>
                <select
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Foreground</label>
                <input
                  type="color"
                  value={foreground}
                  onChange={(event) => setForeground(event.target.value)}
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-1 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Background</label>
                <input
                  type="color"
                  value={background}
                  onChange={(event) => setBackground(event.target.value)}
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-1 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="block text-sm font-medium text-gray-700">Metadata</label>
              <div className="space-y-2 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeLocation}
                    onChange={(event) => setIncludeLocation(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Include location
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeDescription}
                    onChange={(event) => setIncludeDescription(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Include description/notes
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Link generated via quickchart.io. Customize content to match your ordering or check-in flow.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-600 hover:text-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
