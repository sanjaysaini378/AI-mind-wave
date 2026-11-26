import { useEffect, useState } from 'react';
import {
  BatteryCharging,
  Bell,
  Download,
  Layers,
  Maximize2,
  Minimize2,
  Moon,
  Pause,
  Play,
  Power,
  RotateCcw,
  ShieldCheck,
  Square,
} from 'lucide-react';
import {
  ACCENT_SWATCHES,
  DEFAULT_SETTINGS,
  getLightModeSpec,
  LIGHT_MODES,
  LightSettings,
  OverlayRuntimeState,
  PermissionState,
  SimulatedAppId,
} from './types/mindwave';
import { downloadAndroidProjectZip } from './data/androidProjectFiles';
import { AmbientLightCanvas } from './components/AmbientLightCanvas';
import { PhoneOverlaySimulator } from './components/PhoneOverlaySimulator';
import { AndroidCodeExplorer } from './components/AndroidCodeExplorer';
import { ApkBuildGuide } from './components/ApkBuildGuide';

const TIMER_CHOICES = [0, 10, 20, 30, 45, 60];

function formatCountdown(seconds: number | null): string {
  if (seconds === null) return 'Continuous';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function App() {
  const [settings, setSettings] = useState<LightSettings>(DEFAULT_SETTINGS);
  const [runtimeState, setRuntimeState] = useState<OverlayRuntimeState>('active');
  const [simulatedApp, setSimulatedApp] = useState<SimulatedAppId>('home');
  const [viewportAmbientEnabled, setViewportAmbientEnabled] = useState(true);
  const [fullscreenMeditation, setFullscreenMeditation] = useState(false);
  const [permissions, setPermissions] = useState<PermissionState>({
    overlayGranted: true,
    notificationGranted: true,
    batteryUnrestricted: true,
  });
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    DEFAULT_SETTINGS.timerMinutes * 60
  );

  // Sync countdown timer when user adjusts timer preset
  useEffect(() => {
    if (settings.timerMinutes === 0) {
      setRemainingSeconds(null);
    } else {
      setRemainingSeconds(settings.timerMinutes * 60);
    }
  }, [settings.timerMinutes]);

  // Escape key exits full-screen meditation mode
  useEffect(() => {
    if (!fullscreenMeditation) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenMeditation(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreenMeditation]);

  // Countdown tick while Global Phone Mode is active
  useEffect(() => {
    if (runtimeState !== 'active' || remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      setRuntimeState('off');
      return;
    }
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          setRuntimeState('off');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [runtimeState, remainingSeconds]);

  const activeModeSpec = getLightModeSpec(settings.mode);
  const isRunning = runtimeState !== 'off';

  const handleToggleGlobalMode = () => {
    if (isRunning) {
      setRuntimeState('off');
      setPermissionNotice(null);
      return;
    }

    if (!permissions.overlayGranted) {
      setPermissionNotice(
        'Display Over Other Apps (SYSTEM_ALERT_WINDOW) is required before starting Global Phone Mode. Grant it in the Permissions section below.'
      );
      document.getElementById('permissions')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setPermissionNotice(null);
    if (settings.timerMinutes > 0 && (remainingSeconds === null || remainingSeconds <= 0)) {
      setRemainingSeconds(settings.timerMinutes * 60);
    }
    setRuntimeState('active');
  };

  const handlePause = () => {
    if (isRunning) setRuntimeState('paused');
  };

  const handleResume = () => {
    if (runtimeState === 'paused') setRuntimeState('active');
  };

  const handleStop = () => {
    setRuntimeState('off');
  };

  const updateSettings = (patch: Partial<LightSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const statusLabel =
    runtimeState === 'active'
      ? 'Global Phone Mode Active'
      : runtimeState === 'paused'
        ? 'Global Phone Mode Paused'
        : 'Global Phone Mode Off';

  const statusTone =
    runtimeState === 'active'
      ? 'text-[#34D399]'
      : runtimeState === 'paused'
        ? 'text-[#FBBF24]'
        : 'text-[#8D9EC1]';

  return (
    <div className="relative min-h-screen bg-[#050711] text-[#EEF2FF]">
      {/* Full-Screen Silent Meditation Mode (Instant mobile/desktop browser experience) */}
      {fullscreenMeditation && (
        <div className="fixed inset-0 z-[60] bg-[#03050C]">
          <AmbientLightCanvas
            settings={settings}
            active={runtimeState === 'active'}
            scaleFactor={1.4}
          />
          <div className="pointer-events-none fixed inset-x-0 bottom-8 z-10 flex justify-center px-4">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#232D58] bg-[#090D1E]/85 px-4 py-3 backdrop-blur-md">
              <div className="pr-2 text-xs">
                <p className="font-semibold text-[#EEF2FF]">{activeModeSpec.name}</p>
                <p className="font-mono text-[11px] tabular-nums text-[#8D9EC1]">
                  Silent visual light · {formatCountdown(remainingSeconds)}
                </p>
              </div>
              {runtimeState === 'paused' ? (
                <button
                  type="button"
                  onClick={handleResume}
                  className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#4F46E5] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#6366F1]"
                >
                  <Play className="h-3.5 w-3.5" />
                  Resume
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#2B3666] bg-[#121936] px-3.5 py-2 text-xs font-semibold text-[#EEF2FF] hover:bg-[#1A244D]"
                >
                  <Pause className="h-3.5 w-3.5" />
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={() => setFullscreenMeditation(false)}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#2B3666] bg-[#0E142D] px-3.5 py-2 text-xs font-semibold text-[#C7D2FE] hover:bg-[#18224A]"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                Exit Full Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional Full-Viewport Edge Ambient Light Preview (Pointer-events none; zero touch blocking) */}
      {viewportAmbientEnabled && !fullscreenMeditation && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <AmbientLightCanvas
            settings={{ ...settings, centralGlow: 0 }}
            active={runtimeState === 'active'}
            scaleFactor={1.25}
          />
        </div>
      )}

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-[#1A2142] bg-[#050711]/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-6 py-4">
          <a
            href="#studio"
            className="font-display text-lg font-bold tracking-tight text-[#EEF2FF] whitespace-nowrap shrink-0"
          >
            AI Mind Wave
          </a>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 text-sm font-medium text-[#A5B4CF] md:flex"
          >
            <a
              href="#studio"
              className="transition-colors hover:text-[#EEF2FF] whitespace-nowrap shrink-0"
            >
              Live Studio
            </a>
            <a
              href="#permissions"
              className="transition-colors hover:text-[#EEF2FF] whitespace-nowrap shrink-0"
            >
              Permissions
            </a>
            <a
              href="#android-code"
              className="transition-colors hover:text-[#EEF2FF] whitespace-nowrap shrink-0"
            >
              Android Code
            </a>
            <a
              href="#build-apk"
              className="transition-colors hover:text-[#EEF2FF] whitespace-nowrap shrink-0"
            >
              Build APK
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={downloadAndroidProjectZip}
              className="flex min-h-[40px] items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#6366F1] whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              Download Project
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1360px] space-y-20 px-6 py-10 lg:py-14">
        {/* SECTION 1: LIVE GLOBAL PHONE MODE STUDIO */}
        <section id="studio" className="scroll-mt-24">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            {/* Left Column: Activation Console, 7 Light Modes & Controls */}
            <div className="space-y-8 lg:col-span-7">
              <div className="max-w-2xl">
                <p className="text-xs font-medium text-[#818CF8]">
                  Native Kotlin Android Application · Android 10–15 · Silent Visual Meditation
                </p>
                <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-[#EEF2FF] sm:text-4xl">
                  Adaptive Edge Ambient Light Meditation
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[#A5B4CF] sm:text-base">
                  Activate subtle four-edge illumination across your phone while reading,
                  browsing, or watching supported video—paired with Silent Shiv Nada visual light
                  waves and a complete, APK-ready Android Studio Kotlin codebase.
                </p>
              </div>

              {/* Primary Global Phone Mode Activation Panel */}
              <div className="rounded-2xl border border-[#242E5A] bg-[#0B1023] p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    {/* Large Unmistakable ON / OFF Power Button */}
                    <button
                      type="button"
                      onClick={handleToggleGlobalMode}
                      aria-pressed={isRunning}
                      className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-2 transition-transform active:scale-95 ${
                        isRunning
                          ? 'border-[#C7D2FE]/75 bg-gradient-to-b from-[#6366F1] via-[#4F46E5] to-[#5B21B6] text-white shadow-[0_0_40px_rgba(99,102,241,0.45)]'
                          : 'border-[#2A3562] bg-[#101630] text-[#A5B4CF] hover:border-[#6366F1]'
                      }`}
                    >
                      <Power className="h-7 w-7" />
                      <span className="mt-1 text-sm font-bold tracking-wide">
                        {isRunning ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <div>
                      <p className={`text-sm font-semibold ${statusTone}`}>{statusLabel}</p>
                      <h2 className="mt-1 text-xl font-semibold text-[#EEF2FF]">
                        {activeModeSpec.name}
                      </h2>
                      <p className="mt-1 text-xs text-[#9EB0D4]">
                        Zero audio · Zero vibration · Timer:{' '}
                        <span className="font-mono tabular-nums text-[#E0E7FF]">
                          {formatCountdown(remainingSeconds)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Start / Pause / Resume / Stop Controls */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {!isRunning ? (
                      <button
                        type="button"
                        onClick={handleToggleGlobalMode}
                        className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#6366F1] whitespace-nowrap"
                      >
                        <Play className="h-4 w-4" />
                        Start Global Mode
                      </button>
                    ) : (
                      <>
                        {runtimeState === 'paused' ? (
                          <button
                            type="button"
                            onClick={handleResume}
                            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#6366F1] whitespace-nowrap"
                          >
                            <Play className="h-4 w-4" />
                            Resume
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handlePause}
                            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[#2C3766] bg-[#121936] px-4 py-2.5 text-xs font-semibold text-[#EEF2FF] transition-colors hover:bg-[#19234A] whitespace-nowrap"
                          >
                            <Pause className="h-4 w-4" />
                            Pause
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleStop}
                          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[#5B232B] bg-[#211017] px-4 py-2.5 text-xs font-semibold text-[#FCA5A5] transition-colors hover:bg-[#311621] whitespace-nowrap"
                        >
                          <Square className="h-3.5 w-3.5" />
                          Stop
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {permissionNotice && (
                  <div className="mt-4 rounded-xl border border-[#5B4320] bg-[#1D160B] px-4 py-3 text-xs text-[#FDE68A]">
                    {permissionNotice}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#1C2447] pt-4 text-xs">
                  <span className="text-[#9EB0D4]">
                    Preview the four-edge ambient waves around this browser screen
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewportAmbientEnabled((v) => !v)}
                    className="flex min-h-[36px] items-center gap-2 rounded-lg border border-[#27325E] bg-[#101733] px-3 py-1.5 text-xs font-medium text-[#E0E7FF] transition-colors hover:bg-[#18224A] whitespace-nowrap"
                  >
                    {viewportAmbientEnabled ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5 text-[#818CF8]" />
                        Hide Screen-Edge Preview
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3.5 w-3.5 text-[#818CF8]" />
                        Show Screen-Edge Preview
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 7 Visual Light Modes */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold text-[#EEF2FF]">
                    Visual Light Modes
                  </h2>
                  <span className="text-xs text-[#8D9EC1]">
                    7 modes · Slow breathing rhythm · No rapid flashing
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {LIGHT_MODES.map((mode) => {
                    const selected = settings.mode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => updateSettings({ mode: mode.id })}
                        className={`flex flex-col rounded-2xl border p-4 text-left transition-colors ${
                          selected
                            ? 'border-[#6366F1] bg-[#131A38]'
                            : 'border-[#1E274B] bg-[#0B1022] hover:border-[#324075]'
                        } ${mode.id === 'silent_shiv_nada' ? 'sm:col-span-2' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="h-6 w-6 shrink-0 rounded-full border border-white/20"
                              style={{
                                background: `linear-gradient(135deg, ${mode.secondary}, ${mode.accent}, ${mode.lunar})`,
                              }}
                            />
                            <span className="text-sm font-semibold text-[#EEF2FF]">
                              {mode.name}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-[#8D9EC1]">
                            {selected ? 'Selected' : `${mode.baseCycleSeconds}s wave`}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-[#A5B4CF]">
                          {mode.id === 'silent_shiv_nada' ? mode.description : mode.shortNote}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Light & Wave Controls */}
              <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-[#EEF2FF]">
                      Light & Wave Controls
                    </h2>
                    <p className="text-xs text-[#8D9EC1]">
                      Real-time adjustments applied to both the Android canvas engine and live
                      preview.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings(DEFAULT_SETTINGS)}
                    className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#27325E] px-3 py-1.5 text-xs font-medium text-[#C7D2FE] hover:bg-[#141D40] whitespace-nowrap"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Intensity */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <label htmlFor="slider-intensity" className="font-medium text-[#EEF2FF]">
                        Light Intensity
                      </label>
                      <span className="font-mono tabular-nums text-[#818CF8]">
                        {Math.round(settings.intensity * 100)}%
                      </span>
                    </div>
                    <input
                      id="slider-intensity"
                      type="range"
                      min={0.15}
                      max={1}
                      step={0.01}
                      value={settings.intensity}
                      onChange={(e) =>
                        updateSettings({ intensity: parseFloat(e.target.value) })
                      }
                      className="mindwave-slider w-full"
                    />
                  </div>

                  {/* Speed (strictly capped to safe non-strobing range) */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <label htmlFor="slider-speed" className="font-medium text-[#EEF2FF]">
                        Animation Speed (Slow Safe Range)
                      </label>
                      <span className="font-mono tabular-nums text-[#818CF8]">
                        {settings.speed.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      id="slider-speed"
                      type="range"
                      min={0.35}
                      max={1.35}
                      step={0.05}
                      value={settings.speed}
                      onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
                      className="mindwave-slider w-full"
                    />
                  </div>

                  {/* Edge Thickness */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <label htmlFor="slider-thickness" className="font-medium text-[#EEF2FF]">
                        Edge Thickness
                      </label>
                      <span className="font-mono tabular-nums text-[#818CF8]">
                        {Math.round(settings.edgeThickness)} dp
                      </span>
                    </div>
                    <input
                      id="slider-thickness"
                      type="range"
                      min={12}
                      max={56}
                      step={1}
                      value={settings.edgeThickness}
                      onChange={(e) =>
                        updateSettings({ edgeThickness: parseFloat(e.target.value) })
                      }
                      className="mindwave-slider w-full"
                    />
                  </div>

                  {/* Central Glow */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <label htmlFor="slider-central" className="font-medium text-[#EEF2FF]">
                        Central Glow & Sacred Geometry
                      </label>
                      <span className="font-mono tabular-nums text-[#818CF8]">
                        {Math.round(settings.centralGlow * 100)}%
                      </span>
                    </div>
                    <input
                      id="slider-central"
                      type="range"
                      min={0}
                      max={0.85}
                      step={0.01}
                      value={settings.centralGlow}
                      onChange={(e) =>
                        updateSettings({ centralGlow: parseFloat(e.target.value) })
                      }
                      className="mindwave-slider w-full"
                    />
                  </div>

                  {/* Transparency */}
                  <div className="sm:col-span-2">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <label
                        htmlFor="slider-transparency"
                        className="font-medium text-[#EEF2FF]"
                      >
                        Overlay Transparency / Opacity
                      </label>
                      <span className="font-mono tabular-nums text-[#818CF8]">
                        {Math.round(settings.transparency * 100)}%
                      </span>
                    </div>
                    <input
                      id="slider-transparency"
                      type="range"
                      min={0.2}
                      max={0.9}
                      step={0.01}
                      value={settings.transparency}
                      onChange={(e) =>
                        updateSettings({ transparency: parseFloat(e.target.value) })
                      }
                      className="mindwave-slider w-full"
                    />
                  </div>
                </div>

                {/* Custom Color Selection */}
                <div className="mt-6 border-t border-[#1C2447] pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#EEF2FF]">Colour Selection</p>
                      <p className="text-xs text-[#8D9EC1]">
                        Use each mode&apos;s curated deep blue / indigo / violet palette or blend
                        a custom accent tint.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.useCustomColor}
                      onClick={() =>
                        updateSettings({ useCustomColor: !settings.useCustomColor })
                      }
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        settings.useCustomColor ? 'bg-[#6366F1]' : 'bg-[#232D55]'
                      }`}
                    >
                      <span
                        className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                          settings.useCustomColor ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-3">
                    {ACCENT_SWATCHES.map((swatch) => {
                      const active =
                        settings.useCustomColor &&
                        settings.customAccentColor.toLowerCase() === swatch.hex.toLowerCase();
                      return (
                        <button
                          key={swatch.hex}
                          type="button"
                          title={swatch.name}
                          aria-label={`Select ${swatch.name}`}
                          onClick={() =>
                            updateSettings({
                              useCustomColor: true,
                              customAccentColor: swatch.hex,
                            })
                          }
                          className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${
                            active ? 'border-white scale-105' : 'border-[#2B3664]'
                          }`}
                          style={{ backgroundColor: swatch.hex }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Auto Night Mode, Timer & Reboot Restart */}
                <div className="mt-6 grid grid-cols-1 gap-5 border-t border-[#1C2447] pt-5 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-[#818CF8]" />
                        <span className="text-sm font-medium text-[#EEF2FF]">
                          Automatic Night Mode
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settings.autoNightMode}
                        onClick={() =>
                          updateSettings({ autoNightMode: !settings.autoNightMode })
                        }
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          settings.autoNightMode ? 'bg-[#6366F1]' : 'bg-[#232D55]'
                        }`}
                      >
                        <span
                          className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                            settings.autoNightMode ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-[#8D9EC1]">
                      Softly lowers luminance by 42% between 22:00 and 06:00.
                    </p>
                    {settings.autoNightMode && (
                      <button
                        type="button"
                        onClick={() =>
                          updateSettings({ simulateNightHours: !settings.simulateNightHours })
                        }
                        className="min-h-[36px] rounded-lg border border-[#27325E] bg-[#101733] px-3 py-1.5 text-xs font-medium text-[#C7D2FE] hover:bg-[#19234A]"
                      >
                        {settings.simulateNightHours
                          ? 'Previewing Night Dimming (22:40)'
                          : 'Test Night Dimming Now'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[#EEF2FF]">
                        Restart After Reboot
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settings.restartOnBoot}
                        onClick={() =>
                          updateSettings({ restartOnBoot: !settings.restartOnBoot })
                        }
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          settings.restartOnBoot ? 'bg-[#6366F1]' : 'bg-[#232D55]'
                        }`}
                      >
                        <span
                          className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                            settings.restartOnBoot ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-[#8D9EC1]">
                      Optional opt-in: resumes via BootCompletedReceiver only when you enable
                      this toggle and overlay permission remains granted.
                    </p>
                  </div>
                </div>

                {/* Session Timer & Auto-Off */}
                <div className="mt-6 border-t border-[#1C2447] pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#EEF2FF]">
                      Timer & Auto-Off
                    </span>
                    <span className="font-mono text-xs tabular-nums text-[#818CF8]">
                      {formatCountdown(remainingSeconds)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TIMER_CHOICES.map((mins) => {
                      const active = settings.timerMinutes === mins;
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => updateSettings({ timerMinutes: mins })}
                          className={`min-h-[38px] rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                            active
                              ? 'border-[#6366F1] bg-[#4F46E5] text-white'
                              : 'border-[#232D55] bg-[#0F152D] text-[#A5B4CF] hover:text-[#EEF2FF]'
                          }`}
                        >
                          {mins === 0 ? 'Continuous' : `${mins} min`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Android Global Overlay Stage */}
            <div className="lg:sticky lg:top-24 lg:col-span-5">
              <PhoneOverlaySimulator
                settings={settings}
                runtimeState={runtimeState}
                remainingSeconds={remainingSeconds}
                simulatedApp={simulatedApp}
                onSelectSimulatedApp={setSimulatedApp}
                onToggleGlobal={handleToggleGlobalMode}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: ANDROID PERMISSIONS, SAFETY & OVERLAY TRANSPARENCY */}
        <section id="permissions" className="scroll-mt-24 space-y-8 border-t border-[#192040] pt-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[#EEF2FF] sm:text-3xl">
              Android Permission Setup & Safety Boundaries
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
              Global Phone Mode activates only after explicit user consent. Test the Android
              permission states below—revoking Display Over Other Apps immediately blocks Global
              Mode activation in the simulator above.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Permission 1 */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8D9EC1]">Required · Android 10+</span>
                  <span
                    className={
                      permissions.overlayGranted
                        ? 'font-semibold text-[#34D399]'
                        : 'font-semibold text-[#FBBF24]'
                    }
                  >
                    {permissions.overlayGranted ? 'Granted' : 'Not Granted'}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2.5">
                  <Layers className="h-5 w-5 text-[#818CF8]" />
                  <h3 className="text-base font-semibold text-[#EEF2FF]">
                    Display Over Other Apps
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#A5B4CF]">
                  Uses <span className="font-mono text-[#E0E7FF]">SYSTEM_ALERT_WINDOW</span> with{' '}
                  <span className="font-mono text-[#E0E7FF]">FLAG_NOT_TOUCHABLE</span> and{' '}
                  <span className="font-mono text-[#E0E7FF]">FLAG_NOT_FOCUSABLE</span> so touches
                  and keyboard typing pass unobstructed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !permissions.overlayGranted;
                  setPermissions((p) => ({ ...p, overlayGranted: next }));
                  if (!next) setRuntimeState('off');
                }}
                className="mt-5 min-h-[42px] w-full rounded-xl border border-[#2A3562] bg-[#121936] px-4 py-2 text-xs font-semibold text-[#EEF2FF] transition-colors hover:bg-[#1A244D]"
              >
                {permissions.overlayGranted
                  ? 'Simulate Revoking Permission'
                  : 'Grant Overlay Permission'}
              </button>
            </div>

            {/* Permission 2 */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8D9EC1]">Recommended · Android 13+</span>
                  <span
                    className={
                      permissions.notificationGranted
                        ? 'font-semibold text-[#34D399]'
                        : 'font-semibold text-[#FBBF24]'
                    }
                  >
                    {permissions.notificationGranted ? 'Granted' : 'Not Granted'}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2.5">
                  <Bell className="h-5 w-5 text-[#818CF8]" />
                  <h3 className="text-base font-semibold text-[#EEF2FF]">
                    Foreground Notification
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#A5B4CF]">
                  Uses <span className="font-mono text-[#E0E7FF]">POST_NOTIFICATIONS</span> and{' '}
                  <span className="font-mono text-[#E0E7FF]">foregroundServiceType=&quot;specialUse&quot;</span>{' '}
                  for a silent persistent status card with Pause, Resume, and Stop actions.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPermissions((p) => ({
                    ...p,
                    notificationGranted: !p.notificationGranted,
                  }))
                }
                className="mt-5 min-h-[42px] w-full rounded-xl border border-[#2A3562] bg-[#121936] px-4 py-2 text-xs font-semibold text-[#EEF2FF] transition-colors hover:bg-[#1A244D]"
              >
                {permissions.notificationGranted
                  ? 'Simulate Disabling Notifications'
                  : 'Grant Notification Permission'}
              </button>
            </div>

            {/* Permission 3 */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8D9EC1]">Optional Reliability</span>
                  <span
                    className={
                      permissions.batteryUnrestricted
                        ? 'font-semibold text-[#34D399]'
                        : 'font-semibold text-[#FBBF24]'
                    }
                  >
                    {permissions.batteryUnrestricted ? 'Unrestricted' : 'Optimized'}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2.5">
                  <BatteryCharging className="h-5 w-5 text-[#818CF8]" />
                  <h3 className="text-base font-semibold text-[#EEF2FF]">
                    Unrestricted Battery
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#A5B4CF]">
                  Requests <span className="font-mono text-[#E0E7FF]">REQUEST_IGNORE_BATTERY_OPTIMIZATIONS</span>{' '}
                  so OEM power managers do not terminate long ambient sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPermissions((p) => ({
                    ...p,
                    batteryUnrestricted: !p.batteryUnrestricted,
                  }))
                }
                className="mt-5 min-h-[42px] w-full rounded-xl border border-[#2A3562] bg-[#121936] px-4 py-2 text-xs font-semibold text-[#EEF2FF] transition-colors hover:bg-[#1A244D]"
              >
                {permissions.batteryUnrestricted
                  ? 'Simulate Standard Optimization'
                  : 'Set Unrestricted Battery'}
              </button>
            </div>
          </div>

          {/* Honest System Restrictions & Safety Disclosure */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
              <h3 className="text-base font-semibold text-[#EEF2FF]">
                Honest Android System Overlay Limitations
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#A5B4CF]">
                <li>
                  • Banking apps, password managers, and screens marked{' '}
                  <span className="font-mono text-xs text-[#E0E7FF]">FLAG_SECURE</span> block or
                  hide floating overlays at the OS level.
                </li>
                <li>
                  • Android system permission dialogs and security settings automatically suppress
                  overlays to prevent accidental taps.
                </li>
                <li>
                  • DRM-protected video players (Widevine L1 hardware surfaces) may hide overlays
                  during fullscreen playback.
                </li>
                <li>
                  • <span className="font-mono text-xs text-[#E0E7FF]">OverlayService.kt</span>{' '}
                  automatically pauses drawing when the screen turns off, on the lockscreen, or
                  during active phone calls.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-[#818CF8]" />
                <h3 className="text-base font-semibold text-[#EEF2FF]">
                  Important Visual Meditation Safety Notice
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#A5B4CF]">
                AI Mind Wave and Silent Shiv Nada provide a calm, purely visual light meditation
                experience. The application produces absolutely no audio, no mantra playback, and
                no vibration or haptic feedback. It does not claim to activate the third eye,
                generate physical sound waves, or produce supernatural effects. Animation speeds
                are capped to slow, smooth breathing curves with no strobing or abrupt brightness
                jumps.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: COMPLETE NATIVE ANDROID KOTLIN PROJECT EXPLORER */}
        <section id="android-code" className="scroll-mt-24 space-y-6 border-t border-[#192040] pt-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[#EEF2FF] sm:text-3xl">
              Complete Native Android Kotlin Source Code
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
              Inspect every Gradle script, Kotlin class, hardware-accelerated Canvas renderer,
              foreground service, boot receiver, AndroidManifest, and adaptive vector drawable
              included in the downloadable Android Studio project.
            </p>
          </div>
          <AndroidCodeExplorer />
        </section>

        {/* SECTION 4: APK BUILD & INSTALLATION INSTRUCTIONS */}
        <section id="build-apk" className="scroll-mt-24 border-t border-[#192040] pt-14">
          <ApkBuildGuide />
        </section>
      </main>

      <footer className="mt-16 border-t border-[#181F3D] py-8">
        <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-4 px-6 text-xs text-[#7C8DB0] sm:flex-row sm:items-center">
          <p>
            AI Mind Wave – Adaptive Edge Ambient Light Meditation · Native Android Kotlin Project
            (API 29–35)
          </p>
          <p>Visual meditation light experience only · Strictly silent · No audio or haptics</p>
        </div>
      </footer>
    </div>
  );
}
