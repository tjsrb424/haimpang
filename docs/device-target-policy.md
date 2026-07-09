# HAIMPANG Device Target Policy

이 프로젝트는 범용 반응형 웹게임이 아니다.

HAIMPANG은 여자친구가 Galaxy Ultra급 Android 기기에서 홈 화면에 설치해 사용하는 개인용 PWA 앱이다.

따라서 레이아웃 기준은 다음으로 고정한다.

## Primary Target

- Android PWA installed mode
- Portrait only
- Galaxy Ultra급 대화면 스마트폰
- CSS viewport width: 412~430px 중심
- CSS viewport height: 900px대 중심

## QA Viewports

반드시 아래 3개 viewport에서 확인한다.

- 390x844
- 412x915
- 430x932

## Layout Policy

- 데스크탑 풀 반응형을 목표로 하지 않는다.
- 태블릿/가로모드 최적화도 목표로 하지 않는다.
- PC에서는 모바일 앱 프레임이 중앙에 보이면 충분하다.
- 앱 전체는 `100dvh` 기준으로 동작한다.
- 하단 Android gesture area와 bottom tabs가 겹치지 않게 safe area를 유지한다.
- 매치3 보드 타일은 최소 36 CSS px 이상을 유지한다.
- Galaxy Ultra급에서는 tile 39~42 CSS px를 목표로 한다.

## Forbidden

- 물리 해상도 기준으로 고정하지 말 것.
- 3120x1440 같은 디바이스 실제 픽셀 기준으로 UI를 계산하지 말 것.
- 모든 기기 대응을 위해 보드 크기를 희생하지 말 것.
- 데스크탑 대응 때문에 모바일 앱 비율을 망가뜨리지 말 것.
- 브라우저 주소창이 있는 일반 웹 기준으로만 레이아웃을 잡지 말 것.

## Preferred Direction

설치형 PWA에서 앱처럼 보이는 것을 최우선으로 한다.

핵심 기준은 다음이다.

- 여자친구 폰에서 예쁘게 보이는가
- 보드가 손가락으로 누르기 충분한가
- 하단 탭이 Android 제스처 영역과 겹치지 않는가
- 세로 화면에서 홈/게임/지갑/추억/설정이 안정적인가
