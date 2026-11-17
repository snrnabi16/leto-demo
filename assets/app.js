(function () {
  var pages = [].slice.call(document.querySelectorAll(".page"));
  var ids = pages.map(function (p) { return p.id; });
  function show() {
    var name = (location.hash || "#home").slice(1) || "home", anchor = null;
    if (ids.indexOf(name) === -1) {
      var el = document.getElementById(name), host = el && el.closest(".page");
      if (host) { anchor = el; name = host.id; } else name = "home";
    }
    pages.forEach(function (p) { p.classList.toggle("is-active", p.id === name); });
    document.documentElement.style.background = name === "home" ? "#1A213F" : "";
    if (anchor) anchor.scrollIntoView({ block: "start" }); else window.scrollTo(0, 0);
  }
  if (/[?&]shot=1/.test(location.search)) document.documentElement.classList.add("shot");
  window.addEventListener("hashchange", show); show();

  // opening hours in Kazan time (UTC+3): Sun–Thu 12–24, Fri–Sat 12–05
  function kazanNow() { var d = new Date(); return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 3 * 3600000); }
  function openState(now) {
    var day = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var prevLate = (day === 6 || day === 0) && h < 5; // night after Fri or Sat
    if (prevLate) return { open: true, text: "Открыто до 05:00" };
    if (h >= 12) return { open: true, text: (day === 5 || day === 6) ? "Открыто до 05:00" : "Открыто до 00:00" };
    return { open: false, text: "Закрыто · откроется в 12:00" };
  }
  var st = document.getElementById("status");
  var forced = location.search.match(/[?&]at=(\d+)-(\d+)/); // ?at=day-hour for screenshots
  var now = kazanNow();
  if (forced) { now = new Date(2026, 10, 15 + Number(forced[1]), Number(forced[2]), 0); }
  if (st) { var s = openState(now); st.querySelector(".status__text").textContent = s.text; st.classList.toggle("is-closed", !s.open); }
  var today = now.getHours() < 5 ? (now.getDay() + 6) % 7 : now.getDay();
  document.querySelectorAll(".hours [data-days]").forEach(function (row) {
    if (row.getAttribute("data-days").split(",").indexOf(String(today)) > -1) row.classList.add("is-today");
  });

  // menu tabs
  var tabs = [].slice.call(document.querySelectorAll(".tabs a"));
  tabs.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var t = document.querySelector(a.getAttribute("href"));
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  var secs = tabs.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function spy() {
    var cur = 0;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < 140) cur = i; });
    tabs.forEach(function (a, i) {
      var on = i === cur; a.classList.toggle("is-on", on);
      if (on && a.parentNode && document.getElementById("menu").classList.contains("is-active")) {
        var p = a.parentNode, l = a.offsetLeft - 20;
        if (l < p.scrollLeft || a.offsetLeft + a.offsetWidth > p.scrollLeft + p.clientWidth) p.scrollLeft = l;
      }
    });
  }
  window.addEventListener("scroll", spy, { passive: true }); spy();

  // stars
  var hints = { 1: "Жаль. Напишите, что пошло не так", 2: "Спасибо, разберёмся", 3: "Спасибо! Что улучшить?", 4: "Спасибо, рады, что понравилось", 5: "Спасибо! Ждём вас снова" };
  var stars = [].slice.call(document.querySelectorAll(".star")), hint = document.getElementById("rating-hint"), rating = 0;
  function paint(v) { stars.forEach(function (b) { b.classList.toggle("is-on", +b.dataset.value <= v); }); if (hint) hint.innerHTML = v ? hints[v] : "&nbsp;"; }
  stars.forEach(function (b) {
    b.addEventListener("click", function () { rating = +b.dataset.value; paint(rating); });
    b.addEventListener("mouseenter", function () { paint(+b.dataset.value); });
  });
  var box = document.querySelector(".stars"); if (box) box.addEventListener("mouseleave", function () { paint(rating); });
  var m = location.search.match(/[?&]stars=(\d)/); if (m) { rating = +m[1]; paint(rating); }

  // copy
  var toast = document.getElementById("toast"), tt;
  function say(t) { toast.textContent = t; toast.classList.add("is-on"); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("is-on"); }, 1600); }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var a = document.createElement("textarea"); a.value = text; a.setAttribute("readonly", ""); a.style.position = "fixed"; a.style.left = "-9999px";
      document.body.appendChild(a); a.select(); a.setSelectionRange(0, text.length);
      try { document.execCommand("copy") ? res() : rej(); } catch (e) { rej(e); } finally { document.body.removeChild(a); }
    });
  }
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.dataset.copy || "";
      copyText(text).then(function () {
        var c = btn.querySelector(".i-copy"), k = btn.querySelector(".i-check"), l = btn.querySelector(".copy__txt");
        if (c) c.setAttribute("hidden", ""); if (k) k.removeAttribute("hidden");
        if (l) { l.dataset.prev = l.textContent; l.textContent = l.dataset.done; }
        say("Скопировано: " + text);
        setTimeout(function () { if (c) c.removeAttribute("hidden"); if (k) k.setAttribute("hidden", ""); if (l && l.dataset.prev) l.textContent = l.dataset.prev; }, 1600);
      }, function () { say("Не удалось скопировать"); });
    });
  });
})();
