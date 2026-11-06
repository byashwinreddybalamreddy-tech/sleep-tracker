import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import {
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  Smartphone,
  X,
  HelpCircle,
  HardDriveDownload,
  Upload,
  Copy,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react';

interface PWAInstallButtonProps {
  onExportBackup?: () => void;
  onImportBackup?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PWAInstallButton({ onExportBackup, onImportBackup }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Backup & Persistence Quick Button */}
        <button
          onClick={() => setShowDataModal(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
          title="Backup and Restore your daily data"
        >
          <HardDriveDownload className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline">Everyday Backup</span>
        </button>

        {/* PWA / APK Install Button */}
        {isInstalled ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Installed</span>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-lg shadow-xs transition-all whitespace-nowrap"
            title="Install SyncStudy as an Android App or Desktop PWA"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Get App / APK</span>
          </button>
        )}
      </div>

      {/* Install & Android APK Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Install SyncStudy on Android & iOS</h3>
                  <p className="text-xs text-slate-500">Run as a standalone app with alarms & full offline support</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Android WebAPK Highlight Card */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant Android APK (No download required)</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                When you open this link in <strong>Chrome on Android</strong> and tap <strong>&quot;Install app&quot;</strong>, Google Play Services automatically generates an official <strong>WebAPK</strong> file and installs it straight into your Android app drawer with native system alarms and notifications!
              </p>
            </div>

            {/* Steps Breakdown */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-700">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                <span>On Android Phone (Chrome)</span>
              </div>
              <p className="pl-7 text-slate-600 leading-relaxed">
                Open this app in <strong>Chrome</strong> on your Android device. Tap the <strong>three dots (⋮)</strong> menu in the top right corner and tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.
              </p>

              <div className="pt-2 border-t border-slate-200 font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                <span>Send link to your Phone</span>
              </div>
              <div className="pl-7 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-700 font-mono truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200 font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                <span>Generate APK via GitHub Actions or Cloud</span>
              </div>
              <div className="pl-7 text-slate-600 space-y-2">
                <p className="leading-relaxed">
                  We&apos;ve added a ready-to-run <strong>.github/workflows/generate-apk.yml</strong> workflow to this project. When pushed to GitHub, GitHub automatically compiles the <strong>SyncStudy.apk</strong> artifact in 2 minutes!
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`https://www.pwabuilder.com?site=${encodeURIComponent(appUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Instant Cloud APK (PWABuilder)</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Everyday Data Backup & Restore Modal */}
      {showDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <HardDriveDownload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Permanent Everyday Data</h3>
                  <p className="text-xs text-slate-500">Your routine, classes, sleep & reels records</p>
                </div>
              </div>
              <button
                onClick={() => setShowDataModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  SyncStudy automatically persists your alarms, sleep logs, reels, and timetable in your device&apos;s local storage. You can also export a complete backup anytime or switch devices.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Export Button */}
                <button
                  onClick={() => {
                    if (onExportBackup) onExportBackup();
                    setShowDataModal(false);
                  }}
                  className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-all group"
                >
                  <Download className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-800 text-xs">Export Backup</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Download JSON file</span>
                </button>

                {/* Import Button */}
                <label className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center cursor-pointer transition-all group">
                  <Upload className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-800 text-xs">Restore Backup</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Load from file</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (onImportBackup) onImportBackup(e);
                      setShowDataModal(false);
                    }}
                  />
                </label>
              </div>
            </div>

            <button
              onClick={() => setShowDataModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
