// ===== Things you may want to edit =====
const WEDDING_DATE = new Date(2026, 11, 5, 0, 0, 0); // 5 December 2026 (month is 0-based). Add a time, e.g. (2026, 11, 5, 14, 30), when you know it

const MUSIC_FILE = "audio/song.mp3"; // the song: put the file in an "audio" folder next to index.html (use "" for no music)
const OPEN_SCREEN = true;          // true: if the browser blocks music at load, show an "Open invitation" screen first (its tap starts the music). false: music starts on the first tap instead
const MUSIC_VOLUME = 0.4;          // 0 (silent) to 1 (full)
const MUSIC_START = 20;             // where the song starts, in seconds (e.g. 45 = start 45 seconds in; 83 = 1:23)
const MUSIC_END = 0;               // where it stops and loops back to MUSIC_START, in seconds (0 = play to the end of the song)

const slides = [...document.querySelectorAll(".slide")];
const NS = "http://www.w3.org/2000/svg";

// Small seeded random generator so the flowers look the same every visit
function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rand = (r, a, b) => a + r() * (b - a);
const f1 = n => Math.round(n * 10) / 10;

// ---------------------------------------------------------------
// Artwork for the dark panel: fine line drawings, glowing orbs
// ---------------------------------------------------------------
function sprig(x0, y0, x1, y1, bend, n, k) { // line-art branch with outlined leaves
  const cx = (x0 + x1) / 2 + bend, cy = (y0 + y1) / 2;
  let s = `<path class="ln" pathLength="1" style="--k:${k}" d="M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}"/>`;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const tx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx), ty = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    const ang = Math.atan2(tx, -ty) * 180 / Math.PI, L = 46 - i * 2.2;
    for (const side of [-1, 1]) {
      s += `<path class="ln" pathLength="1" style="--k:${k + i}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang + side * 52).toFixed(1)})" d="M0 0C${L * .32} ${-L * .3} ${L * .32} ${-L * .75} 0 ${-L}C${-L * .32} ${-L * .75} ${-L * .32} ${-L * .3} 0 0Z"/>`;
    }
  }
  return s;
}

function bokeh(seed) { // soft light dots, like the blurred lights in the photos
  const r = rng(seed); let s = "";
  for (let i = 0; i < 16; i++) s += `<circle class="orb" cx="${f1(rand(r, 20, 580))}" cy="${f1(rand(r, 20, 780))}" r="${f1(rand(r, 5, 22))}" fill="#bcd6f7" fill-opacity="${f1(rand(r, .08, .24))}" stroke="#d8e8fb" stroke-opacity=".25" style="animation-duration:${f1(rand(r, 9, 20))}s"/>`;
  return s;
}

