/*!
 * LB Install SDK v1 - LoopingBinary
 * Drop into any LoopingBinary PWA:
 *   <script src="https://YOUR-STORE/sdk/lb-install.js" defer></script>
 * When a visitor arrives from LBStore (?lbstore=1) it shows a branded install
 * sheet: native prompt on Android/desktop, a guided Share > Add to Home Screen on iOS.
 * Optional: window.LBInstall.open() to show the sheet from your own button.
 */
(function () {
  if (window.LBInstall) return;
  var script = document.currentScript;
  var color = (script && script.getAttribute("data-color")) || null;
  var deferred = null;
  var host = null;
  var ua = navigator.userAgent;
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.indexOf("Macintosh") > -1 && navigator.maxTouchPoints > 1);
  var standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  var params = new URLSearchParams(location.search);
  var fromStore = params.get("lbstore") === "1" || sessionStorage.getItem("lbstore:pending") === "1";

  if (params.has("lbstore")) {
    params.delete("lbstore");
    var q = params.toString();
    history.replaceState(history.state, "", location.pathname + (q ? "?" + q : "") + location.hash);
    sessionStorage.setItem("lbstore:pending", "1");
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    if (fromStore && !standalone) open();
  });
  window.addEventListener("appinstalled", function () {
    sessionStorage.removeItem("lbstore:pending");
    close();
  });

  function meta() {
    var name = document.title;
    var icon = null;
    var theme = color || (document.querySelector('meta[name="theme-color"]') || {}).content || "#00b369";
    var link = document.querySelector('link[rel="apple-touch-icon"]') || document.querySelector('link[rel~="icon"]');
    if (link) icon = link.href;
    return { name: name, icon: icon, theme: theme };
  }

  var CSS =
    ":host{all:initial}*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',Inter,system-ui,sans-serif}" +
    ".bd{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .25s;z-index:2147483646}" +
    ".sh{position:fixed;left:0;right:0;bottom:0;margin:0 auto;max-width:440px;background:#fff;color:#0a0a12;border-radius:28px 28px 0 0;padding:22px 22px calc(22px + env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .45s cubic-bezier(.22,1.2,.36,1);z-index:2147483647;box-shadow:0 -10px 40px rgba(0,0,0,.2)}" +
    "@media(min-width:600px){.sh{bottom:24px;border-radius:28px}}" +
    "@media(prefers-color-scheme:dark){.sh{background:#141419;color:#f5f5f8}.mu{color:#9a9aaa!important}.st{background:#1f1f27!important}}" +
    ".on .bd{opacity:1}.on .sh{transform:none}" +
    ".hd{display:flex;gap:14px;align-items:center}.ic{width:60px;height:60px;border-radius:14px;object-fit:cover;box-shadow:0 6px 18px rgba(0,0,0,.18)}" +
    ".nm{font-size:18px;font-weight:650;letter-spacing:-.01em;margin:0}.mu{color:#6c6c7d;font-size:13px;margin:2px 0 0}" +
    ".bg{display:inline-flex;gap:5px;align-items:center;font-size:11.5px;font-weight:600;margin-top:4px}" +
    ".bt{display:block;width:100%;margin-top:18px;border:0;border-radius:16px;padding:15px;font-size:16px;font-weight:650;color:#fff;cursor:pointer}" +
    ".lk{display:block;width:100%;margin-top:10px;border:0;background:none;font-size:14px;font-weight:500;cursor:pointer;color:inherit;opacity:.6}" +
    ".st{display:flex;gap:12px;align-items:center;background:#f0f0f5;border-radius:14px;padding:12px;margin-top:10px;font-size:14px;line-height:1.35}" +
    ".n{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;color:#fff}" +
    ".ar{position:fixed;left:50%;bottom:calc(8px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483647;font-size:34px;animation:b 1.2s ease-in-out infinite;filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))}" +
    "@keyframes b{50%{transform:translate(-50%,-10px)}}";

  var SHARE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function open() {
    if (host || standalone) return;
    var m = meta();
    host = document.createElement("div");
    var root = host.attachShadow({ mode: "open" });
    var body =
      '<div class="hd">' +
      (m.icon ? '<img class="ic" src="' + esc(m.icon) + '" alt="">' : "") +
      '<div><p class="nm">Install ' + esc(m.name) + '</p><p class="mu">Free · No download · Always up to date</p>' +
      '<span class="bg" style="color:' + esc(m.theme) + '">✓ Verified on LBStore</span></div></div>';

    if (isIOS) {
      body +=
        '<div class="st"><span class="n" style="background:' + esc(m.theme) + '">1</span><span>Tap ' + SHARE + " Share below (on iOS 26, tap ••• first)</span></div>" +
        '<div class="st"><span class="n" style="background:' + esc(m.theme) + '">2</span><span>Choose <b>Add to Home Screen</b></span></div>' +
        '<div class="st"><span class="n" style="background:' + esc(m.theme) + '">3</span><span>Tap <b>Add</b>. That\'s it!</span></div>' +
        '<button class="lk" data-x>Got it</button>';
    } else if (deferred) {
      body += '<button class="bt" data-i style="background:' + esc(m.theme) + '">Install</button><button class="lk" data-x>Not now</button>';
    } else {
      body +=
        '<div class="st"><span class="n" style="background:' + esc(m.theme) + '">1</span><span>Open your browser menu (⋮)</span></div>' +
        '<div class="st"><span class="n" style="background:' + esc(m.theme) + '">2</span><span>Choose <b>Install app</b> or <b>Add to Home screen</b></span></div>' +
        '<button class="lk" data-x>Got it</button>';
    }

    root.innerHTML = "<style>" + CSS + '</style><div class="w"><div class="bd" data-x></div><div class="sh" role="dialog" aria-modal="true">' + body + "</div>" + (isIOS ? '<div class="ar">⬇️</div>' : "") + "</div>";
    document.body.appendChild(host);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.querySelector(".w").classList.add("on");
      });
    });
    root.addEventListener("click", function (e) {
      var t = e.target.closest("[data-x],[data-i]");
      if (!t) return;
      if (t.hasAttribute("data-i") && deferred) {
        deferred.prompt();
        deferred.userChoice.then(function () {
          deferred = null;
          close();
        });
      } else close();
    });
  }

  function close() {
    sessionStorage.removeItem("lbstore:pending");
    if (!host) return;
    var w = host.shadowRoot.querySelector(".w");
    w.classList.remove("on");
    var h = host;
    host = null;
    setTimeout(function () {
      h.remove();
    }, 400);
  }

  // iOS and browsers without beforeinstallprompt: show the guide once the page settles.
  if (fromStore && !standalone) {
    setTimeout(function () {
      if (!host && (isIOS || !deferred)) open();
    }, isIOS ? 700 : 2500);
  }

  window.LBInstall = { open: open, close: close, canPrompt: function () { return !!deferred; } };
})();
