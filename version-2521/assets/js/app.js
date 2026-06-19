(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
      var search = root.querySelector('[data-filter-search]');
      var year = root.querySelector('[data-filter-year]');
      var region = root.querySelector('[data-filter-region]');
      var type = root.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
      function apply() {
        var q = search ? search.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var r = region ? region.value : '';
        var t = type ? type.value : '';
        cards.forEach(function (card) {
          var text = (card.textContent + ' ' + Array.prototype.map.call(card.attributes, function (attr) { return attr.value; }).join(' ')).toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.getAttribute('data-year') !== y) {
            ok = false;
          }
          if (r && card.getAttribute('data-region') !== r) {
            ok = false;
          }
          if (t && card.getAttribute('data-type') !== t) {
            ok = false;
          }
          card.classList.toggle('is-filter-hidden', !ok);
        });
      }
      [search, year, region, type].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && search) {
        search.value = query;
        apply();
      }
    });
  });
})();
