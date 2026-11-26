import { buildZipBlob, triggerDownload } from '../utils/zipExport';

export interface AndroidProjectFile {
  path: string;
  fileName: string;
  category: 'Kotlin Core' | 'Compose UI' | 'Manifest & Gradle' | 'Resources & Docs';
  language: string;
  content: string;
  lineCount: number;
}

const rawMainModules = import.meta.glob('/android-app/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const rawWorkflowModules = import.meta.glob('/android-app/.github/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const rawModules: Record<string, string> = {
  ...rawMainModules,
  ...rawWorkflowModules,
};

function classifyCategory(relPath: string): AndroidProjectFile['category'] {
  if (relPath.includes('/ui/')) return 'Compose UI';
  if (relPath.endsWith('.kt')) return 'Kotlin Core';
  if (
    relPath.endsWith('.kts') ||
    relPath.endsWith('.properties') ||
    relPath.endsWith('.pro') ||
    relPath.endsWith('.yml') ||
    relPath.endsWith('AndroidManifest.xml')
  ) {
    return 'Manifest & Gradle';
  }
  return 'Resources & Docs';
}

function detectLanguage(relPath: string): string {
  if (relPath.endsWith('.kt')) return 'Kotlin';
  if (relPath.endsWith('.kts')) return 'Gradle Kotlin DSL';
  if (relPath.endsWith('.xml')) return 'Android XML';
  if (relPath.endsWith('.yml')) return 'GitHub Actions YAML';
  if (relPath.endsWith('.md')) return 'Markdown';
  if (relPath.endsWith('.pro')) return 'ProGuard';
  return 'Config';
}

const PRIORITY_ORDER = [
  '.github/workflows/build-apk.yml',
  'app/src/main/java/com/aimindwave/edgeambient/MainActivity.kt',
  'app/src/main/java/com/aimindwave/edgeambient/service/OverlayService.kt',
  'app/src/main/java/com/aimindwave/edgeambient/overlay/AmbientLightCanvasView.kt',
  'app/src/main/java/com/aimindwave/edgeambient/model/LightModels.kt',
  'app/src/main/java/com/aimindwave/edgeambient/data/SettingsRepository.kt',
  'app/src/main/java/com/aimindwave/edgeambient/receiver/BootCompletedReceiver.kt',
  'app/src/main/java/com/aimindwave/edgeambient/util/PermissionHelper.kt',
  'app/src/main/java/com/aimindwave/edgeambient/ui/screens/HomeScreen.kt',
  'app/src/main/java/com/aimindwave/edgeambient/ui/screens/PermissionSetupScreen.kt',
  'app/src/main/java/com/aimindwave/edgeambient/ui/theme/Theme.kt',
  'app/src/main/AndroidManifest.xml',
  'app/build.gradle.kts',
  'build.gradle.kts',
  'settings.gradle.kts',
  'README_BUILD_APK.md',
];

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = Object.entries(rawModules)
  .map(([fullPath, content]) => {
    const relPath = fullPath.replace(/^\/android-app\//, '');
    const segments = relPath.split('/');
    return {
      path: relPath,
      fileName: segments[segments.length - 1],
      category: classifyCategory(relPath),
      language: detectLanguage(relPath),
      content,
      lineCount: content.split('\n').length,
    };
  })
  .sort((a, b) => {
    const idxA = PRIORITY_ORDER.indexOf(a.path);
    const idxB = PRIORITY_ORDER.indexOf(b.path);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.path.localeCompare(b.path);
  });

export function downloadAndroidProjectZip(): void {
  const zipEntries = ANDROID_PROJECT_FILES.map((file) => ({
    path: `AIMindWave-Android/${file.path}`,
    content: file.content,
  }));
  const blob = buildZipBlob(zipEntries);
  triggerDownload(blob, 'AI-Mind-Wave-Android-Project.zip');
}
