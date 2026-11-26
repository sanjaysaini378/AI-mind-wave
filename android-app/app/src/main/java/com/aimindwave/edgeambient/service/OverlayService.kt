package com.aimindwave.edgeambient.service

import android.app.KeyguardManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.media.AudioManager
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.aimindwave.edgeambient.MainActivity
import com.aimindwave.edgeambient.R
import com.aimindwave.edgeambient.data.OverlayStateBus
import com.aimindwave.edgeambient.data.SettingsRepository
import com.aimindwave.edgeambient.model.LightSettings
import com.aimindwave.edgeambient.model.OverlayRuntimeState
import com.aimindwave.edgeambient.overlay.AmbientLightCanvasView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.Calendar

/**
 * Foreground Service managing Global Phone Mode ambient edge illumination.
 *
 * Key Android compliance & safety behaviors:
 * - Requires explicit user activation & granted SYSTEM_ALERT_WINDOW permission.
 * - Uses FLAG_NOT_TOUCHABLE | FLAG_NOT_FOCUSABLE so normal touches, keyboard,
 *   calls, notifications, and underlying apps are never blocked.
 * - Automatically hides rendering during screen-off, lockscreen, or active voice calls.
 * - Android naturally suppresses TYPE_APPLICATION_OVERLAY on secure system dialogs,
 *   permission prompts, and protected/DRM surfaces; this service handles those transitions gracefully.
 */
class OverlayService : Service() {

    companion object {
        private const val TAG = "AIMindWaveOverlaySvc"
        const val CHANNEL_ID = "ai_mind_wave_overlay_channel"
        const val NOTIFICATION_ID = 4108

        const val ACTION_START = "com.aimindwave.edgeambient.action.START"
        const val ACTION_PAUSE = "com.aimindwave.edgeambient.action.PAUSE"
        const val ACTION_RESUME = "com.aimindwave.edgeambient.action.RESUME"
        const val ACTION_STOP = "com.aimindwave.edgeambient.action.STOP"

        fun start(context: Context) {
            val intent = Intent(context, OverlayService::class.java).apply {
                action = ACTION_START
            }
            ContextCompat.startForegroundService(context, intent)
        }

        fun pause(context: Context) {
            val intent = Intent(context, OverlayService::class.java).apply {
                action = ACTION_PAUSE
            }
            context.startService(intent)
        }

        fun resume(context: Context) {
            val intent = Intent(context, OverlayService::class.java).apply {
                action = ACTION_RESUME
            }
            context.startService(intent)
        }

        fun stop(context: Context) {
            val intent = Intent(context, OverlayService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private lateinit var windowManager: WindowManager
    private lateinit var settingsRepository: SettingsRepository

    private var overlayView: AmbientLightCanvasView? = null
    private var currentSettings: LightSettings = LightSettings()
    private var userPaused: Boolean = false
    private var systemAutoHidden: Boolean = false
    private var remainingSeconds: Long? = null

    private var settingsObserverJob: Job? = null
    private var timerJob: Job? = null
    private var systemWatcherJob: Job? = null
    private var screenReceiverRegistered: Boolean = false

    private val screenStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_SCREEN_OFF -> {
                    setAutoHidden(true, "Paused while screen is off")
                }
                Intent.ACTION_USER_PRESENT, Intent.ACTION_SCREEN_ON -> {
                    evaluateSystemConditions()
                }
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        settingsRepository = SettingsRepository(applicationContext)
        createNotificationChannel()
        registerScreenReceiver()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                shutdownService()
                return START_NOT_STICKY
            }
            ACTION_PAUSE -> {
                userPaused = true
                overlayView?.pauseAnimation()
                overlayView?.visibility = View.GONE
                syncStatusAndNotification("Paused by user")
                return START_STICKY
            }
            ACTION_RESUME -> {
                userPaused = false
                evaluateSystemConditions()
                if (!systemAutoHidden) {
                    overlayView?.visibility = View.VISIBLE
                    overlayView?.startAnimation()
                }
                syncStatusAndNotification()
                return START_STICKY
            }
            ACTION_START, null -> {
                if (!Settings.canDrawOverlays(this)) {
                    OverlayStateBus.updateState(
                        state = OverlayRuntimeState.OFF,
                        note = "Overlay permission required before starting Global Phone Mode."
                    )
                    stopSelf()
                    return START_NOT_STICKY
                }
                userPaused = false
                startForegroundWithCompliance()
                attachOverlayIfNeeded()
                observeSettings()
                startSystemConditionWatcher()
                return START_STICKY
            }
            else -> return START_STICKY
        }
    }

