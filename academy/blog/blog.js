/* Esubu Tech Academy blog: button tracking, copy link, contents highlight,
   topic filter. Every part works without this file. It adds conveniences. */
(function () {
  'use strict';
  var me = document.currentScript;
  var post = (me && me.getAttribute('data-post')) || 'unknown';

  // GA4: which post sent the parent, and which button they pressed.
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta]');
    if (!el || typeof window.gtag !== 'function') return;
    window.gtag('event', 'blog_cta_click', {
      post_slug: post,
      cta: el.getAttribute('data-cta'),
      link_url: el.getAttribute('href') || ''
    });
  });

  // Copy link
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-copy');
      var label = btn.querySelector('span');
      var done = function () {
        if (!label) return;
        label.textContent = 'Link copied';
        setTimeout(function () { label.textContent = 'Copy link'; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { window.prompt('Copy this link', url); });
      } else {
        window.prompt('Copy this link', url);
      }
    });
  });

  // Contents list on wide screens: mark the section being read.
  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = byId[en.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    document.querySelectorAll('.prose h2[id]').forEach(function (h) { obs.observe(h); });
  }

  // Topic filter on the blog index
  var filters = document.querySelector('.filters');
  if (filters) {
    filters.hidden = false;
    var items = document.querySelectorAll('#post-list .entry');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (!b) return;
      var f = b.getAttribute('data-filter');
      filters.querySelectorAll('button').forEach(function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      items.forEach(function (it) {
        it.hidden = !(f === 'all' || it.getAttribute('data-cat') === f);
      });
    });
  }
})();
