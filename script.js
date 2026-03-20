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
  }, 1300);

  setTimeout(function () {
    loadingPhase.hidden = true;
    loadingPhase.style.display = "none";
    connectedPhase.hidden = false;
    connectedPhase.style.display = "flex";
    connectedPhase.classList.add("connected-visible");
  }, 1650);

  setTimeout(function () {
    screen.classList.add("loading-done");
    document.body.classList.add("loading-complete");
    markPopupsDone();
  }, 3000);
})();

// ——— Show signed-in email on main page (from Auth0 redirect) ———
(function signedInEmail() {
  var bar = document.getElementById("signed-in-bar");
  var emailEl = document.getElementById("signed-in-email");
  var signOutLink = document.getElementById("sign-out-link");
  if (!bar || !emailEl) return;

  try {
    var email = localStorage.getItem("phantom-user-email");
    var name = localStorage.getItem("phantom-user-name");
    if (email) {
      emailEl.textContent = name ? name + " (" + email + ")" : email;
      bar.style.display = "flex";
    }
  } catch (e) {}

  if (signOutLink) {
    signOutLink.addEventListener("click", function () {
      try {
        localStorage.removeItem("phantom-user-email");
        localStorage.removeItem("phantom-user-name");
      } catch (e) {}
    });
  }
})();

function markPopupsDone() {
  document.body.classList.add("popups-done");
  var gameArea = document.getElementById("game-area");
  if (gameArea) gameArea.setAttribute("aria-hidden", "false");
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
      popup.document.write("<html><head><title>Realtime Student Portal</title></head><body><p>Failed to load content. Check the console.</p></body></html>");
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
  btn.type = "button";
  btn.className = "game-button game-button-tile";
  btn.setAttribute("data-game-id", "ugs:" + fileId);
  btn.setAttribute("data-categories", inferUgsCategories(fileId));
  btn.innerHTML =
    '<span class="game-button-copy"><span class="game-title">' +
    title +
    '</span><span class="game-tagline">Open in new tab.</span></span>';
  gamesGrid.appendChild(btn);
}

/**
 * Infer category tabs from the same title users see (formatUgsTitle) plus raw id
 * for tokens like "nfs", "doom", "cl2048".
 */
