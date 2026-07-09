// Panel: JS (CodePen JS에 그대로 전체 복붙)

(() => {
  /***********************
   * Persistence
   ***********************/
  const LS_KEY = "haimpang_save_v2";
  const SECRET = "HAIMPANG_SECRET_DEMO_v2";

  // 개발용 치트 스위치 (true면 버튼 보임, false면 안 보임)
  const DEBUG_MODE = false;

  const defaultSave = () => ({
    level: 1,
    stars: 0,
    wishes: 0,
    haimpangTotal: 0,
    wallet: [],
    redeemedIds: [],
    lobbyPhoto: null, // dataURL
    wishLog: [],      // 소원 사용 기록
  });

  const SAVE = loadSave();
  function loadSave() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultSave();
      const obj = JSON.parse(raw);
      return Object.assign(defaultSave(), obj);
    } catch (e) {
      return defaultSave();
    }
  }
  function persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(SAVE));
  }

  /***********************
   * Shop data
   ***********************/
  const SHOP_ITEMS = [
    { id: "sbx", name: "스타벅스", priceStars: 15, desc: "커피 한 잔", icon: "☕" },
    { id: "sundae", name: "순대", priceStars: 15, desc: "간식 대체 가능", icon: "🌭" },
    { id: "kalguksu", name: "칼국수", priceStars: 20, desc: "따끈 데이트", icon: "🍜" },
    { id: "baskin", name: "벤엔제리스", priceStars: 35, desc: "아이스크림", icon: "🍦" },
    { id: "chicken", name: "치킨", priceStars: 60, desc: "치킨 데이", icon: "🍗" },
    { id: "movie",  name: "영화 데이트", priceStars: 65, desc: "팝콘까지 포함", icon: "🎬"},
    { id: "sushi", name: "회전초밥", priceStars: 80, desc: "초밥 데이", icon: "🍣" },
    { id: "escape", name: "방탈출", priceStars: 80, desc: "코난 효임이", icon: "🧩" },
  ];

  /***********************
   * UI refs
   ***********************/
  const $ = (q) => {
    const el = document.querySelector(q);
    if (!el) console.warn("[HAIMPANG] Missing element:", q);
    return el;
  };

  const screens = {
    lobby: $("#screenLobby"),
    wallet: $("#screenWallet"),
    ach: $("#screenAch"),
    game: $("#screenGame"),
  };

  const hudStars = $("#hudStars");
  const hudWishes = $("#hudWishes");
  const uiLevel = $("#uiLevel");

  const shopGrid = $("#shopGrid");
  const walletList = $("#walletList");

  const modalQR = $("#modalQR");
  const qrImage = $("#qrImage");
  const qrCaption = $("#qrCaption");
  const qrTokenPreview = $("#qrTokenPreview");

  const modalVerifier = $("#modalVerifier");
  const scanVideo = $("#scanVideo");
  const scanCanvas = $("#scanCanvas");
  const scanStatus = $("#scanStatus");

  const toastEl = $("#toast");
  const flashEl = $("#flash");
  const splashEl = $("#splash");

  // Lobby photo
  const lobbyPhotoEl = $("#lobbyPhoto");
  const photoInput = $("#photoInput");

  // Game HUD
  const hudMoves = $("#hudMoves");
  const hudMission = $("#hudMission");
  const hudCombo = $("#hudCombo");

  /***********************
   * Navigation
   ***********************/
  function showScreen(name) {
    Object.values(screens).forEach((el) => el && el.classList.add("hidden"));
    screens[name] && screens[name].classList.remove("hidden");
  }

  $("#btnWallet")?.addEventListener("click", () => {
    renderWallet();
    showScreen("wallet");
  });
  $("#btnBackFromWallet")?.addEventListener("click", () => showScreen("lobby"));

  $("#btnAch")?.addEventListener("click", () => {
    renderAch();
    showScreen("ach");
  });
  $("#btnBackFromAch")?.addEventListener("click", () => showScreen("lobby"));
  
    // 소원 보내기 버튼
  $("#btnSendWish")?.addEventListener("click", () => {
    const input = $("#wishInput");
    if (!input) return;
    const text = input.value;
    const ok = addWishLog(text);
    if (ok) {
      input.value = "";
    }
  });

  // 엔터키로도 소원 보내기
  $("#wishInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      $("#btnSendWish")?.click();
    }
  });

  /***********************
   * Toast
   ***********************/
  let toastT = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove("hidden");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.add("hidden"), 1600);
  }

  /***********************
   * Lobby photo
   ***********************/
  function renderLobbyPhoto() {
    if (!lobbyPhotoEl) return;
    if (SAVE.lobbyPhoto) {
      lobbyPhotoEl.style.backgroundImage = `url("${SAVE.lobbyPhoto}")`;
    } else {
      lobbyPhotoEl.style.backgroundImage = "none";
    }
  }

  $("#btnPickPhoto")?.addEventListener("click", () => {
    photoInput && photoInput.click();
  });

  photoInput?.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const dataURL = await readAndResizeImage(file, 1200, 0.86);
    SAVE.lobbyPhoto = dataURL;
    persist();
    renderLobbyPhoto();
    toast("로비 사진 적용 완료");
    photoInput.value = "";
  });

  function readAndResizeImage(file, maxW = 1200, quality = 0.86) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width);
          const w = Math.floor(img.width * scale);
          const h = Math.floor(img.height * scale);
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          const cx = c.getContext("2d");
          cx.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /***********************
   * Render HUD/Shop/Wallet/Ach
   ***********************/
  function renderHUD() {
    hudStars && (hudStars.textContent = String(SAVE.stars));
    hudWishes && (hudWishes.textContent = String(SAVE.wishes));
    uiLevel && (uiLevel.textContent = String(SAVE.level));
  }

  function renderShop() {
    if (!shopGrid) return;
    shopGrid.innerHTML = "";
    SHOP_ITEMS.forEach((item) => {
      const canBuy = SAVE.stars >= item.priceStars;
      const card = document.createElement("div");
      card.className = "shopItem";
      card.innerHTML = `
        <div>
          <div class="name">${item.icon} ${item.name}</div>
          <div class="muted" style="font-size:12px; margin-top:4px;">${item.desc}</div>
        </div>
        <div class="rowBetween" style="margin-top:10px;">
          <div class="price"><span>⭐</span><span>${item.priceStars}</span></div>
          <button class="buy" ${canBuy ? "" : "disabled"}>구매</button>
        </div>
      `;
      card.querySelector(".buy").addEventListener("click", () => buyItem(item));
      shopGrid.appendChild(card);
    });
  }

  function renderWallet() {
  if (!walletList) return;
  walletList.innerHTML = "";

  if (SAVE.wallet.length === 0) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<div class="muted">아직 쿠폰이 없어. ⭐로 상점에서 사봐!</div>`;
    walletList.appendChild(empty);
    return;
  }

  // 1) 사용 가능 쿠폰 위, 사용 완료 쿠폰 아래
  //    같은 그룹 내에서는 최근 발급 순(내림차순)
  const sorted = SAVE.wallet.slice().sort((a, b) => {
    const ra = !!a.redeemedAt;
    const rb = !!b.redeemedAt;

    // 사용 가능(false) -> 사용 완료(true) 순
    if (ra !== rb) {
      return ra - rb; // false(0) 먼저, true(1) 나중
    }

    // 둘 다 사용 가능 또는 둘 다 사용 완료면 createdAt 기준 최신순
    const ca = a.createdAt || 0;
    const cb = b.createdAt || 0;
    return cb - ca; // 큰 시간(최근)이 위로
  });

  sorted.forEach((c) => {
    const redeemed = !!c.redeemedAt;
    const el = document.createElement("div");

    // 2) 사용 완료 카드는 .used 클래스 추가 → 회색 처리 + 스탬프
    el.className = "couponCard" + (redeemed ? " used" : "");

    el.innerHTML = `
      <div class="couponTop">
        <div>
          <div class="couponName">${redeemed ? "✅" : "🎫"} ${c.name}</div>
          <div class="couponMeta">
            가격 ⭐${c.priceStars}
            · 발급 ${fmtTime(c.createdAt)}
            ${redeemed ? ` · 사용 ${fmtTime(c.redeemedAt)}` : ""}
          </div>
        </div>
        <div class="couponMeta">${redeemed ? "사용완료" : "사용가능"}</div>
      </div>
      <div class="couponBtns">
        <button class="pill btn small">
          ${redeemed ? "사용완료 기록 보기" : "QR 보여주기"}
        </button>
        <button class="pill btn small">자랑(iMessage)</button>
      </div>
    `;

    const [btnQR, btnBrag] = el.querySelectorAll("button");
    btnQR.addEventListener("click", () => openQR(c));
    btnBrag.addEventListener("click", () => bragOne(c));

    walletList.appendChild(el);
  });
}

     function renderAch() {
    $("#achHaimpangTotal") && ($("#achHaimpangTotal").textContent = String(SAVE.haimpangTotal));
    $("#achWish") && ($("#achWish").textContent = String(SAVE.wishes));
    renderWishPanel();
  }

  // 소원 로그 UI 렌더링
  function renderWishPanel() {
    const countEl = $("#wishCount");
    const totalEl = $("#wishLogTotal");
    const listEl = $("#wishLogList");
    const emptyEl = $("#wishLogEmpty");
    if (!countEl || !totalEl || !listEl || !emptyEl) return;

    const wishes = SAVE.wishes || 0;
    countEl.textContent = String(wishes);

    const logs = (SAVE.wishLog || []).slice().sort((a, b) => b.usedAt - a.usedAt);
    totalEl.textContent = String(logs.length);

    listEl.innerHTML = "";
    if (logs.length === 0) {
      emptyEl.classList.remove("hidden");
      return;
    }
    emptyEl.classList.add("hidden");

    logs.forEach((entry) => {
      const el = document.createElement("div");
      el.className = "wishLogItem";

      const d = new Date(entry.usedAt);
      const timeStr = d.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      el.innerHTML = `
        <div class="wishLogText">"${entry.text}"</div>
        <div class="wishLogMeta">${timeStr}</div>
      `;
      listEl.appendChild(el);
    });
  }

   // 소원권 1장 써서 소원 보내기
  function addWishLog(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) {
      toast("소원을 한 줄로 적어줘 💭");
      return false;
    }

    if (!SAVE.wishes || SAVE.wishes <= 0) {
      toast("소원권이 부족해 :(");
      return false;
    }

    // 시간은 한 번만 찍어두고, 로컬/시트 둘 다 같은 값 사용
    const now = Date.now();

    // 1) 로컬 세이브 업데이트
    SAVE.wishes -= 1;
    SAVE.wishLog.push({
      id: "wish_" + now,
      text: trimmed,
      usedAt: now,
    });

    // (선택) 안 읽은 소원 카운트 쓰고 있으면 여기서도 ++ 해줄 수 있음
    // SAVE.wishUnread = (SAVE.wishUnread || 0) + 1;

    persist();
    renderHUD();
    renderAch(); // 기록 화면/소원 패널 갱신

    toast("효임이가 소원권으로 '" + trimmed + "' 소원을 보냈어 💖");

    // 2) 구글 시트로 전송 (비동기, 실패해도 게임은 계속)
    sendWishToSheet(trimmed, now);

    return true;
  }

  // =====================
  // 개발용: 별 치트 버튼
  // =====================
  function setupDebugCheat() {
  if (!DEBUG_MODE) return;  // 나중에 끄고 싶으면 false로 바꾸면 됨

  const rightPill = document.querySelector(".topbar .pill.right");
  if (!rightPill) return;

  // ⭐ 별 치트 버튼
  const btnStar = document.createElement("button");
  btnStar.className = "pill btn small";
  btnStar.textContent = "+⭐ 테스트";

  btnStar.addEventListener("click", () => {
    // 한 번 누를 때마다 별 10개 추가 (원하면 숫자 바꿔도 됨)
    SAVE.stars += 10;
    renderHUD();
    renderShop();
    persist();
  });

  // 🎟 소원권 치트 버튼
  const btnWish = document.createElement("button");
  btnWish.className = "pill btn small";
  btnWish.textContent = "+🎟 테스트";

  btnWish.addEventListener("click", () => {
    // 한 번 누를 때마다 소원권 1장 추가
    SAVE.wishes = (SAVE.wishes || 0) + 1;
    renderHUD();
    renderAch();  // 기록 화면의 소원권/소원 노트도 같이 갱신
    persist();
  });

// ✅ 새로 추가: 레벨업 치트 버튼
  const btnLevel = document.createElement("button");
  btnLevel.className = "pill btn small";
  btnLevel.textContent = "+LV 테스트";
  btnLevel.addEventListener("click", () => {
    SAVE.level += 1;
    persist();
    renderHUD();
    toast(`개발자용: 레벨 ${SAVE.level}`);
  });

  rightPill.appendChild(btnStar);
  rightPill.appendChild(btnWish);
  rightPill.appendChild(btnLevel); // ← 이 줄 추가
}

  function fmtTime(ts) {
    const d = new Date(ts);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${mm}/${dd} ${hh}:${mi}`;
  }

  /***********************
   * Coupon token + QR
   ***********************/
  function b64urlEncode(str) {
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  }
  function b64urlDecode(b64url) {
    let s = b64url.replaceAll("-", "+").replaceAll("_", "/");
    while (s.length % 4) s += "=";
    const str = decodeURIComponent(escape(atob(s)));
    return str;
  }
  async function sha256hex(str) {
    const enc = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    const arr = Array.from(new Uint8Array(hash));
    return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async function makeToken(payloadObj) {
    const json = JSON.stringify(payloadObj);
    const body = b64urlEncode(json);
    const sig = await sha256hex(SECRET + body);
    return `${body}.${sig}`;
  }
  async function verifyToken(token) {
    const parts = token.split(".");
    if (parts.length !== 2) return { ok: false, reason: "형식 오류" };
    const [body, sig] = parts;
    const expect = await sha256hex(SECRET + body);
    if (expect !== sig) return { ok: false, reason: "서명 불일치" };
    try {
      const json = b64urlDecode(body);
      const payload = JSON.parse(json);
      return { ok: true, payload };
    } catch (e) {
      return { ok: false, reason: "내용 파싱 실패" };
    }
  }
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async function buyItem(item) {
    if (SAVE.stars < item.priceStars) return;
    SAVE.stars -= item.priceStars;

    const couponId = uuid();
    const payload = { v: 1, couponId, itemId: item.id, name: item.name, issuedAt: Date.now() };
    const token = await makeToken(payload);

    SAVE.wallet.push({
      id: couponId,
      itemId: item.id,
      name: item.name,
      priceStars: item.priceStars,
      createdAt: payload.issuedAt,
      token,
    });

    persist();
    renderHUD();
    renderShop();
    renderWallet();
    toast(`쿠폰 발급: ${item.name}`);
  }
  
      // QRCode 라이브러리가 없으면 동적으로 불러오는 헬퍼
    // QRCode 라이브러리를 여러 CDN에서 시도해서 로드
  async function ensureQRCodeLib() {
    // 이미 로드되어 있으면 바로 통과
    if (window.QRCode && typeof window.QRCode.toCanvas === "function") {
      return;
    }

    const urls = [
      "https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js",
      "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"
    ];

    let lastError = null;

    for (const url of urls) {
      try {
        // 같은 URL을 중복으로 안 붙이도록 체크
        const already = Array.from(document.scripts).some(s => s.src === url);
        if (!already) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = url;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("load failed: " + url));
            document.head.appendChild(script);
          });
        }

        // 로딩 후에 전역 객체가 생겼는지 확인
        if (window.QRCode && typeof window.QRCode.toCanvas === "function") {
          return; // 성공
        }
      } catch (e) {
        lastError = e;
      }
    }

    throw lastError || new Error("All QR CDNs failed");
  }
  

        let currentQrCoupon = null; // 파일 상단 어딘가 전역에 추가

