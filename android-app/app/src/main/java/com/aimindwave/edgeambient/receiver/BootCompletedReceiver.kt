package com.aimindwave.edgeambient.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.util.Log
import com.aimindwave.edgeambient.data.SettingsRepository
import com.aimindwave.edgeambient.service.OverlayService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Optional boot receiver that restores Global Phone Mode ONLY when:
 * 1. The user explicitly enabled "Restart after phone reboot" in settings, AND
 * 2. Android's SYSTEM_ALERT_WINDOW permission is currently granted.
 *
 * Never starts silently without prior explicit user consent.
 */
class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action != Intent.ACTION_BOOT_COMPLETED && action != Intent.ACTION_MY_PACKAGE_REPLACED) {
            return
        }

        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val repo = SettingsRepository(context.applicationContext)
                val settings = repo.getCurrentSettings()
                if (settings.restartOnBoot && Settings.canDrawOverlays(context)) {
                    OverlayService.start(context.applicationContext)
                }
            } catch (e: Exception) {
                Log.e("AIMindWaveBoot", "Unable to restore Global Phone Mode after reboot", e)
            } finally {
                pendingResult.finish()
            }
        }
    }
}
