package com.aimindwave.edgeambient.model

import androidx.annotation.ColorInt

/**
 * All visual meditation light modes supported by AI Mind Wave.
 * Strictly visual-only: zero audio, zero mantra playback, zero haptics.
 */
enum class LightMode(
    val id: String,
    val displayName: String,
    val subtitle: String,
    val defaultPrimaryHex: Long,
    val defaultSecondaryHex: Long,
    val defaultAccentHex: Long,
    val defaultGlowHex: Long,
    val baseCycleSeconds: Float,
    val supportsSacredGeometry: Boolean = false
) {
    SILENT_SHIV_NADA(
        id = "silent_shiv_nada",
        displayName = "Silent Shiv Nada",
        subtitle = "Slow 4-beat rhythmic light waves & sacred geometry in deep blue, indigo, violet, and lunar white. Completely silent.",
        defaultPrimaryHex = 0xFF1E1B4B,   // Deep midnight indigo
        defaultSecondaryHex = 0xFF4338CA, // Luminous indigo
        defaultAccentHex = 0xFF7C3AED,    // Soft violet
        defaultGlowHex = 0xFFE0E7FF,      // Soft lunar white
        baseCycleSeconds = 11.5f,
        supportsSacredGeometry = true
    ),
    COSMIC_LIGHT_RHYTHM(
        id = "cosmic_light_rhythm",
        displayName = "Cosmic Light Rhythm",
        subtitle = "Orbital breathing gradients sweeping gently along all four edges.",
        defaultPrimaryHex = 0xFF0F172A,
        defaultSecondaryHex = 0xFF2563EB,
        defaultAccentHex = 0xFF8B5CF6,
        defaultGlowHex = 0xFFC7D2FE,
        baseCycleSeconds = 13.0f
    ),
    INDIGO_DEEP_CALM(
        id = "indigo_deep_calm",
        displayName = "Indigo Deep Calm",
        subtitle = "Ultra-slow steady indigo perimeter glow for quiet reading and stillness.",
        defaultPrimaryHex = 0xFF172554,
        defaultSecondaryHex = 0xFF312E81,
        defaultAccentHex = 0xFF4F46E5,
        defaultGlowHex = 0xFFA5B4FC,
        baseCycleSeconds = 15.0f
    ),
    AJNA_FOCUS(
        id = "ajna_focus",
        displayName = "Ajna Focus",
        subtitle = "Balanced brow-center visual anchor with gentle peripheral framing.",
        defaultPrimaryHex = 0xFF1E1B4B,
        defaultSecondaryHex = 0xFF4F46E5,
        defaultAccentHex = 0xFF6D28D9,
        defaultGlowHex = 0xFFEDE9FE,
        baseCycleSeconds = 10.5f,
        supportsSacredGeometry = true
    ),
    MOVIE_AMBIENT(
        id = "movie_ambient",
        displayName = "Movie Ambient",
        subtitle = "Low-glare subtle edge framing designed for dim rooms and video viewing.",
        defaultPrimaryHex = 0xFF0B132B,
        defaultSecondaryHex = 0xFF1D4ED8,
        defaultAccentHex = 0xFF4338CA,
        defaultGlowHex = 0xFF93C5FD,
        baseCycleSeconds = 16.0f
    ),
    NIGHT_RELAX(
        id = "night_relax",
        displayName = "Night Relax",
        subtitle = "Dimmed warm-indigo low-luminance waves for evening wind-down.",
        defaultPrimaryHex = 0xFF130F26,
        defaultSecondaryHex = 0xFF3B2866,
        defaultAccentHex = 0xFF5B3B8C,
        defaultGlowHex = 0xFFD8CCF2,
        baseCycleSeconds = 18.0f
    ),
    ADAPTIVE_EDGE_LIGHT(
        id = "adaptive_edge_light",
        displayName = "Adaptive Edge Light",
        subtitle = "Automatically adjusts edge luminance for day vs. night hours with fluid perimeter drift.",
        defaultPrimaryHex = 0xFF0F2046,
        defaultSecondaryHex = 0xFF3730A3,
        defaultAccentHex = 0xFF6366F1,
        defaultGlowHex = 0xFFDBEAFE,
        baseCycleSeconds = 12.0f
    );

    companion object {
        fun fromId(id: String?): LightMode =
            entries.firstOrNull { it.id == id } ?: SILENT_SHIV_NADA
    }
}

enum class OverlayRuntimeState {
    OFF,
    ACTIVE,
    PAUSED,
    AUTO_HIDDEN
}

data class OverlayStatusSnapshot(
    val state: OverlayRuntimeState = OverlayRuntimeState.OFF,
    val activeMode: LightMode = LightMode.SILENT_SHIV_NADA,
    val remainingTimerSeconds: Long? = null,
    val statusNote: String? = null,
    val nightDimmingApplied: Boolean = false
)

data class LightSettings(
    val mode: LightMode = LightMode.SILENT_SHIV_NADA,
    /** Overall luminous strength (0.15f..1.0f) */
    val intensity: Float = 0.72f,
    /** Animation pace multiplier strictly capped to safe non-strobing range (0.35f..1.35f) */
    val speed: Float = 0.75f,
    /** Four-edge glow thickness in dp (12f..56f) */
    val edgeThicknessDp: Float = 28f,
    /** Central subtle glow & sacred geometry strength (0.0f..0.85f) */
    val centralGlow: Float = 0.42f,
    /** Optional custom accent tint override (ARGB Int) */
    @ColorInt val customAccentColor: Int = 0xFF6366F1.toInt(),
    val useCustomColor: Boolean = false,
    /** Overall overlay opacity (0.20f..0.90f) so underlying apps remain clearly readable */
    val transparency: Float = 0.65f,
    /** Automatically dims luminance during evening/night hours */
    val autoNightMode: Boolean = true,
    val nightStartHour: Int = 22,
    val nightEndHour: Int = 6,
    /** Auto-off timer in minutes (0 = continuous until stopped manually) */
    val timerMinutes: Int = 20,
    /** Optional user-consented restart after phone reboot (disabled by default) */
    val restartOnBoot: Boolean = false
)