    private fun startForegroundWithCompliance() {
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun attachOverlayIfNeeded() {
        if (overlayView != null) return

        val view = AmbientLightCanvasView(applicationContext)
        val layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            }
        }

        try {
            windowManager.addView(view, layoutParams)
            overlayView = view
            view.startAnimation()
        } catch (e: SecurityException) {
            Log.e(TAG, "Overlay permission revoked while adding window", e)
            OverlayStateBus.updateState(
                state = OverlayRuntimeState.OFF,
                note = "Overlay permission was revoked in Android Settings."
            )
            shutdownService()
        } catch (e: WindowManager.BadTokenException) {
            Log.e(TAG, "Unable to attach overlay window token", e)
            OverlayStateBus.updateState(
                state = OverlayRuntimeState.OFF,
                note = "Android temporarily blocked the overlay window."
            )
            shutdownService()
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error attaching ambient light overlay", e)
            OverlayStateBus.updateState(
                state = OverlayRuntimeState.OFF,
                note = "Unable to start ambient overlay: ${e.localizedMessage ?: "System error"}"
            )
            shutdownService()
        }
    }

    private fun observeSettings() {
        if (settingsObserverJob != null) return
        settingsObserverJob = serviceScope.launch {
            var previousTimerMinutes = -1
            settingsRepository.settingsFlow.collectLatest { settings ->
                currentSettings = settings
                val nightDim = computeNightDimMultiplier(settings)
                overlayView?.applySettings(settings, nightDim)

                if (settings.timerMinutes != previousTimerMinutes) {
                    previousTimerMinutes = settings.timerMinutes
                    configureAutoOffTimer(settings.timerMinutes)
                }

                syncStatusAndNotification()
            }
        }
    }

    private fun configureAutoOffTimer(timerMinutes: Int) {
        timerJob?.cancel()
        if (timerMinutes <= 0) {
            remainingSeconds = null
            syncStatusAndNotification()
            return
        }

        remainingSeconds = timerMinutes * 60L
        timerJob = serviceScope.launch {
            while (isActive && (remainingSeconds ?: 0L) > 0L) {
                delay(1_000L)
                if (!userPaused && !systemAutoHidden) {
                    remainingSeconds = (remainingSeconds ?: 1L) - 1L
                    if ((remainingSeconds ?: 0L) % 15L == 0L || (remainingSeconds ?: 0L) <= 10L) {
                        syncStatusAndNotification()
                    }
                }
            }
            if (isActive && remainingSeconds == 0L) {
                OverlayStateBus.updateState(
                    state = OverlayRuntimeState.OFF,
                    mode = currentSettings.mode,
                    remainingSeconds = null,
                    note = "Auto-off meditation timer completed."
                )
                shutdownService()
            }
        }
    }

    /**
     * Periodically checks non-invasive system states (revoked overlay permission,
     * active voice call, lockscreen, or night-mode clock rollover) so the overlay
     * never interferes with calls, security screens, or revoked permissions.
     */
    private fun startSystemConditionWatcher() {
        if (systemWatcherJob != null) return
        systemWatcherJob = serviceScope.launch {
            while (isActive) {
                if (!Settings.canDrawOverlays(this@OverlayService)) {
                    OverlayStateBus.updateState(
                        state = OverlayRuntimeState.OFF,
                        note = "Overlay permission was turned off in Android Settings."
                    )
                    shutdownService()
                    return@launch
                }
                evaluateSystemConditions()
                overlayView?.applySettings(currentSettings, computeNightDimMultiplier(currentSettings))
                delay(2_500L)
            }
        }
    }

    private fun evaluateSystemConditions() {
        val keyguardManager = getSystemService(KEYGUARD_SERVICE) as? KeyguardManager
        val isLocked = keyguardManager?.isKeyguardLocked == true

        val audioManager = getSystemService(AUDIO_SERVICE) as? AudioManager
        val audioMode = audioManager?.mode ?: AudioManager.MODE_NORMAL
        val inCall = audioMode == AudioManager.MODE_IN_CALL ||
            audioMode == AudioManager.MODE_IN_COMMUNICATION ||
            audioMode == AudioManager.MODE_RINGTONE

        when {
            isLocked -> setAutoHidden(true, "Hidden while device is locked")
            inCall -> setAutoHidden(true, "Automatically paused during active call")
            else -> setAutoHidden(false, null)
        }
    }

    private fun setAutoHidden(hidden: Boolean, reason: String?) {
        if (systemAutoHidden == hidden) return
        systemAutoHidden = hidden
        if (hidden) {
            overlayView?.pauseAnimation()
            overlayView?.visibility = View.GONE
        } else if (!userPaused) {
            overlayView?.visibility = View.VISIBLE
            overlayView?.startAnimation()
        }
        syncStatusAndNotification(reason)
    }

    private fun computeNightDimMultiplier(settings: LightSettings): Float {
        if (!settings.autoNightMode) return 1.0f
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        val inNightWindow = if (settings.nightStartHour > settings.nightEndHour) {
            hour >= settings.nightStartHour || hour < settings.nightEndHour
        } else {
            hour in settings.nightStartHour until settings.nightEndHour
        }
        return if (inNightWindow) 0.58f else 1.0f
    }

    private fun syncStatusAndNotification(note: String? = null) {
        val runtimeState = when {
            userPaused -> OverlayRuntimeState.PAUSED
            systemAutoHidden -> OverlayRuntimeState.AUTO_HIDDEN
            else -> OverlayRuntimeState.ACTIVE
        }
        val nightDimmed = computeNightDimMultiplier(currentSettings) < 0.99f

        OverlayStateBus.updateState(
            state = runtimeState,
            mode = currentSettings.mode,
            remainingSeconds = remainingSeconds,
            note = note,
            nightDimmed = nightDimmed
        )

        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIFICATION_ID, buildNotification())
    }

    private fun buildNotification(): Notification {
        val openAppIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val pauseOrResumeAction = if (userPaused) {
            val resumeIntent = PendingIntent.getService(
                this,
                1,
                Intent(this, OverlayService::class.java).setAction(ACTION_RESUME),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            NotificationCompat.Action.Builder(0, getString(R.string.action_resume), resumeIntent).build()
        } else {
            val pauseIntent = PendingIntent.getService(
                this,
                2,
                Intent(this, OverlayService::class.java).setAction(ACTION_PAUSE),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            NotificationCompat.Action.Builder(0, getString(R.string.action_pause), pauseIntent).build()
        }

        val stopIntent = PendingIntent.getService(
            this,
            3,
            Intent(this, OverlayService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val stopAction = NotificationCompat.Action.Builder(0, getString(R.string.action_stop), stopIntent).build()

        val stateLabel = when {
            userPaused -> "Paused"
            systemAutoHidden -> "Auto-hidden"
            else -> "Active"
        }

        val timerSuffix = remainingSeconds?.let { sec ->
            val mins = sec / 60
            val rem = sec % 60
            String.format(" · %02d:%02d left", mins, rem)
        } ?: ""

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_mind_wave)
            .setContentTitle("AI Mind Wave · ${currentSettings.mode.displayName}")
            .setContentText("Global Phone Mode $stateLabel$timerSuffix (Silent visual light)")
            .setContentIntent(openAppIntent)
            .setOngoing(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .addAction(pauseOrResumeAction)
            .addAction(stopAction)
            .build()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            getString(R.string.notification_channel_name),
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = getString(R.string.notification_channel_desc)
            setSound(null, null)
            enableVibration(false)
            enableLights(false)
            setShowBadge(false)
        }
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        nm.createNotificationChannel(channel)
    }

    private fun registerScreenReceiver() {
        if (screenReceiverRegistered) return
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_USER_PRESENT)
        }
        ContextCompat.registerReceiver(
            this,
            screenStateReceiver,
            filter,
            ContextCompat.RECEIVER_NOT_EXPORTED
        )
        screenReceiverRegistered = true
    }

    private fun shutdownService() {
        timerJob?.cancel()
        systemWatcherJob?.cancel()
        settingsObserverJob?.cancel()
        detachOverlay()
        OverlayStateBus.updateState(
            state = OverlayRuntimeState.OFF,
            mode = currentSettings.mode,
            remainingSeconds = null
        )
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun detachOverlay() {
        overlayView?.let { view ->
            view.stopAnimation()
            try {
                windowManager.removeViewImmediate(view)
            } catch (e: Exception) {
                Log.w(TAG, "Overlay view already detached", e)
            }
        }
        overlayView = null
    }

    override fun onDestroy() {
        if (screenReceiverRegistered) {
            try {
                unregisterReceiver(screenStateReceiver)
            } catch (_: IllegalArgumentException) {
            }
            screenReceiverRegistered = false
        }
        detachOverlay()
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
