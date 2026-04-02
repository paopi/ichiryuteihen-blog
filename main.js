'use strict';

/* ============================================
   一留底辺ブログ - メインスクリプト
   ============================================ */

// ---- ダークモード切替 ----------------------------------------

(function initTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // 初期テーマ: localStorage → OS設定 → デフォルト(light)
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');

  applyTheme(initial);

  btn.addEventListener('click', function () {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    btn.textContent = theme === 'dark' ? '☀️ ライト' : '🌙 ダーク';
  }
})();


// ---- ハンバーガーメニュー ------------------------------------

(function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // ナビリンクをタップしたらメニューを閉じる
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();


// ---- TOPに戻るボタン ----------------------------------------

(function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY >= 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ---- カテゴリフィルター + 無限スクロール --------------------

(function initArticles() {
  const filterArea = document.getElementById('category-filter');
  const grid = document.getElementById('articles-grid');
  const sentinel = document.getElementById('infinite-scroll-sentinel');
  if (!grid) return;

  const PAGE_SIZE = 9;
  const allCards = Array.from(grid.querySelectorAll('.article-card'));
  let currentCategory = 'all';
  let loadedCount = 0;

  function getFiltered() {
    return allCards.filter(function (card) {
      return currentCategory === 'all' || card.dataset.category === currentCategory;
    });
  }

  function loadMore() {
    const filtered = getFiltered();
    const batch = filtered.slice(loadedCount, loadedCount + PAGE_SIZE);
    batch.forEach(function (card) {
      card.style.display = '';
      card.classList.remove('card-fade-in');
      void card.offsetWidth; // reflow でアニメーションをリセット
      card.classList.add('card-fade-in');
    });
    loadedCount += batch.length;
  }

  function resetAndLoad(category) {
    currentCategory = category;
    loadedCount = 0;
    allCards.forEach(function (card) {
      card.style.display = 'none';
      card.classList.remove('card-fade-in');
    });
    loadMore();
  }

  // 初回ロード
  resetAndLoad('all');

  // フィルターボタン
  if (filterArea) {
    const buttons = filterArea.querySelectorAll('.filter-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        resetAndLoad(btn.getAttribute('data-category'));
      });
    });
  }

  // 無限スクロール (IntersectionObserver)
  // 初回ロード直後はsentinelがビューポート内にあるため、
  // ユーザーが実際にスクロールするまでObserverを有効化しない
  if (!sentinel || !window.IntersectionObserver) return;

  var scrollEnabled = false;

  window.addEventListener('scroll', function onFirstScroll() {
    scrollEnabled = true;
    window.removeEventListener('scroll', onFirstScroll);
  }, { passive: true });

  var observer = new IntersectionObserver(function (entries) {
    if (!scrollEnabled) return;
    if (!entries[0].isIntersecting) return;
    var filtered = getFiltered();
    if (loadedCount < filtered.length) {
      loadMore();
    }
  }, { rootMargin: '0px' });

  observer.observe(sentinel);
})();
