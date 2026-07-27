/* ============================================================
   Amplify — mobile navigation (hamburger menu)
   The site renders its header via React (loaded async by
   support.js), so we can't rely on a one-shot DOMContentLoaded
   pass. A MutationObserver injects the hamburger whenever a
   header nav exists without one — handling the async mount and
   any later re-render, and self-healing if React replaces it.
   ============================================================ */
(function () {
  function build(nav) {
    var header = nav.closest('header');
    var bar = nav.parentElement;
    var links = nav.querySelectorAll('a');
    if (!header || !links.length) return;

    // Clear any stale copies before (re)building.
    header.querySelectorAll('.amp-burger, .amp-mm').forEach(function (n) { n.remove(); });

    var btn = document.createElement('button');
    btn.className = 'amp-burger';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';

    var menu = document.createElement('div');
    menu.className = 'amp-mm';
    Array.prototype.forEach.call(links, function (a) {
      var l = document.createElement('a');
      l.href = a.getAttribute('href');
      l.textContent = a.textContent.trim();
      menu.appendChild(l);
    });

    bar.appendChild(btn);
    header.appendChild(menu);

    function close() {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      menu.classList.remove('open');
    }
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') {
        close();
      } else {
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Close menu');
        menu.classList.add('open');
      }
    });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 768) close(); });
  }

  function ensure() {
    var nav = document.querySelector('header nav');
    if (nav && !document.querySelector('header .amp-burger')) build(nav);
  }

  ensure();
  var obs = new MutationObserver(function () { ensure(); });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