function artSVG(kind) {
  if (kind === "none") return ""; // photo pages
  let body = "";
  const orbs = (list) => list.map(([x, y, r]) => `<circle class="orb" cx="${x}" cy="${y}" r="${r}" fill="url(#g-orb)"/>`).join("");
  if (kind === "arch") {
    for (let i = 0; i < 5; i++) {
      const w = 440 - i * 76, x1 = 300 - w / 2, x2 = 300 + w / 2, top = 250 + i * 46;
      body += `<path class="ln" pathLength="1" style="--k:${i}" d="M${x1} 820V${top + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x2} ${top + w / 2}V820"/>`;
    }
    body = orbs([[300, 330, 260], [120, 700, 180]]) + `<g fill="none" stroke="#e3c98f" stroke-opacity=".5" stroke-width="1.3">${body}</g>`;
  } else if (kind === "plain") { // just the glow, no line drawing
    body = orbs([[300, 330, 260], [120, 700, 180], [500, 120, 150]]);
  } else if (kind === "rings") {
    body += `<circle class="ln" pathLength="1" style="--k:0" cx="252" cy="410" r="112"/><circle class="ln" pathLength="1" style="--k:2" cx="348" cy="410" r="112"/>`;
    [190, 255, 325].forEach((r, i) => body += `<circle class="ln" pathLength="1" style="--k:${i + 3}" cx="300" cy="410" r="${r}" stroke-opacity=".45"/>`);
    body += `<path class="ln" pathLength="1" style="--k:6" d="M300 255l16 20-16 20-16-20z" fill="none"/>`;
    body = orbs([[300, 410, 300], [520, 120, 160]]) + `<g fill="none" stroke="#e3c98f" stroke-opacity=".6" stroke-width="1.6">${body}</g>`;
  } else if (kind === "orbs") {
    for (let i = 0; i < 12; i++) body += `<path class="ln" pathLength="1" style="--k:${i % 6}" d="M-100 ${i * 80 + 20}L700 ${i * 80 - 300}"/>`;
    body = orbs([[170, 200, 280], [470, 620, 300], [330, 420, 150]]) + `<g fill="none" stroke="#e3c98f" stroke-opacity=".16" stroke-width="1.2">${body}</g>`;
  } else { // sprigs
    body += sprig(150, 840, 205, 300, -45, 6, 0) + sprig(300, 860, 300, 190, 30, 7, 1) + sprig(450, 840, 395, 330, 45, 6, 2);
    body = orbs([[300, 500, 300]]) + `<g fill="none" stroke="#e3c98f" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round">${body}</g>`;
  }
  return `<svg class="artsvg" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="800" fill="url(#g-bg)"/>${body}${bokeh(kind.length * 31)}</svg>`;
}

// Flowers on the light panel: the photos she sent, cut out so they sit straight on the page.
// Top-right is always the blue anemones; bottom-left alternates between the lilies and the peonies.
slides.forEach((s, n) => {
  const art = s.querySelector(".art"), paper = s.querySelector(".paper");
  art.insertAdjacentHTML("afterbegin", artSVG(s.dataset.art));
  const bottom = n % 2 ? "peony" : "bottom";
  paper.insertAdjacentHTML("afterbegin",
    `<img class="fl fl-tr" src="images/flowers-top.webp" alt="" decoding="async">` +
    `<img class="fl fl-bl ${bottom === "peony" ? "fl-peony" : ""}" src="images/flowers-${bottom}.webp" alt="" decoding="async">`);
});



// ---------------------------------------------------------------
// Countdown on the cover
// ---------------------------------------------------------------
(function countdown() {
  const el = document.getElementById("countdown");
  if (!el) return;
  const tile = (v, label) => `<div><b>${String(v).padStart(2, "0")}</b><span>${label}</span></div>`;
  function tick() {
    const ms = WEDDING_DATE - Date.now();
    if (ms <= 0) {
      const sameDay = Date.now() - WEDDING_DATE < 864e5;
      el.innerHTML = `<div class="countdown-msg">${sameDay ? "Today is the day!" : "We said I do!"}</div>`;
      return;
    }
    const s = Math.floor(ms / 1000);
    el.innerHTML = tile(Math.floor(s / 86400), "Days") + tile(Math.floor(s / 3600) % 24, "Hrs") +
                   tile(Math.floor(s / 60) % 60, "Min") + tile(s % 60, "Sec");
  }
  tick();
  setInterval(tick, 1000);
})();

// ---------------------------------------------------------------
// December 2026 calendar for page 4
// ---------------------------------------------------------------
(function buildCalendar() {
  const el = document.getElementById("cal");
  if (!el) return;
  const YEAR = 2026, MONTH = 11, WEDDING = 5; // month is 0-based: 11 = December
  const first = new Date(YEAR, MONTH, 1).getDay(); // 0 = Sunday
  const days = new Date(YEAR, MONTH + 1, 0).getDate();
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let rows = "", cells = "";
  for (let i = 0; i < first; i++) cells += "<td></td>";
  for (let d = 1; d <= days; d++) {
    cells += d === WEDDING
      ? `<td><span class="day wedding" aria-label="December ${d}, 2026, our wedding day">${d}</span></td>`
      : `<td><span class="day">${d}</span></td>`;
    if ((first + d) % 7 === 0) { rows += `<tr>${cells}</tr>`; cells = ""; }
  }
  if (cells) rows += `<tr>${cells}</tr>`;
  el.innerHTML =
    `<p class="cal-title">December 2026</p><table><thead><tr>` +
    names.map(n => `<th scope="col" aria-label="${n}">${n[0]}</th>`).join("") +
    `</tr></thead><tbody>${rows}</tbody></table>`;
})();

