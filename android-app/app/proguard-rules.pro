# AI Mind Wave - ProGuard / R8 Rules
-keepattributes *Annotation*
-keepattributes Signature,InnerClasses,EnclosingMethod

# Keep Service and BroadcastReceiver entry points
-keep public class com.aimindwave.edgeambient.service.OverlayService { *; }
-keep public class com.aimindwave.edgeambient.receiver.BootCompletedReceiver { *; }

# Keep Kotlin Coroutines & DataStore
-keepclassmembers class * {
    @androidx.annotation.Keep <methods>;
}
-dontwarn kotlinx.coroutines.**
