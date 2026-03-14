// ——— Normal: loading animation → Connected → Website. Redirect: no loading screen, go straight to site. ———
(function loadingSequence() {
  var REDIRECT_KEY = "phantom-from-redirect";
  var screen = document.getElementById("loading-screen");
  var loadingPhase = document.getElementById("loading-phase");
  var connectedPhase = document.getElementById("connected-phase");
  if (!screen || !loadingPhase || !connectedPhase) return;

  connectedPhase.hidden = true;
  connectedPhase.style.display = "none";
  loadingPhase.hidden = false;
  loadingPhase.style.display = "";

  try {
    if (localStorage.getItem(REDIRECT_KEY)) {
      localStorage.removeItem(REDIRECT_KEY);
      // From redirect: show loading animation → Connected → site (same as normal)
    }
  } catch (e) {}

  // Normal and redirect: loading animation → Connected → site (only one phase visible at a time)
  setTimeout(function () {
    loadingPhase.classList.add("loading-fade-out");
  }, 2200);

  setTimeout(function () {
    loadingPhase.hidden = true;
    loadingPhase.style.display = "none";
    connectedPhase.hidden = false;
    connectedPhase.style.display = "flex";
    connectedPhase.classList.add("connected-visible");
  }, 2700);

  setTimeout(function () {
    screen.classList.add("loading-done");
    showPoliciesPopupIfNeeded();
  }, 4700);
})();

// ——— Policies popup (once per visit / acknowledged) ———
function showPoliciesPopupIfNeeded() {
  var POLICIES_KEY = "phantom-policies-ack";
  var overlay = document.getElementById("policies-overlay");
  var continueBtn = document.getElementById("policies-continue");
  var backdrop = overlay && overlay.querySelector(".policies-backdrop");
  if (!overlay || !continueBtn) return;

  function closeAndMaybeDailySummary() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    try { localStorage.setItem(POLICIES_KEY, "1"); } catch (e) {}
    showDailySummaryIfNeeded();
  }

  try {
    if (localStorage.getItem(POLICIES_KEY)) {
      showDailySummaryIfNeeded();
      return;
    }
  } catch (e) {}

  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  continueBtn.addEventListener("click", closeAndMaybeDailySummary, { once: true });
  if (backdrop) backdrop.addEventListener("click", closeAndMaybeDailySummary, { once: true });
}

// ——— Daily AI Summary popup (once per day) ———
function showDailySummaryIfNeeded() {
  var overlay = document.getElementById("daily-summary-overlay");
  var closeBtn = document.getElementById("daily-summary-close");
  var dateEl = document.getElementById("daily-summary-date");
  if (!overlay || !closeBtn) return;

  var KEY = "phantom-daily-summary-seen";
  var today = new Date().toDateString();

  function markSeen() {
    try { localStorage.setItem(KEY, today); } catch (e) {}
  }

  function openPopup() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    if (dateEl) dateEl.textContent = "Summary for " + today;
    markSeen();
  }

  function closePopup() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  }

  try {
    var lastSeen = localStorage.getItem(KEY);
    if (lastSeen !== today) openPopup();
  } catch (e) {
    openPopup();
  }

  closeBtn.addEventListener("click", closePopup);
  overlay.querySelector(".daily-summary-backdrop").addEventListener("click", closePopup);
}

const gameButtons = document.querySelectorAll(".game-button");

