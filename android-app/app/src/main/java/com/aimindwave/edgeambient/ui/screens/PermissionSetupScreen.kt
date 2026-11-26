package com.aimindwave.edgeambient.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.aimindwave.edgeambient.ui.theme.MindWaveColors
import com.aimindwave.edgeambient.util.PermissionAudit

@Composable
fun PermissionSetupScreen(
    permissions: PermissionAudit,
    onRequestOverlayPermission: () -> Unit,
    onRequestNotificationPermission: () -> Unit,
    onRequestBatteryUnrestricted: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MindWaveColors.DeepObsidian),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 18.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "Permissions & Reliability Setup",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MindWaveColors.LunarWhite
                )
                Text(
                    text = "Global Phone Mode never activates secretly. Review and grant only the permissions Android needs to display subtle edge light safely.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MindWaveColors.TextSecondary
                )
            }
        }

        item {
            PermissionStepCard(
                stepLabel = "Step 1 · Required",
                title = "Display Over Other Apps",
                description = "Allows AI Mind Wave to render a transparent, non-interactive light edge while you read, browse, or use supported apps. Touch events pass directly through.",
                granted = permissions.overlayGranted,
                buttonLabel = if (permissions.overlayGranted) "Manage Overlay Setting" else "Allow Display Over Apps",
                onClick = onRequestOverlayPermission
            )
        }

        item {
            PermissionStepCard(
                stepLabel = "Step 2 · Recommended (Android 13+)",
                title = "Persistent Foreground Notification",
                description = "Shows an always-visible silent notification whenever Global Phone Mode is running, with quick Pause, Resume, and Stop controls.",
                granted = permissions.notificationGranted,
                buttonLabel = if (permissions.notificationGranted) "Notification Settings" else "Allow Notifications",
                onClick = onRequestNotificationPermission
            )
        }

        item {
            PermissionStepCard(
                stepLabel = "Step 3 · Optional Reliability",
                title = "Unrestricted Battery Usage",
                description = "Helps prevent Android manufacturers (Samsung, Xiaomi, OnePlus, Vivo) from terminating the foreground ambient service during long sessions.",
                granted = permissions.batteryUnrestricted,
                buttonLabel = if (permissions.batteryUnrestricted) "Battery Unrestricted" else "Optimize Battery Setting",
                onClick = onRequestBatteryUnrestricted
            )
        }

        item {
            Surface(
                color = MindWaveColors.NightSurface,
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, MindWaveColors.SubtleBorder)
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Where Android Restricts Overlays",
                        style = MaterialTheme.typography.titleLarge,
                        color = MindWaveColors.LunarWhite
                    )
                    Text(
                        text = "For security and privacy, Android intentionally blocks floating overlays on certain screens. AI Mind Wave fully respects these system boundaries:",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MindWaveColors.TextSecondary
                    )
                    RestrictionBullet("Banking, payment, and password manager apps using FLAG_SECURE")
                    RestrictionBullet("Android system permission dialogs and Settings security prompts")
                    RestrictionBullet("DRM-protected fullscreen video players (Netflix, Prime Video, etc.)")
                    RestrictionBullet("Active voice calls and lockscreen (automatically paused by AI Mind Wave)")
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}

@Composable
private fun PermissionStepCard(
    stepLabel: String,
    title: String,
    description: String,
    granted: Boolean,
    buttonLabel: String,
    onClick: () -> Unit
) {
    Surface(
        color = MindWaveColors.NightSurface,
        shape = RoundedCornerShape(20.dp),
        border = BorderStroke(
            1.dp,
            if (granted) MindWaveColors.ActiveEmerald.copy(alpha = 0.45f) else MindWaveColors.SubtleBorder
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stepLabel,
                    style = MaterialTheme.typography.labelMedium,
                    color = MindWaveColors.TextMuted
                )
                Text(
                    text = if (granted) "Granted" else "Action Needed",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = if (granted) MindWaveColors.ActiveEmerald else MindWaveColors.PausedAmber
                )
            }

            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                color = MindWaveColors.LunarWhite
            )

            Text(
                text = description,
                style = MaterialTheme.typography.bodyMedium,
                color = MindWaveColors.TextSecondary
            )

            if (granted) {
                OutlinedButton(
                    onClick = onClick,
                    border = BorderStroke(1.dp, MindWaveColors.SubtleBorder),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(buttonLabel, color = MindWaveColors.LunarWhite)
                }
            } else {
                Button(
                    onClick = onClick,
                    colors = ButtonDefaults.buttonColors(containerColor = MindWaveColors.IndigoPrimary),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(buttonLabel, color = Color.White)
                }
            }
        }
    }
}

@Composable
private fun RestrictionBullet(text: String) {
    Text(
        text = "•  $text",
        style = MaterialTheme.typography.bodyMedium,
        color = MindWaveColors.TextSecondary
    )
}
