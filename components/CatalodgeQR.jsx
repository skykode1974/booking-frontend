'use client';
import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const CATALODGE_URL = 'https://awrabsuiteshotel.com.ng/catalodge';

export default function CatalodgeQR({
  url = CATALODGE_URL,
  title = 'Scan to Order',
  subtitle = 'Menu Catalodge • Awrab Suites Hotel',
  logoSrc = '/logo.png', // optional: place /public/logo.png
  size = 280,
}) {
  const canvasRef = useRef(null);

  const downloadPNG = () => {
    try {
      const canvas = canvasRef.current?.querySelector('canvas');
      const data = canvas?.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = 'catalodge-qr.png';
      a.href = data;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const shareLink = async () => {
    try {
      await navigator.share({
        title: 'Catalodge — Awrab Suite Hotel',
        text: 'Tap to order from your room.',
        url,
      });
    } catch (_) {}
  };

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm opacity-80 mb-3">{subtitle}</p>

      <div ref={canvasRef} className="inline-block p-3 bg-white rounded-xl shadow">
        <QRCodeCanvas
          value={url}
          size={size}
          level="H"
          includeMargin={true}
          imageSettings={
            logoSrc
              ? { src: logoSrc, height: 40, width: 40, excavate: true }
              : undefined
          }
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={downloadPNG}
          className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          Download PNG
        </button>
        {canShare && (
          <button
            onClick={shareLink}
            className="px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/10 text-sm"
          >
            Share
          </button>
        )}
      </div>

      <p className="text-xs opacity-70 mt-3">
        Point your phone camera at the code, then tap the link that pops up.
      </p>
    </div>
  );
}
