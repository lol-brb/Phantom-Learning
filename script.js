const gameButtons = document.querySelectorAll(".game-button");

function getGameHtml(id) {
  switch (id) {
    case "carparking":
      return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path fill='%232d3748' d='M8 11L24 11L22 15L10 15Z'/><path fill='%232d3748' d='M10 15L22 15L21 17L11 17Z'/><line x1='24' y1='11' x2='24' y2='20' stroke='%232d3748' stroke-width='1.5'/><circle cx='24' cy='13' r='1.2' fill='%232d3748'/><path fill='%232d3748' d='M23 20l1 4 2-1-1-3z'/></svg>" />
    <title>DeltaMath</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        background: #000;
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        display: flex;
        flex-direction: column;
      }
      .frame-wrap {
        flex: 1;
        min-height: 0;
      }
      iframe {
        border: none;
        width: 100%;
        height: 100%;
        display: block;
      }
      .game-credit {
        margin: 6px 0 8px;
        font-size: 13px;
        line-height: 1.4;
        text-align: center;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .game-credit a {
        color: #60a5fa;
        text-decoration: none;
      }
      .game-credit a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="frame-wrap">
      <iframe
        src="https://www.madkidgames.com/game/car-parking-pro-park-and-drive"
        title="Car Parking Pro Park And Drive"
        loading="lazy"
        allowfullscreen
      ></iframe>
    </div>

    <p class="game-credit">
      <a href="https://www.madkidgames.com/game/car-parking-pro-park-and-drive" target="_blank" rel="noopener noreferrer">
        Play Car Parking Pro Park And Drive
      </a>
    </p>

    <noscript>
      <p class="game-credit">
        <a href="https://www.madkidgames.com/game/car-parking-pro-park-and-drive" target="_blank" rel="noopener noreferrer">
          Play Car Parking Pro Park And Drive
        </a>
      </p>
    </noscript>
  </body>
</html>`;
    case "dodge":
      return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path fill='%232d3748' d='M8 11L24 11L22 15L10 15Z'/><path fill='%232d3748' d='M10 15L22 15L21 17L11 17Z'/><line x1='24' y1='11' x2='24' y2='20' stroke='%232d3748' stroke-width='1.5'/><circle cx='24' cy='13' r='1.2' fill='%232d3748'/><path fill='%232d3748' d='M23 20l1 4 2-1-1-3z'/></svg>" />
    <title>DeltaMath</title>
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
    <title>DeltaMath</title>
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
    case "paddle":
    default:
      return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path fill='%232d3748' d='M8 11L24 11L22 15L10 15Z'/><path fill='%232d3748' d='M10 15L22 15L21 17L11 17Z'/><line x1='24' y1='11' x2='24' y2='20' stroke='%232d3748' stroke-width='1.5'/><circle cx='24' cy='13' r='1.2' fill='%232d3748'/><path fill='%232d3748' d='M23 20l1 4 2-1-1-3z'/></svg>" />
    <title>DeltaMath</title>
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
        border-radius: 16px;
        border: 1px solid #1f2937;
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
    <div class="hud">Move your mouse to control the paddle. Keep the ball up.</div>
    <canvas id="game" width="480" height="420"></canvas>
    <script>
      const canvas = document.getElementById("game");
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;

      const paddle = { width: 80, height: 12, x: w / 2 - 40, y: h - 40 };
      const ball = { x: w / 2, y: h / 2, r: 8, vx: 3, vy: -3.2 };
      let hits = 0;
      let running = true;

      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        paddle.x = x - paddle.width / 2;
        paddle.x = Math.max(10, Math.min(w - paddle.width - 10, paddle.x));
      });

      canvas.addEventListener("click", () => {
        if (!running) {
          ball.x = w/2;
          ball.y = h/2;
          ball.vx = 3;
          ball.vy = -3.2;
          hits = 0;
          running = true;
        }
      });

      function loop() {
        requestAnimationFrame(loop);
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, w, h);

        if (running) {
          ball.x += ball.vx;
          ball.y += ball.vy;

          if (ball.x - ball.r < 4 || ball.x + ball.r > w - 4) ball.vx *= -1;
          if (ball.y - ball.r < 4) ball.vy *= -1;

          if (
            ball.y + ball.r >= paddle.y &&
            ball.y - ball.r <= paddle.y + paddle.height &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.width &&
            ball.vy > 0
          ) {
            ball.vy *= -1;
            const hitPos = (ball.x - paddle.x) / paddle.width - 0.5;
            ball.vx += hitPos * 2.5;
            hits++;
          }

          if (ball.y - ball.r > h + 10) {
            running = false;
          }
        }

        ctx.fillStyle = "#1f2937";
        ctx.fillRect(0, h - 24, w, 24);

        ctx.fillStyle = "#60a5fa";
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

        const grad = ctx.createRadialGradient(ball.x, ball.y, 2, ball.x, ball.y, ball.r);
        grad.addColorStop(0, "#f97316");
        grad.addColorStop(1, "#7c2d12");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#9ca3af";
        ctx.font = "14px system-ui";
        ctx.textAlign = "left";
        ctx.fillText("Hits: " + hits, 10, 22);

        if (!running) {
          ctx.fillStyle = "rgba(15,23,42,0.92)";
          ctx.fillRect(60, h/2 - 60, w - 120, 120);
          ctx.strokeStyle = "#4b5563";
          ctx.strokeRect(60, h/2 - 60, w - 120, 120);
          ctx.fillStyle = "#e5e7eb";
          ctx.textAlign = "center";
          ctx.font = "20px system-ui";
          ctx.fillText("You missed!", w/2, h/2 - 18);
          ctx.font = "14px system-ui";
          ctx.fillStyle = "#9ca3af";
          ctx.fillText("Total hits: " + hits, w/2, h/2 + 6);
          ctx.fillText("Click to play again", w/2, h/2 + 30);
        }
      }

      loop();
    </script>
  </body>
</html>`;
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
    // Fallback: run the game in this tab if pop-ups are blocked
    document.open();
    document.write(html);
    document.close();
  }
}

gameButtons.forEach((button) => {
  const id = button.getAttribute("data-game-id");
  if (!id) return;
  button.addEventListener("click", () => openGameById(id));
});

