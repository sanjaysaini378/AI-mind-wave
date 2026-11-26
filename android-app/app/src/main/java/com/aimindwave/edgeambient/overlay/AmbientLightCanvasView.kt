package com.aimindwave.edgeambient.overlay

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.Shader
import android.os.SystemClock
import android.util.TypedValue
import android.view.Choreographer
import android.view.View
import com.aimindwave.edgeambient.model.LightMode
import com.aimindwave.edgeambient.model.LightSettings
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/**
 * Hardware-accelerated, non-interactive transparent Android overlay View.
 * Renders four-edge ambient illumination, slow rhythmic breathing waves,
 * and subtle sacred-geometry light patterns for Silent Shiv Nada & other modes.
 *
 * Safety guarantees:
 * - Strictly visual only: zero sound, zero haptics.
 * - Smooth sinusoidal easing capped at low frequencies (no rapid flashing or strobing).
 * - Non-focusable & non-clickable so touch events pass directly through to apps below.
 */
class AmbientLightCanvasView(context: Context) : View(context), Choreographer.FrameCallback {

    private var settings: LightSettings = LightSettings()
    private var nightDimFactor: Float = 1.0f
    private var isAnimating: Boolean = false
    private var isPaused: Boolean = false
    private var phaseSeconds: Float = 0f
    private var lastFrameMs: Long = 0L

