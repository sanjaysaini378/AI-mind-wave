export type LightModeId =
  | 'silent_shiv_nada'
  | 'cosmic_light_rhythm'
  | 'indigo_deep_calm'
  | 'ajna_focus'
  | 'movie_ambient'
  | 'night_relax'
  | 'adaptive_edge_light';

export interface LightModeSpec {
  id: LightModeId;
  name: string;
  shortNote: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  lunar: string;
  baseCycleSeconds: number;
  supportsSacredGeometry: boolean;
  attenuation: number;
}

export type OverlayRuntimeState = 'off' | 'active' | 'paused' | 'auto_hidden';

export type SimulatedAppId =
  | 'home'
  | 'reading'
  | 'browsing'
  | 'video'
  | 'banking';

export interface LightSettings {
  mode: LightModeId;
  intensity: number; // 0.15 - 1.0
  speed: number; // 0.35 - 1.35 (strictly capped slow non-strobing range)
  edgeThickness: number; // 12 - 56
  centralGlow: number; // 0.0 - 0.85
  useCustomColor: boolean;
  customAccentColor: string;
  transparency: number; // 0.20 - 0.90
  autoNightMode: boolean;
  simulateNightHours: boolean;
  timerMinutes: number; // 0 = continuous
  restartOnBoot: boolean;
}

export interface PermissionState {
  overlayGranted: boolean;
  notificationGranted: boolean;
  batteryUnrestricted: boolean;
}

export const LIGHT_MODES: LightModeSpec[] = [
  {
    id: 'silent_shiv_nada',
    name: 'Silent Shiv Nada',
    shortNote: '4-beat rhythmic light waves · Sacred geometry · Zero audio',
    description:
      'Slow expanding and contracting light waves in deep blue, indigo, violet, and soft lunar white with subtle central sacred geometry. Completely silent with zero vibration.',
    primary: '#1E1B4B',
    secondary: '#4338CA',
    accent: '#7C3AED',
    lunar: '#E0E7FF',
    baseCycleSeconds: 11.5,
    supportsSacredGeometry: true,
    attenuation: 0.92,
  },
  {
    id: 'cosmic_light_rhythm',
    name: 'Cosmic Light Rhythm',
    shortNote: 'Orbital breathing perimeter gradients',
    description:
      'Unfolding indigo and cobalt waves drifting slowly along all four screen edges in continuous orbital stillness.',
    primary: '#0F172A',
    secondary: '#2563EB',
    accent: '#8B5CF6',
    lunar: '#C7D2FE',
    baseCycleSeconds: 13.0,
    supportsSacredGeometry: false,
    attenuation: 0.9,
  },
  {
    id: 'indigo_deep_calm',
    name: 'Indigo Deep Calm',
    shortNote: 'Ultra-slow perimeter stillness for reading',
    description:
      'Gentle low-contrast midnight indigo edge framing engineered to keep reading and browsing effortless.',
    primary: '#172554',
    secondary: '#312E81',
    accent: '#4F46E5',
    lunar: '#A5B4FC',
    baseCycleSeconds: 15.0,
    supportsSacredGeometry: false,
    attenuation: 0.78,
  },
  {
    id: 'ajna_focus',
    name: 'Ajna Focus',
    shortNote: 'Centered visual anchor · Subtle peripheral halo',
    description:
      'A calm upper-center luminous visual point paired with soft violet-indigo edge waves for quiet visual meditation.',
    primary: '#1E1B4B',
    secondary: '#4F46E5',
    accent: '#6D28D9',
    lunar: '#EDE9FE',
    baseCycleSeconds: 10.5,
    supportsSacredGeometry: true,
    attenuation: 0.9,
  },
  {
    id: 'movie_ambient',
    name: 'Movie Ambient',
    shortNote: 'Low-glare ambient edge framing for dim rooms',
    description:
      'Subtle cinema-friendly perimeter illumination that softens screen contrast in darkened rooms without obstructing playback.',
    primary: '#0B132B',
    secondary: '#1D4ED8',
    accent: '#4338CA',
    lunar: '#93C5FD',
    baseCycleSeconds: 16.0,
    supportsSacredGeometry: false,
    attenuation: 0.58,
  },
  {
    id: 'night_relax',
    name: 'Night Relax',
    shortNote: 'Dimmed evening luminance · Slow wind-down',
    description:
      'Reduced-luminance dusky violet and deep slate waves tuned for gentle evening relaxation before rest.',
    primary: '#130F26',
    secondary: '#3B2866',
    accent: '#5B3B8C',
    lunar: '#D8CCF2',
    baseCycleSeconds: 18.0,
    supportsSacredGeometry: false,
    attenuation: 0.52,
  },
  {
    id: 'adaptive_edge_light',
    name: 'Adaptive Edge Light',
    shortNote: 'Day/night adaptive perimeter luminescence',
    description:
      'Automatically softens edge brightness during configured night hours while maintaining clear daytime edge presence.',
    primary: '#0F2046',
    secondary: '#3730A3',
    accent: '#6366F1',
    lunar: '#DBEAFE',
    baseCycleSeconds: 12.0,
    supportsSacredGeometry: false,
    attenuation: 0.88,
  },
];

export const ACCENT_SWATCHES = [
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Violet', hex: '#7C3AED' },
  { name: 'Deep Blue', hex: '#2563EB' },
  { name: 'Royal Indigo', hex: '#4338CA' },
  { name: 'Amethyst', hex: '#9333EA' },
  { name: 'Lunar Blue', hex: '#38BDF8' },
  { name: 'Soft White', hex: '#E0E7FF' },
];

export const DEFAULT_SETTINGS: LightSettings = {
  mode: 'silent_shiv_nada',
  intensity: 0.74,
  speed: 0.75,
  edgeThickness: 28,
  centralGlow: 0.44,
  useCustomColor: false,
  customAccentColor: '#6366F1',
  transparency: 0.68,
  autoNightMode: true,
  simulateNightHours: false,
  timerMinutes: 20,
  restartOnBoot: false,
};

export function getLightModeSpec(id: LightModeId): LightModeSpec {
  return LIGHT_MODES.find((m) => m.id === id) ?? LIGHT_MODES[0];
}
