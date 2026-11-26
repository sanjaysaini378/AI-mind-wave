import { useState } from 'react';
import { Check, Cloud, Copy, Download, Laptop, Smartphone } from 'lucide-react';
import { downloadAndroidProjectZip } from '../data/androidProjectFiles';

type BuildMethod = 'android-phone' | 'free-cloud' | 'android-studio';

interface CommandBlockProps {
  id: string;
  label: string;
  command: string;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
}

function CommandBlock({ id, label, command, copiedId, onCopy }: CommandBlockProps) {
  const isCopied = copiedId === id;
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#20294E] bg-[#060916]">
      <div className="flex items-center justify-between border-b border-[#192142] px-3.5 py-2 text-[11px] text-[#8D9EC1]">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => onCopy(id, command)}
          className="flex items-center gap-1.5 text-[#C7D2FE] hover:text-white"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#34D399]" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-[#E0E7FF]">
        <code>{command}</code>
      </pre>
    </div>
  );
}

export function ApkBuildGuide() {
  const [method, setMethod] = useState<BuildMethod>('android-phone');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-[#EEF2FF] sm:text-3xl">
            Build the Android APK on Your Phone (Free, No PC Needed)
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
            Compile and install the native Kotlin APK directly from your Android phone using a
            free cloud builder (GitHub Actions) or AndroidIDE on-device—no laptop required.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadAndroidProjectZip}
          className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6366F1] whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          Download Project (.zip)
        </button>
      </div>

      {/* Method Tabs */}
      <div
        role="tablist"
        aria-label="APK build method"
        className="flex flex-wrap items-center gap-1 rounded-xl border border-[#222B52] bg-[#0B1023] p-1 w-fit"
      >
        <button
          role="tab"
          aria-selected={method === 'android-phone'}
          type="button"
          onClick={() => setMethod('android-phone')}
          className={`flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
            method === 'android-phone'
              ? 'bg-[#1D254D] text-[#EEF2FF]'
              : 'text-[#8D9EC1] hover:text-[#EEF2FF]'
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          Build on Android Phone
        </button>
        <button
          role="tab"
          aria-selected={method === 'free-cloud'}
          type="button"
          onClick={() => setMethod('free-cloud')}
          className={`flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
            method === 'free-cloud'
              ? 'bg-[#1D254D] text-[#EEF2FF]'
              : 'text-[#8D9EC1] hover:text-[#EEF2FF]'
          }`}
        >
          <Cloud className="h-3.5 w-3.5" />
          Free Online Site (GitHub)
        </button>
        <button
          role="tab"
          aria-selected={method === 'android-studio'}
          type="button"
          onClick={() => setMethod('android-studio')}
          className={`flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
            method === 'android-studio'
              ? 'bg-[#1D254D] text-[#EEF2FF]'
              : 'text-[#8D9EC1] hover:text-[#EEF2FF]'
          }`}
        >
          <Laptop className="h-3.5 w-3.5" />
          Local Android Studio
        </button>
      </div>

      {method === 'android-phone' && (
        <div className="space-y-5">
          {/* Option A: Phone + Free GitHub Cloud Build (Zero heavy storage on phone) */}
          <div className="rounded-2xl border border-[#2C3768] bg-[#0B1023] p-6">
            <p className="text-xs font-medium text-[#818CF8]">
              Option A · Easiest on Any Android Phone (100% Free Cloud Compile)
            </p>
            <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
              Compile APK via Free GitHub Actions Right From Your Phone
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
              Your downloaded ZIP already includes{' '}
              <span className="font-mono text-[#E0E7FF]">.github/workflows/build-apk.yml</span>.
              GitHub&apos;s free cloud server builds the APK for you in 2–3 minutes without
              filling your phone&apos;s storage.
            </p>

            <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#CBD5F5]">
              <li>
                <strong className="text-[#EEF2FF]">1.</strong> Tap{' '}
                <strong>Download Project (.zip)</strong> on your phone so{' '}
                <span className="font-mono text-xs text-[#E0E7FF]">
                  AI-Mind-Wave-Android-Project.zip
                </span>{' '}
                is saved in your <strong>Downloads</strong> folder.
              </li>
              <li>
                <strong className="text-[#EEF2FF]">2.</strong> Create a free repository at{' '}
                <span className="font-mono text-xs text-[#E0E7FF]">github.com/new</span> (for
                example, <span className="font-mono text-xs text-[#E0E7FF]">ai-mind-wave</span>
                ).
              </li>
              <li>
                <strong className="text-[#EEF2FF]">3.</strong> Push the ZIP from your phone in
                30 seconds using the free <strong>Termux</strong> app (from F-Droid) with the
                command below, or upload the extracted files on GitHub web (Desktop site mode).
              </li>
              <li>
                <strong className="text-[#EEF2FF]">4.</strong> Open your GitHub repo&apos;s{' '}
                <strong>Actions</strong> tab in Chrome, wait ~2 minutes for the green checkmark,
                and tap <strong>AI-Mind-Wave-APKs</strong> to download and install{' '}
                <span className="font-mono text-xs text-[#E0E7FF]">app-release.apk</span>{' '}
                directly on your phone.
              </li>
            </ol>

            <CommandBlock
              id="termux-push"
              label="Run in Termux on your Android phone (pushes full project + workflow to GitHub)"
              command={`pkg update -y && pkg install -y git unzip\ntermux-setup-storage\nmkdir -p ~/mindwave && cd ~/mindwave\nunzip -o ~/storage/downloads/AI-Mind-Wave-Android-Project.zip\ncd AIMindWave-Android\ngit init && git add -A && git commit -m "Build AI Mind Wave APK"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/ai-mind-wave.git\ngit push -u origin main`}
              copiedId={copiedId}
              onCopy={handleCopy}
            />
          </div>

          {/* Option B: 100% On-Device with AndroidIDE */}
          <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
            <p className="text-xs font-medium text-[#818CF8]">
              Option B · Build Locally Inside Your Phone (No GitHub Needed)
            </p>
            <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
              Compile Directly on Phone Using AndroidIDE (Free & Open Source)
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
              Requires a 64-bit Android phone (Android 10+, 4GB+ RAM, ~2.5GB free storage for
              Android SDK &amp; Gradle cache).
            </p>
            <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#CBD5F5]">
              <li>
                <strong className="text-[#EEF2FF]">1.</strong> Install free{' '}
                <strong>AndroidIDE</strong> from F-Droid or GitHub Releases and let its
                first-launch installer set up JDK 17 and Android Build Tools.
              </li>
              <li>
                <strong className="text-[#EEF2FF]">2.</strong> Extract{' '}
                <span className="font-mono text-xs text-[#E0E7FF]">
                  AI-Mind-Wave-Android-Project.zip
                </span>{' '}
                into your phone storage (e.g.,{' '}
                <span className="font-mono text-xs text-[#E0E7FF]">
                  /AndroidIDEProjects/AIMindWave-Android
                </span>
                ).
              </li>
              <li>
                <strong className="text-[#EEF2FF]">3.</strong> Open the folder in AndroidIDE,
                wait for Gradle Sync, then tap the <strong>Run / Build APK</strong> play icon.
              </li>
              <li>
                <strong className="text-[#EEF2FF]">4.</strong> AndroidIDE prompts to install the
                compiled APK straight onto your phone. Open <strong>AI Mind Wave → Permissions</strong>{' '}
                and grant <strong>Display Over Other Apps</strong>.
              </li>
            </ol>
          </div>
        </div>
      )}

      {method === 'free-cloud' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
              <p className="text-xs font-medium text-[#818CF8]">Step 01 · Download ZIP</p>
              <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
                Export the Ready-to-Build Project
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
                Click <strong>Download Project (.zip)</strong> and extract{' '}
                <span className="font-mono text-[#E0E7FF]">AIMindWave-Android</span>. It already
                contains{' '}
                <span className="font-mono text-[#E0E7FF]">
                  .github/workflows/build-apk.yml
                </span>{' '}
                configured with JDK 17, Android SDK 35, and Gradle 8.10.2.
              </p>
            </div>

            <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
              <p className="text-xs font-medium text-[#818CF8]">Step 02 · Free GitHub Repo</p>
              <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
                Upload to a Free GitHub Repository
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
                Sign in at <span className="font-mono text-[#E0E7FF]">github.com</span> (free
                account), click <strong>New repository</strong>, and upload the extracted files
                (including the <span className="font-mono text-[#E0E7FF]">.github</span> folder).
              </p>
              <CommandBlock
                id="git-push"
                label="Push project to trigger automatic APK build"
                command={`cd AIMindWave-Android\ngit init && git add -A && git commit -m "Initial AI Mind Wave"\ngit branch -M main && git remote add origin <YOUR_REPO_URL>\ngit push -u origin main`}
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </div>

            <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
              <p className="text-xs font-medium text-[#818CF8]">
                Step 03 · Automatic Cloud Compile
              </p>
              <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
                Download Compiled APK from Actions Tab
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
                Open your repository&apos;s <strong>Actions</strong> tab on GitHub. The{' '}
                <strong>Build AI Mind Wave APK (Free Cloud Build)</strong> workflow runs
                automatically (~2–3 minutes). Click the finished run and download{' '}
                <span className="font-mono text-[#E0E7FF]">AI-Mind-Wave-APKs</span>.
              </p>
            </div>

            <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
              <p className="text-xs font-medium text-[#818CF8]">
                Step 04 · Optional Cloud Signing
              </p>
              <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
                Signed Release APKs via Secrets
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
                Both <span className="font-mono text-[#E0E7FF]">app-debug.apk</span> and{' '}
                <span className="font-mono text-[#E0E7FF]">app-release.apk</span> are built
                automatically. To sign with your own Play Store keystore in GitHub Actions, add
                repository secrets:{' '}
                <span className="font-mono text-xs text-[#E0E7FF]">
                  KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD
                </span>
                .
              </p>
            </div>
          </div>

          {/* Alternative Free Cloud Sites */}
          <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
            <h3 className="text-base font-semibold text-[#EEF2FF]">
              Free Online Sites Compatible with This Project
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 text-xs leading-relaxed text-[#A5B4CF] sm:grid-cols-3">
              <div>
                <p className="font-semibold text-[#EEF2FF]">GitHub Actions (Recommended)</p>
                <p className="mt-1">
                  Free on public repos (2,000 free min/month on private repos). Zero installs;
                  downloads ready APK straight in your phone browser.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#EEF2FF]">Codemagic (Free Tier)</p>
                <p className="mt-1">
                  Connect your GitHub repo at codemagic.io (500 free build min/month) for visual
                  keystore upload and automatic APK email links.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#EEF2FF]">Firebase Studio / Cloud IDE</p>
                <p className="mt-1">
                  Import the repository into a free browser workspace to edit Kotlin files and
                  run <span className="font-mono text-[#E0E7FF]">gradle assembleRelease</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {method === 'android-studio' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
            <p className="text-xs font-medium text-[#818CF8]">Step 01 · Project Setup</p>
            <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
              Extract & Sync in Android Studio
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
              Unzip{' '}
              <span className="font-mono text-[#E0E7FF]">
                AI-Mind-Wave-Android-Project.zip
              </span>{' '}
              and open the <span className="font-mono text-[#E0E7FF]">AIMindWave-Android</span>{' '}
              folder via <strong>File → Open</strong>. Confirm Android SDK Platform 35 is
              installed in SDK Manager, then allow Gradle Sync to finish.
            </p>
          </div>

          <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
            <p className="text-xs font-medium text-[#818CF8]">Step 02 · Release Keystore</p>
            <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
              Create a Signing Keystore
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
              Generate your release signing key once, then copy{' '}
              <span className="font-mono text-[#E0E7FF]">keystore.properties.example</span> to{' '}
              <span className="font-mono text-[#E0E7FF]">keystore.properties</span> with your
              credentials.
            </p>
            <CommandBlock
              id="keytool"
              label="Generate release-keystore.jks"
              command={`keytool -genkey -v -keystore release-keystore.jks \\\n  -keyalg RSA -keysize 2048 -validity 10000 \\\n  -alias ai-mind-wave-release`}
              copiedId={copiedId}
              onCopy={handleCopy}
            />
          </div>

          <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
            <p className="text-xs font-medium text-[#818CF8]">Step 03 · Compile APK</p>
            <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
              Build Signed Release APK
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
              Use <strong>Build → Generate Signed App Bundle / APK → APK</strong> in Android
              Studio, or run Gradle from the project root directory.
            </p>
            <CommandBlock
              id="gradle"
              label="Compile release APK via Gradle"
              command={`./gradlew assembleRelease\n# Output: app/build/outputs/apk/release/app-release.apk`}
              copiedId={copiedId}
              onCopy={handleCopy}
            />
          </div>

          <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
            <p className="text-xs font-medium text-[#818CF8]">
              Step 04 · Device Installation
            </p>
            <h3 className="mt-1.5 text-lg font-semibold text-[#EEF2FF]">
              Install & Grant Overlay Permissions
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#A5B4CF]">
              Install over USB using ADB or copy{' '}
              <span className="font-mono text-[#E0E7FF]">app-release.apk</span> to your phone
              Downloads folder.
            </p>
            <CommandBlock
              id="adb"
              label="Install signed APK via USB Debugging"
              command={`adb install -r app/build/outputs/apk/release/app-release.apk`}
              copiedId={copiedId}
              onCopy={handleCopy}
            />
          </div>
        </div>
      )}

      {/* Battery Optimization Guidance by Manufacturer */}
      <div className="rounded-2xl border border-[#222B52] bg-[#0B1023] p-6">
        <h3 className="text-base font-semibold text-[#EEF2FF]">
          Android Battery Optimization Guidance (Android 10 – 15)
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#A5B4CF]">
          Foreground services stay most reliable when exempt from aggressive vendor background
          limits. AI Mind Wave includes a direct button to request unrestricted battery usage.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[#1C2447] pt-4 text-xs leading-relaxed text-[#A5B4CF] sm:grid-cols-3">
          <div>
            <p className="font-semibold text-[#EEF2FF]">Google Pixel & Stock Android</p>
            <p className="mt-1">
              App Info → App battery usage → Allow background usage → Unrestricted.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#EEF2FF]">Samsung Galaxy (One UI)</p>
            <p className="mt-1">
              App Info → Battery → Unrestricted, and remove from Sleeping / Deep Sleeping apps.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#EEF2FF]">Xiaomi, OnePlus & Oppo</p>
            <p className="mt-1">
              Enable Autostart (only if Reboot Restart is desired) and set Battery Saver to No
              restrictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