function openQR(coupon) {
  if (!modalQR || !qrImage) return;

  currentQrCoupon = coupon;

  // 모달 열기
  modalQR.classList.remove("hidden");

  // 안내 문구 업데이트
  if (qrCaption) {
    qrCaption.textContent = coupon.redeemedAt
      ? "이미 사용한 쿠폰 기록이야 :)"
      : "자기야 이 QR을 나한테 보여주면\n내가 스캔해서 써줄게 ♡";
  }

  // 이미 사용된 쿠폰이면 더 이상 폴링 안 함
  if (coupon.redeemedAt) {
    // 사용완료 카드 렌더만 맞춰주고 종료
    renderWallet();
  } else {
    // 혹시 이전 타이머가 있으면 정리
    if (coupon._interval) {
      clearInterval(coupon._interval);
      coupon._interval = null;
    }

    // 3초마다 사용 여부 체크
    coupon._interval = setInterval(async () => {
      const before = coupon.redeemedAt;
      await checkCouponStatus(coupon); // 여기서 data.status === "used"면 redeemedAt 세팅

      // 이번 폴링에서 새로 사용됨으로 바뀐 경우
      if (!before && coupon.redeemedAt) {
        clearInterval(coupon._interval);
        coupon._interval = null;
        renderWallet();          // 지갑 리스트 “사용완료”로 갱신
        // 필요하면 토스트도 켜기
        // showUsedToast(coupon.name);
        if (qrCaption) {
          qrCaption.textContent = "사용 완료된 쿠폰이야 💖";
        }
      }
    }, 3000);
  }

  // 토큰 프리뷰
  if (qrTokenPreview) {
    const t = coupon.token || "";
    qrTokenPreview.textContent =
      t.length > 40 ? t.slice(0, 28) + "..." + t.slice(-10) : t;
  }

  // QR 이미지 생성
  const url =
    "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" +
    encodeURIComponent(coupon.token);

  qrImage.src = url;
}

  $("#btnCloseQR")?.addEventListener("click", () => {
  if (modalQR) modalQR.classList.add("hidden");

  // 열려 있던 쿠폰 폴링 정리
  if (currentQrCoupon && currentQrCoupon._interval) {
    clearInterval(currentQrCoupon._interval);
    currentQrCoupon._interval = null;
  }
  currentQrCoupon = null;
});
  
  
  const SHEET_URL = "https://script.google.com/macros/s/AKfycby11b5DMuLSJ4xvOKI115cVBqPllXqrCrtHsl2AW-Ue0Scfkr4PujR__AWwIGz18pjPkg/exec";
  
  // 소원 로그를 구글 시트(Apps Script)로 보내기
  async function sendWishToSheet(text, usedAt) {
    try {
      const body = JSON.stringify({
        type: "wish",
        text,
        usedAt,
      });

      const res = await fetch(SHEET_URL, {
        method: "POST",
        body,
      });

      // 응답은 꼭 안 써도 되지만, 콘솔 확인용으로 남겨둠
      const txt = await res.text();
      console.log("[sendWishToSheet]", res.status, txt);
    } catch (e) {
      console.error("[sendWishToSheet] error", e);
      // 네트워크 끊겨도 게임 로컬 기록은 남아야 하니까 여기서는 토스트 안 띄워도 됨
    }
  }