// ---------------------------------------------------------------
// Words arriving: headings and sentences are split into words that rise into place
// ---------------------------------------------------------------
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.classList.remove("reveal");
  el.classList.add("split");
  el.setAttribute("aria-label", el.textContent.trim());
  el.textContent = "";
  words.forEach((word, wi) => {
    const w = document.createElement("span");
    w.className = "w";
    w.setAttribute("aria-hidden", "true");
    w.style.setProperty("--w", wi);
    const inner = document.createElement("span");
    inner.textContent = word;
    w.append(inner);
    el.append(w);
    if (wi < words.length - 1) el.append(" ");
  });
}
slides.forEach(s => s.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.setProperty("--i", i);
  if (el.children.length === 0 && /^(H1|H2|P)$/.test(el.tagName)) splitWords(el);
}));

// ---------------------------------------------------------------
// Slideshow: progress bar, timers, pause, menu, keyboard, swipe
// ---------------------------------------------------------------
const progress = document.getElementById("progress");
const toggleBtn = document.getElementById("toggle");
let current = 0;
let userPaused = false;
const leaveTimers = new Map();

const segs = slides.map((s, n) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "seg";
  b.setAttribute("aria-label", `Go to page ${n + 1}: ${s.dataset.title || ""}`);
  b.innerHTML = "<b><i></i></b>";
  b.onclick = () => go(n);
  progress.append(b);
  return b;
});

function go(n) {
  const prev = slides[current];
  current = (n + slides.length) % slides.length;
  slides.forEach((s, k) => {
    if (k === current) {
      clearTimeout(leaveTimers.get(s));
      s.classList.remove("leaving");
      s.classList.add("active");
    } else if (s === prev && s.classList.contains("active")) {
      s.classList.remove("active");
      s.classList.add("leaving"); // keeps its finished look while it fades out
      leaveTimers.set(s, setTimeout(() => s.classList.remove("leaving"), 650));
    }
  });

  const secs = Number(slides[current].dataset.duration ?? CONFIG.defaultDuration);
  slides[current].style.setProperty("--dur", (secs || 12) + "s"); // lets the growing text last as long as the page
  segs.forEach((seg, k) => {
    const fill = seg.querySelector("i");
    seg.classList.toggle("done", k < current);
    seg.setAttribute("aria-current", k === current ? "step" : "false");
    fill.classList.remove("run");
    fill.style.width = "";
    fill.style.animationDuration = "";
    if (k === current) {
      void fill.offsetWidth; // restart the animation
      if (secs > 0) { fill.style.animationDuration = secs + "s"; fill.classList.add("run"); }
      else fill.style.width = "100%"; // a page that waits (the RSVP) shows a full bar
    }
  });
}

// When the current segment finishes filling, move to the next page
progress.addEventListener("animationend", e => {
  if (e.target.classList.contains("run")) go(current + 1);
});

function setPaused(p) {
  userPaused = p;
  document.body.classList.toggle("paused", p);
  toggleBtn.setAttribute("aria-pressed", String(p));
  toggleBtn.setAttribute("aria-label", p ? "Resume slideshow" : "Pause slideshow");
}
toggleBtn.onclick = () => setPaused(!userPaused);

// Buttons that jump to a page (the RSVP button on the cover)
document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => go(Number(b.dataset.go))));

