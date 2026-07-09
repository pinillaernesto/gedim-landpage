(function () {
  "use strict";

  /* ─── Helpers ─────────────────────────────────────────────── */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Shared sprinkler API — initPipeFrame fills activate/deactivate */
  var sprinklerAPI = {
    activate:   null,
    deactivate: null,
    isActive:   function () { return false; }
  };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ─── NAV ─────────────────────────────────────────────────── */
  function initNav() {
    var nav      = $("#siteHeader");
    var burger   = $(".nav-hamburger");
    var mobile   = $("#nav-mobile");
    var closeBtn = $(".nav-mobile-close");
    var links    = $$(".nav-mobile-link, .nav-mobile-cta");

    if (!nav) return;

    function handleScroll() {
      nav.classList.toggle("site-header--scrolled", window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    function openMobile() {
      mobile.classList.add("is-open");
      mobile.setAttribute("aria-hidden", "false");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function closeMobile() {
      mobile.classList.remove("is-open");
      mobile.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    if (burger) burger.addEventListener("click", openMobile);
    if (closeBtn) closeBtn.addEventListener("click", closeMobile);
    links.forEach(function (l) { l.addEventListener("click", closeMobile); });

    /* Close on Escape */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobile.classList.contains("is-open")) closeMobile();
    });
  }

  /* ─── SMOOTH SCROLL ─────────────────────────────────────────── */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 185,
        behavior: "smooth"
      });
    });
  }

  /* ─── CUSTOM CURSOR ─────────────────────────────────────────── */
  function initCursor() {
    if (!fineHover) return;
    var cursor = $(".cursor");
    if (!cursor) return;

    var cx = -100, cy = -100, tx = -100, ty = -100;
    var ready = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!ready) {
        ready = true;
        cursor.classList.add("cursor--visible");
      }
    });

    var HOVERABLES = "a, button, [role='button'], select, input, textarea, label, .card-link";

    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(HOVERABLES)) cursor.classList.add("cursor--expand");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(HOVERABLES)) cursor.classList.remove("cursor--expand");
    });

    (function loop() {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      cursor.style.transform = "translate3d(" + (cx - 4) + "px," + (cy - 4) + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ─── PARTICLES ──────────────────────────────────────────────── */
  function initParticles() {
    var canvas = $("#heroCanvas");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var isMobile = window.innerWidth < 768;
    var COUNT = isMobile ? 20 : 40;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var mx = -999, my = -999;

    function resize() {
      var hero = $(".hero");
      if (!hero) return;
      W = hero.offsetWidth;
      H = hero.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", function () {
      resize();
      particles.forEach(function (p) {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
      });
    }, { passive: true });

    window.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mx = (e.clientX - rect.left);
      my = (e.clientY - rect.top);
    }, { passive: true });

    function makeParticle() {
      var vx = (Math.random() - 0.5) * 0.65;
      var vy = (Math.random() - 0.5) * 0.65;
      return {
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: vx, vy: vy,
        bvx: vx, bvy: vy,
        r:  Math.random() * 1.8 + 0.6,
        op: Math.random() * 0.45 + 0.08
      };
    }

    var particles = [];
    for (var i = 0; i < COUNT; i++) particles.push(makeParticle());

    (function animate() {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var dx = mx - p.x;
        var dy = my - p.y;
        var d2 = dx * dx + dy * dy;
        var ATTRACT_R = 120;

        if (d2 < ATTRACT_R * ATTRACT_R) {
          var dist = Math.sqrt(d2) || 1;
          var force = (ATTRACT_R - dist) / ATTRACT_R * 0.28;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.op = Math.min(p.op + 0.03, 0.9);
        } else {
          p.vx += (p.bvx - p.vx) * 0.04;
          p.vy += (p.bvy - p.vy) * 0.04;
          p.op += ((Math.random() * 0.45 + 0.08) - p.op) * 0.008;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x  += p.vx;
        p.y  += p.vy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,255,136," + p.op + ")";
        ctx.fill();
      }

      /* Connection lines */
      for (var i = 0; i < particles.length - 1; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i], b = particles[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d  = Math.sqrt(dx*dx + dy*dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(0,255,136," + ((1 - d / 100) * 0.14) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    })();
  }

  /* ─── PIPE FRAME / SPRINKLER SYSTEM ────────────────────────────── */
  function initPipeFrame() {
    var frameSvg = document.getElementById("pipeFrameSvg");
    var canvas   = document.getElementById("sprinklerCanvas");
    if (!frameSvg || !canvas) return;

    var ctx        = canvas.getContext("2d");
    var active     = false;
    var particles  = [];
    var MAX_P      = 2000;
    var closeTimer = null;

    /* All 7 sprinkler X positions in SVG space (viewBox 0 0 1440 140) */
    var SPRINKLER_XS = [144, 288, 576, 720, 864, 1152, 1296];

    function getSprinklerPos(svgX) {
      var r = frameSvg.getBoundingClientRect();
      /* sprinkler head at svgY ≈ 108 of 140 (deflector plate below drop pipe) */
      return {
        x: r.left + (svgX / 1440) * r.width,
        y: r.top  + r.height * (108 / 140)
      };
    }

    function activateSprinklers() {
      active = true;
      $$(".pipe-valve").forEach(function (v) { v.classList.add("is-open"); });
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(deactivateSprinklers, 10000);
    }

    function deactivateSprinklers() {
      active = false;
      $$(".pipe-valve").forEach(function (v) { v.classList.remove("is-open"); });
      closeTimer = null;
    }

    /* Expose for fire banner */
    sprinklerAPI.activate   = activateSprinklers;
    sprinklerAPI.deactivate = deactivateSprinklers;
    sprinklerAPI.isActive   = function () { return active; };

    /* Any valve click toggles ALL sprinklers */
    $$(".pipe-valve").forEach(function (v) {
      v.addEventListener("click", function () {
        if (active) {
          if (closeTimer) clearTimeout(closeTimer);
          deactivateSprinklers();
        } else {
          activateSprinklers();
        }
      });
    });

    /*
      Radial umbrella spray (NFPA-style):
      Water hits the deflector plate and fans outward ±72° from vertical,
      with most mass between 30° and 70°. Gravity then curves streams into
      parabolic arcs — producing the characteristic parasol/crown pattern.
    */
    function spawnSprinklerParticles(sx, sy) {
      var STREAMS = 3;
      for (var i = 0; i < STREAMS; i++) {
        if (particles.length >= MAX_P) return;

        /* Fan angle from vertical: bias toward outer ring (denser laterally) */
        var u   = Math.random();
        var deg = (u < 0.5 ? -1 : 1) * (20 + Math.random() * 55); /* 20–75° each side */
        var rad = deg * Math.PI / 180;
        var spd = 3.5 + Math.random() * 4.5;  /* px/frame initial speed */

        particles.push({
          x:   sx + (Math.random() - 0.5) * 4,
          y:   sy,
          vx:  Math.sin(rad) * spd,            /* lateral: fast */
          vy:  Math.cos(rad) * spd * 0.35,     /* downward: gentle start */
          life: 1,
          dec:  0.010 + Math.random() * 0.007,
          r:    0.5 + Math.random() * 1.5,
          isCore: Math.random() < 0.4          /* core vs spray droplet */
        });
      }
    }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    (function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (active) {
        SPRINKLER_XS.forEach(function (svgX) {
          var pos = getSprinklerPos(svgX);
          spawnSprinklerParticles(pos.x, pos.y);
        });
      }

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];

        p.vy  += 0.21;   /* gravity — pulls arcing streams down */
        p.vx  *= 0.989;  /* horizontal air resistance */
        p.x   += p.vx;
        p.y   += p.vy;
        p.life -= p.dec;

        if (p.life <= 0 || p.y > canvas.height || p.x < -60 || p.x > canvas.width + 60) {
          particles.splice(i, 1);
          continue;
        }

        var alpha = (p.life * 0.82).toFixed(2);
        var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        /* Draw as motion streak (line in direction of travel) */
        var len = Math.min(speed * 2.2, 10);
        var nx  = p.vx / (speed || 1);
        var ny  = p.vy / (speed || 1);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - nx * len, p.y - ny * len);
        ctx.strokeStyle = p.isCore
          ? "rgba(220,240,255," + alpha + ")"
          : "rgba(150,210,255," + alpha + ")";
        ctx.lineWidth   = p.r;
        ctx.lineCap     = "round";
        ctx.stroke();
      }

      requestAnimationFrame(loop);
    })();
  }

  /* ─── FIRE ALARM BANNER ─────────────────────────────────────── */
  function initFireBanner() {
    var banner      = document.getElementById("fireBanner");
    var canvas      = document.getElementById("fireBannerCanvas");
    var countdown   = document.getElementById("fireBannerCountdown");
    if (!banner || !canvas) return;

    var ctx         = canvas.getContext("2d");
    var flameP      = [];
    var burning     = false;
    var countTmr    = null;

    function resize() {
      canvas.width  = banner.offsetWidth  || window.innerWidth;
      canvas.height = banner.offsetHeight || 84;
    }
    window.addEventListener("resize", function () { resize(); }, { passive: true });
    resize();

    function spawnFlame() {
      var W = canvas.width, H = canvas.height;
      flameP.push({
        x:    Math.random() * W,
        y:    H,
        vx:   (Math.random() - 0.5) * 2.2,
        vy:   -(1.4 + Math.random() * 2.8),
        life: 1,
        dec:  0.022 + Math.random() * 0.014,
        r:    7 + Math.random() * 11
      });
    }

    (function drawFlames() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (burning && flameP.length < 50) {
        for (var s = 0; s < 4; s++) spawnFlame();
      }

      for (var i = flameP.length - 1; i >= 0; i--) {
        var f = flameP[i];
        f.x  += f.vx + (Math.random() - 0.5) * 0.9;
        f.y  += f.vy;
        f.vy *= 0.981;
        f.vx *= 0.958;
        f.r  *= 0.990;
        f.life -= f.dec;

        if (f.life <= 0) { flameP.splice(i, 1); continue; }

        var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2.4);
        if (f.life > 0.55) {
          g.addColorStop(0,   "rgba(255,225,70,"  + (f.life * 0.92).toFixed(2) + ")");
          g.addColorStop(0.35,"rgba(255,90,10,"   + (f.life * 0.72).toFixed(2) + ")");
          g.addColorStop(1,   "rgba(180,0,0,0)");
        } else {
          g.addColorStop(0,   "rgba(255,100,20,"  + (f.life * 0.82).toFixed(2) + ")");
          g.addColorStop(0.5, "rgba(140,0,0,"     + (f.life * 0.50).toFixed(2) + ")");
          g.addColorStop(1,   "rgba(80,0,0,0)");
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      requestAnimationFrame(drawFlames);
    })();

    function startFire() {
      burning = true;
      banner.classList.add("is-active");
      banner.setAttribute("aria-hidden", "false");

      if (sprinklerAPI.activate) sprinklerAPI.activate();

      var secs = 10;
      if (countdown) countdown.textContent = secs + "s";
      if (countTmr) clearInterval(countTmr);
      countTmr = setInterval(function () {
        secs--;
        if (countdown) countdown.textContent = secs + "s";
        if (secs <= 0) {
          clearInterval(countTmr);
          endFire();
        }
      }, 1000);
    }

    function endFire() {
      burning = false;
      banner.classList.remove("is-active");
      banner.setAttribute("aria-hidden", "true");
      /* Sprinklers keep running 2s after fire-out, then auto-close */
      setTimeout(function () {
        if (sprinklerAPI.deactivate) sprinklerAPI.deactivate();
      }, 2000);
    }

    /* Cycle: first fire at 40 s, then every 40 s */
    (function scheduleFire() {
      setTimeout(function () {
        startFire();
        scheduleFire(); /* next cycle */
      }, 40000);
    })();
  }

  /* ─── CAMERA MOUSE FOLLOW ────────────────────────────────────── */
  function initCamera() {
    var svg  = $("#cameraRig");
    var body = $("#cameraBody");
    if (!body || !svg) return;

    /*
      Pivot coords in SVG space (140,130). Camera drawn pointing RIGHT at 0°,
      so atan2(dy,dx) directly makes the lens face the mouse — no offset needed.

      IMPORTANT: we read the pivot position from #cameraPivot (a tiny fixed SVG
      shape), NOT from the SVG element itself. With overflow:visible the SVG's
      getBoundingClientRect() expands to include the beam (~900px wide), placing
      the calculated center far to the right of the actual camera.
    */
    var SVG_PX = 207, SVG_PY = 44;
    var cur = 135, tgt = 135;
    var pivotEl = document.getElementById("cameraPivot");

    function getPivotScreen() {
      if (pivotEl) {
        var pr = pivotEl.getBoundingClientRect();
        return { x: pr.left + pr.width / 2, y: pr.top + pr.height / 2 };
      }
      /* Fallback: use SVG rect + viewport-fraction if marker unavailable */
      var r = svg.getBoundingClientRect();
      return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
    }

    if (!fineHover || window.innerWidth < 768) {
      /* Mobile: slow pendulum sweep */
      var a = 0;
      (function autoRotate() {
        a += 0.35;
        tgt = Math.sin(a * Math.PI / 180) * 55;
        cur += (tgt - cur) * 0.04;
        body.setAttribute("transform",
          "rotate(" + cur.toFixed(2) + "," + SVG_PX + "," + SVG_PY + ")");
        requestAnimationFrame(autoRotate);
      })();
      return;
    }

    window.addEventListener("mousemove", function (e) {
      var p = getPivotScreen();
      var dx = e.clientX - p.x;
      var dy = e.clientY - p.y;
      tgt = Math.atan2(dy, dx) * 180 / Math.PI;
    }, { passive: true });

    (function loop() {
      /* Shortest-arc lerp — smoothly follows tgt without spinning 360° */
      var diff = tgt - cur;
      while (diff >  180) diff -= 360;
      while (diff < -180) diff += 360;
      cur += diff * 0.08;
      body.setAttribute("transform",
        "rotate(" + cur.toFixed(2) + "," + SVG_PX + "," + SVG_PY + ")");
      requestAnimationFrame(loop);
    })();
  }

  /* ─── FIRE CANVAS ────────────────────────────────────────────── */
  function initFireCanvas() {
    $$(".fire-canvas").forEach(function (canvas) {
      var card = canvas.closest(".service-card");
      if (!card || !canvas.getContext) return;

      var ctx = canvas.getContext("2d");
      var particles = [];
      var hovered = false;

      function resize() {
        var W = canvas.offsetWidth  || card.offsetWidth;
        var H = canvas.offsetHeight || 180;
        canvas.width  = W;
        canvas.height = H;
      }
      resize();

      function spawn() {
        var W = canvas.width, H = canvas.height;
        particles.push({
          x:    W * 0.2 + Math.random() * W * 0.6,
          y:    H,
          vx:   (Math.random() - 0.5) * 1.8,
          vy:   -(Math.random() * 2.2 + 0.8),
          life: 1,
          dec:  0.013 + Math.random() * 0.01,
          r:    Math.random() * 5 + 3
        });
      }

      /* Ambient ember at rest — 2 very faint particles */
      function spawnAmbient() {
        var W = canvas.width, H = canvas.height;
        particles.push({
          x:    W * 0.35 + Math.random() * W * 0.3,
          y:    H,
          vx:   (Math.random() - 0.5) * 0.6,
          vy:   -(Math.random() * 0.9 + 0.4),
          life: 0.45,
          dec:  0.018,
          r:    Math.random() * 2.5 + 1
        });
      }

      var frame = 0;
      (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;

        if (hovered && particles.length < 15) spawn();
        if (!hovered && frame % 55 === 0 && particles.length < 3) spawnAmbient();

        particles = particles.filter(function (p) { return p.life > 0.01; });

        particles.forEach(function (p) {
          p.x  += p.vx;
          p.y  += p.vy;
          p.vy *= 0.994;
          p.vx += (Math.random() - 0.5) * 0.1;
          p.life -= p.dec;
          p.r  *= 0.988;

          var bright = p.life > 0.55 ? "255,140,20" : "255,60,0";
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
          g.addColorStop(0, "rgba(" + bright + "," + (p.life * 0.85).toFixed(2) + ")");
          g.addColorStop(1, "rgba(180,0,0,0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        });

        requestAnimationFrame(draw);
      })();

      card.addEventListener("mouseover", function (e) {
        if (!card.contains(e.relatedTarget)) hovered = true;
      });
      card.addEventListener("mouseout", function (e) {
        if (!card.contains(e.relatedTarget)) { hovered = false; particles = []; }
      });
    });
  }

  /* ─── CCTV TIMESTAMPS ─────────────────────────────────────────── */
  function initCCTV() {
    var feeds = $$("[data-feed]");
    if (!feeds.length) return;

    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {
      var now = new Date();
      var ts  = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
      feeds.forEach(function (f) { f.textContent = ts; });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ─── NETWORK PULSE ───────────────────────────────────────────── */
  function initNetworkPulse() {
    var pulses = [$("#np0"), $("#np1"), $("#np2")];
    if (!pulses[0]) return;

    /* Routes: each from hub (130,80) to an endpoint */
    var routes = [
      [{ x: 130, y: 80 }, { x: 38,  y: 28  }],
      [{ x: 130, y: 80 }, { x: 222, y: 28  }],
      [{ x: 130, y: 80 }, { x: 130, y: 142 }]
    ];

    var states = [0, 0.34, 0.67];

    function lerp(a, b, t) {
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }

    /* Make pulses visible */
    pulses.forEach(function (p) { if (p) p.setAttribute("opacity", "0.9"); });

    (function animate() {
      for (var i = 0; i < 3; i++) {
        states[i] = (states[i] + 0.007) % 1;
        var t = states[i];
        /* Ping-pong: 0→1→0 */
        var progress = t < 0.5 ? t * 2 : (1 - t) * 2;
        var pos = lerp(routes[i][0], routes[i][1], progress);
        if (pulses[i]) {
          pulses[i].setAttribute("cx", pos.x.toFixed(1));
          pulses[i].setAttribute("cy", pos.y.toFixed(1));
        }
      }
      requestAnimationFrame(animate);
    })();
  }

  /* ─── REVEAL (IntersectionObserver) ──────────────────────────── */
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });

    items.forEach(function (el) { io.observe(el); });

    /* 6s safety: force-reveal anything still hidden and in viewport */
    setTimeout(function () {
      items.forEach(function (el) {
        if (!el.classList.contains("visible")) {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add("visible");
          }
        }
      });
    }, 6000);
  }

  /* ─── COUNT UP ────────────────────────────────────────────────── */
  function initCounters() {
    var counters = $$("[data-count]");
    if (!counters.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el      = entry.target;
        var target  = parseInt(el.dataset.count, 10);
        var suffix  = el.dataset.suffix || "";
        var start   = Date.now();
        var DUR     = 1800;

        (function tick() {
          var elapsed  = Date.now() - start;
          var progress = Math.min(elapsed / DUR, 1);
          var ease     = 1 - Math.pow(1 - progress, 3); /* cubic ease-out */
          var current  = Math.floor(ease * target);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        })();

        io.unobserve(el);
      });
    }, { threshold: 0.05 });

    counters.forEach(function (el) { io.observe(el); });

    /* 6s safety: fire any counter still showing 0 */
    setTimeout(function () {
      counters.forEach(function (el) {
        if (el.textContent === "0" || el.textContent === "0+") {
          var target = parseInt(el.dataset.count, 10);
          var suffix = el.dataset.suffix || "";
          el.textContent = target + suffix;
        }
      });
    }, 6000);
  }

  /* ─── GSAP ANIMATIONS ─────────────────────────────────────────── */
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return;

    try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}

    /* Hero entrance */
    gsap.from(".hero-content > *", {
      y: 40, opacity: 0, duration: 0.8,
      stagger: 0.15, ease: "power3.out", delay: 0.3
    });

    /* Service cards */
    gsap.from(".service-card", {
      scrollTrigger: { trigger: ".services-grid", start: "top 80%" },
      y: 60, opacity: 0, duration: 0.7,
      stagger: 0.15, ease: "power2.out"
    });

    /* Problem text */
    gsap.from(".problem-text", {
      scrollTrigger: { trigger: ".problem", start: "top 75%" },
      x: -40, opacity: 0, duration: 0.8, ease: "power2.out"
    });

    /* Metrics */
    gsap.from(".metric", {
      scrollTrigger: { trigger: ".proof-metrics", start: "top 80%" },
      y: 30, opacity: 0, duration: 0.6,
      stagger: 0.12, ease: "power2.out"
    });

    /* Maintenance card */
    gsap.from(".maint-card", {
      scrollTrigger: { trigger: ".maintenance", start: "top 80%" },
      x: -30, opacity: 0, duration: 0.75, ease: "power2.out"
    });
  }

  /* ─── CONTACT FORM ────────────────────────────────────────────── */
  function initContactForm() {
    var form = $("#contactForm");
    if (!form) return;

    var required = $$("[required]", form);

    /* Clear error on input */
    required.forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("error"); });
      f.addEventListener("change", function () { f.classList.remove("error"); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var valid = true;
      required.forEach(function (f) {
        f.classList.remove("error");
        if (!f.value.trim()) {
          f.classList.add("error");
          valid = false;
        }
      });

      if (!valid) {
        var firstErr = $(".error", form);
        if (firstErr) firstErr.focus();
        return;
      }

      var d       = new FormData(form);
      var nombre  = d.get("nombre")   || "";
      var empresa = d.get("empresa")  || "";
      var tel     = d.get("telefono") || "";
      var srv     = d.get("servicio") || "";
      var msg     = d.get("mensaje")  || "";

      var subject = "Cotización GEDIM — " + srv + " — " + nombre;
      var body    = [
        "Nombre: " + nombre,
        "Empresa: " + empresa,
        "Teléfono: " + tel,
        "Servicio: " + srv,
        "",
        "Mensaje:",
        msg
      ].join("\n");

      window.location.href =
        "mailto:tecnologia@gedimcolombia.co" +
        "?subject=" + encodeURIComponent(subject) +
        "&body="    + encodeURIComponent(body);
    });
  }

  /* ─── BOOT ────────────────────────────────────────────────────── */
  function boot() {
    safe(initNav,           "initNav");
    safe(initSmoothScroll,  "initSmoothScroll");
    safe(initCursor,        "initCursor");
    safe(initParticles,     "initParticles");
    safe(initPipeFrame,     "initPipeFrame");
    safe(initFireBanner,    "initFireBanner");
    safe(initCamera,        "initCamera");
    safe(initFireCanvas,    "initFireCanvas");
    safe(initCCTV,          "initCCTV");
    safe(initNetworkPulse,  "initNetworkPulse");
    safe(initReveals,       "initReveals");
    safe(initCounters,      "initCounters");
    safe(initContactForm,    "initContactForm");
    safe(initGSAP,           "initGSAP");

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
