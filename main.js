(function () {
  "use strict";

  /* ─── Helpers ─────────────────────────────────────────────── */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ─── NAV ─────────────────────────────────────────────────── */
  function initNav() {
    var nav      = $("#nav");
    var burger   = $(".nav-hamburger");
    var mobile   = $("#nav-mobile");
    var closeBtn = $(".nav-mobile-close");
    var links    = $$(".nav-mobile-link, .nav-mobile-cta");

    if (!nav) return;

    function handleScroll() {
      nav.classList.toggle("nav--solid", window.scrollY > 80);
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
        top: target.getBoundingClientRect().top + window.scrollY - 72,
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

  /* ─── CAMERA MOUSE FOLLOW ────────────────────────────────────── */
  function initCamera() {
    var lens = $("#cameraLens");
    if (!lens) return;

    var crx = 0, cry = 0, trx = 0, try_ = 0;

    if (!fineHover || window.innerWidth < 768) {
      /* Mobile: slow automatic rotation */
      var ang = 0;
      (function autoRotate() {
        ang += 0.5;
        var rad = (ang * Math.PI) / 180;
        lens.style.transform = "rotateX(" + (Math.sin(rad) * 14) + "deg) rotateY(" + (Math.cos(rad) * 14) + "deg)";
        requestAnimationFrame(autoRotate);
      })();
      return;
    }

    window.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth)  * 2 - 1;
      var ny = (e.clientY / window.innerHeight) * 2 - 1;
      trx = -ny * 20;
      try_ = nx * 20;
    }, { passive: true });

    (function loop() {
      crx += (trx - crx) * 0.08;
      cry += (try_ - cry) * 0.08;
      lens.style.transform = "rotateX(" + crx + "deg) rotateY(" + cry + "deg)";
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
    }, { threshold: 0.25 });

    counters.forEach(function (el) { io.observe(el); });
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
    safe(initCamera,        "initCamera");
    safe(initFireCanvas,    "initFireCanvas");
    safe(initCCTV,          "initCCTV");
    safe(initNetworkPulse,  "initNetworkPulse");
    safe(initReveals,       "initReveals");
    safe(initCounters,      "initCounters");
    safe(initContactForm,   "initContactForm");
    safe(initGSAP,          "initGSAP");

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