// Menu
const menu = document.getElementById("menu");
const menuList = document.getElementById("menu-list");
slides.forEach((s, n) => {
  const li = document.createElement("li");
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = s.dataset.title || `Page ${n + 1}`;
  b.onclick = () => { menu.close(); go(n); };
  li.append(b);
  menuList.append(li);
});
let pausedBeforeMenu = false;
document.getElementById("menu-btn").onclick = () => { pausedBeforeMenu = userPaused; setPaused(true); menu.showModal(); };
document.getElementById("menu-close").onclick = () => menu.close();
menu.addEventListener("close", () => setPaused(pausedBeforeMenu));

// Keyboard and swipe (ignored while typing or when a button/pop-up has focus)
document.addEventListener("keydown", e => {
  if (document.body.classList.contains("gated")) return;
  if (e.target.closest("input, select, textarea, button, dialog")) return;
  if (e.key === "ArrowRight") go(current + 1);
  if (e.key === "ArrowLeft") go(current - 1);
  if (e.key === " ") { e.preventDefault(); setPaused(!userPaused); }
});
let x0 = null;
document.addEventListener("touchstart", e => (x0 = e.touches[0].clientX), { passive: true });
document.addEventListener("touchend", e => {
  if (document.body.classList.contains("gated")) return;
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 50 && !e.target.closest("input, select, textarea")) go(current + (dx < 0 ? 1 : -1));
  x0 = null;
});

// ---------------------------------------------------------------
// Background music: starts when the site loads. Phones and browsers only allow sound after
// the guest's first tap, click, swipe or key press, so if it is blocked at load it starts then.
// ---------------------------------------------------------------
const Music = (function music() {
  const btn = document.getElementById("music");
  const audio = document.getElementById("music-player");
  if (!MUSIC_FILE) return { ready: Promise.resolve(false), start: async () => false };
  audio.src = MUSIC_FILE;
  audio.loop = false; // looping is done below so it returns to MUSIC_START, not 0:00
  audio.volume = 0;
  const jumpToStart = () => { if (MUSIC_START > 0) audio.currentTime = MUSIC_START; };
  audio.addEventListener("loadedmetadata", jumpToStart);
  audio.addEventListener("ended", () => { jumpToStart(); audio.play().catch(() => {}); });
  audio.addEventListener("timeupdate", () => { if (MUSIC_END > MUSIC_START && audio.currentTime >= MUSIC_END) jumpToStart(); });
  btn.hidden = false;

  let wanted = true;   // false once the guest mutes it
  let started = false;
  let fade = null;
  function fadeTo(v, ms = 1800, done) {
    clearInterval(fade);
    const from = audio.volume, t0 = performance.now();
    fade = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      audio.volume = from + (v - from) * k;
      if (k === 1) { clearInterval(fade); done && done(); }
    }, 50);
  }
  async function start() {
    if (!wanted || started) return started;
    try {
      await audio.play();
      started = true;
      fadeTo(MUSIC_VOLUME);
      unlock.forEach(ev => removeEventListener(ev, start, true));
    } catch { /* blocked until the guest interacts; the listeners below try again */ }
    return started;
  }
  const unlock = ["click", "touchend", "keydown", "pointerup"];
  unlock.forEach(ev => addEventListener(ev, start, true));
  const ready = start(); // try straight away, as the page loads

  btn.addEventListener("click", e => {
    e.stopPropagation();
    wanted = !wanted;
    btn.setAttribute("aria-pressed", String(!wanted));
    btn.setAttribute("aria-label", wanted ? "Mute music" : "Play music");
    document.body.classList.toggle("music-off", !wanted);
    if (wanted) { if (started) { audio.play().catch(() => {}); fadeTo(MUSIC_VOLUME, 800); } else start(); }
    else fadeTo(0, 500, () => audio.pause());
  });
  let failCb = null;
  audio.addEventListener("error", () => { btn.hidden = true; console.warn("Music file not found:", MUSIC_FILE); failCb && failCb(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (wanted && started) audio.play().catch(() => {});
  });
  return { ready, start, failed: () => !!audio.error, onFail: cb => { failCb = cb; } };
})();

