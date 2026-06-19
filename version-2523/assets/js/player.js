(function () {
  var hlsLoaderPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }

    hlsLoaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("HLS 播放库加载失败"));
      };
      document.head.appendChild(script);
    });

    return hlsLoaderPromise;
  }

  function setStatus(box, message) {
    var status = box.querySelector("[data-player-status]");

    if (status) {
      status.textContent = message;
    }
  }

  function playVideo(box) {
    var video = box.querySelector("video");
    var overlay = box.querySelector("[data-player-overlay]");
    var source = box.getAttribute("data-video-src");

    if (!video || !source) {
      setStatus(box, "当前播放源不可用");
      return;
    }

    setStatus(box, "正在加载播放源...");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.play().catch(function () {});
      if (overlay) {
        overlay.classList.add("hidden");
      }
      setStatus(box, "正在播放");
      return;
    }

    loadHlsLibrary().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        video.src = source;
        video.play().catch(function () {});
        if (overlay) {
          overlay.classList.add("hidden");
        }
        setStatus(box, "正在尝试直接播放");
        return;
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
        setStatus(box, "正在播放");
      });
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus(box, "播放源加载异常，请稍后重试");
        }
      });

      video._hlsInstance = hls;

      if (overlay) {
        overlay.classList.add("hidden");
      }
    }).catch(function () {
      video.src = source;
      video.play().catch(function () {});
      if (overlay) {
        overlay.classList.add("hidden");
      }
      setStatus(box, "正在尝试直接播放");
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-src]"));

    players.forEach(function (box) {
      var overlay = box.querySelector("[data-player-overlay]");

      if (overlay) {
        overlay.addEventListener("click", function () {
          playVideo(box);
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupPlayers);
  } else {
    setupPlayers();
  }
})();