async function checkCouponStatus(coupon) {
  try {
    const res = await fetch(
      SHEET_URL + "?token=" + encodeURIComponent(coupon.token)
    );
    const data = await res.json();

    if (data.status === "used") {
      // 이미 사용된 쿠폰이면, 클라이언트에도 사용완료 표시
      coupon.redeemedAt = Date.now();
      persist();
      renderWallet();
      // 필요하면 토스트 같은 것도 띄우기
      // showUsedToast(coupon.name);
    }
    // not_used면 아무것도 안 함
  } catch (e) {
    console.log("checkCouponStatus error:", e);
  }
}

  /***********************
   * Verifier (scan QR)
   ***********************/
  let scanStream = null;
  let scanRAF = 0;

  $("#btnVerifier")?.addEventListener("click", async () => {
    if (!modalVerifier) return;
    modalVerifier.classList.remove("hidden");
    scanStatus && (scanStatus.textContent = "카메라 요청 중...");
    await startScan();
  });
  $("#btnCloseVerifier")?.addEventListener("click", async () => {
    await stopScan();
    modalVerifier && modalVerifier.classList.add("hidden");
  });

  async function startScan() {
    try {
      scanStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (!scanVideo) return;
      scanVideo.srcObject = scanStream;
      await scanVideo.play();
      scanStatus && (scanStatus.textContent = "QR을 비춰줘");
      scanLoop();
    } catch (e) {
      scanStatus && (scanStatus.textContent = "카메라 권한/HTTPS 문제로 시작 실패");
    }
  }
  async function stopScan() {
    cancelAnimationFrame(scanRAF);
    scanRAF = 0;
    if (scanVideo) {
      scanVideo.pause();
      scanVideo.srcObject = null;
    }
    if (scanStream) {
      scanStream.getTracks().forEach((t) => t.stop());
      scanStream = null;
    }
  }
  async function scanLoop() {
    if (!scanVideo || !scanCanvas) return;
    const w = scanVideo.videoWidth || 640;
    const h = scanVideo.videoHeight || 480;
    if (w && h) {
      scanCanvas.width = w;
      scanCanvas.height = h;
      const ctx2 = scanCanvas.getContext("2d");
      ctx2.drawImage(scanVideo, 0, 0, w, h);
      const img = ctx2.getImageData(0, 0, w, h);
      if (window.jsQR) {
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (code && code.data) {
          await onScanned(code.data);
        }
      }
    }
    scanRAF = requestAnimationFrame(scanLoop);
  }
  async function onScanned(token) {
    scanStatus && (scanStatus.textContent = "검증 중...");
    const res = await verifyToken(token);
    if (!res.ok) {
      scanStatus && (scanStatus.textContent = `실패: ${res.reason}`);
      return;
    }

    const { couponId } = res.payload;
    if (SAVE.redeemedIds.includes(couponId)) {
      scanStatus && (scanStatus.textContent = "이미 사용된 쿠폰");
      return;
    }

    const c = SAVE.wallet.find((x) => x.id === couponId);
    if (!c) {
      scanStatus && (scanStatus.textContent = "지갑에 없는 쿠폰(다른 기기 발급?)");
      return;
    }
    if (c.redeemedAt) {
      scanStatus && (scanStatus.textContent = "이미 사용 완료");
      return;
    }

    c.redeemedAt = Date.now();
    SAVE.redeemedIds.push(couponId);
    persist();
    renderHUD();
    renderWallet();
    scanStatus && (scanStatus.textContent = `✅ 사용 완료: ${c.name}`);
    toast(`사용 완료: ${c.name}`);
  }

  /***********************
   * iMessage brag
   ***********************/
  $("#btnBrag")?.addEventListener("click", () => bragAll());
  function bragAll() {
    const owned = SAVE.wallet.filter((x) => !x.redeemedAt).map((x) => x.name);
    const msg = owned.length
      ? `나 하임팡 지갑에 쿠폰 ${owned.length}개 있음 ㅎㅎ\n- ${owned.join(", ")}\n(원하면 하나 쓸게 ❤️)`
      : `나 하임팡 지갑에 쿠폰은 아직 없지만 곧 모을게 ❤️`;
    shareText(msg);
  }
  function bragOne(c) {
    const msg = `나 하임팡 지갑에 "${c.name}" 쿠폰 있음 ㅎㅎ\n(원하면 지금 QR로 쓸 수도 있어 ❤️)`;
    shareText(msg);
  }
  async function shareText(text) {
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        window.location.href = `sms:&body=${encodeURIComponent(text)}`;
      }
    } catch (e) {}
  }

  /***********************
   * Match-3 (Royal-ish FX)
   ***********************/
  const canvas = $("#gameCanvas");
  const ctx = canvas?.getContext("2d");

    const COLORS = [
    { base: "#ff4d6d", hi: "#ff8fab" },
    { base: "#ffd166", hi: "#fff3b0" },
    { base: "#06d6a0", hi: "#9bf6ff" },
    { base: "#9b5de5", hi: "#cdb4db" },
    { base: "#3a86ff", hi: "#a0c4ff" },
  ];

  // 체리 색상 이름 / 아이콘
  const COLOR_NAMES = ["빨간", "노란", "민트", "보라", "파란"];
  const COLOR_EMOJIS = ["🔴", "🟡", "🟢", "🟣", "🔵"];



  const STAGE_1 = {
    id: 1,
    moves: 18,
    ice: [
      "........",
      "..1111..",
      "..1..1..",
      "..1..1..",
      "..1..1..",
      "..1111..",
      "........",
      "........",
    ],
    dung: [
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
    ],
      missions: [
    // 1스테이지는 "빨간 체리 25개 모으기"만 미션으로 사용
    { type: "CLEAR_COLOR", colorIndex: 0, count: 25, done: 0 },
  ],
  rewardStars: 3,
};
  
  // 2스테이지: 얼음 메인 스테이지 (테두리 + 십자가)
const STAGE_2 = {
  id: 2,
  moves: 20,
  ice: [
    ".111111.",
    "11....11",
    "1.1111.1",
    "........",
    "........",
    "........",
    "........",
    "........"
  ],
  // 이 스테이지는 푸딩 없음
  dung: [
    "........",
    "........",
    "........",
    "........",
    "........",
    "........",
    "........",
    "........"
  ],
  missions: [
    // 색 모으기 + 얼음 깨기 2개 미션
    { type: "CLEAR_COLOR", colorIndex: 1, count: 20, done: 0 },
    { type: "BREAK_ICE", count: 0, done: 0 }
  ],
  rewardStars: 3
};

// 3스테이지: 푸딩 메인 스테이지 (하트 모양 푸딩 🍮)
const STAGE_3 = {
  id: 3,
  moves: 22,
  // 얼음 없음
  ice: [
    "........",
    "........",
    "........",
    "........",
    "........",
    "........",
    "........",
    "........"
  ],
  // 하트 모양 푸딩 패턴 (총 10개)
  dung: [
    "........",
    "........",
    "...11...",
    "..1111..",
    "..1111..",
    "........",
    "........",
    "........"
  ],
  missions: [
    // 색 모으기 + 푸딩 깨기 2개 미션
    { type: "CLEAR_COLOR", colorIndex: 2, count: 20, done: 0 },
    { type: "BREAK_DUNG", count: 10, done: 0 }
  ],
  rewardStars: 3
};


  /* ======================================
 *  Auto stage generator (colors + ice + pudding)
 *  - 8x8 기준
 *  - level >= 4 부터 사용
 * ====================================== */

const AUTO_ROWS = 8;
const AUTO_COLS = 8;

// 8x8 0으로 초기화된 마스크
function makeEmptyMask() {
  return Array.from({ length: AUTO_ROWS }, () =>
    Array.from({ length: AUTO_COLS }, () => 0)
  );
}

function maskToMap(mask) {
  return mask.map(row => row.map(v => (v ? "1" : ".")).join(""));
}

// 간단한 시드 기반 난수 (레벨마다 패턴 고정용)
function makeRng(seed) {
  let s = seed | 0;
  return function () {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 패턴 페인터들 ---------- */

// 테두리 얼음
function paintBorder(mask, thickness = 1) {
  const R = AUTO_ROWS, C = AUTO_COLS;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const top = r < thickness;
      const bottom = r >= R - thickness;
      const left = c < thickness;
      const right = c >= C - thickness;
      if (top || bottom || left || right) mask[r][c] = 1;
    }
  }
}

// 십자가(플러스)
function paintPlus(mask, armWidth = 1) {
  const R = AUTO_ROWS, C = AUTO_COLS;
  const midR = Math.floor(R / 2);
  const midC = Math.floor(C / 2);
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const inRow = Math.abs(r - midR) <= armWidth;
      const inCol = Math.abs(c - midC) <= armWidth;
      if (inRow || inCol) mask[r][c] = 1;
    }
  }
}

// 다이아몬드(◇)
function paintDiamond(mask, radius = 3) {
  const R = AUTO_ROWS, C = AUTO_COLS;
  const midR = Math.floor(R / 2);
  const midC = Math.floor(C / 2);
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const d = Math.abs(r - midR) + Math.abs(c - midC);
      if (d <= radius) mask[r][c] = 1;
    }
  }
}

// 좌우 대칭 랜덤 얼음 섬
function paintRandomIslands(mask, level) {
  const R = AUTO_ROWS, C = AUTO_COLS;
  const rng = makeRng(level * 1234567);
  const densityBase = 0.10 + Math.min(0.14, level * 0.01); // 레벨이 올라갈수록 조금씩 증가

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < Math.ceil(C / 2); c++) {
      if (rng() < densityBase) {
        mask[r][c] = 1;
        const mirrorC = C - 1 - c;
        mask[r][mirrorC] = 1; // 좌우 대칭
      }
    }
  }
}

// 중앙 푸딩 하트 (기본 밸류용)
function paintPuddingHeart(mask) {
  // 기존 수동 STAGE_3 하트랑 비슷한 패턴
  const pattern = [
    "........",
    ".11..11.",
    "11111111",
    "11111111",
    ".111111.",
    "..1111..",
    "...11...",
    "........"
  ];
  for (let r = 0; r < AUTO_ROWS; r++) {
    for (let c = 0; c < AUTO_COLS; c++) {
      if (pattern[r][c] === "1") mask[r][c] = 1;
    }
  }
}

/* === 여기부터 새로 추가 === */

// 1) 랜덤 섬 형태 푸딩 (여러 군데 흩어져 나오게)
function paintPuddingIslands(mask, rng, targetCount = 10) {
  const R = AUTO_ROWS, C = AUTO_COLS;

  // 대략 targetCount 근처로 랜덤
  const minCount = Math.max(6, targetCount - 3);
  const maxCount = targetCount + 4;
  const want = Math.floor(minCount + (maxCount - minCount) * rng());

  let placed = 0;
  let safety = 200;

  while (placed < want && safety-- > 0) {
    const r = (rng() * R) | 0;
    const c = (rng() * C) | 0;

    // 이미 푸딩이면 건너뛰기
    if (mask[r][c] === 1) continue;

    mask[r][c] = 1;
    placed++;

    // 주변에 1~2개 정도 추가로 붙여서 작은 군집 느낌
    const extra = (rng() < 0.5) ? 1 : 2;
    for (let i = 0; i < extra; i++) {
      const dr = ((rng() * 3) | 0) - 1; // -1~1
      const dc = ((rng() * 3) | 0) - 1;
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || rr >= R || cc < 0 || cc >= C) continue;
      if (mask[rr][cc] === 1) continue;
      mask[rr][cc] = 1;
      placed++;
      if (placed >= want) break;
    }
  }
}

// 2) 링(테두리) 형태 푸딩
function paintPuddingRing(mask) {
  const R = AUTO_ROWS, C = AUTO_COLS;
  const innerMargin = 1; // 테두리 두께 조절
  for (let r = innerMargin; r < R - innerMargin; r++) {
    for (let c = innerMargin; c < C - innerMargin; c++) {
      const edgeR = (r === innerMargin || r === R - innerMargin - 1);
      const edgeC = (c === innerMargin || c === C - innerMargin - 1);
      if (edgeR || edgeC) {
        mask[r][c] = 1;
      }
    }
  }
}

/* ---------- 자동 스테이지 생성 ---------- */