    private val edgePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }
    private val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }
    private val geometryStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }
    private val reusablePath = Path()

    init {
        setWillNotDraw(false)
        isClickable = false
        isFocusable = false
        isFocusableInTouchMode = false
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
        setLayerType(LAYER_TYPE_HARDWARE, null)
    }

    fun applySettings(newSettings: LightSettings, nightDimMultiplier: Float) {
        settings = newSettings
        nightDimFactor = nightDimMultiplier.coerceIn(0.35f, 1.0f)
        if (!isPaused) {
            invalidate()
        }
    }

    fun startAnimation() {
        if (isAnimating && !isPaused) return
        isPaused = false
        isAnimating = true
        lastFrameMs = SystemClock.uptimeMillis()
        Choreographer.getInstance().removeFrameCallback(this)
        Choreographer.getInstance().postFrameCallback(this)
    }

    fun pauseAnimation() {
        isPaused = true
        isAnimating = false
        Choreographer.getInstance().removeFrameCallback(this)
        invalidate()
    }

    fun stopAnimation() {
        isPaused = false
        isAnimating = false
        Choreographer.getInstance().removeFrameCallback(this)
    }

    override fun doFrame(frameTimeNanos: Long) {
        if (!isAnimating || isPaused) return

        val nowMs = SystemClock.uptimeMillis()
        val dtSec = ((nowMs - lastFrameMs).coerceIn(0L, 64L)) / 1000f
        lastFrameMs = nowMs

        // Strictly slow, soothing progression (never strobing)
        val safeSpeed = settings.speed.coerceIn(0.35f, 1.35f)
        phaseSeconds = (phaseSeconds + dtSec * safeSpeed) % 3600f

        invalidate()
        Choreographer.getInstance().postFrameCallback(this)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopAnimation()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (isPaused || width == 0 || height == 0) return

        val w = width.toFloat()
        val h = height.toFloat()
        val mode = settings.mode

        // Compute effective luminance budget with Auto Night dimming & safe ceiling
        val modeAttenuation = when (mode) {
            LightMode.MOVIE_AMBIENT -> 0.58f
            LightMode.NIGHT_RELAX -> 0.52f
            LightMode.INDIGO_DEEP_CALM -> 0.78f
            else -> 0.92f
        }
        val masterAlpha = (settings.intensity * settings.transparency * nightDimFactor * modeAttenuation)
            .coerceIn(0.06f, 0.82f)

        val cycleSec = mode.baseCycleSeconds
        val omega = (2.0 * PI / cycleSec).toFloat()

        // Smooth organic breathing envelope (0.62..1.0) - never sudden brightness jumps
        val breath = when (mode) {
            LightMode.SILENT_SHIV_NADA -> {
                // Symbolic 4-beat rhythmic light cadence ("Shiv • Shiv • Shiv • Shiv Naad")
                // Smooth primary inhale/exhale layered with gentle 4-harmonic ripple
                val primary = 0.5f + 0.5f * sin(phaseSeconds * omega)
                val fourBeat = 0.5f + 0.5f * sin(phaseSeconds * omega * 4f - (PI / 2.0).toFloat())
                0.60f + 0.28f * primary + 0.12f * fourBeat
            }
            LightMode.COSMIC_LIGHT_RHYTHM -> {
                0.62f + 0.38f * (0.5f + 0.5f * sin(phaseSeconds * omega))
            }
            LightMode.NIGHT_RELAX -> {
                0.70f + 0.30f * (0.5f + 0.5f * sin(phaseSeconds * omega * 0.8f))
            }
            else -> {
                0.66f + 0.34f * (0.5f + 0.5f * sin(phaseSeconds * omega))
            }
        }

        val primaryColor = mode.defaultPrimaryHex.toInt()
        val secondaryColor = if (settings.useCustomColor) {
            blendColors(mode.defaultSecondaryHex.toInt(), settings.customAccentColor, 0.65f)
        } else {
            mode.defaultSecondaryHex.toInt()
        }
        val accentColor = if (settings.useCustomColor) {
            settings.customAccentColor
        } else {
            mode.defaultAccentHex.toInt()
        }
        val lunarWhite = mode.defaultGlowHex.toInt()

        val baseThicknessPx = dpToPx(settings.edgeThicknessDp)
        val breathingThickness = baseThicknessPx * (0.85f + 0.30f * breath)

        // 1. Four-edge diffused illumination with smooth corner continuity
        drawFourEdgeGlow(
            canvas = canvas,
            w = w,
            h = h,
            thickness = breathingThickness,
            alpha = masterAlpha * breath,
            primary = primaryColor,
            secondary = secondaryColor,
            accent = accentColor,
            lunar = lunarWhite,
            drift = phaseSeconds * omega
        )

        // 2. Subtle central glow + sacred geometry visual meditation layer
        if (settings.centralGlow > 0.02f) {
            drawCentralMeditationLayer(
                canvas = canvas,
                w = w,
                h = h,
                mode = mode,
                alpha = masterAlpha * settings.centralGlow * breath,
                secondary = secondaryColor,
                accent = accentColor,
                lunar = lunarWhite,
                breath = breath,
                omega = omega
            )
        }
    }

    private fun drawFourEdgeGlow(
        canvas: Canvas,
        w: Float,
        h: Float,
        thickness: Float,
        alpha: Float,
        primary: Int,
        secondary: Int,
        accent: Int,
        lunar: Int,
        drift: Float
    ) {
        val shiftA = 0.5f + 0.5f * sin(drift)
        val shiftB = 0.5f + 0.5f * cos(drift * 0.7f)

        val topEdgeColor = blendColors(secondary, accent, shiftA)
        val bottomEdgeColor = blendColors(primary, accent, shiftB)
        val leftEdgeColor = blendColors(secondary, lunar, shiftB * 0.35f)
        val rightEdgeColor = blendColors(accent, secondary, shiftA)

        // Top edge
        edgePaint.shader = LinearGradient(
            0f, 0f, 0f, thickness,
            intArrayOf(
                withAlpha(lunar, alpha * 0.55f),
                withAlpha(topEdgeColor, alpha * 0.85f),
                withAlpha(primary, alpha * 0.32f),
                Color.TRANSPARENT
            ),
            floatArrayOf(0f, 0.22f, 0.62f, 1f),
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(0f, 0f, w, thickness, edgePaint)

        // Bottom edge
        edgePaint.shader = LinearGradient(
            0f, h, 0f, h - thickness,
            intArrayOf(
                withAlpha(lunar, alpha * 0.45f),
                withAlpha(bottomEdgeColor, alpha * 0.82f),
                withAlpha(primary, alpha * 0.30f),
                Color.TRANSPARENT
            ),
            floatArrayOf(0f, 0.22f, 0.62f, 1f),
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(0f, h - thickness, w, h, edgePaint)

        // Left edge
        edgePaint.shader = LinearGradient(
            0f, 0f, thickness, 0f,
            intArrayOf(
                withAlpha(lunar, alpha * 0.50f),
                withAlpha(leftEdgeColor, alpha * 0.82f),
                withAlpha(primary, alpha * 0.28f),
                Color.TRANSPARENT
            ),
            floatArrayOf(0f, 0.22f, 0.62f, 1f),
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(0f, 0f, thickness, h, edgePaint)

        // Right edge
        edgePaint.shader = LinearGradient(
            w, 0f, w - thickness, 0f,
            intArrayOf(
                withAlpha(lunar, alpha * 0.50f),
                withAlpha(rightEdgeColor, alpha * 0.82f),
                withAlpha(primary, alpha * 0.28f),
                Color.TRANSPARENT
            ),
            floatArrayOf(0f, 0.22f, 0.62f, 1f),
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(w - thickness, 0f, w, h, edgePaint)

        // Soft orbiting perimeter wave highlights (gentle traveling luminescence along edges)
        val orbRadius = thickness * 2.6f
        val orbAngle = drift * 0.65f
        val orbX = w * 0.5f + (w * 0.48f) * cos(orbAngle)
        val orbY = h * 0.5f + (h * 0.48f) * sin(orbAngle)

        glowPaint.shader = RadialGradient(
            orbX, orbY, orbRadius,
            intArrayOf(
                withAlpha(lunar, alpha * 0.48f),
                withAlpha(accent, alpha * 0.24f),
                Color.TRANSPARENT
            ),
            floatArrayOf(0f, 0.45f, 1f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(orbX, orbY, orbRadius, glowPaint)

        // Opposing harmonic wave highlight for symmetrical stillness
        val oppX = w - orbX
        val oppY = h - orbY
        glowPaint.shader = RadialGradient(
            oppX, oppY, orbRadius,
            intArrayOf(
                withAlpha(secondary, alpha * 0.42f),
                withAlpha(primary, alpha * 0.20f),
                Color.TRANSPARENT
            ),
            floatArrayOf(0f, 0.45f, 1f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(oppX, oppY, orbRadius, glowPaint)
    }

    private fun drawCentralMeditationLayer(
        canvas: Canvas,
        w: Float,
        h: Float,
        mode: LightMode,
        alpha: Float,
        secondary: Int,
        accent: Int,
        lunar: Int,
        breath: Float,
        omega: Float
    ) {
        val cx = w * 0.5f
        val cy = if (mode == LightMode.AJNA_FOCUS) h * 0.44f else h * 0.50f
        val minDim = min(w, h)
        val haloRadius = minDim * (0.28f + 0.08f * breath)

        // Keep central veil ultra-subtle so underlying apps remain effortlessly readable
        val veilAlpha = (alpha * 0.34f).coerceAtMost(0.32f)

        glowPaint.shader = RadialGradient(
            cx, cy, haloRadius,
            intArrayOf(
                withAlpha(lunar, veilAlpha * 0.85f),
                withAlpha(accent, veilAlpha * 0.48f),
                withAlpha(secondary, veilAlpha * 0.20f),
                Color.TRANSPARENT
            ),
            floatArrayOf(0f, 0.32f, 0.68f, 1f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(cx, cy, haloRadius, glowPaint)

        // Expanding concentric visual wave ripples & sacred geometry for Silent Shiv Nada / Ajna Focus
        if (mode.supportsSacredGeometry) {
            val strokeBase = dpToPx(1.2f)
            val geometryAlpha = (alpha * 0.42f).coerceAtMost(0.36f)

            // 4 concentric breathing rings (symbolic 4-beat Silent Shiv Nada light waves)
            for (i in 0 until 4) {
                val waveProgress = ((phaseSeconds / mode.baseCycleSeconds) + i * 0.25f) % 1.0f
                val ringRadius = minDim * (0.06f + waveProgress * 0.34f)
                // Bell-curve fade in and out so rings never pop abruptly
                val ringFade = sin(waveProgress * PI).toFloat()
                geometryStrokePaint.strokeWidth = strokeBase * (1.2f - 0.5f * waveProgress)
                geometryStrokePaint.color = withAlpha(
                    if (i % 2 == 0) lunar else accent,
                    geometryAlpha * ringFade * 0.78f
                )
                canvas.drawCircle(cx, cy, ringRadius, geometryStrokePaint)
            }

            // Sacred geometry 8-petal harmonic mandala rotating imperceptibly slowly
            val petals = if (mode == LightMode.SILENT_SHIV_NADA) 8 else 6
            val mandalaRadius = minDim * (0.14f + 0.03f * breath)
            val slowRotation = phaseSeconds * omega * 0.14f

            geometryStrokePaint.strokeWidth = strokeBase * 0.9f
            geometryStrokePaint.color = withAlpha(lunar, geometryAlpha * 0.55f)

            reusablePath.reset()
            for (p in 0 until petals) {
                val angle = slowRotation + (p * 2.0 * PI / petals).toFloat()
                val nextAngle = slowRotation + ((p + 1) * 2.0 * PI / petals).toFloat()
                val midAngle = (angle + nextAngle) * 0.5f

                val x1 = cx + mandalaRadius * 0.42f * cos(angle)
                val y1 = cy + mandalaRadius * 0.42f * sin(angle)
                val ctrlX = cx + mandalaRadius * 1.15f * cos(midAngle)
                val ctrlY = cy + mandalaRadius * 1.15f * sin(midAngle)
                val x2 = cx + mandalaRadius * 0.42f * cos(nextAngle)
                val y2 = cy + mandalaRadius * 0.42f * sin(nextAngle)

                reusablePath.moveTo(x1, y1)
                reusablePath.quadTo(ctrlX, ctrlY, x2, y2)
            }
            canvas.drawPath(reusablePath, geometryStrokePaint)

            // Intersecting sacred triangles (counter-rotating gently)
            drawEquilateralTriangle(
                canvas = canvas,
                cx = cx,
                cy = cy,
                radius = mandalaRadius * 0.72f,
                rotationRad = slowRotation,
                color = withAlpha(accent, geometryAlpha * 0.50f),
                strokeWidth = strokeBase * 0.85f
            )
            drawEquilateralTriangle(
                canvas = canvas,
                cx = cx,
                cy = cy,
                radius = mandalaRadius * 0.72f,
                rotationRad = -slowRotation + (PI / 3.0).toFloat(),
                color = withAlpha(lunar, geometryAlpha * 0.45f),
                strokeWidth = strokeBase * 0.85f
            )
        }
    }

    private fun drawEquilateralTriangle(
        canvas: Canvas,
        cx: Float,
        cy: Float,
        radius: Float,
        rotationRad: Float,
        color: Int,
        strokeWidth: Float
    ) {
        reusablePath.reset()
        for (i in 0 until 3) {
            val angle = rotationRad - (PI / 2.0).toFloat() + (i * 2.0 * PI / 3.0).toFloat()
            val x = cx + radius * cos(angle)
            val y = cy + radius * sin(angle)
            if (i == 0) reusablePath.moveTo(x, y) else reusablePath.lineTo(x, y)
        }
        reusablePath.close()
        geometryStrokePaint.strokeWidth = strokeWidth
        geometryStrokePaint.color = color
        canvas.drawPath(reusablePath, geometryStrokePaint)
    }

    private fun dpToPx(dp: Float): Float =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp, resources.displayMetrics)

    private fun withAlpha(color: Int, alphaFraction: Float): Int {
        val a = (alphaFraction.coerceIn(0f, 1f) * 255f).toInt()
        return Color.argb(a, Color.red(color), Color.green(color), Color.blue(color))
    }

    private fun blendColors(from: Int, to: Int, ratio: Float): Int {
        val t = ratio.coerceIn(0f, 1f)
        val inv = 1f - t
        val r = (Color.red(from) * inv + Color.red(to) * t).toInt()
        val g = (Color.green(from) * inv + Color.green(to) * t).toInt()
        val b = (Color.blue(from) * inv + Color.blue(to) * t).toInt()
        return Color.rgb(r, g, b)
    }
}
