// ============ CHIMP HOOD — $CHIMP ============
// Fill these in once the token is actually live. Everything on the page
// (CA chips, buy/chart/social buttons, live market data) reads from here.
const CONFIG = {
  CA: "", // e.g. "3fX...pump" — leave empty until minted
  BUY_URL: "#", // e.g. pump.fun / Jupiter / Raydium swap link
  CHART_URL: "https://dexscreener.com", // replace with the direct pair link once indexed
  X_URL: "#", // e.g. https://x.com/chimphoodsol
  TELEGRAM_URL: "", // leave empty to auto-disable the Telegram button
};

document.addEventListener("DOMContentLoaded", () => {
  wireButtons();
  wireCopyButtons();
  wireMobileNav();
  wireCountUps();
  loadMarketData();
});

// ---------- Buttons (buy / chart / x / telegram) ----------
function wireButtons() {
  const caReady = Boolean(CONFIG.CA);

  document.querySelectorAll("[data-buy-btn]").forEach((el) => {
    el.href = caReady ? CONFIG.BUY_URL : "#market";
    if (!caReady) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("market").scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  document.querySelectorAll("[data-chart-btn]").forEach((el) => {
    el.href = CONFIG.CHART_URL;
  });

  document.querySelectorAll("[data-x-btn]").forEach((el) => {
    el.href = CONFIG.X_URL;
  });

  document.querySelectorAll("[data-telegram-btn]").forEach((el) => {
    if (CONFIG.TELEGRAM_URL) {
      el.href = CONFIG.TELEGRAM_URL;
    } else {
      el.style.opacity = "0.45";
      el.style.pointerEvents = "none";
      el.textContent = "Telegram (soon)";
    }
  });
}

// ---------- CA copy chips ----------
function wireCopyButtons() {
  const display = CONFIG.CA || "TBA — posted at launch";
  const header = document.getElementById("caValueHeader");
  const hero = document.getElementById("caValueHero");
  if (header) header.textContent = display;
  if (hero) hero.textContent = display;

  document.querySelectorAll("#caChipHeader, #caChipHero").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!CONFIG.CA) {
        showToast("No contract yet — check back at launch");
        return;
      }
      try {
        await navigator.clipboard.writeText(CONFIG.CA);
        showToast("Contract address copied");
      } catch (err) {
        showToast("Copy failed — long-press to select manually");
      }
    });
  });
}

function showToast(message) {
  const toast = document.getElementById("copyToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- Mobile nav ----------
function wireMobileNav() {
  const btn = document.getElementById("hamburger");
  const nav = document.getElementById("mainNav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    })
  );
}

// ---------- Count-up stats ----------
function wireCountUps() {
  const els = document.querySelectorAll("[data-countup]");
  if (!els.length) return;

  const animate = (el) => {
    const target = Number(el.dataset.countup);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => observer.observe(el));
}

// ---------- Live market data (DexScreener) ----------
async function loadMarketData() {
  const box = document.getElementById("marketBox");
  if (!box) return;
  if (!CONFIG.CA) return; // placeholder text already in the HTML

  box.innerHTML = `<p class="market-placeholder">Loading live data…</p>`;

  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONFIG.CA}`);
    const data = await res.json();
    const pair = data && data.pairs && data.pairs[0];

    if (!pair) {
      box.innerHTML = `<p class="market-placeholder">Contract is live, but the pair hasn't been
        indexed by DexScreener yet — this section updates automatically once it is.</p>`;
      return;
    }

    const priceUsd = pair.priceUsd ? `$${Number(pair.priceUsd).toFixed(8)}` : "—";
    const mcap = pair.fdv ? `$${Number(pair.fdv).toLocaleString("en-US")}` : "—";
    const liq = pair.liquidity && pair.liquidity.usd
      ? `$${Number(pair.liquidity.usd).toLocaleString("en-US")}`
      : "—";
    const change = pair.priceChange && typeof pair.priceChange.h24 === "number"
      ? pair.priceChange.h24
      : null;
    const changeText = change === null ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
    const changeClass = change === null ? "" : change >= 0 ? "up" : "down";

    if (pair.url) CONFIG.CHART_URL = pair.url;
    document.querySelectorAll("[data-chart-btn]").forEach((el) => (el.href = CONFIG.CHART_URL));

    box.innerHTML = `
      <div class="market-grid">
        <div class="market-item">
          <p class="m-label">Price</p>
          <p class="m-value">${priceUsd}</p>
        </div>
        <div class="market-item">
          <p class="m-label">Market Cap (FDV)</p>
          <p class="m-value">${mcap}</p>
        </div>
        <div class="market-item">
          <p class="m-label">Liquidity</p>
          <p class="m-value">${liq}</p>
        </div>
        <div class="market-item">
          <p class="m-label">24h Change</p>
          <p class="m-value ${changeClass}">${changeText}</p>
        </div>
      </div>`;
  } catch (err) {
    box.innerHTML = `<p class="market-placeholder">Couldn't reach live market data right now —
      try the chart link above instead.</p>`;
  }
}
