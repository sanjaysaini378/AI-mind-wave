package com.aimindwave.edgeambient.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.PowerSettingsNew
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.material.icons.rounded.Stop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aimindwave.edgeambient.model.LightMode
import com.aimindwave.edgeambient.model.LightSettings
import com.aimindwave.edgeambient.model.OverlayRuntimeState
import com.aimindwave.edgeambient.model.OverlayStatusSnapshot
import com.aimindwave.edgeambient.ui.theme.MindWaveColors
import com.aimindwave.edgeambient.util.PermissionAudit
import kotlin.math.roundToInt

private val AccentSwatches = listOf(
    0xFF6366F1.toInt(), // Indigo
    0xFF7C3AED.toInt(), // Violet
    0xFF2563EB.toInt(), // Deep Blue
    0xFF4338CA.toInt(), // Royal Indigo
    0xFF9333EA.toInt(), // Mystic Purple
    0xFF38BDF8.toInt(), // Soft Lunar Blue
    0xFFE0E7FF.toInt()  // Soft White
)

private val TimerOptionsMinutes = listOf(0, 10, 20, 30, 45, 60)

@Composable
fun HomeScreen(
    settings: LightSettings,
    status: OverlayStatusSnapshot,
    permissions: PermissionAudit,
    onToggleGlobalMode: () -> Unit,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onStop: () -> Unit,
    onOpenPermissions: () -> Unit,
    onUpdateSettings: ((LightSettings) -> LightSettings) -> Unit
) {
    val isRunning = status.state == OverlayRuntimeState.ACTIVE ||
        status.state == OverlayRuntimeState.PAUSED ||
        status.state == OverlayRuntimeState.AUTO_HIDDEN

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MindWaveColors.DeepObsidian),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 18.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // 1. Primary Global Phone Mode Activation Card
        item {
            GlobalActivationCard(
                status = status,
                settings = settings,
                permissions = permissions,
                isRunning = isRunning,
                onToggleGlobalMode = onToggleGlobalMode,
                onPause = onPause,
                onResume = onResume,
                onStop = onStop,
                onOpenPermissions = onOpenPermissions
            )
        }

        // 2. Light Modes Selector (including Silent Shiv Nada)
        item {
            SectionHeader(
                title = "Visual Meditation Modes",
                subtitle = "Silent ambient light waves with zero audio and zero vibration."
            )
            Spacer(modifier = Modifier.height(10.dp))
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                LightMode.entries.forEach { mode ->
                    ModeSelectionRow(
                        mode = mode,
                        selected = settings.mode == mode,
                        onSelect = { onUpdateSettings { it.copy(mode = mode) } }
                    )
                }
            }
        }

        // 3. Light Controls
        item {
            SectionHeader(
                title = "Light & Wave Controls",
                subtitle = "Adjust illumination safely. Speed is capped to prevent rapid flashing."
            )
            Spacer(modifier = Modifier.height(10.dp))
            Surface(
                color = MindWaveColors.NightSurface,
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, MindWaveColors.SubtleBorder)
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    LabeledSlider(
                        label = "Light Intensity",
                        valueLabel = "${(settings.intensity * 100).roundToInt()}%",
                        value = settings.intensity,
                        range = 0.15f..1.0f,
                        onValueChange = { v -> onUpdateSettings { it.copy(intensity = v) } }
                    )
                    LabeledSlider(
                        label = "Animation Speed (Slow Safe Range)",
                        valueLabel = String.format("%.2fx", settings.speed),
                        value = settings.speed,
                        range = 0.35f..1.35f,
                        onValueChange = { v -> onUpdateSettings { it.copy(speed = v) } }
                    )
                    LabeledSlider(
                        label = "Edge Thickness",
                        valueLabel = "${settings.edgeThicknessDp.roundToInt()} dp",
                        value = settings.edgeThicknessDp,
                        range = 12f..56f,
                        onValueChange = { v -> onUpdateSettings { it.copy(edgeThicknessDp = v) } }
                    )
                    LabeledSlider(
                        label = "Central Glow & Sacred Geometry",
                        valueLabel = "${(settings.centralGlow * 100).roundToInt()}%",
                        value = settings.centralGlow,
                        range = 0.0f..0.85f,
                        onValueChange = { v -> onUpdateSettings { it.copy(centralGlow = v) } }
                    )
                    LabeledSlider(
                        label = "Overlay Opacity",
                        valueLabel = "${(settings.transparency * 100).roundToInt()}%",
                        value = settings.transparency,
                        range = 0.20f..0.90f,
                        onValueChange = { v -> onUpdateSettings { it.copy(transparency = v) } }
                    )

                    HorizontalDivider(color = MindWaveColors.SubtleBorder)

                    // Color selection
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Custom Accent Tint",
                                style = MaterialTheme.typography.titleMedium,
                                color = MindWaveColors.LunarWhite
                            )
                            Text(
                                text = "Blend a custom hue into the active mode palette",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MindWaveColors.TextMuted
                            )
                        }
                        Switch(
                            checked = settings.useCustomColor,
                            onCheckedChange = { checked ->
                                onUpdateSettings { it.copy(useCustomColor = checked) }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = MindWaveColors.IndigoPrimary
                            )
                        )
                    }

                    if (settings.useCustomColor) {
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            items(AccentSwatches) { colorInt ->
                                val isSelected = settings.customAccentColor == colorInt
                                Box(
                                    modifier = Modifier
                                        .size(38.dp)
                                        .clip(CircleShape)
                                        .background(Color(colorInt))
                                        .border(
                                            width = if (isSelected) 3.dp else 1.dp,
                                            color = if (isSelected) Color.White else MindWaveColors.SubtleBorder,
                                            shape = CircleShape
                                        )
                                        .clickable {
                                            onUpdateSettings { it.copy(customAccentColor = colorInt) }
                                        }
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = MindWaveColors.SubtleBorder)

                    // Auto Night Mode
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Automatic Night Mode",
                                style = MaterialTheme.typography.titleMedium,
                                color = MindWaveColors.LunarWhite
                            )
                            Text(
                                text = "Gently dims edge luminance between ${settings.nightStartHour}:00 and ${settings.nightEndHour}:00",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MindWaveColors.TextMuted
                            )
                        }
                        Switch(
                            checked = settings.autoNightMode,
                            onCheckedChange = { checked ->
                                onUpdateSettings { it.copy(autoNightMode = checked) }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = MindWaveColors.IndigoPrimary
                            )
                        )
                    }

                    HorizontalDivider(color = MindWaveColors.SubtleBorder)

                    // Auto-Off Timer
                    Text(
                        text = "Session Timer & Auto-Off",
                        style = MaterialTheme.typography.titleMedium,
                        color = MindWaveColors.LunarWhite
                    )
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(TimerOptionsMinutes) { minutes ->
                            val selected = settings.timerMinutes == minutes
                            val label = if (minutes == 0) "Continuous" else "${minutes} min"
                            Surface(
                                color = if (selected) MindWaveColors.IndigoPrimary else MindWaveColors.ElevatedSurface,
                                shape = RoundedCornerShape(12.dp),
                                border = BorderStroke(
                                    1.dp,
                                    if (selected) MindWaveColors.IndigoBright else MindWaveColors.SubtleBorder
                                ),
                                modifier = Modifier.clickable {
                                    onUpdateSettings { it.copy(timerMinutes = minutes) }
                                }
                            ) {
                                Text(
                                    text = label,
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 9.dp),
                                    style = MaterialTheme.typography.labelMedium,
                                    color = if (selected) Color.White else MindWaveColors.TextSecondary
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = MindWaveColors.SubtleBorder)

                    // Optional Restart After Reboot (explicit opt-in)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Restart After Phone Reboot",
                                style = MaterialTheme.typography.titleMedium,
                                color = MindWaveColors.LunarWhite
                            )
                            Text(
                                text = "Optional: resume Global Phone Mode after restart only if overlay permission remains granted.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MindWaveColors.TextMuted
                            )
                        }
                        Switch(
                            checked = settings.restartOnBoot,
                            onCheckedChange = { checked ->
                                onUpdateSettings { it.copy(restartOnBoot = checked) }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = MindWaveColors.IndigoPrimary
                            )
                        )
                    }
                }
            }
        }

        // 4. Safety & Android System Overlay Notice
        item {
            Surface(
                color = MindWaveColors.NightSurface,
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, MindWaveColors.SubtleBorder)
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Shield,
                            contentDescription = null,
                            tint = MindWaveColors.IndigoBright,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "Visual Meditation & System Safety",
                            style = MaterialTheme.typography.titleMedium,
                            color = MindWaveColors.LunarWhite
                        )
                    }
                    Text(
                        text = "AI Mind Wave provides a purely visual ambient light experience. It does not produce sound waves, activate supernatural states, or trigger vibration. Android automatically hides overlays on banking apps, password fields, DRM video players, and system permission dialogs for your security.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MindWaveColors.TextSecondary
                    )
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}

