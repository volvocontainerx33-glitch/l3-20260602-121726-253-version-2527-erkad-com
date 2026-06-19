(function () {
  var ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  var normalize = function (value) {
    return (value || "").toString().trim().toLowerCase();
  };

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      var show = function (target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };

      var restart = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var wrap = panel.closest("section") || document;
      var grid = wrap.querySelector("[data-filter-grid]");
      var empty = wrap.querySelector("[data-empty-state]");
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var keyword = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var category = panel.querySelector("[data-filter-category]");
      var query = new URLSearchParams(window.location.search).get("q");

      if (query && keyword) {
        keyword.value = query;
      }

      var filter = function () {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var c = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" "));
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && normalize(card.getAttribute("data-year")) !== y) {
            ok = false;
          }
          if (r && normalize(card.getAttribute("data-region")) !== r) {
            ok = false;
          }
          if (t && normalize(card.getAttribute("data-type")) !== t) {
            ok = false;
          }
          if (c && normalize(card.getAttribute("data-category")) !== c) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      };

      [keyword, year, region, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filter);
          control.addEventListener("change", filter);
        }
      });

      filter();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-play-button]");
      if (!video || !cover) {
        return;
      }

      var source = video.getAttribute("data-hls");
      var hls = null;
      var started = false;

      var playNative = function () {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", source);
        }
        video.play().catch(function () {
          cover.classList.remove("is-hidden");
        });
      };

      var start = function () {
        if (!source) {
          return;
        }
        cover.classList.add("is-hidden");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          playNative();
          started = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hls) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                cover.classList.remove("is-hidden");
              });
            });
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
              if (data && data.fatal) {
                try {
                  hls.destroy();
                } catch (error) {
                }
                hls = null;
                playNative();
              }
            });
          } else {
            video.play().catch(function () {
              cover.classList.remove("is-hidden");
            });
          }
          started = true;
          return;
        }
        playNative();
        started = true;
      };

      cover.addEventListener("click", start);
      video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (started && video.currentTime === 0) {
          cover.classList.remove("is-hidden");
        }
      });
    });
  });
})();
