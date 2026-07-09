# HAIMPANG Sprint 6 추가 지시문 — 팡 이펙트 / 콤보 연출 / 하임팡 피니시 강화

## 0. 목적

현재 Sprint 6 진행 중이지만, 하임팡의 플레이 감각을 살리기 위해 **이펙트와 콤보 연출을 우선 강화**한다.

매치3는 단순히 규칙이 동작하는 것만으로는 재미가 부족하다.  
타일이 제거될 때의 시각적/감각적 보상이 충분해야 반복 플레이가 지루하지 않다.

이번 추가 작업의 핵심 목표는 다음이다.

- 타일이 터질 때 “팡팡” 터지는 시원한 느낌 제공
- cascade/chain이 이어질 때 콤보 피드백 강화
- 콤보 숫자를 터진 위치 근처에 띄우고 자연스럽게 사라지게 만들기
- 10콤보 이상에서는 “하임팡!”이라는 시그니처 연출을 화려하게 노출
- 과한 저가형 슬롯머신 느낌이 아니라, 하임팡의 따뜻한 감성을 유지하면서도 충분히 화려하게 만들기

---

## 1. 콤보 정의

이번 프로젝트에서 **콤보 = 한 번의 valid move 이후 발생하는 cascade 단계 수**로 정의한다.

예시:

- 스왑 후 즉시 1회 제거 = 1콤보
- 제거 후 낙하/리필 뒤 다시 제거 = 2콤보
- 다시 이어지면 3콤보
- 이런 식으로 한 번의 move에서 이어진 전체 cascade count를 combo로 처리한다

즉, `comboCount`는 move 단위로 누적된다.

---

## 2. 타일 제거 이펙트 목표

타일이 제거될 때 단순히 사라지지 말고, **“팡” 하고 터지는 느낌**이 나야 한다.

필수 요소:

- 짧은 scale-up 후 pop
- 밝은 sparkle 파티클 4~8개 정도
- 작은 원형 burst 또는 별빛 burst
- 색상은 base tile color 계열 + 흰색/크림색 highlight
- 제거 순간 1~2프레임 정도의 약한 “hit emphasis” 느낌
- 너무 무겁거나 느리지 않게

권장 타이밍:

- pre-pop scale: 60~80ms
- pop burst: 100~140ms
- sparkle fade out: 180~260ms

연출 방향:

- 하트/별/꽃/사탕/선물 타일이 각각 자기 색 계열 파편을 짧게 뿜는다
- 특수 타일은 일반 타일보다 파편 수와 광량이 조금 더 많다
- 전체 화면을 과하게 흔들지 말고, 터진 위치 중심으로 만족감이 느껴지게 한다

---

## 3. 기본 팡 이펙트 사양

모든 일반 타일 제거 시 다음 연출이 들어가야 한다.

### 일반 타일 제거

- 타일이 살짝 커졌다가
- 중앙에서 반짝임이 생기고
- 작은 파편/별/점이 4~8개 퍼지고
- 타일은 부드럽게 사라진다

### 특수 타일 제거

- line / bomb / rainbow는 일반 타일보다 더 화려하게
- 파티클 수 증가
- 팡 burst 반경 증가
- trail 또는 sweep 느낌 추가 가능
- 단, 성능 저하 주의

---

## 4. 콤보 텍스트 연출

콤보가 발생할 때마다 **터진 위치 근처에 콤보 텍스트를 띄운다.**

예시:

- 2 COMBO
- 3 COMBO
- 4 COMBO
- ...
- 9 COMBO

표시 조건:

- 1콤보는 굳이 크게 띄우지 않아도 됨
- **2콤보부터 노출**
- 각 cascade step마다 해당 step의 주요 제거 중심점 근처에 표시
- 여러 매치가 동시에 터졌다면 전체 제거 그룹의 중심 좌표를 잡아 표시

텍스트 스타일 방향:

- 귀엽지만 가볍지 않게
- 읽기 명확
- 외곽선 또는 soft shadow
- pastel + gold/cream highlight 가능
- 숫자는 크게, COMBO는 조금 작게

애니메이션:

1. 아래에서 살짝 올라오며 등장
2. scale 0.85 → 1.08 → 1.0
3. opacity 1 → 0
4. 위쪽으로 16~28px 정도 떠오르며 사라짐

권장 시간:

