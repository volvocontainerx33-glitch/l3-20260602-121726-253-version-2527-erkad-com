(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(frame) {
    var video = frame.querySelector("video");
    var overlay = frame.querySelector(".player-overlay");
    var message = frame.querySelector("[data-player-message]");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var hls = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
      frame.classList.add("is-error");
    }

    function bindStream() {
      if (!stream) {
        setMessage("视频暂时无法播放");
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("视频加载失败，请稍后重试");
          }
        });
        return;
      }
      setMessage("视频暂时无法播放");
    }

    function startPlayback() {
      if (!video.src && !hls) {
        bindStream();
      }
      frame.classList.remove("is-error");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(function () {
          frame.classList.add("is-playing");
          if (overlay) {
            overlay.hidden = true;
          }
        }).catch(function () {
          if (overlay) {
            overlay.hidden = false;
          }
        });
      } else {
        frame.classList.add("is-playing");
        if (overlay) {
          overlay.hidden = true;
        }
      }
    }

    bindStream();

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    video.addEventListener("play", function () {
      frame.classList.add("is-playing");
      if (overlay) {
        overlay.hidden = true;
      }
    });
    video.addEventListener("pause", function () {
      if (!video.ended && overlay) {
        overlay.hidden = false;
        frame.classList.remove("is-playing");
      }
    });
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.hidden = false;
      }
      frame.classList.remove("is-playing");
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
