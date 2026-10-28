/* eATL marketing site: scroll scenes and demos */
(() => {
  "use strict";

  const CONTACT_EMAIL = "contact@nextbridgeit.net";
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
      empty.innerHTML = `<img src="assets/app-mark-68.png" alt=""><span>Screenshot slot</span><code>${img.getAttribute("src")}</code>`;
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
      .set(scanline, { opacity: 1, y: 0 })
      .to(scanline, { y: () => scanline.parentElement.offsetHeight, duration: 0.9, ease: "power2.inOut" })
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
  const menu = $("[data-menu]");
  const setMenu = (open) => { nav.classList.toggle("is-open", open); menu.setAttribute("aria-expanded", String(open)); };
  menu.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$(".nav__links a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menu.focus(); } });
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- tyre gauge dial, 0 to 250 psi over 270 degrees ---------- */
  const tyre = $("[data-tyre]");
  const DIAL = { cx: 470, cy: 180, from: -135, sweep: 270, max: 250 };
  const needleAngle = (psi) => DIAL.from + (psi / DIAL.max) * DIAL.sweep;
  const needleEl = $("[data-needle]", tyre);
  const setNeedle = (deg) => needleEl.setAttribute("transform", `rotate(${deg.toFixed(2)} ${DIAL.cx} ${DIAL.cy})`);
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
  setNeedle(needleAngle(165));

  /* ---------- static end-states (no GSAP or reduced motion) ---------- */
  const endStates = () => {
    typed.forEach((t) => setTyped(t, 1));
    $$("[data-status][data-end]").forEach((st) => { st.textContent = st.dataset.end; st.className = `pill ${st.dataset.endCls}`; });
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count.replace("-", "−")));
    $$("[data-words] .w").forEach((w) => (w.style.opacity = 1));
    $$("[data-rules] li").forEach((li) => li.classList.add("is-on"));
    $$("[data-cal] .fill").forEach((f) => (f.style.transform = "scaleX(1)"));
    $$(".sheet__dot").forEach((dot) => (dot.style.transform = "scale(1)"));
    const fltLabel = $("[data-flt-label]");
    if (fltLabel) { fltLabel.textContent = "Block ON"; $("[data-flt-time]").textContent = "07:50Z"; }
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

  const mm = gsap.matchMedia();

  /* ---------- flight: four chapters, each plays on its own as it scrolls into view ---------- */
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
  // a value lands in its cell: typed in, then the cell lights up
  const fill = (tl, cell, at) => { typeIn(tl, cell, at, 0.3); flash(tl, cell, at + 0.25); };
  const signed = (v) => (v < 0 ? "−" : "+") + Math.abs(Math.round(v));
  const counter = (tl, el, to, fmt, at, dur, ease = "power1.out") => {
    const o = { v: parseFloat(el.textContent.replace("−", "-")) };
    tl.to(o, { v: to, duration: dur, ease, onUpdate: () => (el.textContent = fmt(o.v)) }, at);
  };
  const setStatus = (tl, pill, text, cls, at) => tl.call(() => { pill.textContent = text; pill.className = `pill ${cls}`; }, null, at);
  const fullText = (el) => typed.find((t) => t.el === el).full;
  const thousands = (v) => Math.round(v).toLocaleString("en-US").replace(/,/g, " ");

  /* value slips: a value lifts off the part as a paper slip, tied to it by a tick, and flies into its cell */
  const svgEl = (n) => document.createElementNS("http://www.w3.org/2000/svg", n);
  const slipLabel = (cell) => {
    const row = cell.parentElement.classList.contains("sheet__grid--eng") ? cell.previousElementSibling.previousElementSibling : null;
    return row ? `ENG 2 · ${row.textContent.trim()}` : $("span", cell).textContent.trim();
  };
  const slipLayer = (body) => {
    const layer = document.createElement("div");
    layer.className = "slips";
    layer.setAttribute("aria-hidden", "true");
    const ticks = svgEl("svg");
    layer.appendChild(ticks);
    body.appendChild(layer);
    // reads first, writes after: interleaving them forced a layout per slip on every frame
    const draw = (S) => {
      if (S.a < 0.001 || S.p > 0.999) {
        S.el.style.opacity = 0; S.tick.style.opacity = 0; S.ring.style.opacity = 0;
        return;
      }
      const L = layer.getBoundingClientRect(), a = S.src.getBoundingClientRect(), b = S.cell.getBoundingClientRect();
      const w = S.el.offsetWidth, h = S.el.offsetHeight;
      const px = a.left + a.width / 2 - L.left, py = a.top + a.height / 2 - L.top;
      const rx = Math.min(px + 22, L.width - w - 12), ry = Math.max(py - 22 - h, 8);
      const tx = b.left - L.left + 4, ty = b.top - L.top + b.height / 2 - h / 2;
      const k = S.p;
      const x = rx + (tx - rx) * k;
      const y = ry + (ty - ry) * k - Math.sin(Math.PI * k) * 70;
      S.el.style.transform = `translate(${x}px, ${y}px) rotate(${(-3 * k).toFixed(2)}deg) scale(${(0.6 + 0.4 * S.a) * (1 - 0.18 * k)})`;
      S.el.style.opacity = Math.min(S.a, (1 - k) / 0.12);
      const tickOn = S.a * Math.max(0, 1 - k * 5);
      S.tick.setAttribute("d", `M${px},${py} L${rx},${ry + h}`);
      S.tick.style.opacity = tickOn;
      S.ring.setAttribute("cx", px); S.ring.setAttribute("cy", py);
      S.ring.style.opacity = tickOn;
    };
    // pops off the part, holds, flies into the cell; the cell types the value as it lands
    return (tl, src, cell, at) => {
      const el = document.createElement("div");
      el.className = "slip";
      el.innerHTML = "<small></small><b></b>";
      el.firstChild.textContent = slipLabel(cell);
      el.lastChild.textContent = $$("[data-type]", cell).map(fullText).join(" ");
      layer.appendChild(el);
      const tick = svgEl("path"), ring = svgEl("circle");
      ring.setAttribute("r", 7);
      ticks.append(tick, ring);
      const S = { el, tick, ring, src, cell, a: 0, p: 0 };
      draw(S);
      tl.to(S, { a: 1, duration: 0.3, ease: "back.out(2)", onUpdate: () => draw(S) }, at)
        .to(S, { p: 1, duration: 0.75, ease: "power2.inOut", onUpdate: () => draw(S) }, at + 0.5);
      fill(tl, cell, at + 1.1);
    };
  };

  // every chapter starts from a blank page when it comes into view, holds the finished page,
  // then plays again; it only runs while it is on screen
  const HOLD = 3;
  const chapter = (key, build) => {
    const root = $(`[data-ch="${key}"]`);
    const sheet = $(".sheet", root);
    const pill = $("[data-status]", sheet);
    const pill0 = [pill.textContent, pill.className];
    typed.forEach((t) => { if (sheet.contains(t.el)) setTyped(t, 0); });
    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: HOLD, defaults: { ease: "power2.inOut" } });
    typeIn(tl, $(".sheet__head", sheet), 0, 0.4);
    // tweens rewind on their own; what a call() set by hand is put back here
    const slip = slipLayer($(".ch__body", root));
    const reset = build({ root, sheet, tl, pill, cell: (sel) => $(sel, sheet), slip: (src, c, at) => slip(tl, src, c, at) });
    tl.eventCallback("onRepeat", () => {
      [pill.textContent, pill.className] = pill0;
      if (reset) reset();
    });
    gsap.from(root, { autoAlpha: 0, y: 48, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: root, start: "top 85%", once: true } });
    ScrollTrigger.create({ trigger: root, start: "top 70%", end: "bottom top", onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) });
  };
  // cells that no scene event fills are typed in one after another
  const typeRest = (tl, sheet, skip, at, step) =>
    $$(".cell", sheet).filter((c) => $("[data-type]", c) && !skip(c)).forEach((c, i) => typeIn(tl, c, at + i * step, 0.3));

  /* 1 · Preflight: tyres and oil in close-up, then the Commander signs */
  chapter("pre", ({ root, sheet, tl, cell, pill, slip }) => {
    const LATER = ["fuel", "nlg", "lmlg", "rmlg", "eng1", "eng2"];
    typeRest(tl, sheet, (c) => LATER.includes(c.dataset.field), 0.2, 0.12);

    // what the record already knows checks in first: QR, carried route, defects, maintenance
    const chips = $$("[data-chips] .chip", root);
    gsap.set(chips, { autoAlpha: 0, y: 8 });
    tl.to(chips, { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.4, ease: "back.out(2)" }, 0.1);

    // fuel: litres counted at the pump, converted to lb, the onboard bar grows with them
    const LB_PER_L = 2116 / 1200, BEFORE = 4094;
    const fuelL = $("[data-fuel-l]", root), fuelLb = $("[data-fuel-lb]", root), fuelOn = $("[data-fuel-on]", root);
    const fuelUp = $("[data-fuel-up]", root);
    const pump = { l: 0 };
    const showFuel = () => {
      fuelL.textContent = thousands(pump.l);
      fuelLb.textContent = thousands(pump.l * LB_PER_L);
      fuelOn.textContent = thousands(BEFORE + pump.l * LB_PER_L);
    };
    showFuel();
    gsap.set(fuelUp, { scaleX: 0 });
    tl.to(pump, { l: 1200, duration: 1.6, ease: "power1.inOut", onUpdate: showFuel }, 0.7)
      .to(fuelUp, { scaleX: 1, duration: 1.6, ease: "power1.inOut" }, 0.7);
    slip(fuelOn, cell("[data-field='fuel']"), 2.3);

    // tyres: NLG first, then both mains, which read the same pressure
    const needle = { deg: needleAngle(0) };
    const turn = () => setNeedle(needle.deg);
    turn();
    const tyPt = $("[data-pt='tyre']", root);
    const oilPt = $("[data-pt='oil']", root);
    const tyPos = $("[data-tyre-pos]", root);
    gsap.set([tyPt, oilPt], { scale: 0, opacity: 0 });
    tl.to(tyPt, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, 0.3)
      .to(needle, { deg: needleAngle(120), duration: 0.6, ease: "back.out(1.4)", onUpdate: turn }, 0.4);
    slip(tyPt, cell("[data-field='nlg']"), 1.0);
    tl.to(needle, { deg: needleAngle(0), duration: 0.3, ease: "power2.in", onUpdate: turn }, 1.5)
      .call(() => (tyPos.textContent = "TYRE · LH / RH MLG"), null, 1.6)
      .to(needle, { deg: needleAngle(165), duration: 0.6, ease: "back.out(1.4)", onUpdate: turn }, 1.85);
    slip(tyPt, cell("[data-field='lmlg']"), 2.45);
    slip(tyPt, cell("[data-field='rmlg']"), 2.75);

    // oil: ENG 1 reads full, ENG 2 takes half a quart; the can pivots on its spout
    const level = $("[data-oil-level]", root);
    const canEl = $("[data-can]", root);
    const can = { x: 520, y: 120, r: 0 };
    const setCan = () => canEl.setAttribute("transform", `translate(${can.x.toFixed(1)} ${can.y.toFixed(1)}) rotate(${can.r.toFixed(1)})`);
    const stream = $("[data-oil-stream]", root);
    const oilPos = $("[data-oil-pos]", root);
    tl.to(oilPt, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, 0.5);
    slip(oilPt, cell("[data-field='eng1']"), 1.1);
    tl.call(() => (oilPos.textContent = "ENG 2 · OIL"), null, 1.5)
      .to(level, { attr: { y: 178, height: 144 }, duration: 0.35 }, 1.5)
      .to(can, { x: 332, y: 2, r: -105, duration: 0.65, onUpdate: setCan }, 1.8)
      .to(stream, { opacity: 1, duration: 0.15 }, 2.4)
      .to(level, { attr: { y: 150, height: 172 }, duration: 0.75, ease: "power1.inOut" }, 2.5)
      .to(stream, { opacity: 0, duration: 0.15 }, 3.25)
      .to(can, { x: 520, y: 120, r: 0, duration: 0.6, onUpdate: setCan }, 3.35);
    slip(oilPt, cell("[data-field='eng2']"), 3.4);

    const sig = $("[data-sig]", sheet);
    const dot = $(".sheet__dot", sheet);
    const len = sig.getTotalLength();
    gsap.set(sig, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(dot, { scale: 0 });
    tl.to(sig, { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut" }, 4.7);
    typeIn(tl, $(".sheet__hash", sheet), 5.3, 0.4);
    tl.to(dot, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 5.6);
    setStatus(tl, pill, "Preflight signed", "pill--ok", 5.65);
    return () => { tyPos.textContent = "TYRE · NLG"; oilPos.textContent = "ENG 1 · OIL"; };
  });

  /* 2 · Flight: crew and route, then each block time stamped as it happens */
  chapter("flt", ({ root, sheet, tl, cell, pill, slip }) => {
    typeRest(tl, sheet, (c) => c.dataset.stamp, 0.2, 0.12);
    const jet = $("[data-scene-jet]", root);
    const label = $("[data-flt-label]", root);
    const time = $("[data-flt-time]", root);
    gsap.set(jet, { xPercent: -50, yPercent: -50, x: 0, y: 0, rotate: -8 });

    // the route fills from LYBE to LYTV; each stamp lights its tick, fuel burns down from ramp to cut-off
    const track = $(".route__track", root);
    const ticks = $$(".route__tick", root);
    const totals = $("[data-flt-totals]", root);
    const fuel = $("[data-flt-fuel]", root);
    const leg = { p: 0 }, burn = { lb: 6210 };
    const drawLeg = () => track.style.setProperty("--p", leg.p.toFixed(4));
    const showBurn = () => (fuel.textContent = thousands(burn.lb));
    drawLeg(); showBurn();
    ticks.forEach((t) => t.classList.remove("is-on"));
    gsap.set(totals, { opacity: 0 });
    tl.to(leg, { p: 0.19, duration: 0.8, ease: "none", onUpdate: drawLeg }, 1.0)
      .to(leg, { p: 0.87, duration: 1.0, ease: "none", onUpdate: drawLeg }, 1.8)
      .to(leg, { p: 1, duration: 0.7, ease: "power1.out", onUpdate: drawLeg }, 2.8)
      .to(burn, { lb: 4020, duration: 2.5, ease: "power1.inOut", onUpdate: showBurn }, 1.0)
      .to(totals, { opacity: 1, duration: 0.4 }, 4.1);

    // the readout shows the time from the record itself, so the two never disagree
    const event = (k, name, at) => {
      const c = cell(`[data-stamp='${k}']`);
      const tick = ticks[["off", "to", "ldg", "on"].indexOf(k)];
      tl.call(() => { label.textContent = name; time.textContent = `${fullText($("[data-type]", c))}Z`; tick.classList.add("is-on"); }, null, at)
        .fromTo(time.parentElement, { opacity: 0.2 }, { opacity: 1, duration: 0.3, immediateRender: false }, at);
      slip(tick, c, at);
    };
    event("off", "Block OFF", 1.0);
    setStatus(tl, pill, "Flight in progress", "", 1.0);
    tl.to(jet, { rotate: 0, duration: 0.8 }, 1.0);
    event("to", "Take-Off", 1.8);
    tl.to(jet, { scale: 1.18, "--sx": "70px", "--sy": "110px", "--sb": "36px", "--so": 0.2, duration: 1.1 }, 1.8)
      .to(jet, { scale: 1, "--sx": "18px", "--sy": "26px", "--sb": "24px", "--so": 0.55, duration: 0.9 }, 2.6);
    event("ldg", "Landing", 2.8);
    event("on", "Block ON", 3.5);
    tl.to(jet, { rotate: -8, duration: 0.8 }, 3.5);
    setStatus(tl, pill, "Flight completed", "", 3.6);
    slip(fuel, cell("[data-stamp='fuel']"), 3.6);
    ["bt", "ft", "ld"].forEach((k, i) => fill(tl, cell(`[data-stamp='${k}']`), 4.7 + i * 0.2));
    const label0 = label.textContent, time0 = time.textContent;

    // the cloud deck streams past while the scene is on screen
    const scene = $(".ch__scene", root);
    const clouds = $$(".cloud", root).map((c, i, all) => {
      gsap.set(c, { top: 0 });
      return gsap.fromTo(c, { y: () => -scene.offsetHeight * 0.6 }, { y: () => scene.offsetHeight * 1.1, duration: 7, ease: "none", repeat: -1, paused: true }).progress(i / all.length);
    });
    ScrollTrigger.create({ trigger: scene, onToggle: (self) => clouds.forEach((t) => (self.isActive ? t.play() : t.pause())) });
    return () => {
      label.textContent = label0; time.textContent = time0;
      ticks.forEach((t) => t.classList.remove("is-on"));
    };
  });

  /* 3 · Engine: cruise readings, then engine 2 taken apart module by module */
  chapter("eng", ({ root, sheet, tl, slip }) => {
    const engine = $("[data-engine]", root);
    const ex = (k) => $(`[data-ex="${k}"]`, engine);
    const [fl, tat, oat, mach] = $$("[data-count]", root);
    counter(tl, fl, 370, (v) => String(Math.round(v)).padStart(3, "0"), 0.2, 1.6);
    counter(tl, tat, -34, signed, 0.2, 1.6);
    counter(tl, oat, -55, signed, 0.2, 1.6);
    counter(tl, mach, 0.7, (v) => v.toFixed(2), 0.2, 1.6);
    $$("[data-field^='h-']", sheet).forEach((c, i) => slip([fl, tat, oat, mach][i], c, 1.6 + i * 0.2));

    const ENG_ORDER = ["x-n1", "x-n2", "x-ff", "x-itt", "x-ot", "x-op"];
    const pts = $$(".ex-pt", engine);
    gsap.set(pts, { scale: 0, opacity: 0 });
    const SPREAD = { "cowl-top": { y: -112, opacity: 0.5 }, "cowl-bot": { y: 112, opacity: 0.5 }, fan: { x: -150 }, comp: { x: -55 }, comb: { x: 18 }, turb: { x: 88 }, exh: { x: 178 }, agb: { y: 44 } };
    Object.entries(SPREAD).forEach(([k, v], i) => tl.to(ex(k), { ...v, duration: 1, ease: "expo.inOut" }, 0.6 + i * 0.04));
    tl.to($$(".ex-label", engine), { opacity: 1, stagger: 0.05, duration: 0.4 }, 1.4)
      .to(pts, { scale: 1, opacity: 1, stagger: 0.05, duration: 0.3, ease: "back.out(2)" }, 1.5);
    $$("[data-field^='x-']", sheet).forEach((c) => slip($(`[data-pt="${c.dataset.field}"]`, engine), c, 2.0 + ENG_ORDER.indexOf(c.dataset.field) * 0.3));
    $$("[data-e1]", sheet).forEach((c, i) => typeIn(tl, c, 3.2 + i * 0.2, 0.3));
  });

  /* 4 · All Weather: CAT IIIA approach into fog, down to minimums */
  chapter("awo", ({ root, sheet, tl, cell, slip }) => {
    const scene = $(".ch__scene", root);
    const runway = $("[data-runway]", root);
    const jet = $("[data-scene-jet]", root);
    const ra = $("[data-ra]", root);
    const dh = $("[data-dh]", root);
    ra.textContent = "1000 ft";
    gsap.set(runway, { xPercent: -50, yPercent: -60.4, x: 0, y: () => -scene.offsetHeight * 1.4 });
    gsap.set(jet, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1.15, "--sx": "96px", "--sy": "150px", "--sb": "40px", "--so": 0.16 });
    gsap.set(dh, { opacity: 0 });
    tl.to(runway, { y: 0, duration: 3.4, ease: "power1.out" }, 0)
      .to(jet, { scale: 1, "--sx": "18px", "--sy": "26px", "--sb": "24px", "--so": 0.55, duration: 3.2, ease: "power1.in" }, 0.2)
      .to($("[data-fog]", root), { opacity: 0.35, duration: 0.8 }, 2.8)
      .to(dh, { opacity: 1, duration: 0.15 }, 2.9);
    counter(tl, ra, 50, (v) => `${Math.round(v)} ft`, 0.3, 2.6, "power1.in");
    typeRest(tl, sheet, (c) => c.dataset.field, 0.3, 0.3);
    slip(ra, cell("[data-field='a-ra']"), 3.0);
    slip($("[data-pt='a-rwy']", root), cell("[data-field='a-rwy']"), 3.4);
  });

  /* ---------- statement words ---------- */
  gsap.to("[data-words] .w", {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: "[data-words]", start: "top 78%", end: "bottom 45%", scrub: true }
  });

  /* ---------- lifecycle ---------- */
  // every step is on the page at once; each card builds up as it scrolls into view,
  // so steps that share the viewport animate side by side instead of waiting in line
  $$("[data-steps] .life__item").forEach((item) => {
    const card = $(".life__card", item);
    const parts = $$(".app__bar, .defect, .row, .sign", card);
    gsap.set(item, { autoAlpha: 0, y: 40 });
    gsap.set(parts, { autoAlpha: 0, y: 12 });
    ScrollTrigger.create({
      trigger: item, start: "top 85%", once: true,
      onEnter: () => {
        item.classList.add("is-on");
        gsap.to(item, { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out" });
        gsap.to(parts, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.5, ease: "expo.out", delay: 0.1 });
      }
    });
  });
  gsap.to("[data-life-rail]", {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 70%", scrub: true }
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

  /* ---------- roles: one card per role for phones, built from the matrix so the two never drift ---------- */
  const matrix = $(".matrix");
  if (matrix) {
    const roles = $$("thead th", matrix).slice(1).map((th) => th.textContent.trim());
    const rows = $$("tbody tr", matrix).map((tr) => [$("th", tr).textContent.trim(), $$("td", tr).map((td) => td.textContent.trim())]);
    const cards = document.createElement("ul");
    cards.className = "role-cards";
    roles.forEach((role, r) => {
      const li = document.createElement("li");
      li.className = "role-card";
      const h = document.createElement("h3");
      h.textContent = role;
      const dl = document.createElement("dl");
      rows.filter(([, cells]) => cells[r] !== "—").forEach(([task, cells]) => {
        const div = document.createElement("div");
        const dt = document.createElement("dt"), dd = document.createElement("dd");
        dt.textContent = task;
        dd.textContent = cells[r];
        div.append(dt, dd);
        dl.appendChild(div);
      });
      li.append(h, dl);
      cards.appendChild(li);
    });
    $(".table-wrap", $("#roles")).after(cards);
  }

  /* ---------- roles rows ---------- */
  gsap.from(".matrix tbody tr", {
    y: 18, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: "expo.out",
    scrollTrigger: { trigger: ".matrix", start: "top 80%", once: true }
  });

  /* ---------- CTA: take-off ---------- */
  mm.add({ desk: "(min-width: 861px)", mob: "(max-width: 860px)" }, (ctx) => {
    const { desk } = ctx.conditions;
    gsap.fromTo("[data-cta-jet]",
      { xPercent: desk ? 70 : 120, yPercent: desk ? 90 : 20, rotate: -40, scale: 0.7 },
      { xPercent: 0, yPercent: 0, rotate: -32, scale: 1, ease: "none",
        scrollTrigger: { trigger: "[data-cta]", start: "top bottom", end: desk ? "bottom bottom" : "top 20%", scrub: 0.8 } });
  });
  gsap.from(".cta__title", {
    yPercent: 30, autoAlpha: 0, ease: "expo.out", duration: 1.1,
    scrollTrigger: { trigger: "[data-cta]", start: "top 65%", once: true }
  });

  // one refresh once both images and fonts are in, instead of two that each moved the pin spacers
  const loaded = new Promise((res) => (document.readyState === "complete" ? res() : window.addEventListener("load", res, { once: true })));
  Promise.all([loaded, document.fonts ? document.fonts.ready : null]).then(() => ScrollTrigger.refresh());
})();