- 등장: 120ms
- 유지: 180ms
- 사라짐: 220ms
- 총 450~550ms 내외

중요:

- 너무 오래 남아 있으면 보드 가독성을 해친다
- 너무 빨리 사라지면 보람이 없다
- **짧고 부드럽고 기분 좋게** 사라져야 한다

---

## 5. 10콤보 이상 “하임팡!” 피니시 연출

**10콤보부터는 일반 콤보 텍스트 대신/추가로 “하임팡!” 시그니처 연출을 넣는다.**

이건 하임팡만의 아이덴티티다.

표시 조건:

- `comboCount >= 10`
- 10콤보, 11콤보, 12콤보 이상에서도 계속 가능
- 단, 한 move 안에서 너무 남발되면 지저분할 수 있으므로
  - 10콤보 달성 시 크게 1회
  - 그 이후는 “11 COMBO”, “12 COMBO”는 더 작게 보조 표시 가능
  - 또는 10콤보 이상 구간마다 “하임팡!”을 유지형으로 강화 표시 가능

권장 연출:

### 하임팡! 텍스트

- “하임팡!” 텍스트를 크게 표시
- 중앙 또는 터진 위치 중심보다 약간 큰 레이어에 띄움
- pastel gold / pink / cream / lavender 조합
- 텍스트 뒤에 starburst 또는 soft radial glow
- sparkle가 팡팡 튀어 나감
- 살짝 bounce 하며 등장

애니메이션 흐름:

1. flash-like soft burst
2. “하임팡!” scale in
3. 뒤에서 반짝이 입자 확산
4. 텍스트가 살짝 튕기고
5. 부드럽게 fade out

권장 시간:

- 등장 140ms
- 강조 220ms
- 퇴장 240ms
- 총 550~700ms

중요:

- **촌스러운 번쩍임 금지**
- 무료 슬롯머신 느낌 금지
- 대신 “와, 크게 터졌다!”는 기분은 확실히 줘야 한다

---

## 6. 콤보 단계별 연출 강도

콤보가 올라갈수록 연출 강도를 조금씩 올린다.

### 2~3콤보

- 작은 combo text
- 가벼운 sparkle

### 4~6콤보

- combo text 크기 증가
- pop 파티클 수 소폭 증가
- 약한 board pulse 가능

### 7~9콤보

- combo text 더 강조
- 특수 타일이 함께 터질 경우 보너스 반짝임
- 작은 celebratory burst

### 10콤보 이상

- “하임팡!” 시그니처 연출
- 가장 화려한 burst
- 화면 전체가 아닌 **보드 중심의 축제 느낌**

---

## 7. 이펙트 톤 가이드

하임팡은 선물 앱 감성이 있으므로, 화려하되 톤을 잃으면 안 된다.

색감 방향:

- pink
- peach
- cream
- soft gold
- lavender
- mint highlight
- white sparkle

피해야 할 것:

- 너무 강한 네온
- 도박 게임 느낌
- 빨강/초록/파랑 원색 남발
- 너무 많은 화면 흔들림
- 눈 아픈 플래시
- 저렴한 모바일 광고게임 효과

핵심은 다음이다.

> “귀엽고 따뜻한데, 터질 땐 확실히 시원하다”

---

## 8. 사운드/진동 Hook 강화

실제 사운드 파일이 없어도 hook은 강화한다.

필수 hook:

- normal pop
- special pop
- combo up
- haimpang finish
- soft vibration on combo 4+
- stronger vibration on 10 combo “하임팡!”

규칙:

- 설정에서 vibration off면 동작 금지
- 너무 자주 진동하지 않도록 강도/횟수 제한
- 브라우저/PWA에서 안전하게 fallback

예시:

- 2~3콤보: 매우 약한 vibrate
- 4~9콤보: 짧은 vibrate
- 10콤보 이상: 조금 더 명확한 vibrate pattern

---

## 9. Phaser 구현 방향

권장 파일:

- `src/game/phaser/animation/effects.ts`
- `src/game/phaser/animation/comboEffects.ts`
- `src/game/phaser/objects/FloatingText.ts`
- `src/game/phaser/session/GameSession.ts` 또는 stage session summary 연결부

필수 구현 후보:

### 일반 팝 이펙트 함수

- `playTilePopEffect`

### 특수 타일 팝 이펙트 함수

- `playSpecialPopEffect`

