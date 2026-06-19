(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startAutoPlay();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startAutoPlay();
      });
    }

    hero.addEventListener('mouseenter', stopAutoPlay);
    hero.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  const filterInput = document.querySelector('[data-card-filter]');
  const filterGrid = document.querySelector('[data-filter-grid]');

  if (filterInput && filterGrid) {
    const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));

    filterInput.addEventListener('input', function () {
      const keyword = filterInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type
        ].join(' ').toLowerCase();

        card.style.display = haystack.includes(keyword) ? '' : 'none';
      });
    });
  }
})();