@Composable
private fun GlobalActivationCard(
    status: OverlayStatusSnapshot,
    settings: LightSettings,
    permissions: PermissionAudit,
    isRunning: Boolean,
    onToggleGlobalMode: () -> Unit,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onStop: () -> Unit,
    onOpenPermissions: () -> Unit
) {
    val stateText = when (status.state) {
        OverlayRuntimeState.ACTIVE -> "Global Phone Mode Active"
        OverlayRuntimeState.PAUSED -> "Global Phone Mode Paused"
        OverlayRuntimeState.AUTO_HIDDEN -> "Auto-Hidden (System Protected)"
        OverlayRuntimeState.OFF -> "Global Phone Mode Off"
    }

    val stateColor = when (status.state) {
        OverlayRuntimeState.ACTIVE -> MindWaveColors.ActiveEmerald
        OverlayRuntimeState.PAUSED, OverlayRuntimeState.AUTO_HIDDEN -> MindWaveColors.PausedAmber
        OverlayRuntimeState.OFF -> MindWaveColors.TextMuted
    }

    Surface(
        color = MindWaveColors.NightSurface,
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(
            1.dp,
            if (isRunning) MindWaveColors.IndigoBright.copy(alpha = 0.65f) else MindWaveColors.SubtleBorder
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(22.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = stateText,
                style = MaterialTheme.typography.titleMedium,
                color = stateColor,
                fontWeight = FontWeight.SemiBold
            )

            // Large unmistakable ON / OFF circular activation button
            val buttonBrush = if (isRunning) {
                Brush.radialGradient(
                    colors = listOf(
                        MindWaveColors.IndigoBright,
                        MindWaveColors.IndigoPrimary,
                        MindWaveColors.VioletAccent
                    )
                )
            } else {
                Brush.radialGradient(
                    colors = listOf(
                        MindWaveColors.ElevatedSurface,
                        MindWaveColors.NightSurface
                    )
                )
            }

            Box(
                modifier = Modifier
                    .size(144.dp)
                    .clip(CircleShape)
                    .background(buttonBrush)
                    .border(
                        width = 2.dp,
                        color = if (isRunning) MindWaveColors.LunarWhite.copy(alpha = 0.7f) else MindWaveColors.SubtleBorder,
                        shape = CircleShape
                    )
                    .clickable(onClick = onToggleGlobalMode),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Rounded.PowerSettingsNew,
                        contentDescription = if (isRunning) "Turn Off Global Phone Mode" else "Turn On Global Phone Mode",
                        tint = MindWaveColors.LunarWhite,
                        modifier = Modifier.size(40.dp)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = if (isRunning) "ON" else "OFF",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MindWaveColors.LunarWhite
                    )
                }
            }

            Text(
                text = if (isRunning) {
                    val timerText = status.remainingTimerSeconds?.let { sec ->
                        String.format(" · %02d:%02d left", sec / 60, sec % 60)
                    } ?: ""
                    "${settings.mode.displayName}$timerText"
                } else {
                    "Tap to illuminate screen edges across apps wherever Android allows overlays."
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MindWaveColors.TextSecondary
            )

            if (!permissions.overlayGranted) {
                OutlinedButton(
                    onClick = onOpenPermissions,
                    border = BorderStroke(1.dp, MindWaveColors.IndigoBright),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Grant Display Over Other Apps Permission",
                        color = MindWaveColors.LunarWhite
                    )
                }
            }

            // Explicit Start / Pause / Resume / Stop Controls
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (!isRunning) {
                    Button(
                        onClick = onToggleGlobalMode,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = MindWaveColors.IndigoPrimary),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Icon(Icons.Rounded.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Start Global Mode")
                    }
                } else {
                    if (status.state == OverlayRuntimeState.PAUSED) {
                        Button(
                            onClick = onResume,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = MindWaveColors.IndigoPrimary),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(Icons.Rounded.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Resume")
                        }
                    } else {
                        OutlinedButton(
                            onClick = onPause,
                            modifier = Modifier.weight(1f),
                            border = BorderStroke(1.dp, MindWaveColors.SubtleBorder),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(Icons.Rounded.Pause, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Pause", color = MindWaveColors.LunarWhite)
                        }
                    }

                    OutlinedButton(
                        onClick = onStop,
                        modifier = Modifier.weight(1f),
                        border = BorderStroke(1.dp, Color(0xFF7F1D1D)),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Icon(
                            Icons.Rounded.Stop,
                            contentDescription = null,
                            tint = Color(0xFFFCA5A5),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Stop", color = Color(0xFFFCA5A5))
                    }
                }
            }

            status.statusNote?.let { note ->
                Text(
                    text = note,
                    style = MaterialTheme.typography.labelMedium,
                    color = MindWaveColors.PausedAmber
                )
            }
        }
    }
}

