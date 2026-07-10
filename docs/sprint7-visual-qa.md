# Sprint 7 시각 QA

검증일: 2026-07-10

기준 브라우저: Codex 인앱 Chromium

기준 화면: Stage 20, 미션 2개

## 모바일 기준

| 뷰포트  |  보드 | 타일 | 결과 |
| ------- | ----: | ---: | ---- |
| 390×844 | 357px | 39px | 통과 |
| 412×915 | 373px | 41px | 통과 |
| 430×932 | 397px | 44px | 통과 |

공통 확인 항목은 safe area, HUD 잘림, 한글 사용자 문구, 5종 베리 식별성, 4종 특수 타일 식별성, 결과 버튼의 화면 내 배치다.

## 장면별 확인

- 기본 게임 화면: 몰입형 셸, 한글 HUD, 2개 미션, 중앙 보드 프레임 확인.
- 타일 선택: 확대와 핑크 광택 링이 나타나고 보드 좌표와 입력 상태는 정상 유지.
- 특수 타일: 가로/세로/폭탄/프리즘 오버레이가 베리 원형을 가리지 않고 구분됨.
- 콤보: 2콤보는 부드럽게, 5콤보는 더 큰 강조, 10콤보는 `하임팡!`과 파스텔 버스트로 표시.
- 결과: 승리/실패 문구와 실제 동작 버튼이 430×932 화면 안에 표시.
- 낮은 이동 수: 5 이하에서 남은 이동 카드가 짧게 강조됨.

유휴 상태의 Phaser 표시 객체는 66개였고, 테스트 브라우저에서 60fps 이상을 유지했다. 앱 아이콘 이미지는 게임 캔버스 안에서 사용하지 않았다.

## 상태 무결성

Effect Lab 실행 전후의 score, moveCount, mission progress, board kinds, inputState가 동일함을 확인했다. Design Lab 열기·닫기 역시 저장 데이터와 게임 세션을 변경하지 않는다.

## 브라우저 회귀

- Stage 1: 8회 valid swipe, 점수 306으로 승리. 승리 결과, 첫 클리어 보상 상태, 다시 하기, 다음 스테이지 이동 확인.
- Stage 6: 3회 valid swipe에서 `line_horizontal` 생성, 특수 미션 1/1 반영 및 보드 오버레이 확인.
- Stage 20: 18회 valid swipe, 점수 612로 패배. 이동 수 5 강조와 실패 결과 확인.
- invalid swap: 이동 수와 점수 변화 없이 `READY`로 rollback.
- diagonal ambiguous: 이동 수 변화 없이 `READY` 유지.
- cascade 동안 입력 잠금 후 `READY` 복귀 확인.
- Effect Lab: 2·5·8·10콤보, 일반 팝, 특수 팝 호출 확인. 특수 팝 도중 effect object 1개가 생성되고 종료 후 정리됨.
- 결과 화면: replay, next stage, stage select, home 버튼의 실제 핸들러만 노출.

## 스크린샷

- `artifacts/sprint7-before-game-412x915.png`
- `artifacts/sprint7-game-idle-390x844.png`
- `artifacts/sprint7-game-selected-412x915.png`
- `artifacts/sprint7-game-special-412x915.png`
- `artifacts/sprint7-combo-2-412x915.png`
- `artifacts/sprint7-combo-5-412x915.png`
- `artifacts/sprint7-combo-10-haimpang-412x915.png`
- `artifacts/sprint7-result-win-430x932.png`
- `artifacts/sprint7-result-lose-430x932.png`
- `artifacts/sprint7-design-lab-412x915.png`

## 자동 검증

- `npm run test`: 18개 파일, 115개 테스트 통과.
- `npm run lint`: 통과.
- `npm run build`: 통과. 기존 Phaser 청크 크기 경고만 존재.
- `npm audit --audit-level=moderate`: 취약점 0개.
- 브라우저 콘솔: 수정 이후 신규 error 0개.