// Tap the left side of the screen for the previous page, the right side for the next
const TAP_LEFT = 0.35; // the left 35% of the screen goes back; the rest goes forward
document.addEventListener("click", e => {
  if (document.body.classList.contains("gated")) return;
  if (e.defaultPrevented || e.button !== 0) return;
  // not on buttons, links, form fields, the top bar, pop-ups, or anywhere on the RSVP page's form area
  if (e.target.closest("button, a, input, select, textarea, label, dialog, #bar, #rsvp, .rsvp .content")) return;
  if (document.querySelector("dialog[open]")) return;
  if (getSelection().toString()) return; // the guest is selecting text, not tapping
  go(current + (e.clientX < innerWidth * TAP_LEFT ? -1 : 1));
});

// ---------------------------------------------------------------
// RSVP form
// ---------------------------------------------------------------
const form = document.getElementById("rsvp");
const status = document.getElementById("rsvp-status");
const sendBtn = form.querySelector('button[type="submit"]');
const dialog = document.getElementById("thanks");

document.getElementById("thanks-close").onclick = () => dialog.close();

function showThanks(name, attending) {
  document.getElementById("thanks-msg").textContent = attending === "yes"
    ? `Thank you, ${name}. Your reply has been received, and we can't wait to celebrate with you.`
    : `Thank you, ${name}. Your reply has been received. We're sorry you can't make it.`;
  dialog.showModal();
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  status.textContent = "";

  const data = Object.fromEntries(new FormData(form));
  data.name = data.name.trim();
  if (!data.name) { // the form's pattern blocks blanks too; this also catches anything that slips past it
    status.textContent = "Please enter your name.";
    form.elements["name"].focus();
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "Sending…";
  try {
    if (!CONFIG.rsvpEndpoint) throw new Error("No rsvpEndpoint set in config.js");
    const res = await fetch(CONFIG.rsvpEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // text/plain avoids a CORS preflight
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const out = await res.json(); // Apps Script answers { ok: true } once the row is saved
    if (!out.ok) throw new Error("Script replied: " + JSON.stringify(out));

    showThanks(data.name, data.attending); // only reached after the reply is confirmed saved
    form.reset();
  } catch (err) {
    console.error("RSVP failed:", err, "Endpoint:", CONFIG.rsvpEndpoint); // open F12 > Console to see why
    status.textContent = "Your reply didn't send. Check your connection and try again.";
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send my reply";
  }
});

// ---------------------------------------------------------------
// Start-up. Browsers only let a page play sound by itself if the guest has already interacted with
// the site. So: try to start the music as the page loads. If it works, the invitation just begins.
// If the browser blocks it, show an "Open invitation" screen: tapping it starts the music and the
// invitation together, so the song is playing from the very first page.
// ---------------------------------------------------------------
(async function startUp() {
  if (!MUSIC_FILE || !OPEN_SCREEN) { go(0); return; }
  const playing = await Music.ready;
  if (playing || Music.failed()) { go(0); return; }
  const gate = document.getElementById("gate");
  document.body.classList.add("gated");
  gate.hidden = false;
  const open = document.getElementById("gate-open");
  open.focus({ preventScroll: true });
  let opened = false;
  const begin = () => {
    if (opened) return;
    opened = true;
    gate.classList.add("gone");
    document.body.classList.remove("gated");
    go(0);
    setTimeout(() => gate.remove(), 900);
  };
  gate.addEventListener("click", e => { e.stopPropagation(); Music.start(); begin(); }); // the tap is what lets the browser play the song
  Music.onFail(begin); // no song file found: don't hold guests at the opening screen
})();