function makeAutoStage(level) {
  // world: 대략 5레벨 단위로 묶어서 기믹/난이도 단계 구분
  const world = Math.max(0, Math.floor((level - 4) / 5)); // 0,1,2,3,...
  const rng = makeRng(level * 987654321);

  // 얼음/푸딩 마스크
  const iceMask = makeEmptyMask();
  const dungMask = makeEmptyMask();

  // 1) 얼음 패턴 선택 (world에 따라 조금씩 다르게)
  const icePatternType = level % 4; // 0~3 순환
  if (icePatternType === 0) {
    // 테두리 + 얇은 십자가
    paintBorder(iceMask, 1);
    paintPlus(iceMask, 0);
  } else if (icePatternType === 1) {
    // 중앙 다이아몬드
    paintDiamond(iceMask, 3);
  } else if (icePatternType === 2) {
    // 두꺼운 십자가 + 일부 다이아
    paintPlus(iceMask, 1);
    if (world >= 1) paintDiamond(iceMask, 2);
  } else {
    // 좌우 대칭 랜덤 섬
    paintRandomIslands(iceMask, level);
  }

    // 2) 푸딩 패턴 (world 1부터 등장) - "나올지" + "모양"을 랜덤으로
  if (world >= 1) {
    // world에 따라 등장 확률 다르게
    const appearChance =
      world === 1 ? 0.5 :      // world 1 (대략 9~13레벨) → 50%
      world === 2 ? 0.7 :      // world 2 → 70%
                  0.85;        // world 3 이상 → 85%

    if (rng() < appearChance) {
      // 어떤 패턴으로 나올지 결정 (3종 랜덤)
      const patternType = (level + Math.floor(rng() * 1000)) % 3;

      if (patternType === 0) {
        // 기존 하트
        paintPuddingHeart(dungMask);
      } else if (patternType === 1) {
        // 여러 군데 섬처럼
        paintPuddingIslands(dungMask, rng, 10);
      } else {
        // 링(테두리) 형태
        paintPuddingRing(dungMask);
      }
    }
  }

  const iceMap = maskToMap(iceMask);
  const dungMap = maskToMap(dungMask);

  // 푸딩 개수 세기 (BREAK_DUNG 미션용)
  let puddingCount = 0;
  for (let r = 0; r < AUTO_ROWS; r++) {
    for (let c = 0; c < AUTO_COLS; c++) {
      if (dungMask[r][c] === 1) puddingCount++;
    }
  }

  // 3) 난이도 밸런스 파라미터
let baseMoves = 22 + Math.floor((level - 4) / 2);

// world가 올라갈수록 살짝씩 깎기
if (world >= 2) baseMoves -= 1; // 14레벨 이후 -1
if (world >= 4) baseMoves -= 1; // 24레벨 이후 한 번 더 -1

// 상한/하한
baseMoves = Math.max(18, Math.min(27, baseMoves));

// 색 미션 기본량: 레벨 올라갈수록 조금씩 증가 (대략 25~45 사이)
const colorTargetBase = 25 + Math.min(20, level * 2); // 기존 기본값

// ★ 4레벨 이후부터는 체리 요구 개수를 조금씩 줄여서 부드럽게
let colorTarget = colorTargetBase;
if (level >= 4 && level <= 6) {
  // 4~6 스테이지: 체감 확 줄도록 80%만 사용
  colorTarget = Math.floor(colorTargetBase * 0.8);
} else if (level >= 7 && level <= 9) {
  // 7~9 스테이지: 약간만 완화 (90%)
  colorTarget = Math.floor(colorTargetBase * 0.9);
} else if (level >= 10) {
  // 10 이상은 기본값 유지 (원하면 여기서도 줄일 수 있음)
  colorTarget = colorTargetBase;
}
  
  // ★ 빠져 있던 부분 다시 추가 (색 인덱스 계산)
  const mainColorIndex = (level - 1) % COLORS.length;
  const subColorIndex =
    COLORS.length > 3
      ? (mainColorIndex + 2) % COLORS.length
      : (mainColorIndex + 1) % COLORS.length;

  // 4) 미션 구성
  const missions = [];

  // (1) 메인 색 미션
missions.push({
  type: "CLEAR_COLOR",
  colorIndex: mainColorIndex,
  count: Math.min(35, colorTarget),  // colorTargetBase → colorTarget, 상한도 45 → 40으로 살짝 낮춤
  done: 0
});

  // (2) world 0에서는 보통 색+얼음, world 1 이상부터 서브 색 / 푸딩 추가
  // 얼음 미션은 개수는 startStage에서 실제 얼음 수로 재셋팅되므로 count=0으로 두고 시작
  let useIceMission = true;
  let useSubColor = false;
  let usePuddingMission = false;

  if (world === 0) {
    // 4~8레벨 근처: 색 + 얼음
    useIceMission = true;
    useSubColor = (level % 3 === 0); // 가끔 색 2개
  } else if (world === 1) {
    // 9~13레벨 근처: 색 2개 + 얼음
    useIceMission = true;
    useSubColor = true;
    usePuddingMission = (puddingCount > 0 && level % 2 === 1);
  } else {
    // world 2 이상: 색 2개 + 얼음 + 가끔 푸딩
    useIceMission = true;
    useSubColor = true;
    usePuddingMission = (puddingCount > 0);
  }

  if (useSubColor) {
  missions.push({
    type: "CLEAR_COLOR",
    colorIndex: subColorIndex,
    count: Math.min(35, Math.floor(colorTarget * 0.7)),
    done: 0
  });
}

  if (useIceMission) {
    missions.push({
      type: "BREAK_ICE",
      count: 0, // 실제 값은 startStage에서 얼음 개수로 다시 설정
      done: 0
    });
  }

  if (usePuddingMission) {
    missions.push({
      type: "BREAK_DUNG",
      count: puddingCount, // 푸딩 개수만큼
      done: 0
    });
  }

  return {
    id: level,       // 레벨 번호 그대로 id
    moves: baseMoves,
    ice: iceMap,
    dung: dungMap,
    missions,
    rewardStars: 3
  };
}
  


  const GAME = {
    rows: 8,
    cols: 8,
    cell: 0,
    boardX: 0,
    boardY: 0,
    grid: [],
    state: "IDLE",
    selected: null,
    pointerDown: false,
    downCell: null,
    swapAnim: null,
    movesLeft: 0,
    combo: 0,
    haimpangThisMove: false,
    stage: null,

     // ✅ 드래그 정보 추가
  pointerStartX: 0,
  pointerStartY: 0,
  dragAxis: null, // "H" 또는 "V"
    

    shakeT: 0,
    shakePow: 0,
    particles: [],

    resolveWait: 0,
    lastSwap: null,
    dropT: 0,

    beamFx: [],   // 로켓 라인 빔
    activeMissionIndex: 0,
    
    cleared: false,


  };

  GAME.grid = makeEmptyGrid();

  function makeEmptyGrid() {
    return Array.from({ length: GAME.rows }, () => Array.from({ length: GAME.cols }, () => null));
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = rect.width,
      H = rect.height;
    const pad = 18;
    const cell = Math.floor(Math.min((W - pad * 2) / GAME.cols, (H - pad * 2) / GAME.rows));
    GAME.cell = Math.max(50, Math.min(cell, 80));
    const bw = GAME.cell * GAME.cols;
    const bh = GAME.cell * GAME.rows;
    GAME.boardX = Math.floor((W - bw) / 2);
    GAME.boardY = Math.floor((H - bh) / 2);
  }
  
  
  function resizeBoardToFit() {
  if (!canvas || !ctx) return;

  const topbar = document.querySelector(".topbar");
  const hud    = document.querySelector(".gameHud");
  const btns   = document.querySelector(".gameBtns");

  const vh       = window.innerHeight;
  const topbarH  = topbar?.offsetHeight || 0;
  const hudH     = hud?.offsetHeight || 0;
  const btnH     = btns?.offsetHeight || 0;
  const padding  = 24; // 위/아래 여유

  // topbar를 제외한 실제 플레이 가능한 높이
  const playableH = vh - topbarH;

  // 그 안에서 HUD + 캔버스 + 버튼이 들어가야 하므로
  const maxCanvasH = playableH - hudH - btnH - padding;

  const minCanvasH = 320;
  const canvasH    = Math.max(minCanvasH, maxCanvasH);

  canvas.style.width  = "100%";
  canvas.style.height = `${canvasH}px`;

  // 보드 cell 사이즈, boardX/boardY 재계산
  resizeCanvas();
}
  
  window.addEventListener("resize", resizeBoardToFit);
  

  function camShake(pow = 10, t = 0.18) {
    GAME.shakePow = Math.max(GAME.shakePow, pow);
    GAME.shakeT = Math.max(GAME.shakeT, t);
  }

  function rnd(n) {
    return (Math.random() * n) | 0;
  }
  function inBounds(r, c) {
    return r >= 0 && r < GAME.rows && c >= 0 && c < GAME.cols;
  }
  function key(r, c) {
    return r * 100 + c;
  }
  function neighbors(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }
  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function easeOutBack(t) {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function isTile(cell) {
    return cell && cell.type === "T";
  }
  function isObstacle(cell) {
    return cell && cell.type === "O";
  }
  function makeTile(color, ice = false) {
    return { type: "T", kind: "N", color, ice, pop: 0 };
  }
  function makePudding() {
  return { type: "O", kind: "PUD", hp: 1, hit: 0 };
}


    function genBoard(stage) {
  const g = makeEmptyGrid();

  // 이 스테이지에 얼음 미션(BREAK_ICE)이 있는지 여부
  const useIce = stage.missions?.some((m) => m.type === "BREAK_ICE");

  for (let r = 0; r < GAME.rows; r++) {
    for (let c = 0; c < GAME.cols; c++) {
      const hasDung = stage.dung?.[r]?.[c] === "1";      // 푸딩(장애물) 여부
      const hasIce  = useIce && stage.ice?.[r]?.[c] === "1"; // 얼음 여부 (미션 없으면 무시)

      // 1) 푸딩 먼저
      if (hasDung) {
        g[r][c] = makePudding();
        continue;
      }

      // 2) 나머지는 일반 타일 + 필요하면 얼음
      const iceOnTile = !!hasIce;
      g[r][c] = makeTile(rnd(COLORS.length), iceOnTile);
    }
  }

    // 시작 보드에서 미리 매치 난 부분은 다시 섞기
    let safe = 100;
    while (safe-- > 0) {
      const m = findMatches(g);
      if (m.groups.length === 0) break;
      for (const pos of m.all) {
        const cell = g[pos.r][pos.c];
        if (isTile(cell)) {
          cell.color = rnd(COLORS.length);
          cell.kind = "N";
        }
      }
    }

    // 더 이상 만들 수 있는 움직임이 없으면 색만 섞어서 한 번 더 안전장치
    if (!hasAnyMove(g)) shuffleTileColors(g);

    return g;
  }

  function shuffleTileColors(g) {
    const flat = [];
    for (let r = 0; r < GAME.rows; r++) {
      for (let c = 0; c < GAME.cols; c++) {
        const cell = g[r][c];
        if (isTile(cell)) flat.push(cell.color);
      }
    }
    for (let i = flat.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    let k = 0;
    for (let r = 0; r < GAME.rows; r++) {
      for (let c = 0; c < GAME.cols; c++) {
        const cell = g[r][c];
        if (isTile(cell)) cell.color = flat[k++];
      }
    }
  }

  function swapCells(g, a, b) {
    const t = g[a.r][a.c];
    g[a.r][a.c] = g[b.r][b.c];
    g[b.r][b.c] = t;
  }

  function hasAnyMove(g) {
    for (let r = 0; r < GAME.rows; r++) {
      for (let c = 0; c < GAME.cols; c++) {
        if (!isTile(g[r][c])) continue;
        const a = { r, c };
        const right = { r, c: c + 1 },
          down = { r: r + 1, c };
        if (inBounds(right.r, right.c) && isTile(g[right.r][right.c]) && wouldMatch(g, a, right)) return true;
        if (inBounds(down.r, down.c) && isTile(g[down.r][down.c]) && wouldMatch(g, a, down)) return true;
      }
    }
    return false;
  }
  function wouldMatch(g, a, b) {
    swapCells(g, a, b);
    const m = findMatches(g);
    swapCells(g, a, b);
    return m.groups.length > 0;
  }

  function findMatches(g) {
    const mark = new Map();
    const groups = [];

    for (let r = 0; r < GAME.rows; r++) {
      let runColor = null,
        runStart = 0,
        runLen = 0;
      for (let c = 0; c < GAME.cols; c++) {
        const cell = g[r][c];
        const col = isTile(cell) ? cell.color : null;
        if (col !== null && col === runColor) {
          runLen++;
        } else {
          if (runLen >= 3) {
            const cells = [];
            for (let k = 0; k < runLen; k++) {
              const cc = runStart + k;
              mark.set(key(r, cc), true);
              cells.push({ r, c: cc });
            }
            groups.push({ orientation: "H", cells, len: runLen });
          }
          runColor = col;
          runStart = c;
          runLen = col === null ? 0 : 1;
        }
      }
      if (runLen >= 3) {
        const cells = [];
        for (let k = 0; k < runLen; k++) {
          const cc = runStart + k;
          mark.set(key(r, cc), true);
          cells.push({ r, c: cc });
        }
        groups.push({ orientation: "H", cells, len: runLen });
      }
    }

    for (let c = 0; c < GAME.cols; c++) {
      let runColor = null,
        runStart = 0,
        runLen = 0;
      for (let r = 0; r < GAME.rows; r++) {
        const cell = g[r][c];
        const col = isTile(cell) ? cell.color : null;
        if (col !== null && col === runColor) {
          runLen++;
        } else {
          if (runLen >= 3) {
            const cells = [];
            for (let k = 0; k < runLen; k++) {
              const rr = runStart + k;
              mark.set(key(rr, c), true);
              cells.push({ r: rr, c });
            }
            groups.push({ orientation: "V", cells, len: runLen });
          }
          runColor = col;
          runStart = r;
          runLen = col === null ? 0 : 1;
        }
      }
      if (runLen >= 3) {
        const cells = [];
        for (let k = 0; k < runLen; k++) {
          const rr = runStart + k;
          mark.set(key(rr, c), true);
          cells.push({ r: rr, c });
        }
        groups.push({ orientation: "V", cells, len: runLen });
      }
    }

    const all = [];
    mark.forEach((_, k) => {
      all.push({ r: Math.floor(k / 100), c: k % 100 });
    });

    return { groups, all };
  }

  function pickPivotForGroup(group, swapA, swapB) {
  // 1) 먼저 플레이어가 직접 스와핑한 칸을 우선 (지금과 동일)
  if (swapA && group.cells.some((p) => p.r === swapA.r && p.c === swapA.c)) {
    return swapA;
  }
  if (swapB && group.cells.some((p) => p.r === swapB.r && p.c === swapB.c)) {
    return swapB;
  }

  // 2) 그게 아니면, 그룹 안에 이미 스페셜(로켓/폭탄)이 있는 칸을 우선 피벗으로 사용
  for (const p of group.cells) {
    const cell = GAME.grid[p.r][p.c];
    if (isTile(cell) && cell.kind !== "N") {
      return p;
    }
  }

  // 3) 둘 다 아니면 예전처럼 가운데 칸
  return group.cells[(group.cells.length / 2) | 0];
}

  function activateSpecialAt(r, c, clearSet) {
  const cell = GAME.grid[r][c];
  if (!isTile(cell)) return;

  if (cell.kind === "RH") {
    // 가로 로켓
    for (let cc = 0; cc < GAME.cols; cc++) clearSet.add(key(r, cc));
    spawnRocketBeam(r, c, "H");
    spawnRocketTrail(r, c, "H");
  } else if (cell.kind === "RV") {
    // 세로 로켓
    for (let rr = 0; rr < GAME.rows; rr++) clearSet.add(key(rr, c));
    spawnRocketBeam(r, c, "V");
    spawnRocketTrail(r, c, "V");
  } else if (cell.kind === "B") {
    // 폭탄
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (inBounds(rr, cc)) clearSet.add(key(rr, cc));
      }
    }
    spawnBombWave(r, c);
  }
}


  function damageDungAt(r, c) {
    const cell = GAME.grid[r][c];
    if (!isObstacle(cell) || cell.kind !== "PUD") return false;
    cell.hp -= 1;
    cell.hit = 1;
    spawnDungChip(r, c);
    camShake(5, 0.12);
    if (cell.hp <= 0) {
      GAME.grid[r][c] = null;
      for (const m of GAME.stage.missions) {
        if (m.type === "BREAK_DUNG" && m.done < m.count) m.done++;
      }
      return true;
    }
    return false;
  }