function getGameHtml(id) {
  const scriptClose = "</scr" + "ipt>";
  switch (id) {
    case "dodge":
      return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path fill='%232d3748' d='M8 11L24 11L22 15L10 15Z'/><path fill='%232d3748' d='M10 15L22 15L21 17L11 17Z'/><line x1='24' y1='11' x2='24' y2='20' stroke='%232d3748' stroke-width='1.5'/><circle cx='24' cy='13' r='1.2' fill='%232d3748'/><path fill='%232d3748' d='M23 20l1 4 2-1-1-3z'/></svg>" />
    <title>Realtime Student Portal</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        background: #020617;
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      canvas {
        background: #020617;
        border: 1px solid #1f2937;
        border-radius: 12px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.95);
      }
      .hud {
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.9);
        border-radius: 999px;
        padding: 4px 12px;
        font-size: 13px;
        border: 1px solid rgba(148, 163, 184, 0.6);
      }
    </style>
  </head>
  <body>
    <div class="hud">Use \u2190 and \u2192 to move &middot; Avoid falling blocks</div>
    <canvas id="game" width="420" height="600"></canvas>
    <script>
      const canvas = document.getElementById("game");
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;

      const player = { x: w / 2 - 20, y: h - 50, width: 40, height: 14, speed: 6 };
      let left = false, right = false;
      let obstacles = [];
      let spawnTimer = 0;
      let score = 0;
      let alive = true;

      function spawnObstacle() {
        const width = 40 + Math.random() * 80;
        const x = Math.random() * (w - width);
        const speed = 2.2 + Math.random() * 2.2 + score * 0.02;
        obstacles.push({ x, y: -20, width, height: 14, speed });
      }

      function rectsCollide(a, b) {
        return !(
          a.x + a.width < b.x ||
          a.x > b.x + b.width ||
          a.y + a.height < b.y ||
          a.y > b.y + b.height
        );
      }

      window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") left = true;
        if (e.key === "ArrowRight") right = true;
        if (!alive && e.key === " ") {
          obstacles = [];
          spawnTimer = 0;
          score = 0;
          alive = true;
        }
      });

      window.addEventListener("keyup", (e) => {
        if (e.key === "ArrowLeft") left = false;
        if (e.key === "ArrowRight") right = false;
      });

      function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, "#020617");
        gradient.addColorStop(1, "#020617");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      function loop() {
        requestAnimationFrame(loop);
        drawBackground();

        // Update player
        if (left) player.x -= player.speed;
        if (right) player.x += player.speed;
        player.x = Math.max(8, Math.min(w - player.width - 8, player.x));

        // Spawn obstacles
        spawnTimer -= 1;
        if (spawnTimer <= 0 && alive) {
          spawnObstacle();
          spawnTimer = Math.max(18, 50 - score * 0.5);
        }

        // Update obstacles
        obstacles.forEach((o) => {
          o.y += o.speed;
        });
        obstacles = obstacles.filter((o) => o.y < h + 30);

        // Collision + score
        if (alive) {
          obstacles.forEach((o) => {
            if (rectsCollide(player, o)) {
              alive = false;
            }
          });
          score += 0.03;
        }

        // Draw obstacles
        obstacles.forEach((o) => {
          const grad = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.height);
          grad.addColorStop(0, "#4b5563");
          grad.addColorStop(1, "#1f2937");
          ctx.fillStyle = grad;
          ctx.fillRect(o.x, o.y, o.width, o.height);
        });

        // Draw player
        ctx.fillStyle = alive ? "#60a5fa" : "#ef4444";
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Draw score
        ctx.fillStyle = "#9ca3af";
        ctx.font = "14px system-ui";
        ctx.textAlign = "left";
        ctx.fillText("Score: " + Math.floor(score), 10, 22);

        if (!alive) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.fillRect(40, h / 2 - 60, w - 80, 120);
          ctx.strokeStyle = "#4b5563";
          ctx.strokeRect(40, h / 2 - 60, w - 80, 120);
          ctx.fillStyle = "#e5e7eb";
          ctx.textAlign = "center";
          ctx.font = "20px system-ui";
          ctx.fillText("Game Over", w / 2, h / 2 - 20);
          ctx.font = "14px system-ui";
          ctx.fillStyle = "#9ca3af";
          ctx.fillText("Final score: " + Math.floor(score), w / 2, h / 2 + 4);
          ctx.fillText("Press SPACE to play again", w / 2, h / 2 + 28);
        }
      }

      loop();
    </script>
  </body>
