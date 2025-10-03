import React, { useEffect, useMemo, useState } from 'react';
import Button from './ui/Button';
import { FiCopy, FiDownload, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const DEFAULT_FOREGROUND = '#1f2937';
const DEFAULT_BACKGROUND = '#ffffff';
const DEFAULT_SIZE = 280;
const DEFAULT_MARGIN = 2;
const DEFAULT_EC_LEVEL = 'M';

const STYLE_PRESETS = [
  {
    id: 'classic',
    name: 'Classic',
    light: '#ffffff',
    dark: '#1f2937',
  },
  {
    id: 'royal',
    name: 'Royal',
    light: '#eef2ff',
    dark: '#312e81',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    light: '#fef3c7',
    dark: '#b45309',
  },
  {
    id: 'fresh',
    name: 'Fresh Mint',
    light: '#ecfdf5',
    dark: '#047857',
  },
];

const QRCodeModal = ({ isOpen, table, onClose }) => {
  const [content, setContent] = useState('');
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeDescription, setIncludeDescription] = useState(false);
  const [format, setFormat] = useState('png');
  const [margin, setMargin] = useState(DEFAULT_MARGIN);
  const [errorCorrection, setErrorCorrection] = useState(DEFAULT_EC_LEVEL);
  const [selectedPreset, setSelectedPreset] = useState('classic');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [logoSize, setLogoSize] = useState(80);

  const computedLogoPixelSize = useMemo(() => {
    return Math.max(20, Math.round((logoSize / DEFAULT_SIZE) * size));
  }, [logoSize, size]);

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
    setMargin(DEFAULT_MARGIN);
    setErrorCorrection(DEFAULT_EC_LEVEL);
    setSelectedPreset('classic');
    setLogoDataUrl('');
    setLogoFileName('');
    setLogoSize(80);
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
      margin: String(margin),
      ecLevel: errorCorrection,
    });

    return `https://quickchart.io/qr?${params.toString()}`;
  }, [background, errorCorrection, foreground, format, margin, qrPayload, size]);

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(qrPayload);
      toast.success('QR content copied to clipboard');
    } catch (error) {
      console.error('Failed to copy QR content:', error);
      toast.error('Failed to copy QR content');
    }
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  const handleDownload = async () => {
    if (!qrUrl || !table) return;

    try {
      if (!logoDataUrl) {
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
        return;
      }

      if (format === 'svg') {
        toast.info('Logo overlay is exported as PNG. Switch to PNG to keep high quality.');
      }

      const qrImage = await loadImage(qrUrl);
      const logoImage = await loadImage(logoDataUrl);

      const canvas = document.createElement('canvas');
      canvas.width = qrImage.width;
      canvas.height = qrImage.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(qrImage, 0, 0, canvas.width, canvas.height);

      const finalLogoSize = Math.min(canvas.width * 0.5, computedLogoPixelSize);
      const logoX = (canvas.width - finalLogoSize) / 2;
      const logoY = (canvas.height - finalLogoSize) / 2;
      ctx.drawImage(logoImage, logoX, logoY, finalLogoSize, finalLogoSize);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `table-${table.tableNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded with logo');
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const handlePresetSelect = (presetId) => {
    if (presetId === 'custom') {
      setSelectedPreset('custom');
      return;
    }

    const preset = STYLE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setForeground(preset.dark);
    setBackground(preset.light);
    setSelectedPreset(presetId);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setLogoDataUrl(result);
        setLogoFileName(file.name);
        toast.success('Logo added to QR code');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoDataUrl('');
    setLogoFileName('');
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

      <div className="relative z-10 w-full max-w-4xl">
        <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
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

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6">
                <div className="relative rounded-xl bg-white p-4 shadow-sm">
                  {qrUrl ? (
                    <>
                      <img
                        src={qrUrl}
                        alt={`QR code for table ${table.tableNumber}`}
                        className="h-auto w-full max-w-xs"
                      />
                      {logoDataUrl ? (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <img
                            src={logoDataUrl}
                            alt={logoFileName || 'Logo preview'}
                            className="rounded-lg object-contain"
                            style={{
                              width: `${computedLogoPixelSize}px`,
                              height: `${computedLogoPixelSize}px`,
                            }}
                          />
                        </div>
                      ) : null}
                    </>
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
            <div className="space-y-3">
              <span className="block text-sm font-medium text-gray-700">Design presets</span>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                      selectedPreset === preset.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <span
                      className="flex h-5 w-10 overflow-hidden rounded-full"
                      aria-hidden="true"
                    >
                      <span className="flex-1" style={{ backgroundColor: preset.light }} />
                      <span className="flex-1" style={{ backgroundColor: preset.dark }} />
                    </span>
                    {preset.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('custom')}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    selectedPreset === 'custom'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

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
                  <option value="svg" disabled={Boolean(logoDataUrl)}>
                    SVG {logoDataUrl ? '(disable logo to use)' : ''}
                  </option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Foreground</label>
                <input
                  type="color"
                  value={foreground}
                  onChange={(event) => {
                    setForeground(event.target.value);
                    setSelectedPreset('custom');
                  }}
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-1 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Background</label>
                <input
                  type="color"
                  value={background}
                  onChange={(event) => {
                    setBackground(event.target.value);
                    setSelectedPreset('custom');
                  }}
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-1 shadow-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Margin ({margin}px)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={margin}
                  onChange={(event) => setMargin(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Error correction</label>
                <select
                  value={errorCorrection}
                  onChange={(event) => setErrorCorrection(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Center logo</label>
                <div className="flex items-center gap-2">
                  {logoDataUrl ? (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                    >
                      <FiTrash2 className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:border-blue-300 hover:text-blue-600">
                    <FiUpload className="h-4 w-4" />
                    Upload logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>

              {logoDataUrl ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <img src={logoDataUrl} alt={logoFileName || 'Logo preview'} className="max-h-12 max-w-12 object-contain" />
                  </div>
                  <div className="flex-1 space-y-2 text-sm text-gray-600">
                    <div className="truncate font-medium text-gray-700">{logoFileName || 'logo'}</div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                        Logo size ({logoSize}px)
                      </label>
                      <input
                        type="range"
                        min="40"
                        max="160"
                        step="10"
                        value={logoSize}
                        onChange={(event) => setLogoSize(Number(event.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Add your restaurant logo to brand your QR code. PNG with transparent background works best.
                </p>
              )}
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
    </div>
  );
};

export default QRCodeModal;