function inferUgsCategories(fileId) {
  var cats = [];
  var title = formatUgsTitle(fileId || "");
  var hay = (title + " " + (fileId || "")).toLowerCase();

  function any(reList) {
    for (var i = 0; i < reList.length; i++) {
      if (reList[i].test(hay)) return true;
    }
    return false;
  }

  // Sports — checked before generic “ball” / “goal” elsewhere
  if (
    any([
      /\bsoccer\b/,
      /\brugby\b/,
      /\btennis\b/,
      /\bvolley\b/,
      /\b(basketball|baseball|hockey|cricket)\b/,
      /\bgolf\b/,
      /miniature\s+golf/,
      /\bputt\b/,
      /\bfootball\b/,
      /\bnfl\b/,
      /\bnba\b/,
      /\bnhl\b/,
      /\bfifa\b/,
      /\bmadden\b/,
      /\bcrunch[\s-]?ball\b/i,
      /\b8[\s-]*ball\b/,
      /\bbilliard\b/,
      /\b(snooker|pool)\b/,
      /\bping[\s-]?pong\b/,
      /\btable[\s-]?tennis\b/,
      /\bboxing\b/,
      /\bwrestle\b/,
      /\bwwe\b/,
      /\bmma\b/,
      /\b(ufc|judo|karate|taekwondo)\b/,
      /\bskate(board|ing)?\b/,
      /\bski(ing)?\b|\bsurf(ing)?\b/,
      /\bsnowboard\b/,
      /\bolympics?\b/,
      /\bworld[\s-]?cup\b/,
      /\bstriker\b/,
      /\bpenalt(y|ies)\b/,
      /\bfreekick\b/,
      /\bgolfer?\b/,
      /\b1v1[\s-]?(tennis|soccer|lol)\b/,
      /\b1[\s-]?on[\s-]?1[\s-]?(soccer|tennis)\b/,
      /\b4th[\s-]?and[\s-]?goal\b/,
      /\b2[\s-]?34[\s-]?player\b/i,
      /touchdown|quarterback|linebacker/i,
      /\bbowl(ing)?\b/,
      /\bpinball\b/i,
      /\bdarts?\b/,
      /\bsports?\b/,
      /\bfitness\b.*\b(game|sim)\b/i,
      /\b(final\s+)?(four|march\s*madness)\b/i,
      /\bmlb\b|\bmls\b/,
      /\bgame[\s-]?(ball|sport)\b/i,
      /\bball(?!oon)\b.*\b(pro|league|stars|blitz)\b/i,
      /\bcurve[\s-]?ball\b/i,
      /\b(homerun|home\s+run)\b/i,
      /\bhoops?\b/,
      /\bpuck\b/i,
      /\bstick\s*(\&|and)\s*puck\b/i,
    ])
  ) {
    cats.push("sports");
  }

  // Driving / vehicles
  if (
    any([
      /\b(racing|\brace\b|racer|racers)\b/,
      /\b(driv(e|ing)|driver)\b/,
      /\bdrift\b/,
      /\bcar\b.*\b(race|sim|crash|drift)\b|\b(race|drift).*[\s-]?car\b/i,
      /\b(truck|rig)\b.*\b(race|sim|park|driver)\b|\b(semi|pickup)\b/i,
      /\bkart\b/,
      /\bgo[\s-]?kart\b/i,
      /\bformula\b|\bf1\b|\bf[\s-]?zero\b/i,
      /\brally\b/,
      /\bnitro\b.*\b(boost|race)\b|\bctgpnitro\b/i,
      /\b(park|parking)\b.*\b(car|mania|sim)\b|\b(car|truck)[\s-]?park/i,
      /\btaxi\b.*\b(race|mania|crazy)\b|\bcrazy\s*taxi\b/i,
      /\bmotor\s*cycle\b|\bmotorbike\b|\bmoto\s*(gp|race|x)\b/i,
      /\bdirt[\s-]?bike\b|\bstunt[\s-]?bike\b/i,
      /\bvehicle\b.*\b(sim|battle)\b/i,
      /\b(nfs|nfscarbon|nfsmw|nfsu|nfsmostwanted|nfsunderground|nfsunleashed|nfsporsche)\b/i,
      /need[\s-]?for[\s-]?speed/i,
      /\bdemolition[\s-]?(derby|crash)|\bderby[\s-]?(crash|race)\b/i,
      /\bhighway\b.*\b(race|rush|havoc)\b/i,
      /\bgrand[\s-]?prix\b/,
      /\bcircuit\b.*\b(race|gp)\b/i,
      /\bforza\b|\bburnout\b|\basphalt\b|\bgrid\b.*\bautos?\b/i,
      /\broad[\s-]?(rash|trip|fury)\b/i,
      /\b(death|rally)[\s-]?chase\b/i,
      /\bfuel\b.*\b(race|run)\b/i,
      /\bturbo\b.*\b(race|drift)\b/i,
      /\bcyber.*\b(ride|racing)\b|bungracing|cyberbun/i,
      /\w+racing\b|\w+drift\b/,
      /\bhorse[\s-]?(race|derby)\b/i,
      /\batv\b.*\b(quad|race)\b/i,
      /\bsled\b.*\b(race|run)\b/i,
      /\btrain[\s-]?(sim|driving)\b/i,
      /\btraffic\b.*\b(race|racer|run)\b/i,
      /\bdonkey[\s-]?kong[\s-]?racing\b/i,
      /\bmario[\s-]?kart\b/i,
      /\b(rocket\s*league|wipeout|f[- ]?zero)\b/i,
    ])
  ) {
    cats.push("driving");
  }

  // Shooters & combat shooters
  if (
    any([
      /\b(shoot|shooter|shooting)\b/i,
      /\b(bullet|bullets|ammo|magazine)\b/,
      /\bsniper\b/,
      /\bgun\b(?![\s-]?geon)/i,
      /\b(pistol|rifle|shotgun|revolver|grenade|bazooka)\b/,
      /\bfps\b|\bfirst[\s-]person\b.*\bshoot/i,
      /\bdoom\b/,
      /\bzombie(s)?\b.*\b(shoot|surviv|defense|hunt)\b|\b(shoot|hunt)\b.*\bzombie/i,
      /\bweapon(s)?\b/,
      /\bwarfare\b|\bcall[\s-]?of[\s-]?duty\b|\bcod\b.*\b(gun|war|ops)\b/i,
      /\b(halo|quake|unreal)\b/,
      /\bcounter[\s-]?strike|csgoclicker|\bcs\s*16\b|\bgo\s*fps\b/i,
      /\bdeath[\s-]?(match|wish)\b/,
      /\bspace[\s-]?(invad|shooter|battle)\b/,
      /\binvad(er|ers)\b/,
      /\bgalaga\b|\bdefender\b.*\barcade\b/i,
      /\bturret\b|\btower[\s-]?(gun|blast)\b/i,
      /\barch(er|ery)\b/,
      /\bduck[\s-]?hunt\b/,
      /\bmetal[\s-]?slug\b/,
      /\bcontra\b/,
      /\bbullet[\s-]?hell\b/,
      /\blaser\b.*\b(shoot|blast)\b|\bblast(er|ers)\b.*\b(neo|space|alien)\b/i,
      /\bpixel[\s-]?gun\b|\bfortnite\b|\bapex\b/i,
      /\boverwatch\b|\bvalorant\b|\bpaladins?\b/i,
      /\bstorm[\s-]?(trooper|rifle)\b/i,
      /\bswat\b|\bpolice[\s-]?(shooter|snipe)\b/i,
      /\bstar[\s-]?wars\b.*\b(shoot|battle|squadron)\b/i,
      /\bred[\s-]?faction\b|\bdistrict\b.*\b187\b/i,
      /\bno[\s-]?more[\s-]?heroes\b/i,
      /\bniteclient\b|\bace[\s-]?combat\b|\bwar[\s-]?hawk\b/i,
      /\b(last|rogue)[\s-]?(stand|company)\b.*\bshooter\b/i,
      /\b500\s*caliber\b/i,
      /\btank(s)?\b.*\b(blast|battle|war|1990|trouble)\b|\b(battle|blast)[\s-]?tank(s)?\b/i,
      /\bwild[\s-]?guns\b|\bgun[\s-]?(star|smoke|point)\b/i,
      /\boperation\b.*\b(wolf|cobra|thunder)\b/i,
      /\btime[\s-]?crisis\b|\bpoint[\s-]?blank\b/i,
      /\bsilent[\s-]?scope\b/,
      /\bresident[\s-]?evil\b.*\b(shoot|gun|4|5|6)\b/i,
      /\b(goldeneye|perfect\s+dark)\b/i,
      /\bmetroid\b.*\b(prime)\b/i,
      /\bkill[\s-]?(zone|switch)\b/i,
      /\bmedal[\s-]?of[\s-]?honor\b|\bbattlefield\b|\b(bf|bc)2\b/i,
      /\bteam[\s-]?(fortress|deathmatch)\b/i,
      /\bunreal[\s-]?tournament\b/,
      /\bquake\b|\b(doom|heretic|hexen)\b/,
      /\b(left|right)\s*4\s*dead\b|\bl4d\b/i,
      /\bplants\b.*\bzombies\b/,
      /\bdefend\b.*\b(castle|nuts|tower)\b.*\b(shoot|bow|arrow)\b/i,
    ])
  ) {
    cats.push("shooting");
  }

  // Arcade & casual: puzzle, platformer, idle, classic, adventure-lite
  if (
    any([
      /\b(puzzle|tetris|2048|sudoku|minesweeper|nonogram|kakuro)\b/,
      /\b(idle|tycoon|clicker|merge|incremental)\b/,
      /\bmatch[\s-]?(3|three)\b|\bcandy\b.*\b(crush|saga)\b/i,
      /\bbubble\b.*\b(shoot|pop|witch)\b/i,
      /\b(breakout|arkanoid|pong)\b/,
      /\b(snake|maze|labyrinth)\b/,
      /\bpac[\s-]?man\b/,
      /\bplatform(er)?\b|\b(runner|running)\b.*\b(game|endless)\b/i,
      /\bendless\b.*\b(jump|run|fly|surf)\b/i,
      /\bflappy\b|\bgeometry[\s-]?dash\b/i,
      /\bphysics\b.*\b(sandbox|puzzle)\b/i,
      /\bcut[\s-]?the[\s-]?rope\b/,
      /\b(mario|sonic|zelda|pokemon|kirby|yoshi|luigi|peach)\b/,
      /\bdonkey[\s-]?kong\b(?!\s*racing)/i,
      /\bmega[\s-]?man\b|\bmetroid\b(?!\s*prime)/i,
      /\bcastlevania\b|\bshovel\b|\bhollow\b.*\bknight\b/i,
      /\bundertale\b|\bdeltarune\b|\bceleste\b/i,
      /\borg(an)?\b.*\b(rhythm|sim)\b/i,
      /\b(card|deck|solitaire|poker)\b(?!.*\bwar\b)/i,
      /\bchess\b|\bcheckers\b/,
      /\btower[\s-]?(def|defense|swap)\b|\btd\b(?!\s*wrest)/i,
      /\blogical\b|\bbrain\b.*\b(tease|game)\b/i,
      /\bobby\b|\bobstacle\b|\bparkour\b/,
      /\bescape\b.*\b(room|game)\b|\b(room|point)[\s-]?(and|&)[\s-]?click\b/i,
      /\badventure[\s-]?(time|quest)\b/i,
      /\bdungeon\b|\broguelike\b|\brogue\b.*\b(like|lite)\b/i,
      /\bsandbox\b|\bsim(ulator)?\b/,
      /\bvisual[\s-]?novel\b|\bdoki[\s-]?doki\b/i,
      /\bfarm(ville|er)?\b|\bharvest\b.*\bmoon\b/i,
      /\bcooking\b.*\b(mama|fever|dash)\b/i,
      /\bdress[\s-]?up\b|\bfashion\b.*\b(design|doll)\b/i,
      /\b(angry|cut)[\s-]?birds?\b/i,
      /\bminigame\b|\bparty\b.*\b(game|mix)\b/i,
      /\bpinball\b|\b(claw|crane)\s*machine\b/i,
      /\b(subway|temple)[\s-]?(run|surf)/i,
      /\bcrossy\b|\bendless[\s-]?(runner|frog)/i,
    ])
  ) {
    cats.push("arcade");
  }

  // Default bucket if nothing matched (browse still works under “All”)
  if (cats.length === 0) cats.push("arcade");

  cats.push("popular");
  var seen = {};
  var out = [];
  for (var j = 0; j < cats.length; j++) {
    if (!seen[cats[j]]) {
      seen[cats[j]] = true;
      out.push(cats[j]);
    }
  }
  return out.join(" ");
}

