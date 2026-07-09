export type FeedbackEvent = 'swap-valid' | 'swap-invalid' | 'pop' | 'cascade';

export function vibrateLight(enabled = true): void {
  if (!enabled || typeof navigator === 'undefined') {
    return;
  }

  navigator.vibrate?.(12);
}

export function playFeedback(event: FeedbackEvent, vibrationEnabled = true): void {
  if (!vibrationEnabled) {
    return;
  }

  if (event === 'swap-invalid') {
    navigator.vibrate?.([10, 20, 10]);
    return;
  }

  vibrateLight(true);
}
