/* eATL marketing site: scroll scenes and demos */
(() => {
  "use strict";

  // TODO: replace with the confirmed sales/contact address before launch.
  const CONTACT_EMAIL = "info@nextbridgeit.net";
  const MAIL_SUBJECT = "eATL: introduction";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- contact links ---------- */
  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}`;
  $$("[data-mail]").forEach((a) => {
    if (a.hasAttribute("data-mail-show")) a.href = mailHref;
  });
  const addr = $("[data-mail-text]");
  if (addr) addr.textContent = CONTACT_EMAIL;

  /* ---------- screenshot slots ---------- */
  $$("img[data-slot]").forEach((img) => {
    const fallback = () => {
      const empty = document.createElement("div");
      empty.className = "shot__empty";
      empty.innerHTML = `<img src="assets/app-mark.png" alt=""><span>Screenshot slot</span><code>${img.getAttribute("src")}</code>`;
      empty.setAttribute("role", "img");
      empty.setAttribute("aria-label", `${img.alt} (screenshot coming soon)`);
      img.replaceWith(empty);
    };
    if (img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener("error", fallback, { once: true });
  });

  /* ---------- QR code (decorative pattern with finder squares) ---------- */
  const qr = $("[data-qrcode]");
  if (qr) {
    const N = 25;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const finder = (r, c) => {
      const inBox = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
      for (const [r0, c0] of [[0, 0], [0, N - 7], [N - 7, 0]]) {
        if (inBox(r0, c0)) {
          const rr = r - r0, cc = c - c0;
          const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6;
          const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
          return ring || core ? 1 : 0;
        }
        if (r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7) return 0;
      }
      return -1;
    };
    const frag = document.createDocumentFragment();
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const f = finder(r, c);
        const on = f === -1 ? rnd() > 0.52 : f === 1;
        const i = document.createElement("i");
        if (!on) i.className = "o";
        frag.appendChild(i);
      }
    }
    qr.appendChild(frag);
  }

  /* ---------- statement: split words ---------- */
  const words = $("[data-words]");
  if (words) {
    words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  }

  /* ---------- MEL calendar ---------- */
  const cal = $("[data-cal]");
  if (cal) {
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d) => {
      const el = document.createElement("div");
      el.className = "cal__dow";
      el.textContent = d;
      cal.appendChild(el);
    });
    // Mon 19 Oct 2026 .. Sun 8 Nov 2026
    const start = Date.UTC(2026, 9, 19);
    for (let i = 0; i < 21; i++) {
      const d = new Date(start + i * 864e5);
      const day = d.getUTCDate();
      const mon = d.getUTCMonth();
      const el = document.createElement("div");
      el.className = "cal__d";
      const isDisc = mon === 9 && day === 24;
      const n = i - 5; // 25 Oct is day 1
      const inInterval = n >= 1 && n <= 10;
      let note = "";
      if (isDisc) { el.classList.add("is-disc"); note = "Found · not counted"; }
      else if (inInterval) { el.classList.add("is-in"); note = n === 10 ? "Expires 23:59:59Z" : `Day ${n}`; if (n === 10) el.classList.add("is-end"); }
      else el.classList.add("is-muted");
      el.innerHTML = `<b>${day}</b><small>${note}</small>${inInterval ? '<i class="fill"></i>' : ""}`;
      cal.appendChild(el);
    }
  }

  /* ---------- typing helpers ---------- */
  const typed = $$("[data-type]").map((el) => {
    const full = el.dataset.type || el.textContent;
    return { el, full };
  });
  const setTyped = (item, p) => {
    const n = Math.round(item.full.length * Math.min(Math.max(p, 0), 1));
    if (item.el._n !== n) { item.el.textContent = item.full.slice(0, n); item.el._n = n; }
  };

  /* ---------- QR demo ---------- */
  const scanResult = $("[data-scan-result]");
  const placardReg = $("[data-placard-reg]");
  const scanline = $("[data-scanline]");
  const SCANS = {
    ok: { reg: "YU-RDA", dot: "ok", title: "YU-RDA confirmed", body: "Signature verified on the device with the operator's public key, no network needed. The confirmation covers one record and expires after 60 minutes." },
    wrong: { reg: "YU-RDB", dot: "bad", title: "This code belongs to YU-RDB", body: "You selected YU-RDA. eATL names both aircraft and offers to switch, so the record opens on the aircraft you are actually in." },
    override: { reg: "YU-RDA", dot: "warn", title: "Manual override", body: "Damaged sticker or no camera: the commander gives a reason and confirms with PIN. The override is written into the record, its PDF, the audit trail and the admin override monitor." }
  };
  const showScan = (key) => {
    const s = SCANS[key];
    $$("[data-scan]").forEach((b) => b.classList.toggle("is-on", b.dataset.scan === key));
    if (placardReg) placardReg.textContent = s.reg;
    const render = () => {
      scanResult.innerHTML = `<h3><span class="dot dot--${s.dot}"></span>${s.title}</h3><p>${s.body}</p>`;
    };
    if (reduced || !window.gsap || key === "override") { render(); return; }
    gsap.timeline()
      .set(scanline, { opacity: 1, top: 0 })
      .to(scanline, { top: "100%", duration: 0.9, ease: "power2.inOut" })
      .set(scanline, { opacity: 0 })
      .add(render)
      .from(scanResult.children, { y: 14, opacity: 0, stagger: 0.06, duration: 0.5, ease: "expo.out" });
  };
  $$("[data-scan]").forEach((b) => b.addEventListener("click", () => showScan(b.dataset.scan)));
  if (scanResult) scanResult.innerHTML = `<h3><span class="dot dot--ok"></span>${SCANS.ok.title}</h3><p>${SCANS.ok.body}</p>`;

  /* ---------- hash chain demo ---------- */
  const blocks = $$("[data-block]");
  const links = $$(".chain .link");
  const note = $("[data-chain-note]");
  const tamperBtn = $("[data-tamper]");
  const amendBtn = $("[data-amend]");
  if (tamperBtn && amendBtn) {
    tamperBtn.addEventListener("click", () => {
      [2, 3].forEach((i) => blocks[i].classList.add("is-broken"));
      [1, 2].forEach((i) => links[i].classList.add("is-broken"));
      blocks.forEach((b) => b.classList.remove("is-amend"));
      note.innerHTML = 'Fuel at cut-off: <b class="mono">4 200 lb</b>. The Flight and Close hashes no longer match the content. A signed record can\'t be edited in place.';
      tamperBtn.hidden = true;
      amendBtn.hidden = false;
      amendBtn.focus();
    });
    amendBtn.addEventListener("click", () => {
      blocks.forEach((b) => b.classList.remove("is-broken"));
      links.forEach((l) => l.classList.remove("is-broken"));
      [2, 3].forEach((i) => blocks[i].classList.add("is-amend"));
      note.innerHTML = 'Amendment opened with a reason. The original stays intact and visible; signatures covering the corrected field are repeated, the rest carry over.';
      amendBtn.hidden = true;
      tamperBtn.hidden = false;
      tamperBtn.textContent = "Try again";
    });
  }

  /* ---------- offline demo ---------- */
  const net = $("[data-net]");
  const netLabel = $("[data-net-label]");
  const outbox = $("[data-outbox]");
  const outCount = $("[data-outbox-count]");
  const srvDot = $("[data-server-dot]");
  const srvLabel = $("[data-server-label]");
  const QUEUE = [
    ["Preflight · signed", "06:31Z"],
    ["Fuel uplift · 1 200 L", "06:33Z"],
    ["Flight · crew and route", "06:38Z"],
    ["Flight Data · block times", "07:51Z"],
    ["Defect 32-41 · 2 photos", "07:55Z"],
    ["Flight · signed", "07:58Z"]
  ];
  let qTimer = null;
  let touched = false;
  const updateCount = () => {
    const pending = $$("li:not(.is-sent)", outbox).length;
    outCount.textContent = `${pending} pending`;
  };
  const fillQueue = () => {
    clearInterval(qTimer);
    outbox.innerHTML = "";
    let i = 0;
    const add = () => {
      if (i >= QUEUE.length || !net.checked) { clearInterval(qTimer); return; }
      const [t, time] = QUEUE[i++];
      const li = document.createElement("li");
      li.innerHTML = `<span>${t}</span><span class="mono">queued ${time}</span>`;
      outbox.appendChild(li);
      if (window.gsap && !reduced) gsap.from(li, { x: -16, opacity: 0, duration: 0.5, ease: "expo.out" });
      updateCount();
    };
    if (reduced) { while (i < QUEUE.length) add(); return; }
    add();
    qTimer = setInterval(add, 520);
  };
  const sync = () => {
    clearInterval(qTimer);
    srvDot.classList.add("is-ok");
    srvLabel.textContent = "Connected · syncing";
    const items = $$("li:not(.is-sent)", outbox);
    items.forEach((li, k) => {
      setTimeout(() => {
        li.classList.add("is-sent");
        li.lastElementChild.textContent = "synced";
        updateCount();
        if (k === items.length - 1) srvLabel.textContent = `Synced · ${items.length} changes · 0 conflicts`;
      }, reduced ? 0 : 260 * (k + 1));
    });
    if (!items.length) srvLabel.textContent = "Connected · nothing to sync";
  };
  const setNet = () => {
    netLabel.textContent = net.checked ? "Airplane mode" : "Online";
    if (net.checked) {
      srvDot.classList.remove("is-ok");
      srvLabel.textContent = "Server unreachable · working locally";
      fillQueue();
    } else sync();
  };
  if (net) {
    net.addEventListener("change", () => { touched = true; setNet(); });
  }

  /* ---------- nav state ---------- */
  const nav = $("[data-nav]");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- static end-states (no GSAP or reduced motion) ---------- */
  const endStates = () => {
    typed.forEach((t) => setTyped(t, 1));
    const st = $("[data-status]");
    if (st) { st.textContent = "Preflight signed"; st.className = "pill pill--ok"; }
    $$("[data-words] .w").forEach((w) => (w.style.opacity = 1));
    $$("[data-rules] li").forEach((li) => li.classList.add("is-on"));
    $$("[data-cal] .fill").forEach((f) => (f.style.transform = "scaleX(1)"));
    const dot = $(".sheet__dot");
    if (dot) dot.style.transform = "scale(1)";
    if (net) setNet();
  };

  if (!window.gsap || !window.ScrollTrigger || reduced) { endStates(); return; }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      });
    });
  }

  /* ---------- hero: one flight in four chapters, the aircraft fills its own log ---------- */
  const hero = $("[data-hero]");
  const stage = $(".hero__stage", hero);
  const sheet = $("[data-sheet]");
  const jet = $("[data-jet]");
  const jetSvg = $("svg", jet);
  const ticks = $("[data-ticks]");
  const sig = $("[data-sig]");
  const statusPill = $("[data-status]");
  const pages = $$("[data-page]", sheet);
  const sheetTabs = $$("[data-tab]", sheet);
  const chapterEls = $$("[data-chapters] li");
  const engine = $("[data-engine]");
  const tyre = $("[data-tyre]");
  const oil = $("[data-oil]");
  const runway = $("[data-runway]");
  const ex = (k) => $(`[data-ex="${k}"]`, engine);
  const stampCell = (k) => $(`[data-stamp="${k}"]`, sheet);

  /* tyre gauge dial, 0 to 250 psi over 270 degrees */
  const DIAL = { cx: 470, cy: 180, from: -135, sweep: 270, max: 250 };
  const needleAngle = (psi) => DIAL.from + (psi / DIAL.max) * DIAL.sweep;
  const dialTicks = $("[data-gauge-ticks]", tyre);
  for (let v = 0; v <= DIAL.max; v += 10) {
    const a = (needleAngle(v) - 90) * Math.PI / 180;
    const major = v % 50 === 0;
    const r1 = 84, r2 = major ? 68 : 75;
    const t = document.createElementNS("http://www.w3.org/2000/svg", "line");
    t.setAttribute("x1", DIAL.cx + r1 * Math.cos(a)); t.setAttribute("y1", DIAL.cy + r1 * Math.sin(a));
    t.setAttribute("x2", DIAL.cx + r2 * Math.cos(a)); t.setAttribute("y2", DIAL.cy + r2 * Math.sin(a));
    t.setAttribute("class", major ? "ty-tick ty-tick--major" : "ty-tick");
    dialTicks.appendChild(t);
    if (major) {
      const n = document.createElementNS("http://www.w3.org/2000/svg", "text");
      n.setAttribute("x", DIAL.cx + 54 * Math.cos(a)); n.setAttribute("y", DIAL.cy + 54 * Math.sin(a) + 5);
      n.setAttribute("text-anchor", "middle"); n.setAttribute("class", "ty-num");
      n.textContent = v;
      dialTicks.appendChild(n);
    }
  }

  /* value slips: each value lifts off its part and flies into its cell */
  const PRE = ["reg", "fuel", "nlg", "lmlg", "rmlg", "eng1", "eng2"];
  const AMB = ["h-fl", "h-tat", "h-oat", "h-mach"];
  const ENG = ["x-n1", "x-n2", "x-ff", "x-itt", "x-ot", "x-op"];
  const AWO = ["a-ra", "a-rwy"];
  const SOURCE = { nlg: "tyre", lmlg: "tyre", rmlg: "tyre", eng1: "oil", eng2: "oil" };
  const svgEl = (n) => document.createElementNS("http://www.w3.org/2000/svg", n);
  const slips = {};
  [...PRE, ...AMB, ...ENG, ...AWO].forEach((k) => {
    const cell = $(`[data-field="${k}"]`, sheet);
    const row = cell.parentElement.classList.contains("sheet__grid--eng") ? cell.previousElementSibling.previousElementSibling : null;
    const label = row ? `ENG 2 · ${row.textContent.trim()}` : $("span", cell).textContent.trim();
    const value = $$("[data-type]", cell).map((el) => el.dataset.type || el.textContent).join(" ");
    const el = document.createElement("div");
    el.className = "slip";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<small></small><b></b>`;
    el.firstChild.textContent = label;
    el.lastChild.textContent = value;
    stage.appendChild(el);
    const tick = svgEl("path"), ring = svgEl("circle");
    ring.setAttribute("r", 7);
    ticks.append(tick, ring);
    slips[k] = { el, tick, ring, cell, a: 0, p: 0, pt: $(`[data-pt="${SOURCE[k] || k}"]`, stage) };
  });

  const drawSlips = () => {
    const sr = stage.getBoundingClientRect();
    ticks.setAttribute("viewBox", `0 0 ${sr.width} ${sr.height}`);
    Object.values(slips).forEach((S) => {
      if (S.a <= 0.001 || S.p >= 0.999) {
        S.el.style.opacity = 0; S.tick.style.opacity = 0; S.ring.style.opacity = 0; return;
      }
      const a = S.pt.getBoundingClientRect();
      const b = S.cell.getBoundingClientRect();
      const w = S.el.offsetWidth, h = S.el.offsetHeight;
      const px = a.left + a.width / 2 - sr.left, py = a.top + a.height / 2 - sr.top;
      const rx = Math.min(px + 22, sr.width - w - 12), ry = Math.max(py - 22 - h, 72);
      const tx = b.left - sr.left + 4, ty = b.top - sr.top + b.height / 2 - h / 2;
      const k = S.p;
      const x = rx + (tx - rx) * k;
      const y = ry + (ty - ry) * k - Math.sin(Math.PI * k) * 70;
      const s = (0.6 + 0.4 * S.a) * (1 - 0.18 * k);
      S.el.style.transform = `translate(${x}px, ${y}px) rotate(${(-3 * k).toFixed(2)}deg) scale(${s})`;
      S.el.style.opacity = Math.min(S.a, (1 - k) / 0.12);
      const tickOn = S.a * Math.max(0, 1 - k * 5);
      S.tick.setAttribute("d", `M${px},${py} L${rx},${ry + h}`);
      S.tick.style.opacity = tickOn;
      S.ring.setAttribute("cx", px); S.ring.setAttribute("cy", py);
      S.ring.style.opacity = tickOn;
    });
  };

  const sigLen = sig.getTotalLength();
  gsap.set(sig, { strokeDasharray: sigLen, strokeDashoffset: sigLen });
  gsap.set(".sheet__dot", { scale: 0 });
  typed.forEach((t) => { if (sheet.contains(t.el)) setTyped(t, 0); });

  const typerTween = (tl, el, at, dur = 0.5) => {
    const item = typed.find((t) => t.el === el);
    if (!item) return;
    const o = { p: 0 };
    tl.to(o, { p: 1, duration: dur, ease: "none", onUpdate: () => setTyped(item, o.p) }, at);
  };
  const typeIn = (tl, cellOrEl, at, dur) => $$("[data-type]", cellOrEl).forEach((el) => typerTween(tl, el, at, dur));
  const flash = (tl, cell, at) => {
    tl.fromTo(cell, { backgroundColor: "rgba(231,240,250,0)" }, { backgroundColor: "rgba(231,240,250,1)", duration: 0.12, immediateRender: false }, at)
      .to(cell, { backgroundColor: "rgba(231,240,250,0)", duration: 0.6 }, at + 0.12);
  };
  // a slip pops off the part, holds, flies into the cell; the cell types the value as it lands
  const slip = (tl, k, at) => {
    const S = slips[k];
    tl.to(S, { a: 1, duration: 0.3, ease: "back.out(2)" }, at)
      .to(S, { p: 1, duration: 0.75, ease: "power2.inOut" }, at + 0.5);
    typeIn(tl, S.cell, at + 1.1, 0.25);
    flash(tl, S.cell, at + 1.15);
  };
  const stamp = (tl, k, at) => { typeIn(tl, stampCell(k), at, 0.3); flash(tl, stampCell(k), at + 0.25); };
  const signed = (v) => (v < 0 ? "−" : "+") + Math.abs(Math.round(v));
  const counter = (tl, el, to, fmt, at, dur, ease = "power1.out") => {
    const from = parseFloat(el.textContent.replace("−", "-"));
    const o = { v: from };
    tl.to(o, { v: to, duration: dur, ease, onUpdate: () => (el.textContent = fmt(o.v)) }, at);
  };

  /* page, status, chapter and close-up labels follow the timeline position, both directions */
  const pick = (sched, t) => sched.reduce((v, [at, val]) => (t >= at ? val : v), sched[0][1]);
  let curPage = 0;
  const showPage = (i) => {
    if (i === curPage) return;
    curPage = i;
    pages.forEach((p, k) => p.classList.toggle("is-on", k === i));
    sheetTabs.forEach((s, k) => s.classList.toggle("is-on", k === i));
    gsap.fromTo(pages[i], { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.55, ease: "expo.out" });
  };
  let curStatus = "";
  const setStatus = ([text, cls]) => {
    if (text === curStatus) return;
    curStatus = text;
    statusPill.textContent = text;
    statusPill.className = `pill ${cls}`;
  };

  const mm = gsap.matchMedia();
  mm.add({ desk: "(min-width: 861px)", mob: "(max-width: 860px)" }, (ctx) => {
    const { desk } = ctx.conditions;
    gsap.set(sheet, { x: 0, y: 0, autoAlpha: 0, xPercent: desk ? 40 : -50, yPercent: desk ? -50 : 30, rotate: desk ? 6 : 4 });
    gsap.set(jet, { x: 0, y: 0, xPercent: -50, yPercent: desk ? -50 : 0, transformOrigin: desk ? "50% 50%" : "50% 0%" });
    gsap.set(jetSvg, { scale: 1, transformOrigin: "50% 50%" });
    gsap.set([engine, tyre, oil], { x: 0, y: 0, xPercent: desk ? 0 : -50, yPercent: desk ? -50 : 0, autoAlpha: 0 });
    gsap.set(runway, { xPercent: -50, autoAlpha: 0 });
    gsap.set([".hot circle", ".ex-pt"], { scale: 0, opacity: 0 });

    const sched = { pages: [[0, 0]], status: [[0, ["Draft", "pill--draft"]]], chapters: [], labels: [] };
    const sync = () => {
      drawSlips();
      const t = tl.time();
      showPage(pick(sched.pages, t));
      setStatus(pick(sched.status, t));
      sched.labels.forEach(({ el, list }) => { const v = pick(list, t); if (el.textContent !== v) el.textContent = v; });
      chapterEls.forEach((li, i) => {
        const [a, b] = sched.chapters[i] || [0, 0];
        li.classList.toggle("is-on", t >= a && t < b);
        li.style.setProperty("--p", Math.min(Math.max((t - a) / (b - a), 0), 1).toFixed(3));
      });
    };

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" }, onUpdate: sync });

    // camera dives into a point on the aircraft and hands over to a close-up
    const closeIn = (overlay, origin, at, turn = 0) => {
      tl.set(jetSvg, { transformOrigin: origin }, at)
        .to(jetSvg, { scale: 6, duration: 1, ease: "power2.in" }, at)
        .to(jet, { autoAlpha: 0, duration: 0.3 }, at + 0.7)
        .to(".apron", { opacity: 0.35, duration: 0.8 }, at)
        .fromTo(overlay, { autoAlpha: 0, scale: 0.35, rotate: turn }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1, ease: "power3.out", immediateRender: false }, at + 0.55);
    };
    const closeOut = (overlay, at, turn = 0) => {
      tl.to(overlay, { autoAlpha: 0, scale: 0.35, rotate: turn, duration: 0.8, ease: "power2.in" }, at)
        .to(jet, { autoAlpha: 1, duration: 0.3 }, at + 0.4)
        .to(jetSvg, { scale: 1, duration: 1, ease: "power2.out" }, at + 0.4)
        .to(".apron", { opacity: 1, duration: 0.8 }, at + 0.4);
    };

    /* 1 · Preflight: on stand; registration and fuel, then tyres and oil in close-up */
    tl.to("[data-cue]", { autoAlpha: 0, duration: 0.2 }, 0)
      .to("[data-hero-copy]", { y: -120, autoAlpha: 0, filter: "blur(6px)", duration: 0.8 }, 0)
      .to(".apron", { scale: 1.08, duration: 3.2, ease: "none" }, 0);
    if (desk) tl.to("[data-chapters]", { opacity: 1, duration: 0.5 }, 0.6);
    if (desk) {
      tl.to(jet, { left: "28%", scale: 0.92, rotate: -8, duration: 1 }, 0.1);
    } else {
      tl.to(jet, { y: () => 110 - jet.offsetTop, scale: 0.55, rotate: -8, duration: 1 }, 0.1);
    }
    tl.to(sheet, { autoAlpha: 1, xPercent: desk ? 0 : -50, yPercent: desk ? -50 : 0, rotate: -3, duration: 0.9, ease: "expo.out" }, 0.55)
      .to(".hot circle", { scale: 1, opacity: 1, stagger: 0.1, duration: 0.3, ease: "back.out(2)" }, 1);
    typeIn(tl, $(".sheet__head", sheet), 1.25, 0.5);
    slip(tl, "reg", 1.5);
    slip(tl, "fuel", 2.0);
    $$(".cell", pages[0]).filter((c) => !c.dataset.field).forEach((c, i) => typeIn(tl, c, 1.7 + i * 0.22, 0.3));
    tl.to(".hot circle", { scale: 0, opacity: 0, duration: 0.3 }, 3.3);

    // tyres: gauge on the valve, NLG then both mains; the needle drops to zero between wheels
    const tTy = 3.4;
    closeIn(tyre, "39.7% 53.1%", tTy, -12);
    // the needle turns about the dial centre; driven as an attribute so the pivot never drifts
    const needleEl = $("[data-needle]", tyre);
    const needle = { deg: needleAngle(0) };
    const setNeedle = () => needleEl.setAttribute("transform", `rotate(${needle.deg.toFixed(2)} ${DIAL.cx} ${DIAL.cy})`);
    setNeedle();
    const tyPts = $$("[data-pt='tyre']", tyre);
    tl.to(tyPts, { scale: 1, opacity: 1, duration: 0.3 }, tTy + 1.3);
    // both mains read the same pressure, so they share one reading and lift off one after the other
    const READS = [[["nlg"], "TYRE · NLG", 120], [["lmlg", "rmlg"], "TYRE · LH / RH MLG", 165]];
    const tyreLabels = [];
    let tyLast = 0;
    READS.forEach(([keys, label, psi], i) => {
      const at = tTy + 1.4 + i * 1.6;
      tyreLabels.push([i === 0 ? 0 : at - 0.15, label]);
      if (i > 0) tl.to(needle, { deg: needleAngle(0), duration: 0.3, ease: "power2.in", onUpdate: setNeedle }, at - 0.45);
      tl.to(needle, { deg: needleAngle(psi), duration: 0.6, ease: "back.out(1.4)", onUpdate: setNeedle }, at);
      keys.forEach((k, j) => slip(tl, k, (tyLast = at + 0.55 + j * 0.5)));
    });
    sched.labels.push({ el: $("[data-tyre-pos]", tyre), list: tyreLabels });
    const tTyOut = tyLast + 1.6;
    tl.to(tyPts, { scale: 0, opacity: 0, duration: 0.2 }, tTyOut);
    closeOut(tyre, tTyOut, 12);

    // oil: sight glass on each engine; ENG 1 reads full, ENG 2 takes half a quart
    const tOil = tTyOut + 1.2;
    closeIn(oil, "39.7% 67.2%", tOil, 12);
    const level = $("[data-oil-level]", oil);
    // the can pivots on its spout (local origin); driven as an attribute like the needle
    const canEl = $("[data-can]", oil);
    const can = { x: 520, y: 120, r: 0 };
    const setCan = () => canEl.setAttribute("transform", `translate(${can.x.toFixed(1)} ${can.y.toFixed(1)}) rotate(${can.r.toFixed(1)})`);
    const stream = $("[data-oil-stream]", oil);
    const oilPt = $("[data-pt='oil']", oil);
    tl.to(oilPt, { scale: 1, opacity: 1, duration: 0.3 }, tOil + 1.3);
    slip(tl, "eng1", tOil + 1.4);
    const tE2 = tOil + 2.3;
    sched.labels.push({ el: $("[data-oil-pos]", oil), list: [[0, "ENG 1 · OIL"], [tE2, "ENG 2 · OIL"]] });
    tl.to(level, { attr: { y: 178, height: 144 }, duration: 0.35 }, tE2)
      .to(can, { x: 332, y: 2, r: -105, duration: 0.65, ease: "power2.inOut", onUpdate: setCan }, tE2 + 0.3)
      .to(stream, { opacity: 1, duration: 0.15 }, tE2 + 0.9)
      .to(level, { attr: { y: 150, height: 172 }, duration: 0.75, ease: "power1.inOut" }, tE2 + 1.0)
      .to(stream, { opacity: 0, duration: 0.15 }, tE2 + 1.75)
      .to(can, { x: 520, y: 120, r: 0, duration: 0.6, ease: "power2.inOut", onUpdate: setCan }, tE2 + 1.85);
    slip(tl, "eng2", tE2 + 1.9);
    const tOilOut = tE2 + 3.35;
    tl.to(oilPt, { scale: 0, opacity: 0, duration: 0.2 }, tOilOut);
    closeOut(oil, tOilOut, -12);

    const tSign = tOilOut + 1.2;
    tl.to(sig, { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut" }, tSign);
    typeIn(tl, $(".sheet__hash", sheet), tSign + 0.6, 0.4);
    tl.to(".sheet__dot", { scale: 1, duration: 0.3, ease: "back.out(3)" }, tSign + 0.9);
    sched.status.push([tSign + 0.95, ["Preflight signed", "pill--ok"]]);

    /* 2 · Flight: crew and route, off blocks, take-off */
    const T2 = tSign + 1.6;
    sched.pages.push([T2, 1]);
    $$(".cell:not([data-stamp])", pages[1]).forEach((c, i) => typeIn(tl, c, T2 + 0.2 + i * 0.14, 0.3));
    const tOff = T2 + 1.3;
    tl.to(jet, { rotate: 0, y: "-=30", duration: 0.9, ease: "power1.inOut" }, tOff)
      .to(".apron", { y: 160, duration: 1, ease: "power1.in" }, tOff);
    stamp(tl, "off", tOff + 0.5);
    sched.status.push([tOff + 0.5, ["Flight in progress", ""]]);

    const tTo = T2 + 2.4;
    tl.to(".apron", { autoAlpha: 0, scale: 1.4, duration: 1.1, ease: "power2.in" }, tTo)
      .to("[data-sky]", { autoAlpha: 1, duration: 0.9 }, tTo + 0.2)
      .to(jet, { "--sx": "96px", "--sy": "150px", "--sb": "40px", "--so": 0.16, scale: desk ? 1 : 0.6, duration: 1.3 }, tTo + 0.1);
    stamp(tl, "to", tTo + 0.6);
    const hud = $("[data-hud]");
    tl.to(hud, { autoAlpha: 1, duration: 0.4 }, tTo + 0.6);
    const hv = (k) => $(`[data-pt="${k}"]`, hud);
    counter(tl, hv("h-fl"), 370, (v) => String(Math.round(v)).padStart(3, "0"), tTo + 0.7, 1.6);
    counter(tl, hv("h-tat"), -34, signed, tTo + 0.7, 1.6);
    counter(tl, hv("h-oat"), -55, signed, tTo + 0.7, 1.6);
    counter(tl, hv("h-mach"), 0.7, (v) => v.toFixed(2), tTo + 0.7, 1.6);

    /* 3 · Engine: cruise readings, then engine 2 taken apart module by module */
    const T3 = tTo + 2.6;
    sched.pages.push([T3, 2]);
    AMB.forEach((k, i) => slip(tl, k, T3 + 0.3 + i * 0.3));

    const tZoom = T3 + 2.1;
    tl.set(jetSvg, { transformOrigin: "60.3% 67.2%" }, tZoom)
      .to(hud, { autoAlpha: 0, duration: 0.4 }, tZoom)
      .to(jetSvg, { scale: 7, duration: 1.1, ease: "power2.in" }, tZoom)
      .to(jet, { autoAlpha: 0, duration: 0.35 }, tZoom + 0.75)
      .to("[data-sky]", { opacity: 0.45, duration: 0.8 }, tZoom)
      .fromTo(engine, { autoAlpha: 0, scale: 0.3, rotate: 90 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.1, ease: "power3.out", immediateRender: false }, tZoom + 0.6);

    const tBoom = tZoom + 1.7;
    const SPREAD = { "cowl-top": { y: -112, opacity: 0.5 }, "cowl-bot": { y: 112, opacity: 0.5 }, fan: { x: -150 }, comp: { x: -55 }, comb: { x: 18 }, turb: { x: 88 }, exh: { x: 178 }, agb: { y: 44 } };
    Object.entries(SPREAD).forEach(([k, v], i) => tl.to(ex(k), { ...v, duration: 1, ease: "expo.inOut" }, tBoom + i * 0.04));
    tl.to(".ex-label", { opacity: 1, stagger: 0.05, duration: 0.4 }, tBoom + 0.8)
      .to($$(".ex-pt", engine), { scale: 1, opacity: 1, stagger: 0.05, duration: 0.3, ease: "back.out(2)" }, tBoom + 0.9);
    const tE = tBoom + 1.3;
    ENG.forEach((k, i) => slip(tl, k, tE + i * 0.3));
    $$("[data-e1]", sheet).forEach((c, i) => typeIn(tl, c, tE + 1.1 + i * 0.3, 0.3));

    const tBack = tE + ENG.length * 0.3 + 1.3;
    tl.to([".ex-label", ...$$(".ex-pt", engine)], { opacity: 0, duration: 0.3 }, tBack);
    Object.keys(SPREAD).forEach((k) => tl.to(ex(k), { x: 0, y: 0, opacity: 1, duration: 0.8, ease: "expo.inOut" }, tBack + 0.2));
    tl.to(engine, { autoAlpha: 0, scale: 0.3, rotate: 90, duration: 0.9, ease: "power2.in" }, tBack + 1.0)
      .to(jet, { autoAlpha: 1, duration: 0.35 }, tBack + 1.3)
      .to(jetSvg, { scale: 1, duration: 1.1, ease: "power2.out" }, tBack + 1.3)
      .to("[data-sky]", { opacity: 1, duration: 0.8 }, tBack + 1.3);

    /* 4 · All Weather: CAT IIIA approach into fog, touchdown, back on blocks */
    const T4 = tBack + 2.6;
    sched.pages.push([T4, 3]);
    const stageH = () => stage.offsetHeight;
    const jetCY = () => (desk ? stageH() / 2 - 30 : 80 + jet.offsetHeight * 0.3);
    const rwyFinal = () => jetCY() - runway.offsetHeight * (1450 / 2400);
    tl.to("[data-fog]", { autoAlpha: 1, duration: 1 }, T4)
      .to(".cloud", { opacity: 0, duration: 0.8 }, T4 + 0.2)
      .to(hud, { autoAlpha: 1, duration: 0.4 }, T4 + 0.2)
      .to("[data-hud-cruise]", { opacity: 0, duration: 0.3 }, T4 + 0.2)
      .to("[data-hud-ra]", { opacity: 1, duration: 0.3 }, T4 + 0.35)
      .fromTo(runway, { y: () => rwyFinal() - stageH() * 1.4 }, { y: rwyFinal, duration: 3.4, ease: "power1.out", immediateRender: false }, T4 + 0.2)
      .to(runway, { autoAlpha: 1, duration: 0.6 }, T4 + 0.2)
      .to(jet, { "--sx": "18px", "--sy": "26px", "--sb": "24px", "--so": 0.55, scale: desk ? 0.92 : 0.55, duration: 3.2, ease: "power1.in" }, T4 + 0.4);
    counter(tl, $("[data-ra]", hud), 50, (v) => `${Math.round(v)} ft`, T4 + 0.4, 2.6, "power1.in");
    tl.to("[data-dh]", { opacity: 1, duration: 0.15 }, T4 + 3.0);
    $$(".cell:not([data-field])", pages[3]).forEach((c, i) => typeIn(tl, c, T4 + 0.6 + i * 0.32, 0.3));
    tl.to("[data-fog]", { autoAlpha: 0.3, duration: 0.8 }, T4 + 2.8);
    slip(tl, "a-ra", T4 + 3.05);
    slip(tl, "a-rwy", T4 + 3.5);

    const tLdg = T4 + 5.0;
    sched.pages.push([tLdg, 1]);
    stamp(tl, "ldg", tLdg + 0.3);
    const tIn = tLdg + 0.9;
    tl.to([runway, "[data-fog]", hud], { autoAlpha: 0, duration: 0.8 }, tIn)
      .to("[data-sky]", { autoAlpha: 0, duration: 0.8 }, tIn + 0.2)
      .fromTo(".apron", { y: -160, scale: 1.2 }, { autoAlpha: 1, y: 0, scale: 1.08, duration: 1.1, ease: "power2.out", immediateRender: false }, tIn)
      .to(jet, { rotate: -8, y: "+=30", duration: 1, ease: "power1.inOut" }, tIn + 0.2);
    stamp(tl, "on", tIn + 1.0);
    ["fuel", "bt", "ft", "ld"].forEach((k, i) => stamp(tl, k, tIn + 1.25 + i * 0.2));
    sched.status.push([tIn + 1.1, ["Flight completed", ""]]);
    tl.to({}, { duration: 0.8 });
    // the cloud deck streams past from take-off until the fog takes over
    tl.fromTo(".cloud", { y: 0 }, { y: () => stage.offsetHeight * 1.8, ease: "none", duration: T4 + 1 - (tTo + 0.2), immediateRender: false }, tTo + 0.2);

    const end = tl.duration();
    sched.chapters = [[0, T2], [T2, T3], [T3, T4], [T4, end + 1]];

    /* scroll picks the step, the step plays on its own: each stop is a resting frame */
    const STOPS = [tTy, tTyOut, tOilOut, T3, tBack, tLdg, end];
    // close to authored pace; only a long jump (fast scroll across several steps) is squeezed to the cap
    const SPEED = 1.6, MAX_DUR = 5;
    let player = null, target = 0;
    const playTo = (t) => {
      if (t === target) return;
      target = t;
      if (player) player.kill();
      const dur = Math.min(Math.max(Math.abs(t - tl.time()) / SPEED, 0.3), MAX_DUR);
      player = tl.tweenTo(t, { duration: dur, ease: "none" });
    };
    ScrollTrigger.create({
      trigger: hero, start: "top top", end: `+=${STOPS.length * 70}%`,
      pin: true, anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        // ScrollTrigger rounds start to -0.001px, so the top of the page reads as a hair above zero
        playTo(self.scroll() - self.start < 8 ? 0 : STOPS[Math.min(STOPS.length - 1, Math.floor(p * STOPS.length))]);
      },
      onRefresh: () => {
        // re-measure function-based values (jet, runway) at the current position
        if (player) player.kill();
        const t = tl.time();
        tl.time(0).invalidate().time(t);
        if (player) player = tl.tweenTo(target, { duration: Math.min(Math.abs(target - t) / SPEED, MAX_DUR), ease: "none" });
        drawSlips();
      }
    });

    return () => {
      if (player) player.kill();
      $$(".cell", sheet).forEach((c) => { c.style.backgroundColor = ""; });
      curPage = -1; showPage(0);
    };
  });

  /* ---------- statement words ---------- */
  gsap.to("[data-words] .w", {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: "[data-words]", start: "top 78%", end: "bottom 45%", scrub: true }
  });

  /* ---------- lifecycle ---------- */
  const steps = $$("[data-steps] li");
  const tabs = $$("[data-app-tabs] span");
  const panes = $$("[data-pane]");
  const appStatus = $("[data-app-status]");
  const STATUS = [["Preflight signed", ""], ["Flight in progress", ""], ["Flight completed", ""], ["Flight completed", ""], ["Closed", "pill--ok"]];
  let cur = -1;
  const setStep = (i) => {
    if (i === cur) return;
    const prev = cur;
    cur = i;
    steps.forEach((s, k) => s.classList.toggle("is-on", k === i));
    tabs.forEach((s, k) => s.classList.toggle("is-on", k === i));
    appStatus.textContent = STATUS[i][0];
    appStatus.className = `pill ${STATUS[i][1]}`;
    panes.forEach((p, k) => {
      if (k === i) {
        p.classList.add("is-on");
        gsap.fromTo(p, { autoAlpha: 0, y: prev < i ? 24 : -24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" });
        gsap.fromTo($$(".row, .sign, .defect, .timeline", p), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "expo.out", delay: 0.08 });
      } else if (p.classList.contains("is-on")) {
        p.classList.remove("is-on");
        gsap.to(p, { autoAlpha: 0, duration: 0.25 });
      }
    });
  };
  setStep(0);
  const tlFill = $("[data-tl-fill]");
  gsap.set(tlFill, { scaleX: 0 });
  ScrollTrigger.create({
    trigger: "[data-life]", start: "top top", end: "+=360%", pin: ".life__pin", scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      const i = Math.min(4, Math.floor(p * 5));
      setStep(i);
      const local = p * 5 - 2;
      gsap.set(tlFill, { scaleX: Math.min(Math.max(local, 0), 1) });
    }
  });
  gsap.from(".ipad", {
    rotateX: 18, y: 80, scale: 0.94, transformPerspective: 1400, ease: "none",
    scrollTrigger: { trigger: "[data-life]", start: "top 90%", end: "top top", scrub: true }
  });

  /* ---------- QR: auto scan when visible ---------- */
  ScrollTrigger.create({ trigger: ".qr", start: "top 55%", once: true, onEnter: () => showScan("ok") });
  gsap.from(".placard", {
    rotate: -10, y: 120, ease: "none",
    scrollTrigger: { trigger: ".qr", start: "top bottom", end: "center center", scrub: true }
  });

  /* ---------- chain: blocks seal one by one ---------- */
  // plays through once the track is in view, so the whole chain is sealed before the visitor scrolls on
  const chainTl = gsap.timeline({ scrollTrigger: { trigger: "[data-chain-track]", start: "top 85%", toggleActions: "play none none none" } });
  blocks.forEach((b, i) => {
    chainTl.from(b, { y: 32, autoAlpha: 0, duration: 0.7, ease: "expo.out" }, i * 0.45);
    if (links[i]) chainTl.from(links[i], { scaleX: 0, scaleY: 0, duration: 0.35, ease: "power2.out" }, i * 0.45 + 0.3);
  });

  /* ---------- offline ---------- */
  ScrollTrigger.create({
    trigger: "[data-offline]", start: "top 60%", once: true,
    onEnter: () => {
      setNet();
      setTimeout(() => { if (!touched && net.checked) { net.checked = false; setNet(); } }, QUEUE.length * 520 + 1800);
    }
  });

  /* ---------- rules ---------- */
  $$("[data-rules] li").forEach((li) => {
    ScrollTrigger.create({
      trigger: li, start: "top 72%", end: "bottom 28%",
      onToggle: (self) => li.classList.toggle("is-on", self.isActive || self.progress === 1)
    });
  });

  /* ---------- MEL calendar fill ---------- */
  gsap.to("[data-cal] .fill", {
    scaleX: 1, stagger: 0.25, ease: "none",
    scrollTrigger: { trigger: "[data-mel]", start: "top 65%", end: "bottom 70%", scrub: true }
  });

  /* ---------- screens rail ---------- */
  mm.add("(min-width: 861px)", () => {
    const rail = $("[data-rail]");
    const dist = () => Math.max(0, rail.scrollWidth - window.innerWidth);
    gsap.to(rail, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: "[data-screens]", start: "top top", end: () => `+=${dist()}`, pin: ".screens__pin", scrub: 0.6, invalidateOnRefresh: true }
    });
  });

  /* ---------- roles rows ---------- */
  gsap.from(".matrix tbody tr", {
    y: 18, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: "expo.out",
    scrollTrigger: { trigger: ".matrix", start: "top 80%", once: true }
  });

  /* ---------- CTA: take-off ---------- */
  gsap.fromTo("[data-cta-jet]",
    { xPercent: 70, yPercent: 90, rotate: -40, scale: 0.7 },
    { xPercent: 0, yPercent: 0, rotate: -32, scale: 1, ease: "none",
      scrollTrigger: { trigger: "[data-cta]", start: "top bottom", end: "bottom bottom", scrub: 0.8 } });
  gsap.from(".cta__title", {
    yPercent: 30, autoAlpha: 0, ease: "expo.out", duration: 1.1,
    scrollTrigger: { trigger: "[data-cta]", start: "top 65%", once: true }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
