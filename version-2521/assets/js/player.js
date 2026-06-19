(function () {
  function start(opts) {
    var video = document.getElementById(opts.videoId);
    var button = document.getElementById(opts.buttonId);
    var overlay = document.getElementById(opts.overlayId);
    var src = opts.src;
    var launched = false;
    function launch() {
      if (!video || !src) {
        return;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (launched) {
        video.play();
        return;
      }
      launched = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        return;
      }
      video.src = src;
      video.play();
    }
    if (button) {
      button.addEventListener('click', launch);
    }
    if (overlay) {
      overlay.addEventListener('click', launch);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!launched || video.paused) {
          launch();
        } else {
          video.pause();
        }
      });
    }
  }
  window.SitePlayer = {
    start: start
  };
})();