var ugsList = typeof window.UGS_FILES !== "undefined" && window.UGS_FILES;
if (ugsList && Array.isArray(ugsList)) {
  ugsList.forEach(function(fileId) {
    if (fileId && typeof fileId === "string") addUgsGameButton(fileId);
  });
}

var activeGameCategory = "all";

function getButtonCategories(btn) {
  var raw = (btn.getAttribute("data-categories") || "").trim();
  if (!raw) return [];
  return raw.split(/\s+/).filter(Boolean);
}

function buttonMatchesCategory(btn) {
  if (activeGameCategory === "all") return true;
  return getButtonCategories(btn).indexOf(activeGameCategory) !== -1;
}

function filterGamesBySearch() {
  var searchEl = document.getElementById("game-search");
  var countEl = document.getElementById("game-count");
  var emptyHint = document.getElementById("game-empty-hint");
  var q = (searchEl && searchEl.value) ? searchEl.value.trim().toLowerCase() : "";
  var buttons = document.querySelectorAll(".games-grid .game-button");
  var total = buttons.length;
  var visible = 0;
  buttons.forEach(function(btn) {
    var titleEl = btn.querySelector(".game-title");
    var taglineEl = btn.querySelector(".game-tagline");
    var text = ((titleEl && titleEl.textContent) || "") + " " + ((taglineEl && taglineEl.textContent) || "");
    var searchMatch = !q || text.toLowerCase().indexOf(q) !== -1;
    var catMatch = buttonMatchesCategory(btn);
    var show = searchMatch && catMatch;
    btn.classList.toggle("game-hidden", !show);
    if (show) visible++;
  });
  if (countEl) {
    if ((q || activeGameCategory !== "all") && visible !== total) {
      countEl.textContent = "Showing " + visible + " of " + total.toLocaleString() + " entries";
    } else {
      countEl.textContent = total.toLocaleString() + " entr" + (total === 1 ? "y" : "ies");
    }
  }
  if (emptyHint) emptyHint.hidden = visible !== 0;
}

(function gameCategoryTabs() {
  var tabs = document.querySelectorAll(".game-tab");
  if (!tabs.length) return;
  tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
      activeGameCategory = tab.getAttribute("data-category") || "all";
      tabs.forEach(function(t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      filterGamesBySearch();
    });
  });
})();

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
