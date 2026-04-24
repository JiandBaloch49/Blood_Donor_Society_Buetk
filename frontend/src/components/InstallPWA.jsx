import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * InstallPWA — shows a sticky install banner when the browser fires
 * the `beforeinstallprompt` event (Chrome/Edge/Android).
 * Dismissed state is persisted in localStorage.
 */
const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Don't show if previously dismissed
    if (localStorage.getItem('pwa_dismissed') === 'true') return;

    const handler = (e) => {
      e.preventDefault(); // Prevent Chrome's mini-infobar
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe animate-in slide-in-from-bottom duration-500">
      <div className="max-w-2xl mx-auto bg-[#800000] text-white rounded-2xl shadow-2xl shadow-black/30 flex items-center gap-4 p-4 pr-3 border border-white/10">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black tracking-tight leading-snug">
            Install Blood Donation App
          </p>
          <p className="text-xs text-white/70 font-medium mt-0.5 leading-snug">
            Faster offline access for emergency coordination
          </p>
        </div>

        {/* Install Button */}
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 bg-white text-[#800000] font-black text-xs px-4 py-2.5 rounded-xl hover:bg-white/90 transition-all active:scale-95 flex-shrink-0 shadow-lg"
        >
          <Download className="w-3.5 h-3.5" />
          Install
        </button>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="p-2 hover:bg-white/10 rounded-xl transition-all flex-shrink-0"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