### 콤보 텍스트 함수

- `showComboText`

### 하임팡 피니시 함수

- `showHaimpangBurst`

### sparkle 파티클 helper

- `spawnSparkleBurst`

### 제거 중심점 계산

- `getEffectAnchorFromMatchedPositions`

중요:

- `setTimeout` 난사 금지
- Promise/tween chain으로 제어
- cascade 흐름과 자연스럽게 연결
- input lock은 유지
- 이펙트 때문에 board state / visual state가 꼬이면 안 됨

---

## 10. UI / 게임 루프 연결

콤보 연출은 **매치가 실제 해결되는 타이밍**에 붙어야 한다.

권장 흐름:

1. valid swap
2. match resolve
3. special activation if needed
4. 제거 위치 계산
5. pop effect 실행
6. combo count 증가
7. combo text 또는 하임팡 텍스트 표시
8. drop
9. refill
10. 다음 cascade 있으면 반복

즉, combo text는 **drop 전 또는 drop 직전 타이밍**이 가장 자연스럽다.

---

## 11. 성능 가이드

이펙트가 많아져도 모바일에서 버벅이면 안 된다.

제한:

- 일반 타일 파티클은 타일당 과하지 않게
- 동시에 너무 많은 emitter 생성 금지
- 가능하면 Graphics 또는 lightweight particle 사용
- object pooling 검토
- 390x844 기준 성능 저하 없어야 함

최적화 기준:

- 보드 입력 반응성 저하 금지
- cascade가 길어져도 애니메이션이 과하게 늘어지지 않음
- 과한 full-screen effect 금지

---

## 12. QA 기준

반드시 수동 QA로 확인한다.

### 기본 팝 이펙트

- 일반 타일이 밋밋하게 사라지지 않음
- 팡하는 느낌이 있음
- 너무 시끄럽거나 난잡하지 않음

### 콤보 텍스트

- 2콤보부터 표시
- 위치가 부자연스럽지 않음
- 텍스트가 읽힘
- 자연스럽게 떠오르고 사라짐

### 하임팡 피니시

- 10콤보 이상에서 “하임팡!” 확인
- 충분히 화려함
- 너무 촌스럽지 않음
- 보드 플레이를 방해하지 않음

### 회귀 확인

- valid swap 유지
- invalid rollback 유지
- input lock 유지
- Stage 1 clear 유지
- Stage 6 special mission 유지
- Stage 20 forced lose 유지
- save 유지
- reward 중복 방지 유지

### 모바일 확인

- 390x844
- 412x915
- 430x932
- board size 유지
- tile size 최소 36px 이상
- console error 0

---

## 13. 완료 기준

이번 추가 작업 완료 기준:

- 일반 타일 팝 이펙트 강화
- 특수 타일 팝 이펙트 강화
- 2콤보 이상 combo text 표시
- combo text 부드러운 등장/퇴장
- 10콤보 이상 “하임팡!” 연출 구현
- vibration/sound hook 연결
- 기존 게임 루프 회귀 없음
- 모바일 QA 통과
- lint / test / build 통과

---

## 14. 완료 보고 형식

완료 후 아래 형식으로 보고하라.

```md
# Sprint 6 이펙트 강화 완료 보고

## 1. 커밋/푸시

- 커밋:
- 푸시:
- 워크트리 상태:

## 2. 구현 요약

- 일반 팝 이펙트:
- 특수 팝 이펙트:
- combo text:
- 하임팡 피니시:
- vibration/sound hook:

## 3. 테스트

- 추가한 테스트:
- 총 테스트 수:
- npm run test:
- npm run lint:
- npm run build:
- npm audit:

## 4. 모바일 QA

- 390x844:
- 412x915:
- 430x932:
- board size:
- tile size:
- console error:

## 5. 회귀 QA

- valid swap:
- invalid rollback:
- input lock:
- Stage 1 clear:
- Stage 6 special mission:
- Stage 20 forced lose:
- save 유지:
- reward 중복 방지:

## 6. 남은 이슈

- Known issues:
- Deferred:
```

---

## 15. 핵심 판단

지금 하임팡에서 제일 부족하면 치명적인 부분은 **“잘 터지는 느낌”**이다.

그래서 Sprint 6 진행 중이어도 이펙트 / 콤보 / 하임팡 연출은 우선순위를 높여서 넣는 게 맞다.
