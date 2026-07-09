export type FeedbackEvent =
  | 'swap-valid'
  | 'swap-invalid'
  | 'pop'
  | 'special-pop'
  | 'combo-up'
  | 'haimpang-finish'
  | 'cascade';

export function vibrateLight(enabled = true): void {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  navigator.vibrate(12);
}

export function playFeedback(event: FeedbackEvent, vibrationEnabled = true): void {
  if (!vibrationEnabled || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  if (event === 'swap-invalid') {
    navigator.vibrate([10, 20, 10]);
    return;
  }

  if (event === 'special-pop') {
    navigator.vibrate([16, 18, 10]);
    return;
  }

  if (event === 'combo-up') {
    navigator.vibrate([10, 18, 14]);
    return;
  }

  if (event === 'haimpang-finish') {
    navigator.vibrate([20, 26, 26, 30, 18]);
    return;
  }

  navigator.vibrate(event === 'cascade' ? 8 : 12);
}
