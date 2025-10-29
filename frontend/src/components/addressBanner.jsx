// components/AccuracyBanner.jsx
import { useState, useEffect } from 'react';
import { TriangleAlert, MapPin, X } from 'lucide-react';

export default function AccuracyBanner() {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const bannerDismissed = localStorage.getItem('accuracyBannerDismissed');
    if (bannerDismissed === 'true') {
      setShowBanner(false);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('accuracyBannerDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="bg-indigo-50 border-b border-indigo-200 p-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="flex-shrink-0">
                <TriangleAlert size={16} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-indigo-800">
                    <span className="font-semibold">District or representative look wrong?</span> ZIP codes can span multiple districts. Use the{' '}
                    <span className="inline-flex items-center gap-1 font-semibold">
                        <MapPin size={12} className="inline" /> address input
                    </span>{' '}
                    in the header above for better accuracy.
                </p>
            </div>
            <button onClick={handleDismiss}>
                <X size={18} />
            </button>
        </div>
    </div>
  );
}