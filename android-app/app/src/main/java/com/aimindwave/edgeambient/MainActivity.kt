package com.aimindwave.edgeambient

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.Security
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.aimindwave.edgeambient.data.OverlayStateBus
import com.aimindwave.edgeambient.data.SettingsRepository
import com.aimindwave.edgeambient.model.LightSettings
import com.aimindwave.edgeambient.model.OverlayRuntimeState
import com.aimindwave.edgeambient.service.OverlayService
import com.aimindwave.edgeambient.ui.screens.HomeScreen
import com.aimindwave.edgeambient.ui.screens.PermissionSetupScreen
import com.aimindwave.edgeambient.ui.theme.AIMindWaveTheme
import com.aimindwave.edgeambient.ui.theme.MindWaveColors
import com.aimindwave.edgeambient.util.PermissionAudit
import com.aimindwave.edgeambient.util.PermissionHelper
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var settingsRepository: SettingsRepository
    private var permissionAudit by mutableStateOf(
        PermissionAudit(
            overlayGranted = false,
            notificationGranted = true,
            batteryUnrestricted = false
        )
    )
    private var selectedTab by mutableIntStateOf(0)

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) {
        refreshPermissions()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        settingsRepository = SettingsRepository(applicationContext)
        refreshPermissions()

        setContent {
            AIMindWaveTheme {
                val settings by settingsRepository.settingsFlow.collectAsState(initial = LightSettings())
                val status by OverlayStateBus.status.collectAsState()

                MainScaffold(
                    selectedTab = selectedTab,
                    onSelectTab = { selectedTab = it },
                    settings = settings,
                    status = status,
                    permissions = permissionAudit,
                    onToggleGlobalMode = { handleGlobalToggle(status.state) },
                    onPause = { OverlayService.pause(this) },
                    onResume = { OverlayService.resume(this) },
                    onStop = { OverlayService.stop(this) },
                    onRequestOverlay = { PermissionHelper.openOverlayPermissionSettings(this) },
                    onRequestNotification = { requestNotificationPermission() },
                    onRequestBattery = { PermissionHelper.openBatteryOptimizationSettings(this) },
                    onUpdateSettings = { transform ->
                        lifecycleScope.launch {
                            settingsRepository.updateSettings(transform)
                        }
                    }
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        refreshPermissions()
    }

    private fun refreshPermissions() {
        permissionAudit = PermissionHelper.audit(this)
    }

    private fun handleGlobalToggle(currentState: OverlayRuntimeState) {
        val isActiveOrPaused = currentState != OverlayRuntimeState.OFF
        if (isActiveOrPaused) {
            OverlayService.stop(this)
            return
        }

        if (!PermissionHelper.hasOverlayPermission(this)) {
            selectedTab = 1
            PermissionHelper.openOverlayPermissionSettings(this)
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            !PermissionHelper.hasNotificationPermission(this)
        ) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }

        OverlayService.start(this)
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (!PermissionHelper.hasNotificationPermission(this)) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            } else {
                PermissionHelper.openNotificationSettings(this)
            }
        } else {
            PermissionHelper.openNotificationSettings(this)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScaffold(
    selectedTab: Int,
    onSelectTab: (Int) -> Unit,
    settings: LightSettings,
    status: com.aimindwave.edgeambient.model.OverlayStatusSnapshot,
    permissions: PermissionAudit,
    onToggleGlobalMode: () -> Unit,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onStop: () -> Unit,
    onRequestOverlay: () -> Unit,
    onRequestNotification: () -> Unit,
    onRequestBattery: () -> Unit,
    onUpdateSettings: ((LightSettings) -> LightSettings) -> Unit
) {
    Scaffold(
        containerColor = MindWaveColors.DeepObsidian,
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = "AI Mind Wave",
                        color = MindWaveColors.LunarWhite
                    )
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MindWaveColors.DeepObsidian
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MindWaveColors.NightSurface,
                contentColor = MindWaveColors.LunarWhite
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { onSelectTab(0) },
                    icon = { Icon(Icons.Rounded.AutoAwesome, contentDescription = "Global Mode") },
                    label = { Text("Global Mode") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MindWaveColors.LunarWhite,
                        selectedTextColor = MindWaveColors.LunarWhite,
                        indicatorColor = MindWaveColors.IndigoPrimary.copy(alpha = 0.25f),
                        unselectedIconColor = MindWaveColors.TextMuted,
                        unselectedTextColor = MindWaveColors.TextMuted
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { onSelectTab(1) },
                    icon = { Icon(Icons.Rounded.Security, contentDescription = "Permissions") },
                    label = { Text("Permissions") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MindWaveColors.LunarWhite,
                        selectedTextColor = MindWaveColors.LunarWhite,
                        indicatorColor = MindWaveColors.IndigoPrimary.copy(alpha = 0.25f),
                        unselectedIconColor = MindWaveColors.TextMuted,
                        unselectedTextColor = MindWaveColors.TextMuted
                    )
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MindWaveColors.DeepObsidian)
                .padding(innerPadding)
        ) {
            if (selectedTab == 0) {
                HomeScreen(
                    settings = settings,
                    status = status,
                    permissions = permissions,
                    onToggleGlobalMode = onToggleGlobalMode,
                    onPause = onPause,
                    onResume = onResume,
                    onStop = onStop,
                    onOpenPermissions = { onSelectTab(1) },
                    onUpdateSettings = onUpdateSettings
                )
            } else {
                PermissionSetupScreen(
                    permissions = permissions,
                    onRequestOverlayPermission = onRequestOverlay,
                    onRequestNotificationPermission = onRequestNotification,
                    onRequestBatteryUnrestricted = onRequestBattery
                )
            }
        }
    }
}
