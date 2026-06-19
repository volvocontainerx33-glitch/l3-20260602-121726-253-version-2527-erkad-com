(function () {
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const count = document.querySelector('[data-search-count]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (!input || !results || !count || !window.SEARCH_MOVIES) {
    return;
  }

  input.value = initialQuery;

  function createCard(movie) {
    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '  <figure class="poster-wrap">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-year">' + movie.year + '</span>',
      '    <span class="poster-play">播放</span>',
      '  </figure>',
      '  <div class="movie-card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('
');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runSearch(query) {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      results.innerHTML = '';
      count.textContent = '请输入关键词开始搜索。';
      return;
    }

    const matched = window.SEARCH_MOVIES.filter(function (movie) {
      return movie.searchText.indexOf(keyword) !== -1;
    }).slice(0, 120);

    results.innerHTML = matched.map(createCard).join('
');
    count.textContent = '找到 ' + matched.length + ' 条结果，最多显示前 120 条。';
  }

  input.addEventListener('input', function () {
    runSearch(input.value);
  });

  runSearch(initialQuery);
})();
