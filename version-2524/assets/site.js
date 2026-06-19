(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dots button'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const keyword = document.querySelector('[data-filter-keyword]');
  const year = document.querySelector('[data-filter-year]');
  const type = document.querySelector('[data-filter-type]');
  const cards = Array.from(document.querySelectorAll('[data-title]'));

  function applyFilters() {
    const q = keyword ? keyword.value.trim().toLowerCase() : '';
    const y = year ? year.value : '';
    const t = type ? type.value : '';

    cards.forEach(function (card) {
      const title = (card.dataset.title || '').toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase();
      const region = (card.dataset.region || '').toLowerCase();
      const cardType = card.dataset.type || '';
      const cardYear = card.dataset.year || '';
      const okText = !q || title.includes(q) || tags.includes(q) || region.includes(q);
      const okYear = !y || cardYear === y;
      const okType = !t || cardType.includes(t);
      card.style.display = okText && okYear && okType ? '' : 'none';
    });
  }

  [keyword, year, type].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
})();

function initVideoPlayer(videoUrl) {
  const video = document.querySelector('#video-player');
  const layer = document.querySelector('#play-layer');
  const status = document.querySelector('#player-status');
  let loaded = false;
  let hls = null;

  if (!video || !layer || !videoUrl) {
    return;
  }

  function setStatus(text) {
    if (status) {
      status.textContent = text || '';
    }
  }

  function loadVideo() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('播放加载失败，请稍后重试');
        }
      });
    } else {
      video.src = videoUrl;
    }
  }

  function playNow() {
    loadVideo();
    layer.classList.add('is-hidden');
    const playResult = video.play();
    if (playResult && playResult.catch) {
      playResult.catch(function () {
        layer.classList.remove('is-hidden');
      });
    }
  }

  layer.addEventListener('click', playNow);
  video.addEventListener('click', function () {
    if (video.paused) {
      playNow();
    }
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      layer.classList.remove('is-hidden');
    }
  });
  video.addEventListener('play', function () {
    layer.classList.add('is-hidden');
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