// ✅ 스페셜(로켓/폭탄)끼리 스와핑했을 때 처리
function trySpecialSwap(a, b) {
  const cellA = GAME.grid[a.r][a.c];
  const cellB = GAME.grid[b.r][b.c];

  if (!isTile(cellA) || !isTile(cellB)) return false;

  const specA = cellA.kind !== "N";
  const specB = cellB.kind !== "N";

  // 둘 다 일반 블록이면 특수 스왑 아님
  if (!specA && !specB) return false;

  // 1) 스페셜 스왑이니 클리어 셋에 두 칸을 씨앗으로 넣기
  const clearSet = new Set();
  if (specA) clearSet.add(key(a.r, a.c));
  if (specB) clearSet.add(key(b.r, b.c));

  // 2) 필요하면 폭탄+폭탄 같은 경우 범위를 조금 키우는 것도 가능하지만,
  //    기본은 activateSpecialAt 체인으로 충분히 "빵 터지는" 느낌이 나므로 여기서는 그대로 둠.
  const cleared = applyClearAndMissions(clearSet);
  if (cleared <= 0) return false;

  // 3) 유효한 이동으로 처리
  GAME.movesLeft = Math.max(0, GAME.movesLeft - 1);
  hudMoves && (hudMoves.textContent = String(GAME.movesLeft));

  GAME.combo = 1;
  hudCombo && (hudCombo.textContent = "1");
  GAME.haimpangThisMove = false;

  camShake(6, 0.18);

  // 4) 이후 드롭 → 일반 매치 해소 루프 들어가도록 상태 전환
  GAME.state = "DROP";
  GAME.dropT = 0;
  GAME.lastSwap = null; // 콤보 생성용 스왑 정보는 없음

  return true;
}



  function applyClearAndMissions(clearSet) {
    let expanded = true;
    while (expanded) {
      expanded = false;
      for (const k of Array.from(clearSet)) {
        const r = Math.floor(k / 100),
          c = k % 100;
        const cell = GAME.grid[r][c];
        if (isTile(cell) && cell.kind !== "N") {
          const before = clearSet.size;
          activateSpecialAt(r, c, clearSet);
          if (clearSet.size !== before) expanded = true;
        }
      }
    }

    for (const k of Array.from(clearSet)) {
      const r = Math.floor(k / 100),
        c = k % 100;
      if (isObstacle(GAME.grid[r][c])) damageDungAt(r, c);
    }

    let clearedCount = 0;
    for (const k of clearSet) {
      const r = Math.floor(k / 100),
        c = k % 100;
      const cell = GAME.grid[r][c];
      if (!isTile(cell)) continue;

            for (const m of GAME.stage.missions) {
        // 색깔 블록 미션
        if (m.type === "CLEAR_COLOR" && cell.color === m.colorIndex && m.done < m.count) {
          m.done++;
        }
        // 얼음 미션
        if (m.type === "BREAK_ICE" && cell.ice && m.done < m.count) {
          m.done++;
        }
      }




      const nb = [{ r: r - 1, c }, { r: r + 1, c }, { r, c: c - 1 }, { r, c: c + 1 }];
      for (const p of nb) {
        if (inBounds(p.r, p.c) && isObstacle(GAME.grid[p.r][p.c])) damageDungAt(p.r, p.c);
      }

      GAME.grid[r][c] = null;
      clearedCount++;
      spawnPopVfx(r, c, cell.color, cell.kind);
    }

    return clearedCount;
  }

  function dropAndFill() {
    for (let c = 0; c < GAME.cols; c++) {
      let r = GAME.rows - 1;
      while (r >= 0) {
        while (r >= 0 && isObstacle(GAME.grid[r][c])) r--;
        if (r < 0) break;

        let segBot = r;
        while (r >= 0 && !isObstacle(GAME.grid[r][c])) r--;
        let segTop = r + 1;

        let write = segBot;
        for (let rr = segBot; rr >= segTop; rr--) {
          const cell = GAME.grid[rr][c];
          if (cell) {
            if (write !== rr) {
              GAME.grid[write][c] = cell;
              GAME.grid[rr][c] = null;
            }
            write--;
          }
        }
        for (let rr = write; rr >= segTop; rr--) {
          GAME.grid[rr][c] = makeTile(rnd(COLORS.length), false);
          spawnDropSpark(rr, c);
        }
      }
    }
  }



    function missionsText() {
  if (!GAME.stage) return "";
  return GAME.stage.missions
    .map((m) => {
      if (m.type === "CLEAR_COLOR") {
        const idx = m.colorIndex ?? 0;
        const colorName = COLOR_NAMES[idx % COLOR_NAMES.length] || "체리";
        const left = Math.max(0, m.count - m.done);
        return `${colorName} 체리 ${left}개`;
      }
      if (m.type === "BREAK_ICE")
        return `얼음 ${Math.max(0, m.count - m.done)}개`;
      if (m.type === "BREAK_DUNG")
        return `푸딩 ${Math.max(0, m.count - m.done)}개`;
      return "";
    })
    .filter(Boolean)
    .join(" / ");
}
  
  function renderMissionPills() {
  const wrap = document.getElementById("missionPills");
  if (!wrap || !GAME.stage) return;

  wrap.innerHTML = "";

  // 어떤 미션인지에 따라 아이콘 클래스 결정
  const iconClassFor = (m) => {
    if (m.type === "CLEAR_COLOR") {
      const idx = m.colorIndex ?? 0;
      // 체리 색상은 color-0 ~ color-4 로만 표현
      return `color-${idx % COLORS.length}`;
    }
    if (m.type === "BREAK_ICE") {
      // 얼음 아이콘
      return "icon-ice";
    }
    if (m.type === "BREAK_DUNG") {
      // 푸딩 아이콘
      return "icon-pudding";
    }
    return "icon-generic";
  };

  // count가 0인 미션은 표시하지 않음
  GAME.stage.missions.forEach((m) => {
    if (!m || m.count === 0) return;

    const left = Math.max(0, m.count - m.done);
    const doneClass = left === 0 ? " missionDone" : "";
    const iconClass = iconClassFor(m);

    const pill = document.createElement("div");
    pill.className = "missionPill" + doneClass;

    // ─ 체리: 색상 블럭 + 숫자 / 얼음·푸딩: 모양 아이콘 + 숫자 ─
    pill.innerHTML = `
      <div class="missionIcon ${iconClass}"></div>
      <div class="missionText">
        <div class="missionCount">${left}</div>
      </div>
    `;

    wrap.appendChild(pill);
  });
}
  
  
  
  function isStageClear() {
  // count가 0인 미션은 이미 완료된 것으로 취급
  return GAME.stage.missions.every((m) => m.count === 0 || m.done >= m.count);
}



  function triggerHaimpang() {
  if (GAME.haimpangThisMove) return;
  GAME.haimpangThisMove = true;

  flashOnce(900);
  splashOnce();

  SAVE.haimpangTotal++;
  if (SAVE.haimpangTotal % 10 === 0) {
    SAVE.wishes++;
    toast("소원권 +1 🎟️");
  } else {
    toast("하임팡! 💖");
  }

  persist();
  renderHUD();
}

  
  function showComboFloat(n, cx, cy) {
  if (n < 2) return;

  const template = document.getElementById("comboFloat");
  if (!template || !canvas) return;

  const canvasRect = canvas.getBoundingClientRect();
  const app = document.getElementById("app");
  const appRect = app ? app.getBoundingClientRect() : { left: 0, top: 0 };

  // 캔버스 내부 좌표(논리) → 실제 화면 좌표로 스케일 변환
  const scaleX = canvasRect.width  / canvas.width;
  const scaleY = canvasRect.height / canvas.height;

  const screenX = (canvasRect.left - appRect.left) + cx * scaleX;
  const screenY = (canvasRect.top  - appRect.top)  + cy * scaleY;

  // 템플릿을 복제해서 개별 인스턴스로 사용 (이전 콤보도 유지)
  const el = template.cloneNode(false);
  el.removeAttribute("id");
  el.textContent = `${n}콤보!`;

  el.style.position = "absolute";
  el.style.left = `${screenX}px`;
  el.style.top  = `${screenY}px`;
  el.style.opacity = "0";
// 잘못된 버전
// el.style.transform = "translate(-50%, 0) scale(0.7)`;

el.style.transform = "translate(-50%, 0) scale(0.7)";

  template.parentNode.appendChild(el);

  // 서서히 떠오르면서 스르륵 사라지는 애니메이션
  const anim = el.animate(
    [
      {
        transform: "translate(-50%, 0) scale(0.7)",
        opacity: 0
      },
      {
        transform: "translate(-50%, -8px) scale(1.1)",
        opacity: 1,
        offset: 0.30
      },
      {
        transform: "translate(-50%, -18px) scale(1.0)",
        opacity: 1,
        offset: 0.70
      },
      {
        transform: "translate(-50%, -28px) scale(1.0)",
        opacity: 0
      }
    ],
    {
      duration: 2500, // ← 여기 숫자로 '유지 시간' 조절
      easing: "cubic-bezier(.2,.9,.2,1)"
    }
  );

  anim.onfinish = () => {
    if (el.parentNode) el.parentNode.removeChild(el);
  };
}



  function flashOnce(ms = 420) {
    if (!flashEl) return;
    flashEl.classList.remove("hidden");
    flashEl.style.opacity = "0";
    flashEl
      .animate([{ opacity: 0 }, { opacity: 0.92 }, { opacity: 0 }], { duration: ms, easing: "ease-out" })
      .onfinish = () => {
        flashEl.classList.add("hidden");
        flashEl.style.opacity = "0";
      };
  }

  function splashOnce() {
  if (!splashEl) return;

  splashEl.classList.remove("hidden");
  const text = splashEl.querySelector(".splashText");

  text.textContent = "하임팡!";

  text.animate(
    [
      { transform: "scale(0.5) rotate(-8deg)", opacity: 0 },
      { transform: "scale(1.2) rotate(4deg)", opacity: 1, offset: 0.4 },
      { transform: "scale(1.0) rotate(-2deg)", opacity: 1, offset: 0.7 },
      { transform: "scale(0.95)", opacity: 0 }
    ],
    {
      duration: 1400,
      easing: "cubic-bezier(.2,.9,.2,1)"
    }
  ).onfinish = () => {
    splashEl.classList.add("hidden");
  };
}


  function resolveOnce(swapA = null, swapB = null) {
  const { groups, all } = findMatches(GAME.grid);
  if (groups.length === 0) return { cleared: 0, cx: null, cy: null };

  const clearSet = new Set(all.map((p) => key(p.r, p.c)));

  // ✅ 새로 추가: 가로/세로 그룹이 교차하는 칸(3x3 교차 등)을 폭탄으로 승급
  const cellFlags = new Map(); // key -> {h:bool, v:bool}
  for (const g of groups) {
    for (const p of g.cells) {
      const k = key(p.r, p.c);
      let f = cellFlags.get(k) || { h: false, v: false };
      if (g.orientation === "H") f.h = true;
      else f.v = true;
      cellFlags.set(k, f);
    }
  }

  const crossCenters = [];
  cellFlags.forEach((f, k) => {
    if (f.h && f.v) crossCenters.push(k);
  });

  for (const k of crossCenters) {
    const r = Math.floor(k / 100);
    const c = k % 100;
    const cell = GAME.grid[r][c];
    if (!isTile(cell)) continue;

    cell.kind = "B";   // 폭탄으로 승급
    cell.pop = 1;
    spawnSpecialSpawn(r, c);
    clearSet.delete(k); // 본인은 지워지지 않도록
  }

  // ★ 콤보 표시용 중심 좌표 계산 (격자 기준)
  let cx = null, cy = null;
  if (all.length > 0) {
    let sumR = 0, sumC = 0;
    for (const p of all) {
      sumR += p.r;
      sumC += p.c;
    }
    const ar = sumR / all.length;
    const ac = sumC / all.length;
    // 격자 -> 화면 좌표 변환
    cx = GAME.boardX + (ac + 0.5) * GAME.cell;
    cy = GAME.boardY + (ar + 0.5) * GAME.cell;
  }

  // 스페셜(로켓/폭탄) 변환 로직 그대로 유지
  for (const g of groups) {
    if (g.len === 4 || g.len >= 5) {
      const pivot = pickPivotForGroup(g, swapA, swapB);
      const pKey = key(pivot.r, pivot.c);
      const pivotCell = GAME.grid[pivot.r][pivot.c];
      if (!isTile(pivotCell)) continue;

      if (g.len === 4) {
        pivotCell.kind = g.orientation === "H" ? "RH" : "RV";
        pivotCell.pop = 1;
        spawnSpecialSpawn(pivot.r, pivot.c);
      } else {
        pivotCell.kind = "B";
        pivotCell.pop = 1;
        spawnSpecialSpawn(pivot.r, pivot.c);
      }
      clearSet.delete(pKey);
    }
  }

  const cleared = applyClearAndMissions(clearSet);
  return { cleared, cx, cy };
}

  /***********************
   * Input
   ***********************/
  function pointToCell(px, py) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = px - rect.left;
    const y = py - rect.top;
    const cx = x - GAME.boardX;
    const cy = y - GAME.boardY;
    const c = Math.floor(cx / GAME.cell);
    const r = Math.floor(cy / GAME.cell);
    if (!inBounds(r, c)) return null;
    return { r, c };
  }

  canvas?.addEventListener("pointerdown", (e) => {
  if (GAME.cleared) return;            // ✅ 클리어 후 입력 무시
  if (GAME.state !== "IDLE") return;

  GAME.pointerDown = true;
  GAME.pointerStartX = e.clientX;
  GAME.pointerStartY = e.clientY;
  GAME.dragAxis = null;

  const p = pointToCell(e.clientX, e.clientY);
  if (!p) return;
  GAME.downCell = p;
  handleSelect(p); // 탭으로도 선택 가능
});

  canvas?.addEventListener("pointermove", (e) => {
  if (GAME.cleared) return;            // ✅ 클리어 후 드래그 무시
  if (!GAME.pointerDown) return;
  if (GAME.state !== "IDLE") return;
  if (!GAME.downCell) return;

  const dx = e.clientX - GAME.pointerStartX;
  const dy = e.clientY - GAME.pointerStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // 셀 크기 기준으로 최소 드래그 거리 설정 (너무 예민하지 않게)
  const threshold = Math.max(8, GAME.cell * 0.25);

  // 아직 축이 정해지지 않았다면, 먼저 어느 방향으로 많이 움직였는지 본다
  if (!GAME.dragAxis) {
    if (absDx < threshold && absDy < threshold) {
      // 아직 충분히 안 움직였으면 스왑 안 함
      return;
    }
    GAME.dragAxis = absDx >= absDy ? "H" : "V";
  }

  let target = null;

  if (GAME.dragAxis === "H") {
    // 가로 드래그: x가 충분히 움직였을 때만
    if (absDx < threshold) return;
    const dir = dx > 0 ? 1 : -1; // 오른쪽 or 왼쪽
    target = { r: GAME.downCell.r, c: GAME.downCell.c + dir };
  } else {
    // 세로 드래그: y가 충분히 움직였을 때만
    if (absDy < threshold) return;
    const dir = dy > 0 ? 1 : -1; // 아래 or 위
    target = { r: GAME.downCell.r + dir, c: GAME.downCell.c };
  }

  if (!target || !inBounds(target.r, target.c)) return;

  // 여기서 한 번만 스왑하고 드래그 종료
  attemptSwap(GAME.downCell, target);
  GAME.pointerDown = false;
  GAME.downCell = null;
  GAME.dragAxis = null;
});


