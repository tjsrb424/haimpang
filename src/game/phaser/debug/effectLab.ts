export const EFFECT_LAB_EVENT = 'haimpang:effect-lab';

export const EFFECT_LAB_CUES = [
  'combo-2',
  'combo-5',
  'combo-10-haimpang',
  'normal-pop',
  'special-pop',
] as const;

export type EffectLabCue = (typeof EFFECT_LAB_CUES)[number];

export function isEffectLabCue(value: unknown): value is EffectLabCue {
  return typeof value === 'string' && EFFECT_LAB_CUES.includes(value as EffectLabCue);
}

export function getEffectLabCue(event: Event): EffectLabCue | null {
  if (!(event instanceof CustomEvent) || !isEffectLabCue(event.detail)) {
    return null;
  }

  return event.detail;
}

export function requestEffectLabCue(cue: EffectLabCue): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  window.dispatchEvent(new CustomEvent<EffectLabCue>(EFFECT_LAB_EVENT, { detail: cue }));
  return true;
}
