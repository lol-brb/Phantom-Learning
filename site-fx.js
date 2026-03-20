(function () {
  var canvas = document.getElementById("fx-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var w = 0;
  var h = 0;
  var particles = [];
  var mouse = { x: -9999, y: -9999 };
  var mouseActive = false;
  var tick = 0;
  var paused = false;

  var PALETTE = [
    "rgba(129,140,248,0.95)",
    "rgba(99,102,241,0.92)",
    "rgba(167,139,250,0.88)",
    "rgba(96,165,250,0.85)",
    "rgba(129,140,248,0.75)",
  ];

  function pickColor() {
    return PALETTE[(Math.random() * PALETTE.length) | 0];
  }

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = (w * dpr) | 0;
    canvas.height = (h * dpr) | 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = reduced ? 28 : Math.min(52, Math.max(30, ((w * h) / 26000) | 0));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (reduced ? 0.15 : 0.55),
        vy: (Math.random() - 0.5) * (reduced ? 0.15 : 0.55),
        r: Math.random() * 1.6 + 0.5,
        c: pickColor(),
        tw: Math.random() * Math.PI * 2,
      });
    }
  }

  function onMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouseActive = true;
  }

  function onLeave() {
    mouseActive = false;
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseleave", onLeave, { passive: true });
  resize();

  var linkDist = reduced ? 78 : 100;
  var linkDistSq = linkDist * linkDist;
  var mouseR = reduced ? 100 : 140;
  var mouseRSq = mouseR * mouseR;

  document.addEventListener(
    "visibilitychange",
    function () {
      paused = document.hidden;
      if (!paused) requestAnimationFrame(step);
    },
    { passive: true }
  );

  function step() {
    if (paused) return;
    tick++;
    ctx.clearRect(0, 0, w, h);
    if (!w || !h) {
      requestAnimationFrame(step);
      return;
    }

    var i, j, p, q, dx, dy, d2, alpha, pulse;
    var drawLinks = !reduced && tick % 2 === 0;

    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      if (!reduced && mouseActive) {
        dx = p.x - mouse.x;
        dy = p.y - mouse.y;
        d2 = dx * dx + dy * dy;
        if (d2 < mouseRSq && d2 > 1) {
          var push = (mouseRSq - d2) / mouseRSq;
          var inv = push * 0.9;
          p.vx += (dx / Math.sqrt(d2)) * inv * 0.08;
          p.vy += (dy / Math.sqrt(d2)) * inv * 0.08;
        }
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.992;
      p.vy *= 0.992;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
      p.tw += reduced ? 0.01 : 0.026;
    }

    if (drawLinks) {
      ctx.lineWidth = 0.55;
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        for (j = i + 1; j < particles.length; j++) {
          q = particles[j];
          dx = p.x - q.x;
          dy = p.y - q.y;
          d2 = dx * dx + dy * dy;
          if (d2 < linkDistSq) {
            alpha = (1 - d2 / linkDistSq) * 0.22;
            ctx.strokeStyle = "rgba(148,163,184," + alpha.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
    }

    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      pulse = 0.65 + Math.sin(p.tw) * 0.35;
      ctx.beginPath();
      ctx.globalAlpha = 0.4 + pulse * 0.55;
      ctx.fillStyle = p.c;
      ctx.arc(p.x, p.y, p.r * (0.85 + pulse * 0.35), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (!reduced && tick % 28 === 0) {
      var sx = (Math.random() * w) | 0;
      var sy = (Math.random() * h) | 0;
      var g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 120);
      g.addColorStop(0, "rgba(129,140,248,0.07)");
      g.addColorStop(0.5, "rgba(79,70,229,0.04)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();