@Composable
private fun ModeSelectionRow(
    mode: LightMode,
    selected: Boolean,
    onSelect: () -> Unit
) {
    Surface(
        color = if (selected) MindWaveColors.ElevatedSurface else MindWaveColors.NightSurface,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(
            width = if (selected) 1.5.dp else 1.dp,
            color = if (selected) MindWaveColors.IndigoBright else MindWaveColors.SubtleBorder
        ),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onSelect)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(
                            colors = listOf(
                                Color(mode.defaultSecondaryHex),
                                Color(mode.defaultAccentHex),
                                Color(mode.defaultGlowHex)
                            )
                        )
                    )
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = mode.displayName,
                    style = MaterialTheme.typography.titleMedium,
                    color = MindWaveColors.LunarWhite,
                    fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = mode.subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MindWaveColors.TextSecondary
                )
            }
        }
    }
}

@Composable
private fun SectionHeader(title: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            color = MindWaveColors.LunarWhite
        )
        Text(
            text = subtitle,
            style = MaterialTheme.typography.bodyMedium,
            color = MindWaveColors.TextMuted
        )
    }
}

@Composable
private fun LabeledSlider(
    label: String,
    valueLabel: String,
    value: Float,
    range: ClosedFloatingPointRange<Float>,
    onValueChange: (Float) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.titleMedium,
                color = MindWaveColors.LunarWhite
            )
            Text(
                text = valueLabel,
                style = MaterialTheme.typography.labelMedium,
                color = MindWaveColors.IndigoBright
            )
        }
        Slider(
            value = value,
            onValueChange = onValueChange,
            valueRange = range,
            colors = SliderDefaults.colors(
                thumbColor = MindWaveColors.LunarWhite,
                activeTrackColor = MindWaveColors.IndigoPrimary,
                inactiveTrackColor = MindWaveColors.SubtleBorder
            )
        )
    }
}
