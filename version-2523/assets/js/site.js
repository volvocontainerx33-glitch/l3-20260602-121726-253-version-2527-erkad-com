(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav-links]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var filterSelect = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
    var noResults = document.querySelector("[data-no-results]");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function filterCards() {
      var query = normalize(searchInput ? searchInput.value : "");
      var filter = normalize(filterSelect ? filterSelect.value : "");
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var type = normalize(card.getAttribute("data-type"));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchFilter = !filter || type.indexOf(filter) !== -1;
        var shouldShow = matchQuery && matchFilter;

        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("show", visibleCount === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", filterCards);
    }

    if (filterSelect) {
      filterSelect.addEventListener("change", filterCards);
    }
  });
})();
