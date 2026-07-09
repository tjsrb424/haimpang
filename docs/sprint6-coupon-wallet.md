# Sprint 6 Coupon Wallet

## Scope

Sprint 6 turns the coupon wallet into a real use flow:

- expanded coupon definitions
- coupon detail modal
- QR-like code card without image assets
- two-step use confirmation
- `available -> used` save transition
- `usedAt` persistence
- coupon use memory logs
- wallet status counts
- memory page grouping by category

## Coupon Data

`src/data/coupons.ts` now defines 10 coupons with:

- `id`
- `title`
- `description`
- `unlockCondition`
- `qrPayload`
- `category`
- `displayCode`
- `useConfirmText`
- `memoryTitle`
- `memoryDescription`

Categories:

- `food`
- `date`
- `care`
- `wish`
- `special`

## Coupon State Rules

State comes from `save.couponWallet`.

- `locked`: detail can be opened, but code is locked and use is blocked.
- `available`: detail, code, QR placeholder, and use flow are available.
- `used`: detail remains visible, `usedAt` is shown, and reuse is blocked.

Re-clearing a stage does not turn a used coupon back to available.

## Use Flow

Flow:

1. Open Wallet.
2. Open an available coupon detail.
3. Check the display code and QR-style card.
4. Press `사용 완료`.
5. Confirm with `정말 사용 완료하기`.
6. Save changes:
   - coupon status becomes `used`
   - `usedAt` is recorded
   - coupon id is added to `usedCoupons`
   - a `coupon_used` memory log is prepended
   - `lastPlayedAt` is updated

The confirmation copy is intentionally explicit because use cannot be undone in the UI.

## SaveManager

Added:

- `useCoupon(save, couponId)`
- `getCouponStatus(save, couponId)`
- `getCouponCounts(save)`

`migrateSave` now fills missing memory log categories and deduplicates `usedCoupons`.

## Memory Logs

`MemoryLogEntry` now includes:

- `system`
- `stage_clear`
- `coupon_unlock`
- `coupon_used`
- `special`

Stage clears write `stage_clear`.
First coupon unlocks write `coupon_unlock`.
Coupon use writes `coupon_used`.

Legacy logs without a category are migrated to `system`, except `stage-*` logs which migrate to `stage_clear`.

## Wallet UI

Wallet shows:

- available count
- used count
- locked count
- category badge
- state badge
- detail button
- locked condition
- used date

The QR placeholder is CSS/HTML only and uses the coupon payload to create a stable pattern.

## Automated Tests

Added:

- `tests/save/couponUse.test.ts`
- `tests/wallet/couponCounts.test.ts`
- `tests/save/memoryLogMigration.test.ts`

Coverage:

- available coupon becomes used
- `usedAt` is recorded
- `usedCoupons` is updated
- `coupon_used` memory log is added
- locked coupon cannot be used
- used coupon cannot be used twice
- missing coupon id leaves save unchanged
- locked/available/used counts update
- legacy memory logs receive categories

## QA Result

412x915 coupon flow:

- available coupon detail opened
- QR placeholder visible with active pattern cells
- use confirmation shown
- use completed
- coffee coupon became `used`
- `usedAt` recorded
- `usedCoupons` contains `coffee`
- memory log `커피 쿠폰 사용` visible after reload-style persistence check
- console/page errors: 0
- image count: 0

## Known Issues

- QR is a local placeholder pattern, not a scannable external QR.
- Coupon unlock balance is still tied to the current 20 stage rewards plus future locked coupons.
- There is no undo flow for coupon use, by design for Sprint 6.
