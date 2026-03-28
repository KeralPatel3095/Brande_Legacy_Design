/**
 * Loads includes/header.html into #layout-header and/or includes/footer.html into #layout-footer.
 * Either host may be omitted. Run on inner pages only (not index.html). Requires a local or hosted server (fetch may fail on file://).
 */
(function () {
  var headerHost = document.getElementById("layout-header");
  var footerHost = document.getElementById("layout-footer");
  if (!headerHost && !footerHost) return;

  var base = "includes/";
  var scripts = document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    if (src && src.indexOf("load-includes.js") !== -1) {
      base = src.replace(/[^/]+$/, "");
      break;
    }
  }

  function initMegaMenu() {
    var overlay = document.getElementById("megaMenuOverlay");
    if (!overlay) return;

    var titleEl = document.getElementById("megaMenuTitle");
    var closeBtn = overlay.querySelector(".overlayClose");
    var backBtn = document.getElementById("megaMenuBack");
    var menuButtons = document.querySelectorAll("button[data-mega]");
    var itemButtons = overlay.querySelectorAll(".overlayItem");

    function openOverlay() {
      if (titleEl) titleEl.textContent = "Services";
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeOverlay() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    var closeTimer = null;
    var hoveringNav = false;
    var hoveringOverlay = false;

    function scheduleClose() {
      if (closeTimer) window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(function () {
        if (!hoveringNav && !hoveringOverlay) closeOverlay();
      }, 160);
    }

    menuButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (overlay.classList.contains("open")) {
          closeOverlay();
        } else {
          openOverlay();
        }
      });

      var supportsHover =
        window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (supportsHover) {
        btn.addEventListener("mouseenter", function () {
          hoveringNav = true;
          if (closeTimer) window.clearTimeout(closeTimer);
          openOverlay();
        });
        btn.addEventListener("mouseleave", function () {
          hoveringNav = false;
          scheduleClose();
        });
      }
    });

    overlay.addEventListener("mouseenter", function () {
      hoveringOverlay = true;
      if (closeTimer) window.clearTimeout(closeTimer);
    });
    overlay.addEventListener("mouseleave", function () {
      hoveringOverlay = false;
      scheduleClose();
    });

    if (closeBtn) closeBtn.addEventListener("click", closeOverlay);
    if (backBtn) backBtn.addEventListener("click", closeOverlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay();
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeOverlay();
    });

    itemButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-services-target");
        closeOverlay();
        if (!target) return;
        if (target.indexOf(".html") !== -1) {
          window.location.href = target;
        } else if (target.charAt(0) === "#") {
          window.location.hash = target;
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function initMobileNavToggle() {
    var header = document.getElementById("siteHeaderBar");
    var toggleBtn = document.getElementById("mobileMenuToggle");
    if (!header || !toggleBtn) return;

    var mobileQuery = window.matchMedia("(max-width: 768px)");
    var closeSelectors = ".leftNav a, .rightNav a, .leftNav .navButton";

    function setOpen(isOpen) {
      header.classList.toggle("mobile-nav-open", isOpen);
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggleBtn.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
      toggleBtn.textContent = isOpen ? "✕" : "☰";
    }

    toggleBtn.addEventListener("click", function () {
      setOpen(!header.classList.contains("mobile-nav-open"));
    });

    document.querySelectorAll(closeSelectors).forEach(function (el) {
      el.addEventListener("click", function () {
        if (mobileQuery.matches) setOpen(false);
      });
    });

    function syncDesktopState() {
      if (!mobileQuery.matches) setOpen(false);
    }

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", syncDesktopState);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(syncDesktopState);
    }
  }

  function initHeaderScroll() {
    var pre = document.getElementById("headerPreNav");
    var bar = document.getElementById("siteHeaderBar");
    if (!pre || !bar) return;

    var fadeRange = 480;
    var ticking = false;

    function updateHeaderMotion() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var p = Math.min(Math.max(y / fadeRange, 0), 1);
      pre.style.setProperty("--pre-hide", String(p));
      pre.classList.toggle("is-collapsed", p > 0.9);
      bar.classList.toggle("is-stuck", y > 10);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateHeaderMotion);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateHeaderMotion);
    updateHeaderMotion();
  }

  var tasks = [];
  if (headerHost) {
    tasks.push(
      fetch(base + "header.html")
        .then(function (r) {
          if (!r.ok) throw new Error("header.html " + r.status);
          return r.text();
        })
        .then(function (html) {
          headerHost.innerHTML = html;
        })
    );
  }
  if (footerHost) {
    tasks.push(
      fetch(base + "footer.html")
        .then(function (r) {
          if (!r.ok) throw new Error("footer.html " + r.status);
          return r.text();
        })
        .then(function (html) {
          footerHost.innerHTML = html;
        })
    );
  }

  Promise.all(tasks)
    .then(function () {
      initMobileNavToggle();
      initMegaMenu();
      initHeaderScroll();
      window.dispatchEvent(new CustomEvent("brande:layout-loaded"));
    })
    .catch(function (e) {
      console.warn("Brande layout includes: could not load header/footer. Use a local server (e.g. Live Server).", e);
    });
})();
