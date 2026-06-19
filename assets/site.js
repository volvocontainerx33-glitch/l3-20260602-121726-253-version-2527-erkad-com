import { H as Hls } from "./hls.js";

const MovieSite = (() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function initImages() {
    $$('img').forEach((image) => {
      image.addEventListener('error', () => {
        image.classList.add('is-missing');
      }, { once: true });
    });
  }

  function initMenu() {
    const toggle = $('[data-menu-toggle]');
    const nav = $('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    const slides = $$('.hero-slide');
    const dots = $$('.hero-dot');
    if (slides.length < 2) {
      return;
    }
    let active = 0;
    const setActive = (index) => {
      active = index % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => setActive(index));
    });
    window.setInterval(() => setActive(active + 1), 5200);
  }

  function initFilters() {
    const scope = $('[data-search-scope]');
    if (!scope) {
      return;
    }
    const keyword = $('[data-filter-keyword]');
    const year = $('[data-filter-year]');
    const type = $('[data-filter-type]');
    const cards = $$('.movie-card', scope);
    const empty = $('[data-empty-state]');

    const apply = () => {
      const keywordValue = (keyword?.value || '').trim().toLowerCase();
      const yearValue = year?.value || '';
      const typeValue = type?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = (card.dataset.search || '').toLowerCase();
        const cardYear = card.dataset.year || '';
        const cardType = card.dataset.type || '';
        const matched = (!keywordValue || haystack.includes(keywordValue))
          && (!yearValue || cardYear === yearValue)
          && (!typeValue || cardType === typeValue);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [keyword, year, type].filter(Boolean).forEach((control) => {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
  }

  function initPlayer() {
    const player = $('[data-player]');
    if (!player) {
      return;
    }
    const video = $('video', player);
    const button = $('[data-play]', player);
    const overlay = $('[data-overlay]', player);
    const source = player.dataset.src;
    let hlsInstance = null;

    const start = async () => {
      overlay?.classList.add('is-hidden');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        await video.play();
        return;
      }
      if (Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
      }
    };

    button?.addEventListener('click', () => {
      start().catch(() => {
        overlay?.classList.remove('is-hidden');
      });
    });
    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) {
        start().catch(() => {
          overlay.classList.remove('is-hidden');
        });
      }
    });
  }

  function init() {
    initImages();
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', MovieSite.init);
