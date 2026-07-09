export interface DisplayModeSource {
  matchMedia?: (query: string) => { matches: boolean };
  navigator?: Navigator & {
    standalone?: boolean;
  };
}

export interface InstallGuideState {
  standalone: boolean;
  shouldShowGuide: boolean;
  title: string;
  description: string;
}

function getDisplayModeSource(source?: DisplayModeSource): DisplayModeSource | undefined {
  if (source) {
    return source;
  }

  if (typeof window === 'undefined') {
    return undefined;
  }

  return window;
}

export function isStandaloneMode(source?: DisplayModeSource): boolean {
  const target = getDisplayModeSource(source);
  if (!target) {
    return false;
  }

  return Boolean(
    target.matchMedia?.('(display-mode: standalone)').matches ||
      target.matchMedia?.('(display-mode: fullscreen)').matches ||
      target.navigator?.standalone,
  );
}

export function shouldShowInstallGuide(source?: DisplayModeSource): boolean {
  return !isStandaloneMode(source);
}

export function getInstallGuideState(source?: DisplayModeSource): InstallGuideState {
  const standalone = isStandaloneMode(source);

  if (standalone) {
    return {
      standalone,
      shouldShowGuide: false,
      title: '앱처럼 실행 중',
      description: '지금은 홈 화면 앱처럼 주소창 없이 하임팡을 열고 있어요.',
    };
  }

  return {
    standalone,
    shouldShowGuide: true,
    title: '홈 화면에 추가하기',
    description: 'Chrome 메뉴에서 홈 화면에 추가를 누르면 하임팡을 진짜 앱처럼 열 수 있어요.',
  };
}
