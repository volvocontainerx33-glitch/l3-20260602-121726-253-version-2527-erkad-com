(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function setImageFallbacks() {
    $all("img").forEach(function (img) {
      img.addEventListener(
        "error",
        function () {
          img.classList.add("is-missing");
        },
        { once: true },
      );
    });
  }

  function initMenu() {
    var button = $("[data-menu-button]");
    var menu = $("[data-mobile-menu]");
    if (!button || !menu) return;
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initSearchForms() {
    $all(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initHero() {
    var hero = $("[data-hero]");
    if (!hero) return;
    var slides = $all("[data-hero-slide]", hero);
    var dots = $all("[data-hero-dot]", hero);
    var prev = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    prev &&
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    next &&
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .trim();
  }

  function initCatalog() {
    var catalog = $("[data-catalog]");
    var grid = $("[data-card-grid]");
    if (!catalog || !grid) return;
    var queryInput = $("[data-filter-query]");
    var categorySelect = $("[data-filter-category]");
    var typeSelect = $("[data-filter-type]");
    var yearSelect = $("[data-filter-year]");
    var emptyState = $("[data-empty-state]");
    var cards = $all(".movie-card", grid);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (queryInput && initialQuery) queryInput.value = initialQuery;

    function applyFilters() {
      var q = normalize(queryInput && queryInput.value);
      var category = normalize(categorySelect && categorySelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var shown = 0;
      cards.forEach(function (card) {
        var keywords = normalize(
          card.dataset.keywords + " " + card.dataset.title,
        );
        var ok = true;
        if (q && keywords.indexOf(q) === -1) ok = false;
        if (category && normalize(card.dataset.category) !== category)
          ok = false;
        if (type && normalize(card.dataset.type) !== type) ok = false;
        if (year && normalize(card.dataset.year) !== year) ok = false;
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      if (emptyState) emptyState.hidden = shown !== 0;
    }

    [queryInput, categorySelect, typeSelect, yearSelect].forEach(
      function (control) {
        if (!control) return;
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      },
    );
    applyFilters();
  }

  function formatTime(seconds) {
    seconds = Number.isFinite(seconds) ? seconds : 0;
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  function initPlayers() {
    $all("[data-player]").forEach(function (player) {
      var video = $(".player-video", player);
      var cover = $(".player-cover", player);
      var playToggle = $(".play-toggle", player);
      var muteToggle = $(".mute-toggle", player);
      var fullToggle = $(".full-toggle", player);
      var range = $(".time-range", player);
      var label = $(".time-label", player);
      if (!video) return;
      var streamUrl = video.getAttribute("data-stream");
      var hls = null;

      if (streamUrl) {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else {
          video.src = streamUrl;
        }
      }

      function updateState() {
        if (playToggle) playToggle.textContent = video.paused ? "▶" : "Ⅱ";
        if (muteToggle) muteToggle.textContent = video.muted ? "🔇" : "🔊";
        if (range && Number.isFinite(video.duration)) {
          range.max = video.duration;
          range.value = video.currentTime;
        }
        if (label)
          label.textContent =
            formatTime(video.currentTime) + " / " + formatTime(video.duration);
      }

      function play() {
        if (cover) cover.classList.add("hidden");
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            if (cover) cover.classList.remove("hidden");
          });
        }
      }

      function togglePlay() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      cover && cover.addEventListener("click", play);
      playToggle && playToggle.addEventListener("click", togglePlay);
      video.addEventListener("click", togglePlay);
      muteToggle &&
        muteToggle.addEventListener("click", function () {
          video.muted = !video.muted;
          updateState();
        });
      fullToggle &&
        fullToggle.addEventListener("click", function () {
          if (player.requestFullscreen) player.requestFullscreen();
        });
      range &&
        range.addEventListener("input", function () {
          video.currentTime = Number(range.value || 0);
          updateState();
        });
      video.addEventListener("play", updateState);
      video.addEventListener("pause", updateState);
      video.addEventListener("timeupdate", updateState);
      video.addEventListener("loadedmetadata", updateState);
      window.addEventListener("beforeunload", function () {
        if (hls) hls.destroy();
      });
      updateState();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setImageFallbacks();
    initMenu();
    initSearchForms();
    initHero();
    initCatalog();
    initPlayers();
  });
})();
