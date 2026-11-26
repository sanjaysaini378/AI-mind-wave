package com.aimindwave.edgeambient.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.aimindwave.edgeambient.model.LightMode
import com.aimindwave.edgeambient.model.LightSettings
import com.aimindwave.edgeambient.model.OverlayRuntimeState
import com.aimindwave.edgeambient.model.OverlayStatusSnapshot
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.mindWaveDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "ai_mind_wave_settings"
)

/**
 * In-process reactive state bus keeping MainActivity and OverlayService synchronized.
 */
object OverlayStateBus {
    private val _status = MutableStateFlow(OverlayStatusSnapshot())
    val status: StateFlow<OverlayStatusSnapshot> = _status.asStateFlow()

    fun update(snapshot: OverlayStatusSnapshot) {
        _status.value = snapshot
    }

    fun updateState(
        state: OverlayRuntimeState,
        mode: LightMode = _status.value.activeMode,
        remainingSeconds: Long? = _status.value.remainingTimerSeconds,
        note: String? = null,
        nightDimmed: Boolean = _status.value.nightDimmingApplied
    ) {
        _status.value = OverlayStatusSnapshot(
            state = state,
            activeMode = mode,
            remainingTimerSeconds = remainingSeconds,
            statusNote = note,
            nightDimmingApplied = nightDimmed
        )
    }
}

class SettingsRepository(private val context: Context) {

    private object Keys {
        val MODE = stringPreferencesKey("light_mode")
        val INTENSITY = floatPreferencesKey("intensity")
        val SPEED = floatPreferencesKey("speed")
        val EDGE_THICKNESS_DP = floatPreferencesKey("edge_thickness_dp")
        val CENTRAL_GLOW = floatPreferencesKey("central_glow")
        val CUSTOM_ACCENT_COLOR = intPreferencesKey("custom_accent_color")
        val USE_CUSTOM_COLOR = booleanPreferencesKey("use_custom_color")
        val TRANSPARENCY = floatPreferencesKey("transparency")
        val AUTO_NIGHT_MODE = booleanPreferencesKey("auto_night_mode")
        val NIGHT_START_HOUR = intPreferencesKey("night_start_hour")
        val NIGHT_END_HOUR = intPreferencesKey("night_end_hour")
        val TIMER_MINUTES = intPreferencesKey("timer_minutes")
        val RESTART_ON_BOOT = booleanPreferencesKey("restart_on_boot")
    }

    val settingsFlow: Flow<LightSettings> = context.mindWaveDataStore.data.map { prefs ->
        LightSettings(
            mode = LightMode.fromId(prefs[Keys.MODE]),
            intensity = (prefs[Keys.INTENSITY] ?: 0.72f).coerceIn(0.15f, 1.0f),
            speed = (prefs[Keys.SPEED] ?: 0.75f).coerceIn(0.35f, 1.35f),
            edgeThicknessDp = (prefs[Keys.EDGE_THICKNESS_DP] ?: 28f).coerceIn(12f, 56f),
            centralGlow = (prefs[Keys.CENTRAL_GLOW] ?: 0.42f).coerceIn(0.0f, 0.85f),
            customAccentColor = prefs[Keys.CUSTOM_ACCENT_COLOR] ?: 0xFF6366F1.toInt(),
            useCustomColor = prefs[Keys.USE_CUSTOM_COLOR] ?: false,
            transparency = (prefs[Keys.TRANSPARENCY] ?: 0.65f).coerceIn(0.20f, 0.90f),
            autoNightMode = prefs[Keys.AUTO_NIGHT_MODE] ?: true,
            nightStartHour = prefs[Keys.NIGHT_START_HOUR] ?: 22,
            nightEndHour = prefs[Keys.NIGHT_END_HOUR] ?: 6,
            timerMinutes = prefs[Keys.TIMER_MINUTES] ?: 20,
            restartOnBoot = prefs[Keys.RESTART_ON_BOOT] ?: false
        )
    }

    suspend fun getCurrentSettings(): LightSettings = settingsFlow.first()

    suspend fun updateSettings(transform: (LightSettings) -> LightSettings) {
        context.mindWaveDataStore.edit { prefs ->
            val current = LightSettings(
                mode = LightMode.fromId(prefs[Keys.MODE]),
                intensity = (prefs[Keys.INTENSITY] ?: 0.72f).coerceIn(0.15f, 1.0f),
                speed = (prefs[Keys.SPEED] ?: 0.75f).coerceIn(0.35f, 1.35f),
                edgeThicknessDp = (prefs[Keys.EDGE_THICKNESS_DP] ?: 28f).coerceIn(12f, 56f),
                centralGlow = (prefs[Keys.CENTRAL_GLOW] ?: 0.42f).coerceIn(0.0f, 0.85f),
                customAccentColor = prefs[Keys.CUSTOM_ACCENT_COLOR] ?: 0xFF6366F1.toInt(),
                useCustomColor = prefs[Keys.USE_CUSTOM_COLOR] ?: false,
                transparency = (prefs[Keys.TRANSPARENCY] ?: 0.65f).coerceIn(0.20f, 0.90f),
                autoNightMode = prefs[Keys.AUTO_NIGHT_MODE] ?: true,
                nightStartHour = prefs[Keys.NIGHT_START_HOUR] ?: 22,
                nightEndHour = prefs[Keys.NIGHT_END_HOUR] ?: 6,
                timerMinutes = prefs[Keys.TIMER_MINUTES] ?: 20,
                restartOnBoot = prefs[Keys.RESTART_ON_BOOT] ?: false
            )
            val updated = transform(current)
            prefs[Keys.MODE] = updated.mode.id
            prefs[Keys.INTENSITY] = updated.intensity.coerceIn(0.15f, 1.0f)
            prefs[Keys.SPEED] = updated.speed.coerceIn(0.35f, 1.35f)
            prefs[Keys.EDGE_THICKNESS_DP] = updated.edgeThicknessDp.coerceIn(12f, 56f)
            prefs[Keys.CENTRAL_GLOW] = updated.centralGlow.coerceIn(0.0f, 0.85f)
            prefs[Keys.CUSTOM_ACCENT_COLOR] = updated.customAccentColor
            prefs[Keys.USE_CUSTOM_COLOR] = updated.useCustomColor
            prefs[Keys.TRANSPARENCY] = updated.transparency.coerceIn(0.20f, 0.90f)
            prefs[Keys.AUTO_NIGHT_MODE] = updated.autoNightMode
            prefs[Keys.NIGHT_START_HOUR] = updated.nightStartHour.coerceIn(0, 23)
            prefs[Keys.NIGHT_END_HOUR] = updated.nightEndHour.coerceIn(0, 23)
            prefs[Keys.TIMER_MINUTES] = updated.timerMinutes.coerceIn(0, 180)
            prefs[Keys.RESTART_ON_BOOT] = updated.restartOnBoot
        }
    }
}
