package com.aimindwave.edgeambient.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object MindWaveColors {
    val DeepObsidian = Color(0xFF050711)
    val NightSurface = Color(0xFF0C1022)
    val ElevatedSurface = Color(0xFF131934)
    val SubtleBorder = Color(0xFF232C52)
    val IndigoPrimary = Color(0xFF6366F1)
    val IndigoBright = Color(0xFF818CF8)
    val VioletAccent = Color(0xFF7C3AED)
    val LunarWhite = Color(0xFFEEF2FF)
    val TextSecondary = Color(0xFFA5B4CF)
    val TextMuted = Color(0xFF7C8DB0)
    val ActiveEmerald = Color(0xFF34D399)
    val PausedAmber = Color(0xFFFBBF24)
}

private val MindWaveDarkColorScheme = darkColorScheme(
    primary = MindWaveColors.IndigoPrimary,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF22255A),
    onPrimaryContainer = MindWaveColors.LunarWhite,
    secondary = MindWaveColors.VioletAccent,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFF2A1E52),
    onSecondaryContainer = Color(0xFFEDE9FE),
    background = MindWaveColors.DeepObsidian,
    onBackground = MindWaveColors.LunarWhite,
    surface = MindWaveColors.NightSurface,
    onSurface = MindWaveColors.LunarWhite,
    surfaceVariant = MindWaveColors.ElevatedSurface,
    onSurfaceVariant = MindWaveColors.TextSecondary,
    outline = MindWaveColors.SubtleBorder
)

private val MindWaveTypography = Typography(
    headlineMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        lineHeight = 30.sp,
        letterSpacing = (-0.3).sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 18.sp,
        lineHeight = 24.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 15.sp,
        lineHeight = 21.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 21.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp
    )
)

@Composable
fun AIMindWaveTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = MindWaveDarkColorScheme,
        typography = MindWaveTypography,
        content = content
    )
}