window.addEventListener("pointerup", () => {
  GAME.pointerDown = false;
  GAME.downCell = null;
  GAME.dragAxis = null;
});

window.addEventListener("pointercancel", () => {
  GAME.pointerDown = false;
  GAME.downCell = null;
  GAME.dragAxis = null;
});



  function handleSelect(p) {
    if (!GAME.selected) {
      GAME.selected = p;
      return;
    }
    const a = GAME.selected;
    if (a.r === p.r && a.c === p.c) {
      GAME.selected = null;
      return;
    }
    if (neighbors(a, p)) {
      attemptSwap(a, p);
      GAME.selected = null;
    } else {
      GAME.selected = p;
    }
  }

  function attemptSwap(a, b) {
    if (GAME.cleared) return;   // ✅ 클리어 후엔 스왑 자체를 차단
  // 이동 횟수 0이면 더 이상 스왑 불가 (클리어도 아닌 경우)
  if (GAME.movesLeft <= 0 && !isStageClear()) {
    toast("이동 횟수가 다 했어! 💔");
    return;
  }

  if (GAME.state !== "IDLE") return;
  if (!isTile(GAME.grid[a.r][a.c]) || !isTile(GAME.grid[b.r][b.c])) {
    camShake(3, 0.08);
    return;
  }

  GAME.state = "SWAP";
  GAME.swapAnim = { a, b, t: 0, dur: 0.20 };
}


  /***********************
   * Particles
   ***********************/
  function spawnPopVfx(r, c, color, kind) {
    const s = GAME.cell;
    const x = GAME.boardX + c * s + s / 2;
    const y = GAME.boardY + r * s + s / 2;

    for (let i = 0; i < 7; i++) {
      GAME.particles.push({
        kind: "heart",
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 110,
        vy: -80 - Math.random() * 110,
        life: 0.85 + Math.random() * 0.35, // longer
        age: 0,
        color,
      });
    }

    if (kind === "RH" || kind === "RV" || kind === "B") {
      for (let i = 0; i < 12; i++) {
        GAME.particles.push({
          kind: "spark",
          x,
          y,
          vx: (Math.random() - 0.5) * 160,
          vy: (Math.random() - 0.5) * 160,
          life: 0.45 + Math.random() * 0.25,
          age: 0,
          color,
        });
      }
    }
  }

  function spawnDropSpark(r, c) {
    const s = GAME.cell;
    const x = GAME.boardX + c * s + s / 2;
    const y = GAME.boardY + r * s + 6;
    GAME.particles.push({
      kind: "spark",
      x,
      y,
      vx: (Math.random() - 0.5) * 50,
      vy: 40 + Math.random() * 60,
      life: 0.45,
      age: 0,
      color: rnd(COLORS.length),
    });
  }

  function spawnSpecialSpawn(r, c) {
    const s = GAME.cell;
    const x = GAME.boardX + c * s + s / 2;
    const y = GAME.boardY + r * s + s / 2;
    for (let i = 0; i < 18; i++) {
      GAME.particles.push({
        kind: "spark",
        x,
        y,
        vx: (Math.random() - 0.5) * 220,
        vy: (Math.random() - 0.5) * 220,
        life: 0.55 + Math.random() * 0.22, // longer
        age: 0,
        color: rnd(COLORS.length),
      });
    }
    camShake(7, 0.12);
  }

  function spawnRocketTrail(r, c, dir) {
    const s = GAME.cell;
    const x = GAME.boardX + c * s + s / 2;
    const y = GAME.boardY + r * s + s / 2;

    for (let i = 0; i < 22; i++) {
      const t = i / 22;
      GAME.particles.push({
        kind: "trail",
        x: x + (dir === "H" ? (Math.random() - 0.5) * s : 0),
        y: y + (dir === "V" ? (Math.random() - 0.5) * s : 0),
        vx:
          dir === "H"
            ? (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 220)
            : (Math.random() - 0.5) * 40,
        vy:
          dir === "V"
            ? (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 220)
            : (Math.random() - 0.5) * 40,
        life: 0.26 + t * 0.14,
        age: 0,
        color: rnd(COLORS.length),
      });
    }
  }
  
  function spawnRocketBeam(r, c, dir){
  const s = GAME.cell;
  const x = GAME.boardX + c*s + s/2;
  const y = GAME.boardY + r*s + s/2;
  GAME.beamFx.push({ dir, x, y, t:0, life:0.18 });
}