</html>`;
    case "clicker":
      return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path fill='%232d3748' d='M8 11L24 11L22 15L10 15Z'/><path fill='%232d3748' d='M10 15L22 15L21 17L11 17Z'/><line x1='24' y1='11' x2='24' y2='20' stroke='%232d3748' stroke-width='1.5'/><circle cx='24' cy='13' r='1.2' fill='%232d3748'/><path fill='%232d3748' d='M23 20l1 4 2-1-1-3z'/></svg>" />
    <title>Realtime Student Portal</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        background: #020617;
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .wrap {
        text-align: center;
      }
      canvas {
        background: #020617;
        border-radius: 16px;
        border: 1px solid #1f2937;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.95);
        cursor: crosshair;
      }
      .hud {
        margin-bottom: 10px;
        font-size: 14px;
        color: #9ca3af;
      }
      button {
        margin-top: 8px;
        border-radius: 999px;
        border: 1px solid #4b5563;
        background: #111827;
        color: #e5e7eb;
        padding: 4px 12px;
        cursor: pointer;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="hud">
        Click the glowing circle as many times as you can in 20 seconds.
      </div>
      <canvas id="game" width="420" height="420"></canvas>
      <div class="hud" id="info"></div>
      <button id="restart">Restart</button>
    </div>
    <script>
      const canvas = document.getElementById("game");
      const ctx = canvas.getContext("2d");
      const info = document.getElementById("info");
      const restartBtn = document.getElementById("restart");

      const w = canvas.width;
      const h = canvas.height;

      let cx, cy, r;
      let score = 0;
      let timeLeft = 20;
      let playing = false;
      let timerId = null;

      function spawnCircle() {
        r = 26;
        cx = r + Math.random() * (w - r * 2);
        cy = r + Math.random() * (h - r * 2);
      }

      function draw() {
        ctx.clearRect(0, 0, w, h);
        const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, r + 14);
        grad.addColorStop(0, "rgba(96, 165, 250, 1)");
        grad.addColorStop(1, "rgba(15, 23, 42, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#60a5fa";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        info.textContent = "Score: " + score + " \u00b7 Time left: " + timeLeft.toFixed(1) + "s";

        if (!playing && timeLeft <= 0) {
          ctx.fillStyle = "rgba(15,23,42,0.92)";
          ctx.fillRect(40, h/2 - 60, w - 80, 120);
          ctx.strokeStyle = "#4b5563";
          ctx.strokeRect(40, h/2 - 60, w - 80, 120);
          ctx.fillStyle = "#e5e7eb";
          ctx.textAlign = "center";
          ctx.font = "20px system-ui";
          ctx.fillText("Time up!", w/2, h/2 - 18);
          ctx.font = "14px system-ui";
          ctx.fillStyle = "#9ca3af";
          ctx.fillText("Final score: " + score, w/2, h/2 + 6);
        }
      }

      function start() {
        score = 0;
        timeLeft = 20;
        playing = true;
        spawnCircle();
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
          timeLeft -= 0.1;
          if (timeLeft <= 0) {
            timeLeft = 0;
            playing = false;
            clearInterval(timerId);
          }
          draw();
        }, 100);
        draw();
      }

      canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dist = Math.hypot(x - cx, y - cy);
        if (playing && dist <= r + 4) {
          score++;
          spawnCircle();
          draw();
        } else if (!playing && timeLeft <= 0) {
          start();
        }
      });

      restartBtn.addEventListener("click", () => {
        start();
      });

      start();
    </script>
  </body>
</html>`;
    default:
      return null;
  }
}

function openGameById(id) {
  const popup = window.open("about:blank", "_blank");
  const html = getGameHtml(id);
  if (!html) return;

  if (popup) {
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  } else {
    document.open();
    document.write(html);
    document.close();
  }
}

function openUgsGame(fileId) {
  var name = fileId;
  if (name.indexOf(".") === -1) name = name + ".html";
  var url = "https://cdn.jsdelivr.net/gh/bubbls/ugs-singlefile/UGS-Files/" + encodeURIComponent(name) + "?t=" + Date.now();
  var popup = window.open("about:blank", "_blank");
  if (!popup) return;
  fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(text) {
      popup.document.open();
      popup.document.write(text);
      popup.document.close();
      popup.document.title = "Realtime Student Portal";
    })
    .catch(function() {
      popup.document.open();
      popup.document.write("<html><head><title>Realtime Student Portal</title></head><body><p>Failed to load game. Check the console.</p></body></html>");
      popup.document.close();
    });
}

var gamesGrid = document.querySelector(".games-grid");
if (gamesGrid) {
  gamesGrid.addEventListener("click", function(e) {
    var btn = e.target.closest(".game-button");
    if (!btn) return;
    var id = btn.getAttribute("data-game-id");
    if (!id) return;
    if (id.indexOf("ugs:") === 0) {
      openUgsGame(id.slice(4));
    } else {
      openGameById(id);
    }
  });
}

