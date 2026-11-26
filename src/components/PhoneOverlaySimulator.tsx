import { useState } from 'react';
import {
  BookOpen,
  Globe,
  Lock,
  Pause,
  Play,
  Power,
  Smartphone,
  Square,
  Video,
} from 'lucide-react';
import {
  getLightModeSpec,
  LightSettings,
  OverlayRuntimeState,
  SimulatedAppId,
} from '../types/mindwave';
import { AmbientLightCanvas } from './AmbientLightCanvas';

interface PhoneOverlaySimulatorProps {
  settings: LightSettings;
  runtimeState: OverlayRuntimeState;
  remainingSeconds: number | null;
  simulatedApp: SimulatedAppId;
  onSelectSimulatedApp: (app: SimulatedAppId) => void;
  onToggleGlobal: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const APP_SCENES: { id: SimulatedAppId; label: string; icon: typeof Smartphone }[] = [
  { id: 'home', label: 'App Home', icon: Smartphone },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'browsing', label: 'Browsing', icon: Globe },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'banking', label: 'Banking', icon: Lock },
];

function formatTimer(seconds: number | null): string {
  if (seconds === null) return 'Continuous';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function PhoneOverlaySimulator({
  settings,
  runtimeState,
  remainingSeconds,
  simulatedApp,
  onSelectSimulatedApp,
  onToggleGlobal,
  onPause,
  onResume,
  onStop,
}: PhoneOverlaySimulatorProps) {
  const [drmProtectedVideo, setDrmProtectedVideo] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [articleFontLarge, setArticleFontLarge] = useState(false);

  const modeSpec = getLightModeSpec(settings.mode);
  const isBlockedByAndroid =
    simulatedApp === 'banking' || (simulatedApp === 'video' && drmProtectedVideo);

  const isRunningService = runtimeState !== 'off';
  const overlayVisiblyDrawing = runtimeState === 'active' && !isBlockedByAndroid;

  return (
    <div className="flex flex-col items-center">
      {/* Interactive Scene Switcher above the phone */}
      <div className="mb-4 w-full max-w-[390px]">
        <div className="mb-2 flex items-center justify-between text-xs text-[#A5B4CF]">
          <span>Simulate foreground Android app</span>
          <span className="font-mono tabular-nums text-[#7C8DB0]">
            {overlayVisiblyDrawing
              ? 'Overlay Active'
              : isBlockedByAndroid && isRunningService
                ? 'Hidden by Android'
                : runtimeState === 'paused'
                  ? 'Paused'
                  : 'Off'}
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Simulated Android application"
          className="grid grid-cols-5 gap-1 rounded-xl border border-[#232C52] bg-[#0C1022] p-1"
        >
          {APP_SCENES.map((scene) => {
            const Icon = scene.icon;
            const isSelected = simulatedApp === scene.id;
            return (
              <button
                key={scene.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => onSelectSimulatedApp(scene.id)}
                className={`flex min-h-[42px] flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#1D2448] text-[#EEF2FF]'
                    : 'text-[#8D9EC1] hover:text-[#EEF2FF]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{scene.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Android Device Bezel */}
      <div className="relative w-full max-w-[356px] rounded-[42px] border border-[#2A3562] bg-[#070A17] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.65)]">
        {/* Inner Android Viewport */}
        <div className="relative h-[680px] w-full overflow-hidden rounded-[32px] border border-[#19203E] bg-[#050711]">
          {/* Android Status Bar */}
          <div className="relative z-20 flex items-center justify-between px-5 pt-3 pb-2 text-[11px] font-mono tabular-nums text-[#C7D2FE]/90">
            <span>{settings.simulateNightHours ? '22:40' : '14:18'}</span>
            <div className="h-4 w-20 rounded-full bg-[#020308]" aria-hidden="true" />
            <span>5G · 92%</span>
          </div>

          {/* Persistent Foreground Service Notification Preview (Visible while service runs) */}
          {isRunningService && (
            <div className="relative z-20 mx-3 mb-2 rounded-2xl border border-[#2B3666] bg-[#0E142D]/95 p-3 backdrop-blur-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#EEF2FF]">
                    AI Mind Wave · {modeSpec.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#A5B4CF]">
                    {isBlockedByAndroid
                      ? 'Auto-hidden for secure screen'
                      : runtimeState === 'paused'
                        ? 'Paused · Silent visual light'
                        : `Global Mode active · ${formatTimer(remainingSeconds)}`}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-[#818CF8]">
                  Silent
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-2 border-t border-[#20294E] pt-2">
                {runtimeState === 'paused' ? (
                  <button
                    type="button"
                    onClick={onResume}
                    className="flex min-h-[32px] items-center gap-1.5 rounded-lg bg-[#1E2750] px-3 py-1 text-[11px] font-medium text-[#EEF2FF] hover:bg-[#283366] whitespace-nowrap"
                  >
                    <Play className="h-3 w-3" />
                    Resume
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onPause}
                    className="flex min-h-[32px] items-center gap-1.5 rounded-lg bg-[#1E2750] px-3 py-1 text-[11px] font-medium text-[#EEF2FF] hover:bg-[#283366] whitespace-nowrap"
                  >
                    <Pause className="h-3 w-3" />
                    Pause
                  </button>
                )}
                <button
                  type="button"
                  onClick={onStop}
                  className="flex min-h-[32px] items-center gap-1.5 rounded-lg bg-[#2A1421] px-3 py-1 text-[11px] font-medium text-[#FCA5A5] hover:bg-[#3A1C2D] whitespace-nowrap"
                >
                  <Square className="h-3 w-3" />
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* Simulated Foreground App Screen (Receives all touches unimpeded) */}
          <div className="relative z-10 h-[calc(100%-54px)] overflow-y-auto px-4 pb-16 mindwave-scroll">
            {simulatedApp === 'home' && (
              <div className="flex flex-col items-center pt-5 text-center">
                <p className="text-xs font-medium text-[#8D9EC1]">
                  Adaptive Edge Ambient Light
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#EEF2FF]">
                  {runtimeState === 'active'
                    ? 'Global Phone Mode Active'
                    : runtimeState === 'paused'
                      ? 'Global Phone Mode Paused'
                      : 'Global Phone Mode Off'}
                </h3>

                {/* Large Mobile ON/OFF Button inside simulated Android UI */}
                <button
                  type="button"
                  onClick={onToggleGlobal}
                  aria-label={
                    isRunningService
                      ? 'Turn Off Global Phone Mode'
                      : 'Turn On Global Phone Mode'
                  }
                  className={`mt-6 flex h-36 w-36 flex-col items-center justify-center rounded-full border-2 transition-transform active:scale-95 ${
                    isRunningService
                      ? 'border-[#C7D2FE]/70 bg-gradient-to-b from-[#6366F1] via-[#4F46E5] to-[#5B21B6] text-white shadow-[0_0_48px_rgba(99,102,241,0.45)]'
                      : 'border-[#27315A] bg-[#0F152D] text-[#A5B4CF] hover:border-[#4F46E5]'
                  }`}
                >
                  <Power className="h-9 w-9" />
                  <span className="mt-1.5 text-base font-bold tracking-wide">
                    {isRunningService ? 'ON' : 'OFF'}
                  </span>
                </button>

                <p className="mt-5 max-w-[250px] text-xs leading-relaxed text-[#A5B4CF]">
                  {isRunningService
                    ? `${modeSpec.name} is illuminating screen edges silently. Switch apps above to test overlay pass-through.`
                    : 'Tap ON to preview four-edge ambient meditation waves across apps.'}
                </p>

                <div className="mt-6 w-full space-y-2 rounded-2xl border border-[#1E274B] bg-[#0B1024]/90 p-3.5 text-left text-xs">
                  <div className="flex items-center justify-between text-[#A5B4CF]">
                    <span>Active Mode</span>
                    <span className="font-medium text-[#EEF2FF]">{modeSpec.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#A5B4CF]">
                    <span>Audio & Haptics</span>
                    <span className="font-medium text-[#EEF2FF]">Disabled (Silent)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#A5B4CF]">
                    <span>Auto-Off Timer</span>
                    <span className="font-mono tabular-nums text-[#EEF2FF]">
                      {formatTimer(remainingSeconds)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {simulatedApp === 'reading' && (
              <div className="space-y-4 pt-3 text-left">
                <div className="flex items-center justify-between border-b border-[#1A2242] pb-3">
                  <div>
                    <p className="text-[11px] text-[#8D9EC1]">Reading App · Touch Pass-Through</p>
                    <h4 className="text-base font-semibold text-[#EEF2FF]">
                      Quiet Visual Attention
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArticleFontLarge((v) => !v)}
                    className="min-h-[36px] rounded-lg border border-[#24305B] bg-[#101733] px-2.5 text-xs text-[#C7D2FE]"
                  >
                    {articleFontLarge ? 'A-' : 'A+'}
                  </button>
                </div>

                <div
                  className={`space-y-3 leading-relaxed text-[#CBD5F5] ${
                    articleFontLarge ? 'text-sm' : 'text-xs'
                  }`}
                >
                  <p>
                    Gentle peripheral illumination gives the eyes a calm visual frame while
                    reading long chapters at night. Because the Android window uses
                    FLAG_NOT_TOUCHABLE and FLAG_NOT_FOCUSABLE, every scroll gesture and tap
                    reaches the reading app immediately.
                  </p>
                  <p>
                    Notice how the four-edge glow breathes smoothly around the perimeter while
                    keeping center text contrast crisp and legible.
                  </p>
                  <p>
                    Try tapping the counter button below to verify that controls underneath the
                    overlay respond with zero delay.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setTapCount((c) => c + 1)}
                  className="w-full min-h-[44px] rounded-xl border border-[#293566] bg-[#121A3A] px-4 py-2.5 text-xs font-medium text-[#EEF2FF] hover:bg-[#19234B]"
                >
                  Test Touch Pass-Through · Taps Recorded: {tapCount}
                </button>
              </div>
            )}

            {simulatedApp === 'browsing' && (
              <div className="space-y-3 pt-3">
                <div className="rounded-xl border border-[#232D58] bg-[#0D132B] px-3 py-2 text-xs font-mono text-[#94A3C8]">
                  https://meditation-journal.example/ambient-light
                </div>
                <div className="space-y-3 rounded-2xl border border-[#1B2345] bg-[#0B1022] p-4">
                  <p className="text-xs font-semibold text-[#EEF2FF]">
                    Ambient Edge Framing While Browsing
                  </p>
                  <p className="text-xs leading-relaxed text-[#A5B4CF]">
                    Standard browser tabs, address bars, and on-screen keyboards remain fully
                    interactive while Global Phone Mode renders subtle breathing color waves
                    around screen margins.
                  </p>
                  <input
                    type="text"
                    placeholder="Type here to verify keyboard & focus..."
                    className="w-full min-h-[40px] rounded-lg border border-[#27325F] bg-[#060916] px-3 text-xs text-[#EEF2FF] placeholder-[#6B7CA3] focus:border-[#6366F1] focus:outline-none"
                  />
                </div>
                <div className="space-y-2 rounded-2xl border border-[#1B2345] bg-[#0B1022] p-4 text-xs text-[#A5B4CF]">
                  <p className="font-medium text-[#EEF2FF]">Browser Compatibility</p>
                  <p>
                    Chrome, Firefox, and reading apps permit standard non-blocking overlays.
                    Android automatically suppresses overlays if a site opens a system payment
                    or autofill sheet.
                  </p>
                </div>
              </div>
            )}

            {simulatedApp === 'video' && (
              <div className="space-y-4 pt-3">
                <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#222B53] bg-gradient-to-br from-[#0D1430] via-[#131A3C] to-[#080C1C] p-4 text-center">
                  <Video className="h-7 w-7 text-[#818CF8]" />
                  <p className="mt-2 text-xs font-semibold text-[#EEF2FF]">
                    {drmProtectedVideo
                      ? 'DRM Protected Stream (Widevine L1)'
                      : 'Standard Video Playback'}
                  </p>
                  <p className="mt-1 text-[11px] text-[#9EB0D4]">
                    {drmProtectedVideo
                      ? 'Android hardware surface blocks overlays during DRM video.'
                      : 'Movie Ambient mode softly frames the screen perimeter.'}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#1F2950] bg-[#0C1127] p-3.5">
                  <div className="pr-3">
                    <p className="text-xs font-medium text-[#EEF2FF]">
                      Simulate DRM Protected Player
                    </p>
                    <p className="text-[11px] text-[#8D9EC1]">
                      Demonstrates honest Android Widevine overlay restriction
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={drmProtectedVideo}
                    onClick={() => setDrmProtectedVideo((v) => !v)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      drmProtectedVideo ? 'bg-[#6366F1]' : 'bg-[#232D55]'
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                        drmProtectedVideo ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {drmProtectedVideo && isRunningService && (
                  <div className="rounded-xl border border-[#5B4320] bg-[#1E170C] p-3 text-xs leading-relaxed text-[#FDE68A]">
                    Overlay paused by Android hardware video protection. Some streaming apps
                    (such as Netflix or Prime Video) restrict floating overlays during protected
                    playback.
                  </div>
                )}
              </div>
            )}

            {simulatedApp === 'banking' && (
              <div className="space-y-4 pt-4">
                <div className="rounded-2xl border border-[#26315D] bg-[#0B1024] p-4 text-center">
                  <Lock className="mx-auto h-7 w-7 text-[#93C5FD]" />
                  <h4 className="mt-2 text-sm font-semibold text-[#EEF2FF]">
                    Secure Banking Screen
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#A5B4CF]">
                    FLAG_SECURE Active · Protected Financial Input
                  </p>
                </div>

                <div className="rounded-2xl border border-[#5B4320] bg-[#1D160B] p-4 text-xs leading-relaxed text-[#FDE68A]">
                  <p className="font-semibold text-[#FEF3C7]">
                    Overlay Automatically Hidden for Security
                  </p>
                  <p className="mt-1.5 text-[#FDE68A]/90">
                    Android blocks overlays over banking apps, password prompts, and system
                    permission screens to prevent tapjacking. AI Mind Wave never attempts to
                    bypass these protections.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Non-Blocking Transparent Android Overlay Canvas */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <AmbientLightCanvas
              settings={settings}
              active={overlayVisiblyDrawing}
              scaleFactor={0.88}
            />
          </div>

          {/* Android Gesture Navigation Pill */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 left-1/2 z-40 h-1 w-28 -translate-x-1/2 rounded-full bg-white/30"
          />
        </div>
      </div>
    </div>
  );
}