function updateBeamFx(dt){
  const next = [];
  for (const b of GAME.beamFx){
    b.t += dt;
    if (b.t < b.life) next.push(b);
  }
  GAME.beamFx = next;
}

function drawBeamFx(){
  for (const b of GAME.beamFx){
    const k = 1 - (b.t / b.life);
    ctx.save();
    ctx.globalAlpha = 0.9 * k;
    ctx.lineCap = "round";

    // thick glow
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 16 * (0.6 + 0.4*k);
    ctx.beginPath();
    if (b.dir === "H"){
      ctx.moveTo(GAME.boardX + 8, b.y);
      ctx.lineTo(GAME.boardX + GAME.cols*GAME.cell - 8, b.y);
    } else {
      ctx.moveTo(b.x, GAME.boardY + 8);
      ctx.lineTo(b.x, GAME.boardY + GAME.rows*GAME.cell - 8);
    }
    ctx.stroke();

    // inner highlight
    ctx.globalAlpha = 0.65 * k;
    ctx.strokeStyle = "rgba(120,220,255,.95)";
    ctx.lineWidth = 6 * (0.6 + 0.4*k);
    ctx.beginPath();
    if (b.dir === "H"){
      ctx.moveTo(GAME.boardX + 8, b.y);
      ctx.lineTo(GAME.boardX + GAME.cols*GAME.cell - 8, b.y);
    } else {
      ctx.moveTo(b.x, GAME.boardY + 8);
      ctx.lineTo(b.x, GAME.boardY + GAME.rows*GAME.cell - 8);
    }
    ctx.stroke();

    ctx.restore();
  }
}


  function spawnBombWave(r, c) {
    const s = GAME.cell;
    const x = GAME.boardX + c * s + s / 2;
    const y = GAME.boardY + r * s + s / 2;
    GAME.particles.push({ kind: "ring", x, y, rr: 0, life: 0.45, age: 0 });
  }

  function spawnDungChip(r, c) {
    const s = GAME.cell;
    const x = GAME.boardX + c * s + s / 2;
    const y = GAME.boardY + r * s + s / 2;
    for (let i = 0; i < 10; i++) {
      GAME.particles.push({
        kind: "chip",
        x,
        y,
        vx: (Math.random() - 0.5) * 170,
        vy: -60 - Math.random() * 120,
        life: 0.55 + Math.random() * 0.25,
        age: 0,
      });
    }
  }

  function updateParticles(dt) {
    const next = [];
    for (const p of GAME.particles) {
      p.age += dt;
      if (p.age >= p.life) continue;
      const k = 1 - p.age / p.life;

      if (p.kind === "ring") {
        p.rr = 10 + (1 - k) * 140;
      } else {
        p.x += (p.vx || 0) * dt;
        p.y += (p.vy || 0) * dt;
        if (p.kind === "heart" || p.kind === "chip") p.vy += 180 * dt;
        if (p.kind === "spark" || p.kind === "trail") p.vy += 90 * dt;
      }
      next.push(p);
    }
    GAME.particles = next;
  }

  /***********************
   * Render
   ***********************/
  function render() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width,
      H = rect.height;
    ctx.clearRect(0, 0, W, H);

    let sx = 0,
      sy = 0;
    if (GAME.shakeT > 0) {
      sx = (Math.random() * 2 - 1) * GAME.shakePow;
      sy = (Math.random() * 2 - 1) * GAME.shakePow;
    }

    ctx.save();
    ctx.translate(sx, sy);

    drawBoardFrame();
    drawCells();
    drawBeamFx();
    drawSelection();
    drawParticles();

    ctx.restore();
  }

  function drawBoardFrame() {
    const bw = GAME.cell * GAME.cols;
    const bh = GAME.cell * GAME.rows;
    ctx.save();
    roundRect(GAME.boardX - 10, GAME.boardY - 10, bw + 20, bh + 20, 22);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.65)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawCells() {
    if (!GAME.grid || GAME.grid.length !== GAME.rows) return;

    const swap = GAME.swapAnim;
    let skip = null;
    if (swap) skip = new Set([key(swap.a.r, swap.a.c), key(swap.b.r, swap.b.c)]);

    for (let r = 0; r < GAME.rows; r++) {
      if (!GAME.grid[r]) continue;
      for (let c = 0; c < GAME.cols; c++) {
        if (skip && skip.has(key(r, c))) continue;
        const cell = GAME.grid[r][c];
        if (cell) drawCell(r, c, cell, 0, 0, 1);
      }
    }

    if (swap) {
      const { a, b, t, dur } = swap;
      const k = clamp01(t / dur);
      const e = easeInOutQuad(k);
      const dx = (b.c - a.c) * GAME.cell * e;
      const dy = (b.r - a.r) * GAME.cell * e;
      drawCell(a.r, a.c, GAME.grid[a.r][a.c], dx, dy, 1);
      drawCell(b.r, b.c, GAME.grid[b.r][b.c], -dx, -dy, 1);
    }
  }

  function drawCell(r, c, cell, ox, oy, alpha) {
    const x = GAME.boardX + c * GAME.cell + ox;
    const y = GAME.boardY + r * GAME.cell + oy;
    const s = GAME.cell;

    ctx.save();
    ctx.globalAlpha = 0.1;
    roundRect(x + 6, y + 6, s - 12, s - 12, 14);
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fill();
    ctx.restore();

    if (isObstacle(cell) && cell.kind === "PUD") {
  drawDung(x, y, s, cell, alpha);
  return;
}
    if (!isTile(cell)) return;

    const pad = 6;
    const bx = x + pad,
      by = y + pad,
      bw = s - pad * 2,
      bh = s - pad * 2;

    

    const pal = COLORS[cell.color];
    const popT = clamp01(cell.pop);
    const popS = 1 + 0.12 * easeOutBack(popT);
    const cx = bx + bw / 2,
      cy = by + bh / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(popS, popS);
    ctx.translate(-cx, -cy);

    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    roundRect(bx + 1, by + 3, bw, bh, 14);
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha;
    roundRect(bx, by, bw, bh, 14);
    const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    g.addColorStop(0, pal.hi);
    g.addColorStop(1, pal.base);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.globalAlpha = alpha * 0.28;
    roundRect(bx + 3, by + 3, bw - 6, bh * 0.42, 12);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha * 0.92;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,.88)";
    ctx.font = `900 ${Math.floor(s * 0.34)}px system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif`;

    let glyph = "🍒";
    if (cell.kind === "RH" || cell.kind === "RV") glyph = "🚀";
    if (cell.kind === "B") glyph = "💣";
    ctx.fillText(glyph, bx + bw / 2, by + bh / 2 + 1);

    if (cell.kind === "RH" || cell.kind === "RV") {
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = "rgba(255,255,255,.90)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (cell.kind === "RH") {
        ctx.moveTo(bx + 10, by + bh / 2);
        ctx.lineTo(bx + bw - 10, by + bh / 2);
      } else {
        ctx.moveTo(bx + bw / 2, by + 10);
        ctx.lineTo(bx + bw / 2, by + bh - 10);
      }
      ctx.stroke();
    }
    ctx.restore();
    
    // 🔵 여기 아래에 얼음 오버레이 추가
    if (cell.ice) {
      const ix = x + 3;
      const iy = y + 3;
      const iw = s - 6;
      const ih = s - 6;

      ctx.save();
      // 푸른 그라디언트 + 흰 테두리
      const g2 = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
      g2.addColorStop(0, "rgba(180,230,255,0.85)");
      g2.addColorStop(1, "rgba(120,200,255,0.9)");

      ctx.globalAlpha = 0.55;
      roundRect(ix, iy, iw, ih, 14);
      ctx.fillStyle = g2;
      ctx.fill();

      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      roundRect(ix, iy, iw, ih, 14);
      ctx.stroke();

      // 오른쪽 위에 작은 🧊 아이콘
      ctx.font = `900 ${Math.floor(s * 0.18)}px system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.fillText("🧊", ix + iw - 4, iy + 2);

      ctx.restore();
    }

    ctx.restore();
  }

  function drawDung(x, y, s, cell, alpha) {
  const pad = 8;
  const bx = x + pad,
        by = y + pad,
        bw = s - pad * 2,
        bh = s - pad * 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  const hit = clamp01(cell.hit);
  const tint = `rgba(255,220,180,${0.45 + hit * 0.25})`;

  roundRect(bx, by, bw, bh, 16);
  ctx.fillStyle = tint;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,.08)";
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,.5)";
  ctx.font = `1000 ${Math.floor(s * 0.28)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🍮", bx + bw / 2, by + bh / 2);

  ctx.font = `900 ${Math.floor(s * 0.16)}px system-ui`;
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.fillText(`x${cell.hp}`, bx + bw / 2, by + bh - 10);

  ctx.restore();
}


  function drawSelection() {
    if (!GAME.selected) return;
    const { r, c } = GAME.selected;
    const x = GAME.boardX + c * GAME.cell;
    const y = GAME.boardY + r * GAME.cell;
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,255,255,.80)";
    roundRect(x + 4, y + 4, GAME.cell - 8, GAME.cell - 8, 14);
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles() {
    for (const p of GAME.particles) {
      const k = 1 - p.age / p.life;
      ctx.save();
      ctx.globalAlpha = Math.max(0, k);

      if (p.kind === "heart") {
        const pal = COLORS[p.color];
        ctx.fillStyle = pal.hi;
        ctx.font = "1000 16px system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("♥", p.x, p.y);
      } else if (p.kind === "spark" || p.kind === "trail") {
        const pal = COLORS[p.color];
        ctx.fillStyle = pal.base;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === "chip") {
        ctx.fillStyle = "rgba(0,0,0,.18)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === "ring") {
        ctx.strokeStyle = "rgba(255,255,255,.85)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  /***********************
 * Stage & buttons
 ***********************/

// 수동 스테이지 테이블
const STAGES = {
  1: STAGE_1,
  2: STAGE_2,
  3: STAGE_3
};

// 현재 레벨에 맞는 스테이지 선택
function getCurrentStage() {
  const manual = STAGES[SAVE.level];
  if (manual) return manual;

  // 수동 맵이 없으면 자동 생성 스테이지 사용
  return makeAutoStage(SAVE.level);
}

$("#btnPlay")?.addEventListener("click", () => startStage(getCurrentStage()));
$("#btnQuit")?.addEventListener("click", () => showScreen("lobby"));
$("#btnRestartStage")?.addEventListener("click", () => startStage(getCurrentStage()));


  function startStage(stage) {
    GAME.cleared = false;  // ✅ 새 스테이지 시작 시 클리어 상태 해제
    GAME.stage = deepClone(stage);
    GAME.grid = genBoard(GAME.stage);
// ✅ ICE mission count auto-fix (ice + obstacle overlap 방지)
fixStageMissionCounts(GAME.stage);
    GAME.activeMissionIndex = 0;
    
    
  // 실제 보드 기준으로 얼음 미션 개수 재계산 + 난이도 클램프
  for (const m of GAME.stage.missions) {
    if (m.type === "BREAK_ICE") {
      let realIce = 0;

      // 실제 보드에 깔린 얼음 개수 계산
      for (let r = 0; r < GAME.rows; r++) {
        for (let c = 0; c < GAME.cols; c++) {
          const cell = GAME.grid[r][c];
          if (cell && cell.ice) realIce++;
        }
      }

      // 기본은 실제 개수
      let target = realIce;

      // 얼음이 많이 깔린 자동 스테이지용 난이도 조절:
      // - 얼음이 10개 이상이면 [10, 30] 안으로 클램프
      if (realIce >= 8) {
        target = Math.max(8, Math.min(realIce, 18));
      }
      // (실제 얼음이 10개 미만이면, target = realIce 그대로라서
      //  8개 깔렸으면 8개만 깨면 클리어 가능)

      m.count = target;
    }
  }
  



function fixStageMissionCounts(stage){
  // 실제 생성 가능한 얼음(= 장애물이 아닌 칸의 ice '1')만 카운트
  let iceCount = 0;
  for (let r=0;r<GAME.rows;r++){
    for (let c=0;c<GAME.cols;c++){
      const ice = stage.ice?.[r]?.[c] === "1";
      const obs = stage.dung?.[r]?.[c] === "1"; // 현재는 dung 맵을 장애물로 사용 중
      if (ice && !obs) iceCount++;
    }
  }

  for (const m of stage.missions){
    m.done = 0;
    if (m.type === "BREAK_ICE") m.count = iceCount;
  }
}

    GAME.grid = genBoard(GAME.stage);
    GAME.movesLeft = stage.moves;
    GAME.combo = 0;
    GAME.selected = null;
    GAME.state = "IDLE";
    GAME.particles = [];
    GAME.haimpangThisMove = false;
    GAME.resolveWait = 0;
    GAME.lastSwap = null;

    showScreen("game");

    // iOS/mobile first-frame safety
    requestAnimationFrame(() => {
      resizeBoardToFit(); // ← 여기로 교체
      hudMoves && (hudMoves.textContent = String(GAME.movesLeft));
      hudMission && (hudMission.textContent = missionsText());
      renderMissionPills();
      hudCombo && (hudCombo.textContent = "0");
    });
  }

  function deepClone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  setInterval(() => {
    if (!GAME.stage) return;
    if (!screens.game?.classList.contains("hidden")) {
      hudMission && (hudMission.textContent = missionsText());
      renderMissionPills();
      hudMoves && (hudMoves.textContent = String(GAME.movesLeft));
    }
  }, 140);

  /***********************
   * Main loop
   ***********************/
  let lastTs = 0;
  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.033, (ts - lastTs) / 1000);
    lastTs = ts;

    update(dt);
    render();

    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (GAME.shakeT > 0) {
      GAME.shakeT -= dt;
      if (GAME.shakeT <= 0) {
        GAME.shakeT = 0;
        GAME.shakePow = 0;
      } else {
        GAME.shakePow *= 0.92;
      }
    }

    if (GAME.state === "SWAP" && GAME.swapAnim) {
  GAME.swapAnim.t += dt;
  if (GAME.swapAnim.t >= GAME.swapAnim.dur) {
    const { a, b } = GAME.swapAnim;

    swapCells(GAME.grid, a, b);

    // ✅ 먼저 스페셜 스왑인지 확인
    if (trySpecialSwap(a, b)) {
      GAME.swapAnim = null;
      return; // 여기서 한 턴 처리 끝
    }

    // 그게 아니면 기존처럼 매치 검사
    const m = findMatches(GAME.grid);
    if (m.groups.length > 0) {
      GAME.movesLeft = Math.max(0, GAME.movesLeft - 1);
      GAME.combo = 0;
      GAME.haimpangThisMove = false;
      hudMoves && (hudMoves.textContent = String(GAME.movesLeft));

      GAME.state = "RESOLVE";
      GAME.lastSwap = { a, b };
      GAME.swapAnim = null;

      camShake(4, 0.1);
    } else {
      swapCells(GAME.grid, a, b);
      GAME.state = "IDLE";
      GAME.swapAnim = null;
      camShake(2, 0.08);
    }
  }
}

    if (GAME.state === "RESOLVE") {
  GAME.resolveWait += dt;
  if (GAME.resolveWait < 0.02) {
    // 여기서는 이펙트만 업데이트
    updateParticles(dt);
    updateBeamFx(dt);
    return;
  }
  GAME.resolveWait = 0;

  const { a, b } = GAME.lastSwap || {};
  const res = resolveOnce(a, b);

  // 실제로 뭔가가 터졌을 때만 콤보 증가 + 표시
  if (res.cleared > 0) {
    GAME.combo++;
    hudCombo && (hudCombo.textContent = String(GAME.combo));
    showComboFloat(GAME.combo, res.cx, res.cy);

    if (GAME.combo >= 5) {
      triggerHaimpang();
    }
  }

  renderMissionPills();

  if (res.cleared === 0) {
    GAME.state = "IDLE";
    GAME.combo = 0;
    hudCombo && (hudCombo.textContent = "0");
    GAME.lastSwap = null;

    if (isStageClear()) {
      onStageClear();
    } else if (GAME.movesLeft <= 0) {
      toast("자기야… 이동이 다했어 🥺");
    } else {
      if (!hasAnyMove(GAME.grid)) {
        shuffleTileColors(GAME.grid);
        toast("사랑으로 섞었어 💞");
      }
    }
  } else {
    GAME.state = "DROP";
    GAME.dropT = 0;
  }
}

    if (GAME.state === "DROP") {
      GAME.dropT += dt;
      if (GAME.dropT >= 0.18) {
        dropAndFill();
        GAME.state = "RESOLVE";
      }
    }

    // decay anim params
    for (let r = 0; r < GAME.rows; r++) {
      for (let c = 0; c < GAME.cols; c++) {
        const cell = GAME.grid[r]?.[c];
        if (isTile(cell)) cell.pop = Math.max(0, cell.pop - dt * 1.8);
        else if (isObstacle(cell)) cell.hit = Math.max(0, cell.hit - dt * 3.0);
      }
    }

    updateBeamFx(dt);
    updateParticles(dt);
  }

  function onStageClear() {
  // 보드 조작 잠금
  GAME.cleared = true;

  // 별/레벨 처리
  SAVE.stars += GAME.stage.rewardStars;
  SAVE.level = Math.max(SAVE.level, GAME.stage.id + 1);
  persist();
  renderHUD();
  renderShop();

  // 클리어 모달 내용 채우기
  const clearLevelEl = document.getElementById("clearLevel");
  const clearStarsEl = document.getElementById("clearStars");
  if (clearLevelEl) clearLevelEl.textContent = GAME.stage.id;
  if (clearStarsEl) clearStarsEl.textContent = GAME.stage.rewardStars;

  // 토스트는 선택: 살리고 싶으면 유지
  // toast(`클리어! ⭐+${GAME.stage.rewardStars}`);

  // 모달 표시
  const cm = document.getElementById("clearModal");
  if (cm) cm.classList.remove("hidden");
}
  
  const btnClearToLobby = document.getElementById("btnClearToLobby");
if (btnClearToLobby) {
  btnClearToLobby.addEventListener("click", () => {
    const cm = document.getElementById("clearModal");
    if (cm) cm.classList.add("hidden");

    GAME.cleared = false;
    showScreen("lobby");
  });
}

  /***********************
   * Init
   ***********************/
  function showScreen(name) {
  // 1) 모든 화면 숨기기
  Object.values(screens).forEach((el) => el.classList.add("hidden"));

  // 2) 선택한 화면만 보이게
  if (screens[name]) {
    screens[name].classList.remove("hidden");
  }

  // 3) 로비 / 인게임에 따라 스크롤 모드 전환
  if (name === "game") {
    // 인게임: 전체 스크롤 잠그고 풀스크린 모드
    document.body.classList.add("ingame");

    // 캔버스/보드 사이즈 재계산해서 화면에 딱 맞게
    // (이미 위쪽에 정의된 함수 – resizeCanvas 그대로 사용)
    resizeBoardToFit(); 
  } else {
    // 로비나 다른 화면: 일반 스크롤 모드
    document.body.classList.remove("ingame");
  }
}

  renderHUD();
  renderShop();
  renderWallet();
  renderAch();
  renderLobbyPhoto();
  
  setupDebugCheat(); 

  requestAnimationFrame(() => {
  resizeBoardToFit();  // ← 여기로 교체
  requestAnimationFrame(loop);
});
})();