function formatUgsTitle(fileId) {
  var s = fileId.indexOf("cl") === 0 ? fileId.slice(2) : fileId;
  s = s.replace(/([a-z])([0-9])/gi, "$1 $2").replace(/([0-9])([a-zA-Z])/g, "$1 $2");
  s = s.replace(/([a-z])([A-Z])/g, "$1 $2");
  return s.replace(/\b\w/g, function(c) { return c.toUpperCase(); }).trim();
}

function addUgsGameButton(fileId) {
  var title = formatUgsTitle(fileId);
  if (title.length > 32) title = title.slice(0, 29) + "...";
  var btn = document.createElement("button");
  btn.className = "game-button";
  btn.setAttribute("data-game-id", "ugs:" + fileId);
  btn.innerHTML = "<span class=\"game-title\">" + title + "</span>\n            <span class=\"game-tagline\">Open in new tab.</span>";
  gamesGrid.appendChild(btn);
}

var ugsList = typeof window.UGS_FILES !== "undefined" && window.UGS_FILES;
if (ugsList && Array.isArray(ugsList)) {
  ugsList.forEach(function(fileId) {
    if (fileId && typeof fileId === "string") addUgsGameButton(fileId);
  });
}

function filterGamesBySearch() {
  var searchEl = document.getElementById("game-search");
  var countEl = document.getElementById("game-count");
  var q = (searchEl && searchEl.value) ? searchEl.value.trim().toLowerCase() : "";
  var buttons = document.querySelectorAll(".games-grid .game-button");
  var total = buttons.length;
  var visible = 0;
  buttons.forEach(function(btn) {
    var titleEl = btn.querySelector(".game-title");
    var taglineEl = btn.querySelector(".game-tagline");
    var text = ((titleEl && titleEl.textContent) || "") + " " + ((taglineEl && taglineEl.textContent) || "");
    var match = !q || text.toLowerCase().indexOf(q) !== -1;
    btn.classList.toggle("search-hidden", !match);
    if (match) visible++;
  });
  if (countEl) {
    if (q && visible !== total) {
      countEl.textContent = "Showing " + visible + " of " + total.toLocaleString() + " games";
    } else {
      countEl.textContent = total.toLocaleString() + " game" + (total === 1 ? "" : "s");
    }
  }
}

var gameSearchEl = document.getElementById("game-search");
if (gameSearchEl) {
  gameSearchEl.addEventListener("input", filterGamesBySearch);
  gameSearchEl.addEventListener("search", filterGamesBySearch);
}
filterGamesBySearch();

// ——— Automatically read email from browser, display "*email* connected" ———
(function emailConnect() {
  var STORAGE_KEY = "phantom-learning-email";
  var containerEl = document.getElementById("email-connect");
  var displayEl = document.getElementById("email-display");

  var hasCredentials = typeof navigator !== "undefined" && navigator.credentials && typeof navigator.credentials.get === "function";

  function getStoredEmail() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function setStoredEmail(email) {
    try {
      if (email) localStorage.setItem(STORAGE_KEY, email);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function showEmail(email) {
    if (!containerEl || !displayEl) return;
    displayEl.textContent = "*" + email + "*";
    containerEl.hidden = false;
  }

  function hideEmail() {
    if (containerEl) containerEl.hidden = true;
  }

  function tryGetEmailSilent() {
    if (!hasCredentials) return Promise.resolve(null);
    return navigator.credentials.get({ password: true, mediation: "silent" })
      .then(function (cred) {
        if (cred && cred.id) return cred.id;
        return null;
      })
      .catch(function () { return null; });
  }

  var saved = getStoredEmail();
  if (saved) {
    showEmail(saved);
  } else if (hasCredentials) {
    tryGetEmailSilent().then(function (email) {
      if (email) {
        setStoredEmail(email);
        showEmail(email);
      } else {
        hideEmail();
      }
    }).catch(hideEmail);
  } else {
    hideEmail();
  }
})();

// "This is [word]" — rotating word with cool styling
const taglineWordEl = document.getElementById("tagline-word");
if (taglineWordEl) {
  const words = [
    "trustworthy",
    "safe",
    "unblocked",
    "private",
    "secure",
    "reliable",
  ];
  let idx = 0;
  setInterval(() => {
    taglineWordEl.classList.add("fade");
    setTimeout(() => {
      idx = (idx + 1) % words.length;
      taglineWordEl.textContent = words[idx];
      taglineWordEl.classList.remove("fade");
    }, 250);
  }, 2200);
}
