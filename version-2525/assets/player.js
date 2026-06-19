import { H as Hls } from './hls-vendor-dru42stk.js';

const video = document.getElementById('video-player');
const bigPlay = document.querySelector('[data-big-play]');

function setupPlayer() {
  if (!video) {
    return;
  }

  const source = video.dataset.source;

  if (!source) {
    return;
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (data && data.fatal) {
        console.warn('HLS playback error:', data.type);
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  }

  if (bigPlay) {
    bigPlay.addEventListener('click', function () {
      video.play();
    });

    video.addEventListener('play', function () {
      bigPlay.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      bigPlay.classList.remove('is-hidden');
    });
  }
}

setupPlayer();
