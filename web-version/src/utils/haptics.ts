/**
 * Haptic feedback utilities (placeholders for Android/iOS)
 * These will work when running in Capacitor native apps
 */

export async function hapticLight() {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    // Fallback: No haptics available (web browser)
    // Could add visual feedback instead
  }
}

export async function hapticMedium() {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    // Fallback: No haptics available
  }
}

export async function hapticHeavy() {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    // Fallback: No haptics available
  }
}

export async function hapticSuccess() {
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch (error) {
    // Fallback: No haptics available
  }
}

export async function hapticWarning() {
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Warning });
  } catch (error) {
    // Fallback: No haptics available
  }
}

export async function hapticError() {
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Error });
  } catch (error) {
    // Fallback: No haptics available
  }
}

