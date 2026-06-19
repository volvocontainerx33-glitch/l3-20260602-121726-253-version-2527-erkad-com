document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("movie-player");
  var button = document.querySelector("[data-video-start]");

  if (!video) {
    return;
  }

  var source = video.getAttribute("data-hls-src");
  var frame = video.closest(".video-frame");

  function markPlaying() {
    if (frame) {
      frame.classList.add("is-playing");
    }
  }

  function markPaused() {
    if (frame && video.paused) {
      frame.classList.remove("is-playing");
    }
  }

  function startPlayback() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (source) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          video.src = source;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", markPlaying);
  video.addEventListener("pause", markPaused);
  video.addEventListener("ended", markPaused);
});
