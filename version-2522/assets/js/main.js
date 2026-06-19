document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initHeroCarousel();
  initFilterPanel();
  initSearchPage();
});

function initMobileMenu() {
  var toggle = document.querySelector(".mobile-toggle");
  var panel = document.querySelector(".mobile-panel");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", function () {
    var isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.textContent = isOpen ? "☰" : "×";
    panel.hidden = isOpen;
  });
}

function initHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var previous = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  if (slides.length === 0) {
    return;
  }

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (previous) {
    previous.addEventListener("click", function () {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      start();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  start();
}

function initFilterPanel() {
  var panel = document.querySelector("[data-filter-panel]");
  var list = document.querySelector("[data-filter-list]");

  if (!panel || !list) {
    return;
  }

  var keywordInput = panel.querySelector("[data-filter-keyword]");
  var yearSelect = panel.querySelector("[data-filter-year]");
  var typeSelect = panel.querySelector("[data-filter-type]");
  var resetButton = panel.querySelector("[data-filter-reset]");
  var countOutput = panel.querySelector("[data-filter-count]");
  var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter() {
    var keyword = normalize(keywordInput ? keywordInput.value : "");
    var year = normalize(yearSelect ? yearSelect.value : "");
    var type = normalize(typeSelect ? typeSelect.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year")
      ].join(" "));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
      var matchType = !type || normalize(card.getAttribute("data-type")) === type;
      var shouldShow = matchKeyword && matchYear && matchType;

      card.classList.toggle("is-hidden-by-filter", !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (countOutput) {
      countOutput.textContent = visible + " 部影片";
    }
  }

  [keywordInput, yearSelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilter);
      control.addEventListener("change", applyFilter);
    }
  });

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (keywordInput) {
        keywordInput.value = "";
      }
      if (yearSelect) {
        yearSelect.value = "";
      }
      if (typeSelect) {
        typeSelect.value = "";
      }
      applyFilter();
    });
  }
}

function initSearchPage() {
  var resultsEl = document.querySelector("[data-search-results]");
  var countEl = document.querySelector("[data-search-count]");
  var titleEl = document.querySelector("[data-search-title]");
  var inputEl = document.querySelector("[data-search-input]");

  if (!resultsEl || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";

  if (inputEl) {
    inputEl.value = query;
  }

  renderSearchResults(query, resultsEl, countEl, titleEl);
}

function renderSearchResults(query, resultsEl, countEl, titleEl) {
  var keyword = String(query || "").trim().toLowerCase();

  if (!keyword) {
    resultsEl.innerHTML = '<div class="empty-results">请输入关键词搜索影片。</div>';
    if (countEl) {
      countEl.textContent = "输入关键词开始搜索";
    }
    return;
  }

  var results = window.MOVIE_SEARCH_DATA.filter(function (item) {
    var haystack = [
      item.title,
      item.category,
      item.year,
      item.region,
      item.type,
      item.oneLine,
      (item.tags || []).join(" ")
    ].join(" ").toLowerCase();
    return haystack.indexOf(keyword) !== -1;
  });

  if (titleEl) {
    titleEl.textContent = '“' + query + '” 的搜索结果';
  }

  if (countEl) {
    countEl.textContent = results.length + " 个结果";
  }

  if (results.length === 0) {
    resultsEl.innerHTML = '<div class="empty-results">没有找到相关影片，请尝试更换关键词。</div>';
    return;
  }

  resultsEl.innerHTML = results.slice(0, 240).map(function (item) {
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(item.url) + '" class="card-cover" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="duration-badge">' + escapeHtml(item.duration) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta">',
      '      <a href="' + escapeHtml(item.categoryUrl) + '">' + escapeHtml(item.category) + '</a>',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="tag-row">' + (item.tags || []).slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '  </div>',
      '</article>'
    ].join("
");
  }).join("
");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
