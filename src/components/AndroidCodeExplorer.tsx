import { useMemo, useState } from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import {
  ANDROID_PROJECT_FILES,
  AndroidProjectFile,
  downloadAndroidProjectZip,
} from '../data/androidProjectFiles';

const CATEGORIES: Array<'All' | AndroidProjectFile['category']> = [
  'All',
  'Kotlin Core',
  'Compose UI',
  'Manifest & Gradle',
  'Resources & Docs',
];

export function AndroidCodeExplorer() {
  const [selectedCategory, setSelectedCategory] =
    useState<'All' | AndroidProjectFile['category']>('All');
  const [selectedPath, setSelectedPath] = useState<string>(
    ANDROID_PROJECT_FILES[0]?.path ?? ''
  );
  const [copied, setCopied] = useState(false);

  const filteredFiles = useMemo(() => {
    if (selectedCategory === 'All') return ANDROID_PROJECT_FILES;
    return ANDROID_PROJECT_FILES.filter((f) => f.category === selectedCategory);
  }, [selectedCategory]);

  const activeFile = useMemo(() => {
    return (
      ANDROID_PROJECT_FILES.find((f) => f.path === selectedPath) ??
      filteredFiles[0] ??
      ANDROID_PROJECT_FILES[0]
    );
  }, [selectedPath, filteredFiles]);

  const handleCopyFile = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#222B52] bg-[#0A0E1F]">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-[#1D2547] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#EEF2FF]">
            Native Android Studio Project ({ANDROID_PROJECT_FILES.length} files)
          </h3>
          <p className="mt-1 text-sm text-[#9EB0D4]">
            Kotlin 2.0 · Jetpack Compose Material 3 · Android SDK 35 (minSdk 29 / Android 10+)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#222B52] bg-[#060916] p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  const firstInCat =
                    cat === 'All'
                      ? ANDROID_PROJECT_FILES[0]
                      : ANDROID_PROJECT_FILES.find((f) => f.category === cat);
                  if (firstInCat) setSelectedPath(firstInCat.path);
                }}
                className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#1D254D] text-[#EEF2FF]'
                    : 'text-[#8D9EC1] hover:text-[#EEF2FF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={downloadAndroidProjectZip}
            className="flex min-h-[42px] items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#6366F1] whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            Download Android Project (.zip)
          </button>
        </div>
      </div>

      {/* Split Explorer & Code Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* File List */}
        <aside className="max-h-[580px] overflow-y-auto border-b border-[#1D2547] p-3 lg:col-span-4 lg:border-r lg:border-b-0 mindwave-scroll">
          <div className="space-y-1">
            {filteredFiles.map((file) => {
              const isSelected = activeFile?.path === file.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedPath(file.path)}
                  className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-[#171F42] text-[#EEF2FF]'
                      : 'text-[#A5B4CF] hover:bg-[#111730] hover:text-[#EEF2FF]'
                  }`}
                >
                  <FileCode2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      isSelected ? 'text-[#818CF8]' : 'text-[#6A7BA3]'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{file.fileName}</p>
                    <p className="truncate font-mono text-[11px] text-[#7888AE]">
                      {file.path}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#7888AE]">
                    {file.lineCount}L
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Code Viewer */}
        <div className="flex flex-col lg:col-span-8">
          {activeFile && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1D2547] bg-[#0D1229] px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-medium text-[#EEF2FF]">
                    {activeFile.path}
                  </p>
                  <p className="text-[11px] text-[#8D9EC1]">
                    {activeFile.language} · {activeFile.lineCount} lines
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyFile}
                  className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#293463] bg-[#131B3B] px-3 py-1.5 text-xs font-medium text-[#EEF2FF] transition-colors hover:bg-[#1C2752] whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#34D399]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy File
                    </>
                  )}
                </button>
              </div>

              <div className="max-h-[520px] overflow-auto bg-[#060916] p-4 font-mono text-[12px] leading-relaxed text-[#D6E0FF] mindwave-scroll">
                <pre className="m-0">
                  <code>
                    {activeFile.content.split('\n').map((line, idx) => (
                      <div key={idx} className="table-row">
                        <span className="table-cell select-none pr-4 text-right tabular-nums text-[#4E5E88]">
                          {idx + 1}
                        </span>
                        <span className="table-cell whitespace-pre">{line}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
