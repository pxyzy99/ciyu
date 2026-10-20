(() => {
  'use strict';

  const WORDS = Array.isArray(window.WORDS) ? window.WORDS : [];
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const toastRoot = document.getElementById('toast-root');

  if (!WORDS.length) {
    app.innerHTML = '<div style="padding:60px;text-align:center;font-family:system-ui">词库数据没有加载成功，请确认 data/words.js 与 index.html 在同一目录。</div>';
    return;
  }

  const byId = new Map(WORDS.map(w => [w.id, w]));
  const STORAGE_KEY = 'ciyu.study.cet4.v1';
  const PRESET_GOALS = [30, 50];
  const MAX_GOAL = 200;
  const PRACTICE_MODES = [
    { key: 'mixed', label: '混合练习', short: '混合' },
    { key: 'card', label: '卡片回想', short: '卡片' },
    { key: 'en2cn', label: '英译中 · 四选一', short: '英译中' },
    { key: 'cn2en', label: '中译英 · 四选一', short: '中译英' },
    { key: 'spell', label: '拼写挑战', short: '拼写' }
  ];
  const PRACTICE_KEYS = PRACTICE_MODES.map(m => m.key);

  /* ---------------- icons ---------------- */

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/>',
    repeat: '<path d="M20 7h-9a4 4 0 0 0-4 4v1"/><path d="m17 4 3 3-3 3"/><path d="M4 17h9a4 4 0 0 0 4-4v-1"/><path d="m7 20-3-3 3-3"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    arrowRight: '<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
    arrowLeft: '<path d="M20 12H4"/><path d="m10 18-6-6 6-6"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    x: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7 0 2-1 3-2 4 0-4-2-7-4-9 0 4-4 7-4 12 0 4 3 7 7 7z"/>',
    shuffle: '<path d="M3 7h4c4 0 6 10 10 10h4"/><path d="m18 14 3 3-3 3"/><path d="M3 17h4c1.5 0 2.8-1.4 4-3"/><path d="M14 7h3"/><path d="m18 4 3 3-3 3"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/>',
    moon: '<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
    spark: '<path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="m5.6 5.6 2.1 2.1"/><path d="m16.3 16.3 2.1 2.1"/><path d="m5.6 18.4 2.1-2.1"/><path d="m16.3 7.7 2.1-2.1"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    bookOpen: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    leaf: '<path d="M20 4C10 4 4 9 4 17c0 2 1 3 3 3 8 0 13-6 13-16z"/><path d="M4 20c2-6 6-9 12-11"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4h-.1a1.7 1.7 0 0 0-1.6 1z"/>',
    menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>'
  };

  const ico = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ---------------- storage ---------------- */

  function defaultStore() {
    return {
      progress: {},
      log: {},
      recent: [],
      settings: {
        dailyGoal: 30,
        studyMode: 'mixed',
        theme: 'light',
        seed: Math.floor(Date.now() % 2147483647)
      }
    };
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultStore();
      const parsed = JSON.parse(raw);
      const base = defaultStore();
      if (!parsed || typeof parsed !== 'object') return base;
      const rawGoal = Number(parsed.settings?.dailyGoal);
      const savedGoal = Number.isFinite(rawGoal) && rawGoal > 0 ? Math.max(1, Math.min(MAX_GOAL, rawGoal)) : 30;
      const studyMode = PRACTICE_KEYS.includes(parsed.settings?.studyMode) ? parsed.settings.studyMode : 'mixed';
      return {
        progress: parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {},
        log: parsed.log && typeof parsed.log === 'object' ? parsed.log : {},
        recent: Array.isArray(parsed.recent) ? parsed.recent.filter(id => byId.has(id)) : [],
        settings: {
          dailyGoal: [10, 20].includes(savedGoal) ? 30 : savedGoal,
          studyMode,
          theme: parsed.settings?.theme === 'dark' ? 'dark' : 'light',
          seed: Number(parsed.settings?.seed) || base.settings.seed
        }
      };
    } catch (err) {
      return defaultStore();
    }
  }

  const store = loadStore();
  let orderCache = null;
  let session = null;
  let lastRoute = null;
  const scrollPositions = {};
  let libraryState = { query: '', filter: 'all', sort: 'shuffle', limit: 60 };
  let reviewTab = 'weak';
  let paletteState = { open: false, items: [], index: 0 };
  let modalOpen = false;
  let goalEditing = false;

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (err) {
      /* private mode or blocked storage */
    }
  }

  /* ---------------- utilities ---------------- */

  const pad = n => String(n).padStart(2, '0');
  const localKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayKey = () => localKey(new Date());
  const esc = str => String(str ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
  const num = n => Number(n || 0).toLocaleString('zh-CN');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function dateLabel() {
    const d = new Date();
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    return `${d.getMonth() + 1}月${d.getDate()}日 · ${week}`;
  }

  function englishDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rng) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((rng || Math.random)() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function shuffledWords() {
    if (orderCache) return orderCache;
    orderCache = shuffle(WORDS, mulberry32(Number(store.settings.seed) >>> 0));
    return orderCache;
  }

  function reshuffle() {
    store.settings.seed = (Date.now() % 2147483647);
    orderCache = null;
    save();
  }

  function pOf(id) {
    return store.progress[id];
  }

  function hasMistake(p) {
    return !!p && ((p.wrong || 0) > 0 || (p.fuzzy || 0) > 0);
  }

  function statusOf(id) {
    const p = pOf(id);
    if (!p || !p.seen) return 'new';
    if (p.box >= 4) return 'mastered';
    if (hasMistake(p)) return 'weak';
    return 'learning';
  }

  const STATUS_META = {
    new: { label: '未学', cls: '' },
    learning: { label: '学习中', cls: 'learning' },
    weak: { label: '易错', cls: 'weak' },
    mastered: { label: '已掌握', cls: 'mastered' }
  };

  function counts() {
    let mastered = 0;
    let weak = 0;
    let learning = 0;
    for (const w of WORDS) {
      const p = pOf(w.id);
      if (!p || !p.seen) continue;
      if (p.box >= 4) mastered++;
      else if (hasMistake(p)) weak++;
      else learning++;
    }
    const learned = mastered + weak + learning;
    return { total: WORDS.length, learned, mastered, weak, learning, fresh: WORDS.length - learned };
  }

  function weakWords() {
    return WORDS.filter(w => {
      const p = pOf(w.id);
      return p && p.seen && p.box < 4 && hasMistake(p);
    }).sort((a, b) => {
      const pa = pOf(a.id);
      const pb = pOf(b.id);
      return ((pb.wrong || 0) * 2 + (pb.fuzzy || 0)) - ((pa.wrong || 0) * 2 + (pa.fuzzy || 0));
    });
  }

  function conqueredWords() {
    return WORDS.filter(w => {
      const p = pOf(w.id);
      return p && p.seen && p.box >= 4 && ((p.wrong || 0) > 0 || (p.fuzzy || 0) > 0);
    }).sort((a, b) => (pOf(b.id).last || 0) - (pOf(a.id).last || 0));
  }

  function recentLearned(limit = 4) {
    return WORDS.filter(w => pOf(w.id)?.seen)
      .sort((a, b) => (pOf(b.id)?.last || 0) - (pOf(a.id)?.last || 0))
      .slice(0, limit);
  }

  function dueCount() {
    const now = Date.now();
    return WORDS.filter(w => {
      const p = pOf(w.id);
      return p && p.seen && p.box < 4 && (p.due || 0) <= now;
    }).length;
  }

  function todayLog() {
    return store.log[todayKey()] || { studied: 0, correct: 0, wrong: 0, fuzzy: 0 };
  }

  function formatStats() {
    const meta = {
      card: '卡片回想',
      en2cn: '英译中',
      cn2en: '中译英',
      spell: '拼写挑战'
    };
    const totals = Object.fromEntries(Object.keys(meta).map(k => [k, 0]));
    for (const log of Object.values(store.log)) {
      if (!log.formats || typeof log.formats !== 'object') continue;
      for (const [key, value] of Object.entries(log.formats)) {
        if (key in totals) totals[key] += Number(value) || 0;
      }
    }
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    return {
      total,
      items: Object.entries(meta).map(([key, label]) => ({
        key,
        label,
        count: totals[key],
        pct: total ? Math.round((totals[key] / total) * 100) : 0
      }))
    };
  }

  function firstMeaning(w) {
    const m = w.meanings?.[0];
    return m ? `${m.pos ? m.pos + ' ' : ''}${m.text}` : '';
  }

  function meaningPreview(w) {
    const seen = new Set();
    return (w.meanings || [])
      .map(m => ({ pos: m.pos || '', text: String(m.text || '').trim() }))
      .filter(item => {
        const key = `${item.pos}|${item.text}`;
        if (!item.text || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 2)
      .map(item => `${item.pos ? item.pos + ' ' : ''}${item.text}`)
      .join('；');
  }

  function wordSizeClass(word) {
    const n = word.replace(/[^A-Za-z]/g, '').length;
    if (n > 15) return 'xlong';
    if (n > 10) return 'long';
    return '';
  }

  function meaningsHTML(w, limit) {
    const list = limit ? w.meanings.slice(0, limit) : w.meanings;
    return list.map(m => `<div class="meaning-line"><span class="pos ${m.pos ? '' : 'pos-empty'}">${esc(m.pos || '释')}</span><span>${esc(m.text)}</span></div>`).join('');
  }

  function ringSVG(pct, size = 148, stroke = 9) {
    const r = (size - stroke) / 2 - 2;
    const c = 2 * Math.PI * r;
    const off = c * (1 - clamp(pct, 0, 100) / 100);
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
      <circle class="ring-value" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    </svg>`;
  }

  function showToast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    toastRoot.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 280);
    }, 2200);
  }

  /* ---------------- 答题奖励气泡 ---------------- */

  const BUBBLE_GOOD = [
    'PXY 真棒',
    '彭湘宜真厉害',
    '这题也难不倒你',
    'PXY 又答对啦',
    '记得真准，彭湘宜',
    'PXY 今天的脑子很好用',
    '一个词，又拿下了',
    '厉害呀，彭湘宜',
    '答对的样子最好看',
    'PXY 稳稳的',
    '这个单词认识你了',
    '彭湘宜的记性真好'
  ];

  const BUBBLE_CHEER = [
    'PXY 加油',
    '没关系，再看一眼就记住了',
    '彭湘宜别急，慢慢来',
    '错一次，记得更牢',
    '这个单词等会儿还会来找你',
    'PXY 已经很棒了',
    '深呼吸，下一题稳住',
    '不着急，记忆需要一点时间',
    '彭湘宜，再试一次',
    '错题也是进度的一部分',
    '先放一放，等会儿再来'
  ];

  let bubbleLastAt = 0;

  function bubbleLayer() {
    let layer = document.getElementById('bubble-root');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'bubble-root';
      layer.className = 'bubble-root';
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);
    }
    return layer;
  }

  function pickBubbleText(pool) {
    if (pool.length < 2) return pool[0];
    let text = pool[Math.floor(Math.random() * pool.length)];
    if (text === pickBubbleText.last) text = pool[(pool.indexOf(text) + 1) % pool.length];
    pickBubbleText.last = text;
    return text;
  }

  function showBubble(kind = 'good') {
    const now = Date.now();
    if (now - bubbleLastAt < 650) return;
    const layer = bubbleLayer();
    if (layer.children.length >= 3) return;
    bubbleLastAt = now;

    const cheer = kind === 'cheer';
    const el = document.createElement('div');
    el.className = `bubble ${cheer ? 'bubble-cheer' : 'bubble-good'} v${1 + Math.floor(Math.random() * 3)}`;
    el.innerHTML = `<span class="bubble-mark" aria-hidden="true">${cheer ? '♡' : '✦'}</span><span class="bubble-text"></span>`;
    el.querySelector('.bubble-text').textContent = pickBubbleText(cheer ? BUBBLE_CHEER : BUBBLE_GOOD);
    el.style.fontSize = `${(14 + Math.random() * 2.4).toFixed(1)}px`;
    layer.appendChild(el);

    const pad = 12;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const top = 78;
    const bottom = Math.max(top + h + 24, window.innerHeight - 92);
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    el.style.left = `${pad + Math.random() * Math.max(1, maxX - pad)}px`;
    el.style.top = `${top + Math.random() * Math.max(1, bottom - top - h)}px`;
    el.style.setProperty('--tilt', `${(Math.random() * 6 - 3).toFixed(1)}deg`);

    setTimeout(() => el.remove(), 2800);
  }

  function addRecent(id) {
    store.recent = [id, ...store.recent.filter(x => x !== id)].slice(0, 8);
    save();
  }

  function initGrain() {
    const canvas = document.getElementById('grain-canvas');
    if (!canvas || !canvas.getContext) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();

    function spawn() {
      const count = width < 640 ? 26 : Math.min(64, Math.max(40, Math.round(width / 28)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.7 + Math.random() * 1.9,
        speed: 0.28 + Math.random() * 0.34,
        sway: 0.3 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.16 + Math.random() * 0.2,
        warm: Math.random() < 0.18
      }));
    }

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawn();
    }

    function frame(now) {
      const dark = document.documentElement.dataset.theme === 'dark';
      const step = Math.min(32, now - last) / 16.67;
      last = now;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += p.speed * step;
        p.x += Math.sin(now * 0.00025 + p.phase) * p.sway * 0.028 * step;
        if (p.y > height + 6) {
          p.y = -6;
          p.x = Math.random() * width;
        }
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.warm
          ? (dark ? `rgba(224,138,108,${p.alpha})` : `rgba(198,95,67,${p.alpha * 0.75})`)
          : (dark ? `rgba(242,238,226,${p.alpha})` : `rgba(28,42,36,${p.alpha})`);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    raf = requestAnimationFrame(frame);
  }

  /* ---------------- routing ---------------- */

  function routeName() {
    const h = location.hash.replace(/^#\/?/, '');
    if (['home', 'study', 'library', 'review', 'stats'].includes(h)) return h;
    return 'home';
  }

  function go(hash) {
    if (location.hash === hash) {
      render();
    } else {
      location.hash = hash;
    }
  }

  /* ---------------- shell ---------------- */

  function navLink(route, current, iconName, label, count) {
    const active = current === route || (current === 'study' && route === 'home');
    return `<a class="nav-link ${active ? 'active' : ''}" href="#/${route}">
      ${ico(iconName)}
      <span>${label}</span>
      ${count !== undefined ? `<span class="nav-count">${num(count)}</span>` : ''}
    </a>`;
  }

  function mobileLink(route, current, iconName, label) {
    const active = current === route || (current === 'study' && route === 'home');
    return `<a class="${active ? 'active' : ''}" href="#/${route}">${ico(iconName)}<span>${label}</span></a>`;
  }

  function shell(route, content) {
    const c = counts();
    const ts = todayLog();
    const goal = store.settings.dailyGoal;
    const done = ts.studied;
    const themeLabel = store.settings.theme === 'dark' ? '切换到浅色' : '切换到深色';
    return `
      <aside class="sidebar">
        <a class="brand" href="#/home" aria-label="PXY专用四级网站首页">
          <span class="brand-mark">词</span>
          <span>
            <span class="brand-name">PXY 四级</span>
            <span class="brand-sub">WORD ISLE</span>
          </span>
        </a>
        <nav class="nav" aria-label="主导航">
          <div class="nav-label">STUDY</div>
          ${navLink('home', route, 'home', '开始学习')}
          ${navLink('library', route, 'book', '词库查询', c.total)}
          ${navLink('review', route, 'repeat', '易错本', c.weak)}
          ${navLink('stats', route, 'chart', '学习数据')}
        </nav>
        <div class="sidebar-spacer"></div>
        <div class="sidebar-card">
          <div class="sidebar-card-top">
            <span class="streak-line">${ico('leaf', 'icon-sm')} 今天已读</span>
            <span id="sidebarCount" style="font-size:9px;color:var(--muted)">${done} 个词</span>
          </div>
          <p id="sidebarGoalText">有时间就翻开，不必赶进度</p>
        </div>
        <div class="sidebar-foot">
          <span>CET-4 VOCABULARY</span>
          <span>${num(c.total)} WORDS</span>
        </div>
      </aside>
      <div class="main-wrap">
        <header class="topbar">
          <div class="topbar-date">
            <div class="eyebrow">${englishDate()}</div>
            <p><span class="mobile-brand">PXY 四级</span>${dateLabel()}</p>
          </div>
          <div class="topbar-actions">
            <button class="search-trigger" data-action="open-palette" aria-label="搜索单词">
              ${ico('search', 'icon-sm')}<span>搜索单词或释义</span><kbd>Ctrl K</kbd>
            </button>
            <button class="icon-btn" data-action="toggle-theme" aria-label="${themeLabel}" title="${themeLabel}">
              ${ico(store.settings.theme === 'dark' ? 'sun' : 'moon', 'icon-sm')}
            </button>
            <div class="goal-pill"><i></i>今日 ${goal} 词</div>
          </div>
        </header>
        <main class="view" id="view">${content}</main>
      </div>
      <nav class="mobile-nav" aria-label="移动端导航">
        ${mobileLink('home', route, 'home', '学习')}
        ${mobileLink('library', route, 'book', '词库')}
        ${mobileLink('review', route, 'repeat', '易错')}
        ${mobileLink('stats', route, 'chart', '数据')}
      </nav>`;
  }

  function updateSidebar() {
    const ts = todayLog();
    const done = ts.studied;
    const text = document.getElementById('sidebarGoalText');
    const count = document.getElementById('sidebarCount');
    if (text) text.textContent = '有时间就翻开，不必赶进度';
    if (count) count.textContent = `${done} 个词`;
  }

  /* ---------------- session logic ---------------- */

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function practiceMeta(key) {
    return PRACTICE_MODES.find(m => m.key === key) || PRACTICE_MODES[0];
  }

  function practiceLabel(key) {
    return practiceMeta(key).label;
  }

  function normalizeAnswer(value) {
    return String(value || '').toLowerCase().replace(/[^a-z]/g, '');
  }

  function spellHint(w) {
    return w.id.split(/\s+/).filter(Boolean).map(part => {
      const letters = part.replace(/[^a-z]/gi, '');
      return letters ? letters[0] + '_'.repeat(Math.max(0, letters.length - 1)) : '';
    }).join('  ');
  }

  function meaningChars(text) {
    const stop = '的地得和与或及等一种使人';
    return new Set(String(text || '').replace(/[，,。.;；:：、（）()\[\]\s]/g, '').split('').filter(ch => /[\u4e00-\u9fa5]/.test(ch) && !stop.includes(ch)));
  }

  function overlapScore(a, b) {
    const sa = meaningChars(a);
    const sb = meaningChars(b);
    if (!sa.size || !sb.size) return 0;
    let hit = 0;
    for (const ch of sa) if (sb.has(ch)) hit++;
    return hit / Math.max(sa.size, sb.size);
  }

  function posClass(pos) {
    const p = String(pos || '').toLowerCase();
    if (p.startsWith('n')) return 'n';
    if (p.startsWith('v')) return 'v';
    if (p.startsWith('adv')) return 'adv';
    if (p.startsWith('adj') || p.startsWith('a.') || p.startsWith('s.')) return 'a';
    return p;
  }

  function pickDistractors(w, format, count, rng) {
    const pool = shuffle(WORDS.filter(x => x.id !== w.id && x.word.toLowerCase() !== w.word.toLowerCase()), rng);
    const correctMeaning = w.meanings.map(m => m.text).join(' ');
    const correctText = format === 'en2cn' ? firstMeaning(w) : w.word;
    const targetClass = posClass(w.meanings[0]?.pos || '');
    const used = new Set([correctText.toLowerCase()]);
    const preferred = [];
    const fallback = [];

    for (const d of pool) {
      const text = format === 'en2cn' ? firstMeaning(d) : d.word;
      if (!text || used.has(text.toLowerCase())) continue;
      const sim = overlapScore(correctMeaning, d.meanings.map(m => m.text).join(' '));
      if (sim > 0.26) continue;
      if (format !== 'en2cn') {
        if (d.word[0]?.toLowerCase() === w.word[0]?.toLowerCase()) continue;
        const lenA = d.word.replace(/[^a-z]/gi, '').length;
        const lenB = w.word.replace(/[^a-z]/gi, '').length;
        if (Math.abs(lenA - lenB) > 4) continue;
      }
      used.add(text.toLowerCase());
      const item = { text };
      if (posClass(d.meanings[0]?.pos || '') === targetClass) preferred.push(item);
      else fallback.push(item);
    }

    const out = preferred.slice(0, count);
    for (const item of fallback) {
      if (out.length >= count) break;
      out.push(item);
    }
    if (out.length < count) {
      for (const d of pool) {
        const text = format === 'en2cn' ? firstMeaning(d) : d.word;
        if (!text || used.has(text.toLowerCase())) continue;
        out.push({ text });
        used.add(text.toLowerCase());
        if (out.length === count) break;
      }
    }
    return out;
  }

  function makeQuestion(id, format, seed = 0) {
    const w = byId.get(id);
    const rng = mulberry32(hashString(`${id}|${format}|${store.settings.seed}|${seed}`));
    if (format === 'card') return { id, format };
    if (format === 'spell') {
      return {
        id,
        format,
        prompt: meaningPreview(w),
        phonetic: w.phonetic || '',
        hint: spellHint(w),
        accepted: [normalizeAnswer(w.id), normalizeAnswer(w.word)]
      };
    }
    const correctText = format === 'en2cn' ? firstMeaning(w) : w.word;
    const distractors = pickDistractors(w, format, 3, rng);
    const options = shuffle([{ text: correctText, correct: true }, ...distractors.map(d => ({ text: d.text, correct: false }))], rng);
    return {
      id,
      format,
      prompt: meaningPreview(w),
      phonetic: w.phonetic || '',
      options,
      answerIndex: options.findIndex(o => o.correct)
    };
  }

  function formatSequence(practice, n) {
    if (practice !== 'mixed') return Array(n).fill(practice);
    const rng = mulberry32(hashString(`mix|${store.settings.seed}|${Date.now()}`));
    const bag = ['card', 'card', 'en2cn', 'cn2en', 'spell'];
    const seq = [];
    while (seq.length < n) seq.push(...shuffle(bag, rng));
    if (seq[0] !== 'card') {
      const firstCard = seq.indexOf('card');
      if (firstCard > 0) [seq[0], seq[firstCard]] = [seq[firstCard], seq[0]];
    }
    return seq.slice(0, n);
  }

  function buildQueue(mode, size) {
    const rng = mulberry32((Number(store.settings.seed) ^ Date.now()) >>> 0);
    const now = Date.now();
    const fresh = [];
    const due = [];
    const weak = [];
    const learning = [];
    const mastered = [];

    for (const w of WORDS) {
      const p = pOf(w.id);
      if (!p || !p.seen) {
        fresh.push(w);
      } else if (p.box >= 4) {
        mastered.push(w);
      } else {
        learning.push(w);
        if (hasMistake(p)) weak.push(w);
        if ((p.due || 0) <= now) due.push(w);
      }
    }

    if (mode === 'review') {
      weak.sort((a, b) => {
        const pa = pOf(a.id);
        const pb = pOf(b.id);
        return ((pb.wrong || 0) * 2 + (pb.fuzzy || 0)) - ((pa.wrong || 0) * 2 + (pa.fuzzy || 0));
      });
      return weak.slice(0, size).map(w => w.id);
    }

    if (mode === 'new') {
      return shuffle(fresh, rng).slice(0, size).map(w => w.id);
    }

    if (mode === 'random') {
      return shuffle(WORDS, rng).slice(0, size).map(w => w.id);
    }

    const out = [];
    const seen = new Set();
    const push = list => {
      for (const w of shuffle(list, rng)) {
        if (out.length >= size) break;
        if (!seen.has(w.id)) {
          seen.add(w.id);
          out.push(w.id);
        }
      }
    };

    push(due);
    push(weak);
    push(fresh);
    push(learning);
    push(mastered);

    if (out.length < size) {
      for (const w of shuffle(WORDS, rng)) {
        if (out.length >= size) break;
        if (!seen.has(w.id)) {
          seen.add(w.id);
          out.push(w.id);
        }
      }
    }
    return out;
  }

  function createSession(mode, opts = {}) {
    const size = opts.ids ? opts.ids.length : (opts.size || store.settings.dailyGoal);
    const practice = PRACTICE_KEYS.includes(opts.practice) ? opts.practice : store.settings.studyMode;
    let ids;
    if (opts.ids) {
      ids = opts.ids.filter(id => byId.has(id));
    } else {
      ids = buildQueue(mode, size);
    }
    if (!ids.length) return false;
    const formats = formatSequence(practice, ids.length);
    const sessionSeed = Date.now();
    const questions = ids.map((id, i) => makeQuestion(id, formats[i], sessionSeed));
    session = {
      mode,
      practice,
      queue: ids,
      questions,
      index: 0,
      revealed: false,
      answered: false,
      selected: null,
      correct: null,
      results: [],
      startedAt: Date.now(),
      animating: false
    };
    return true;
  }

  function startSession(mode, opts = {}) {
    if (!createSession(mode, opts)) {
      showToast(mode === 'review' ? '还没有易错词，先去认识几个新词吧' : '暂时没有可学习的词');
      return;
    }
    if (routeName() !== 'study') go('#/study');
    else render();
  }

  function exitStudy() {
    session = null;
    go('#/home');
  }

  function modeLabel(mode) {
    return {
      daily: '今日学习',
      review: '错词重练',
      new: '新词学习',
      random: '单词精学'
    }[mode] || '今日学习';
  }

  function applyRating(id, rating, format = 'card') {
    const p = store.progress[id] || { seen: 0, box: 0, correct: 0, wrong: 0, fuzzy: 0, last: 0, due: 0 };
    p.seen = (p.seen || 0) + 1;
    p.last = Date.now();
    if (rating === 'again') {
      p.box = 0;
      p.wrong = (p.wrong || 0) + 1;
      p.due = Date.now() + 10 * 60 * 1000;
    } else if (rating === 'hard') {
      p.box = Math.max(1, Math.min(p.box || 0, 2));
      p.fuzzy = (p.fuzzy || 0) + 1;
      p.due = Date.now() + 24 * 60 * 60 * 1000;
    } else {
      p.box = Math.min(5, (p.box || 0) + 1);
      p.correct = (p.correct || 0) + 1;
      const days = [0, 1, 3, 7, 14, 30][p.box] || 30;
      p.due = Date.now() + days * 24 * 60 * 60 * 1000;
    }
    store.progress[id] = p;

    const k = todayKey();
    const log = store.log[k] || { studied: 0, correct: 0, wrong: 0, fuzzy: 0 };
    log.studied++;
    if (rating === 'again') log.wrong++;
    else if (rating === 'hard') log.fuzzy++;
    else log.correct++;
    log.formats = log.formats || {};
    log.formats[format] = (log.formats[format] || 0) + 1;
    store.log[k] = log;
    save();
  }

  function rate(rating) {
    if (!session || session.animating) return;
    const current = currentQuestion();
    if (!current || current.format !== 'card') return;
    if (session.index >= session.queue.length) return;
    if (!session.revealed) {
      session.revealed = true;
      paintStudy();
      return;
    }
    const id = session.queue[session.index];
    applyRating(id, rating, 'card');
    session.results.push({ id, rating, format: 'card' });
    session.animating = true;
    updateSidebar();

    const card = document.getElementById('flashCard');
    if (card) card.classList.add(`leaving-${rating}`);
    if (rating === 'again') showToast('已收进易错本，稍后再见');
    const bubbleKind = rating === 'good' ? 'good' : 'cheer';
    setTimeout(() => showBubble(bubbleKind), 150);

    setTimeout(() => {
      session.index++;
      session.revealed = false;
      session.animating = false;
      paintStudy();
    }, 220);
  }

  function currentQuestion() {
    return session?.questions?.[session.index] || null;
  }

  function finishAnswer(correct, selected = null) {
    if (!session || session.answered) return;
    const q = currentQuestion();
    if (!q || q.format === 'card') return;
    session.answered = true;
    session.selected = selected;
    session.correct = !!correct;
    const rating = correct ? 'good' : 'again';
    applyRating(q.id, rating, q.format);
    session.results.push({ id: q.id, rating, format: q.format });
    updateSidebar();
    if (!correct) showToast('已收进易错本，稍后再见');
    paintStudy();
    setTimeout(() => showBubble(correct ? 'good' : 'cheer'), 110);
  }

  function answerOption(index) {
    if (!session || session.answered) return;
    const q = currentQuestion();
    if (!q || !q.options) return;
    finishAnswer(index === q.answerIndex, index);
  }

  function submitSpelling() {
    if (!session || session.answered) return;
    const q = currentQuestion();
    if (!q || q.format !== 'spell') return;
    const input = document.getElementById('spellInput');
    if (!input) return;
    const value = normalizeAnswer(input.value);
    if (!value) {
      showToast('先写下你记得的拼写');
      input.focus();
      return;
    }
    finishAnswer(q.accepted.includes(value), input.value);
  }

  function nextQuestion() {
    if (!session) return;
    session.index++;
    session.revealed = false;
    session.answered = false;
    session.selected = null;
    session.correct = null;
    session.animating = false;
    paintStudy();
  }

  /* ---------------- study view ---------------- */

  function studyBody() {
    if (!session) {
      if (!createSession('daily')) {
        return `<div class="study-shell"><div class="empty-state"><div class="empty-art">${ico('check')}</div><h3>词库已经被你走完了</h3><p>所有词都留下了学习记录。可以去易错本再温习一遍，或者把今天的节奏放慢一点。</p><a class="btn btn-primary" href="#/review">去易错本</a></div></div>`;
      }
    }

    if (session.index >= session.queue.length) return summaryHTML();

    const id = session.queue[session.index];
    const w = byId.get(id);
    if (!w) {
      session.index++;
      return studyBody();
    }

    const p = pOf(id);
    const sizeCls = wordSizeClass(w.word);
    const pct = session.queue.length ? ((session.index) / session.queue.length) * 100 : 0;
    const seenLabel = p && p.seen ? `第 ${p.seen + 1} 次见面` : '第一次见面';
    const q = currentQuestion() || { id, format: 'card' };
    const isCard = q.format === 'card';
    const answered = !!session.answered;
    const correct = !!session.correct;
    const selected = session.selected;

    let body = '';
    let foot = '';

    if (isCard) {
      const mainMeanings = w.meanings.slice(0, 4);
      const extraMeanings = w.meanings.slice(4);
      body = `
        <div class="flash-stage">
          <article class="flash-card ${session.revealed ? 'revealed' : ''}" id="flashCard" data-action="reveal" tabindex="0" role="button" aria-label="查看 ${esc(w.word)} 的释义">
            <div class="flash-top">
              <span class="tag accent">卡片回想</span>
              <span class="flash-index">${seenLabel} · ${String(session.index + 1).padStart(2, '0')}</span>
            </div>
            <div class="flash-main">
              <div class="flash-word ${sizeCls}">${esc(w.word)}</div>
              <div class="flash-phon"><span>${esc(w.phonetic || '')}</span></div>
            </div>
            <div class="flash-reveal">
              ${session.revealed ? `
                <div class="meaning-list">${mainMeanings.map(m => `<div class="meaning-line"><span class="pos ${m.pos ? '' : 'pos-empty'}">${esc(m.pos || '释')}</span><span>${esc(m.text)}</span></div>`).join('')}</div>
                ${extraMeanings.length ? `<details class="definition-box"><summary>更多释义 · ${extraMeanings.length} 条 ${ico('chevron', 'icon-sm')}</summary><div class="meaning-list" style="margin-top:10px">${extraMeanings.map(m => `<div class="meaning-line"><span class="pos ${m.pos ? '' : 'pos-empty'}">${esc(m.pos || '释')}</span><span>${esc(m.text)}</span></div>`).join('')}</div></details>` : ''}
                ${w.definition ? `<details class="definition-box"><summary>英文释义 ${ico('chevron', 'icon-sm')}</summary><p>${esc(w.definition)}</p></details>` : ''}
              ` : `
                <div class="reveal-hint"><span class="hint-ring">${ico('eye', 'icon-sm')}</span>释义藏在卡片这一面<br>点击卡片，或按空格翻开</div>
              `}
            </div>
            <div class="flash-note">
              <span>${ico('leaf', 'icon-sm')} ${session.revealed ? '回想一下，继续下一个' : '先回想，再翻开'}</span>
              <span>词库 ${num(counts().total)} 词</span>
            </div>
          </article>
        </div>
        <div class="rating-row">
          <button class="rate-btn rate-again" data-rate="again" ${session.revealed ? '' : 'disabled'}><span>不认识</span><kbd>1</kbd></button>
          <button class="rate-btn rate-hard" data-rate="hard" ${session.revealed ? '' : 'disabled'}><span>有点模糊</span><kbd>2</kbd></button>
          <button class="rate-btn rate-good" data-rate="good" ${session.revealed ? '' : 'disabled'}><span>认识</span><kbd>3</kbd></button>
        </div>`;
      foot = `<span><kbd>Space</kbd> ${session.revealed ? '继续' : '翻开释义'}</span><span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> 选择熟悉度</span><span><kbd>Esc</kbd> 结束本组</span>`;
    } else {
      const meta = practiceMeta(q.format);
      let prompt = '';
      if (q.format === 'en2cn') {
        prompt = `<div class="quiz-prompt">
          <div class="quiz-word ${sizeCls}">${esc(w.word)}</div>
          <div class="quiz-phon"><span>${esc(w.phonetic || '')}</span></div>
          <p class="quiz-instruction">选出最接近的中文释义</p>
        </div>`;
      } else if (q.format === 'cn2en') {
        prompt = `<div class="quiz-prompt">
          <div class="quiz-cn">${esc(q.prompt)}</div>
          <p class="quiz-instruction">选出对应的英文单词</p>
        </div>`;
      } else {
        prompt = `<div class="quiz-prompt">
          <div class="quiz-cn">${esc(q.prompt)}</div>
          <div class="quiz-hint">${esc(q.phonetic)} · ${esc(q.hint)}</div>
          <form class="spell-form" id="spellForm">
            <input id="spellInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="输入完整单词" ${answered ? 'disabled' : ''}>
            <button type="submit" ${answered ? 'disabled' : ''} aria-label="检查拼写">${ico('check', 'icon-sm')}</button>
          </form>
        </div>`;
      }

      const options = q.options ? `<div class="option-grid">${q.options.map((o, i) => {
        let state = '';
        if (answered) {
          if (o.correct) state = 'correct';
          else if (i === selected) state = 'wrong';
          else state = 'dimmed';
        }
        return `<button class="option opt-${'abcd'[i]} ${state}" data-option="${i}" ${answered ? 'disabled' : ''}>
          <span class="option-motes" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          <span class="option-key">${'ABCD'[i]}</span>
          <span class="option-text">${esc(o.text)}</span>
          ${answered && o.correct ? `<span class="option-mark">${ico('check', 'icon-sm')}</span>` : ''}
          ${answered && i === selected && !o.correct ? `<span class="option-mark">${ico('x', 'icon-sm')}</span>` : ''}
        </button>`;
      }).join('')}</div>` : '';

      const feedback = answered ? `<div class="quiz-feedback ${correct ? 'good' : 'bad'}">
        <span class="feedback-mark">${ico(correct ? 'check' : 'x')}</span>
        <div class="feedback-copy">
          <b>${correct ? '答对了，记忆又深了一点' : '这次没选对，再记一遍'}</b>
          <p class="feedback-word">${esc(w.word)} <span>${esc(w.phonetic || '')}</span></p>
          <p class="feedback-meaning">${esc(meaningPreview(w))}</p>
        </div>
      </div>` : '';

      body = `<div class="quiz-stage">
        <article class="quiz-card">
          <div class="quiz-top">
            <span class="tag accent">${esc(meta.short)}</span>
            <span class="flash-index">${seenLabel} · ${String(session.index + 1).padStart(2, '0')}</span>
          </div>
          ${prompt}
          ${options}
          ${feedback}
          ${answered ? `<div class="quiz-next-row"><button class="btn btn-primary quiz-next" data-action="next-question">${session.index + 1 >= session.queue.length ? '完成本组' : '下一题'} ${ico('arrowRight', 'icon-sm')}</button></div>` : ''}
          <div class="quiz-foot-note"><span>${ico('leaf', 'icon-sm')} ${meta.label}</span><span>选一个，看看记住了没有</span></div>
        </article>
      </div>`;
      foot = q.format === 'spell'
        ? `<span><kbd>Enter</kbd> 检查拼写</span><span><kbd>Esc</kbd> 结束本组</span>`
        : `<span><kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd> 选择答案</span><span><kbd>Esc</kbd> 结束本组</span>`;
    }

    return `
      <div class="study-shell rise">
        <div class="study-head">
          <button class="study-back" data-action="exit-study" aria-label="结束本组">${ico('arrowLeft', 'icon-sm')}</button>
          <span class="session-pill"><i></i>${modeLabel(session.mode)} · ${practiceMeta(session.practice).short}</span>
          <span class="study-count"><b>${String(session.index + 1).padStart(2, '0')}</b> / ${String(session.queue.length).padStart(2, '0')}</span>
        </div>
        <div class="study-line"><span style="width:${pct}%"></span></div>
        ${body}
        <div class="study-foot">${foot}</div>
      </div>`;
  }

  function summaryHTML() {
    if (!session) return studyBody();
    const total = session.results.length;
    const good = session.results.filter(r => r.rating === 'good').length;
    const hard = session.results.filter(r => r.rating === 'hard').length;
    const again = session.results.filter(r => r.rating === 'again').length;
    const pct = total ? Math.round((good / total) * 100) : 0;
    const words = session.results.slice(0, 10).map(r => {
      const w = byId.get(r.id);
      const color = r.rating === 'again' ? 'var(--accent)' : r.rating === 'hard' ? 'var(--gold)' : 'var(--sage-deep)';
      return `<span style="color:${color}" data-word-id="${esc(r.id)}">${esc(w.word)}</span>`;
    }).join('');
    return `
      <div class="summary-wrap rise">
        <div class="summary-card">
          <div class="eyebrow" style="justify-content:center">SESSION COMPLETE</div>
          <h2>这一组，收好啦。</h2>
          <p class="summary-sub">${total} 个词已记入你的学习轨迹。慢一点，也是在向前。</p>
          <div class="summary-ring"><div class="ring-wrap">${ringSVG(pct, 132, 8)}<div class="ring-text"><strong>${pct}%</strong><span>熟悉度</span></div></div></div>
          <div class="summary-stats">
            <div><b style="color:var(--sage-deep)">${good}</b><span>认识</span></div>
            <div><b style="color:var(--gold)">${hard}</b><span>模糊</span></div>
            <div><b style="color:var(--accent)">${again}</b><span>生词</span></div>
            <div><b>${pct}%</b><span>熟悉度</span></div>
          </div>
          ${words ? `<div class="summary-words">${words}</div>` : ''}
          <div class="summary-actions">
            <button class="btn btn-primary" data-action="next-session">再来一组 ${ico('arrowRight', 'icon-sm')}</button>
            <button class="btn btn-ghost" data-action="exit-study">回首页</button>
          </div>
        </div>
      </div>`;
  }

  function paintStudy() {
    const view = document.getElementById('view');
    if (!view) return;
    view.innerHTML = studyBody();
    updateSidebar();
    const q = currentQuestion();
    if (q && q.format === 'spell' && !session.answered) {
      setTimeout(() => document.getElementById('spellInput')?.focus(), 60);
    }
    if (q && q.format !== 'card' && session.answered) {
      setTimeout(() => document.querySelector('.quiz-next')?.focus({ preventScroll: true }), 60);
    }
  }

  /* ---------------- home ---------------- */

  function deckWord() {
    const order = shuffledWords();
    const fresh = order.find(w => statusOf(w.id) === 'new');
    if (fresh) return fresh;
    const weak = order.find(w => statusOf(w.id) === 'weak');
    return weak || order[0];
  }

  function homeHTML() {
    const c = counts();
    const ts = todayLog();
    const goal = store.settings.dailyGoal;
    const done = ts.studied;
    const goalPct = goal ? Math.min(100, (done / goal) * 100) : 0;
    const masteredPct = c.total ? Math.round((c.mastered / c.total) * 100) : 0;
    const deck = deckWord();
    const weak = weakWords().slice(0, 3);
    const recent = recentLearned(4);
    const due = dueCount();
    const reviewPlan = Math.min(goal, due + c.weak);
    const newPlan = Math.max(0, goal - reviewPlan);
    const goalDone = Math.min(done, goal);
    const planDonePct = goal ? Math.min(100, (goalDone / goal) * 100) : 0;
    const deckLong = wordSizeClass(deck.word) ? 'long' : '';
    const ctaLabel = done >= goal ? '再读一组' : done > 0 ? '继续读几个' : '开始今天的词';

    return `
      <div class="view-inner">
        <section class="hero rise">
          <div class="hero-copy">
            <div class="eyebrow">PXY · 专属四级小岛</div>
            <h1>PXY 专用<br><em>四级网站</em></h1>
            <p class="hero-lede">这是只给彭湘宜一个人开的词岛。<br>${num(c.total)} 个四级词，每天读几个；背不下来也没关系，明天再来。</p>
            <div class="hero-actions">
              <button class="btn btn-primary" data-action="start-daily">${ctaLabel} ${ico('arrowRight', 'icon-sm')}</button>
              <button class="btn btn-ghost" data-action="random-word">${ico('shuffle', 'icon-sm')} 随机抽一个词</button>
            </div>
            <div class="hero-meta">
              <span>${num(c.total)} 个词条</span><i></i>
              <span>已学 ${num(c.learned)}</span><i></i>
              <span>${num(due)} 个词待复习</span>
            </div>
          </div>
          <div class="hero-art">
            <div class="hero-blob"></div>
            <div class="hero-dots"></div>
            <div class="card-stack">
              <div class="deck-card" data-word-id="${esc(deck.id)}" role="button" tabindex="0" style="cursor:pointer" aria-label="查看 ${esc(deck.word)}">
                <div class="deck-top">
                  <span class="deck-label">A WORD FOR NOW</span>
                  <span class="deck-no">No. ${String(WORDS.indexOf(deck) + 1).padStart(4, '0')}</span>
                </div>
                <div class="deck-body">
                  <div class="deck-word ${deckLong}">${esc(deck.word)}</div>
                  <div class="deck-phon">${esc(deck.phonetic || '')}</div>
                  <div class="deck-rule"></div>
                  <div class="deck-meaning">${esc(meaningPreview(deck))}</div>
                </div>
                <div class="deck-actions"><span>不认识</span><span>模糊</span><span>认识</span></div>
              </div>
            </div>
            <div class="hero-stamp">PXY<br>专属</div>
          </div>
        </section>

        <section class="stat-strip rise rise-2" aria-label="学习概览">
          <div class="stat-cell">
            <div class="stat-label">Learned</div>
            <div class="stat-number">${num(c.learned)}<small>/ ${num(c.total)}</small></div>
            <div class="stat-note">已经打过照面的词</div>
          </div>
          <div class="stat-cell sage">
            <div class="stat-label">Mastered</div>
            <div class="stat-number">${num(c.mastered)}<small>词</small></div>
            <div class="stat-note">一次次回想，慢慢变熟</div>
          </div>
          <div class="stat-cell accent">
            <div class="stat-label">To Revisit</div>
            <div class="stat-number">${num(c.weak)}<small>词</small></div>
            <div class="stat-note">易错本里的老朋友</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">Fresh</div>
            <div class="stat-number">${num(c.fresh)}<small>词</small></div>
            <div class="stat-note">还没有遇见的词</div>
          </div>
        </section>

        <section class="dashboard-grid rise rise-3">
          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">${ico('chart', 'icon-sm')} 学习进度</div>
              <a class="panel-link" href="#/stats">查看数据 ${ico('chevron', 'icon-sm')}</a>
            </div>
            <div class="progress-layout">
              <div class="ring-wrap">
                ${ringSVG(masteredPct, 148, 9)}
                <div class="ring-text"><strong>${masteredPct}<i style="font-size:14px;font-style:normal">%</i></strong><span>已掌握</span></div>
              </div>
              <div class="legend">
                <div class="legend-row"><i></i><span>已掌握</span><b>${num(c.mastered)}</b></div>
                <div class="legend-row"><i></i><span>学习中</span><b>${num(c.learning)}</b></div>
                <div class="legend-row"><i></i><span>易错</span><b>${num(c.weak)}</b></div>
                <div class="legend-row"><i></i><span>未学</span><b>${num(c.fresh)}</b></div>
              </div>
            </div>
            <div class="progress-foot">
              <span>距离全部掌握还有 <b>${num(c.fresh + c.learning + c.weak)}</b> 个词</span>
              <span>${new Date().getFullYear()} · CET-4</span>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">${ico('target', 'icon-sm')} 今天，读几个</div>
              <div class="goal-switch" aria-label="每日目标">
                ${PRESET_GOALS.map(n => `<button class="${goal === n && !goalEditing ? 'active' : ''}" data-goal="${n}">${n}</button>`).join('')}
                <button class="${(!PRESET_GOALS.includes(goal) || goalEditing) ? 'active' : ''}" data-goal="custom">自定义</button>
              </div>
            </div>
            ${goalEditing ? `<form class="custom-goal" id="customGoalForm" novalidate>
              <span>每天</span>
              <input id="customGoalInput" type="number" min="1" max="${MAX_GOAL}" value="${goal}" inputmode="numeric" aria-label="自定义每日词数" title="1–${MAX_GOAL} 词">
              <span>词</span>
              <button type="submit">确定</button>
            </form>` : ''}
            <div class="plan-number">${goalDone}<span> / ${goal} 词</span></div>
            <div class="plan-track"><span style="width:${planDonePct}%"></span></div>
            <div class="plan-split">
              <div><span>待复习</span><b>${reviewPlan}</b></div>
              <div><span>今日新词</span><b>${newPlan}</b></div>
            </div>
            <div class="mode-row">
              <span class="mode-label">${ico('spark', 'icon-sm')} 练习形式</span>
              <div class="select-wrap">
                <select id="practiceSelect" aria-label="练习形式">
                  ${PRACTICE_MODES.map(m => `<option value="${m.key}" ${store.settings.studyMode === m.key ? 'selected' : ''}>${m.label}</option>`).join('')}
                </select>
              </div>
            </div>
            <button class="plan-cta" data-action="start-daily">${done >= goal ? '再读一组' : '开始这一组'} ${ico('arrowRight', 'icon-sm')}</button>
          </div>

          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">${ico('repeat', 'icon-sm')} 最近易错</div>
              <a class="panel-link" href="#/review">去易错本 ${ico('chevron', 'icon-sm')}</a>
            </div>
            ${weak.length ? `<div class="mistake-list">${weak.map(w => {
              const p = pOf(w.id);
              return `<div class="mistake-row" data-word-id="${esc(w.id)}">
                <div class="mistake-main">
                  <div class="mistake-word">${esc(w.word)}</div>
                  <div class="mistake-meaning">${esc(firstMeaning(w))}</div>
                </div>
                <span class="mistake-count">${(p.wrong || 0) + (p.fuzzy || 0)} 次</span>
              </div>`;
            }).join('')}</div>` : `<div class="empty-mini"><div class="empty-icon">${ico('leaf', 'icon-sm')}</div>还没有易错词。<br>先去认识几个新朋友吧。</div>`}
          </div>

          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">${ico('leaf', 'icon-sm')} 最近遇见</div>
              <a class="panel-link" href="#/library">去词库 ${ico('chevron', 'icon-sm')}</a>
            </div>
            ${recent.length ? `<div class="mistake-list">${recent.map(w => {
              const st = STATUS_META[statusOf(w.id)];
              return `<div class="mistake-row" data-word-id="${esc(w.id)}">
                <div class="mistake-main">
                  <div class="mistake-word">${esc(w.word)}</div>
                  <div class="mistake-meaning">${esc(firstMeaning(w))}</div>
                </div>
                <span class="status-pill ${st.cls}"><i></i>${st.label}</span>
              </div>`;
            }).join('')}</div>` : `<div class="empty-mini"><div class="empty-icon">${ico('leaf', 'icon-sm')}</div>还没有遇见的词。<br>读几个，就会留下痕迹。</div>`}
          </div>
        </section>
        <footer class="site-foot">
          <span>PXY 专用 · 写给彭湘宜的四级词岛</span>
          <span>四级词库 · ${num(c.total)} 个词条</span>
        </footer>
      </div>`;
  }

  /* ---------------- review ---------------- */

  function reviewRow(w, i) {
    const p = pOf(w.id);
    const st = STATUS_META[statusOf(w.id)];
    const errors = (p.wrong || 0) + (p.fuzzy || 0);
    return `<div class="word-row" data-word-id="${esc(w.id)}">
      <span class="row-index">${String(i + 1).padStart(2, '0')}</span>
      <div class="row-word"><b>${esc(w.word)}</b><span>${esc(w.phonetic || '')}</span></div>
      <div class="row-meaning">${esc(meaningPreview(w))}</div>
      <span class="status-pill ${st.cls}"><i></i>${st.label}</span>
      <button class="row-errors" data-practice="${esc(w.id)}" title="单独重练">${errors ? `<b>${errors}</b> 次` : '重练'}</button>
      <span class="row-chevron">${ico('chevron', 'icon-sm')}</span>
    </div>`;
  }

  function reviewHTML() {
    const weak = weakWords();
    const conquered = conqueredWords();
    const list = reviewTab === 'weak' ? weak : conquered;
    const chips = (weak.length ? weak.slice(0, 4) : [{ word: 'elusive' }, { word: 'ambiguous' }, { word: 'deteriorate' }, { word: 'reluctant' }]);
    return `
      <div class="view-inner">
        <section class="page-head rise">
          <div class="eyebrow">REVISIT THE HARD ONES</div>
          <h1>易错本</h1>
          <p>这里收着那些见过几次、却还没真正记住的词。把它们重新放回卡片里，多一次回想，就多一点把握。</p>
        </section>
        <section class="review-hero rise rise-2">
          <div class="review-hero-copy">
            <div class="eyebrow">A SECOND LOOK</div>
            <h2>${weak.length ? `还有 ${weak.length} 个词，等你再想一遍。` : '这一页，暂时很干净。'}</h2>
            <p>${weak.length ? '错词会按错误次数排好顺序，先重练最不熟的那几个。连续答对 4 次后，会移入「已攻克」。' : '继续学习新词，易错本会在需要的时候自动出现。连续答对 4 次后，词会移入「已攻克」。'}</p>
            <button class="btn" data-action="start-review" ${weak.length ? '' : 'disabled style="opacity:.45;cursor:not-allowed"'}>${ico('repeat', 'icon-sm')} ${weak.length ? '开始错词重练' : '暂无错词'}</button>
          </div>
          <div class="review-art" aria-hidden="true">
            ${chips.map(c => `<span class="review-chip">${esc(c.word)}</span>`).join('')}
          </div>
        </section>
        <section class="review-section rise rise-3">
          <div class="review-tabs">
            <button class="tab-btn ${reviewTab === 'weak' ? 'active' : ''}" data-tab="weak">待复习 · ${weak.length}</button>
            <button class="tab-btn ${reviewTab === 'conquered' ? 'active' : ''}" data-tab="conquered">已攻克 · ${conquered.length}</button>
          </div>
          ${list.length ? `<div class="word-list">${list.map((w, i) => reviewRow(w, i)).join('')}</div>` : `<div class="empty-state"><div class="empty-art">${ico(reviewTab === 'weak' ? 'leaf' : 'check')}</div><h3>${reviewTab === 'weak' ? '还没有需要重练的词' : '还没有攻克的错词'}</h3><p>${reviewTab === 'weak' ? '在背词时选择「不认识」或「有点模糊」，它们会自动来到这里。' : '把易错词重新练熟之后，它们会出现在这里。'}</p><a class="btn btn-ghost" href="#/study">去学一组词</a></div>`}
        </section>
      </div>`;
  }

  /* ---------------- library ---------------- */

  function filterWords() {
    const q = libraryState.query.trim().toLowerCase();
    let list = libraryState.sort === 'shuffle' ? shuffledWords() : WORDS.slice();

    if (libraryState.filter !== 'all') {
      list = list.filter(w => statusOf(w.id) === libraryState.filter);
    }

    if (q) {
      list = list.filter(w => {
        if (w.word.toLowerCase().includes(q) || w.id.includes(q)) return true;
        if (w.meanings.some(m => m.text.toLowerCase().includes(q))) return true;
        if (w.definition && w.definition.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    if (libraryState.sort === 'az') {
      list = list.slice().sort((a, b) => a.word.localeCompare(b.word, 'en'));
    } else if (libraryState.sort === 'weak') {
      list = list.slice().sort((a, b) => {
        const pa = pOf(a.id);
        const pb = pOf(b.id);
        return ((pb?.wrong || 0) + (pb?.fuzzy || 0)) - ((pa?.wrong || 0) + (pa?.fuzzy || 0));
      });
    } else if (libraryState.sort === 'recent') {
      list = list.slice().sort((a, b) => (pOf(b.id)?.last || 0) - (pOf(a.id)?.last || 0));
    }
    if (q) {
      const scoreOf = w => {
        const word = w.word.toLowerCase();
        if (word === q || w.id === q) return 0;
        if (word.startsWith(q)) return 1;
        if (word.includes(q)) return 2;
        if (w.meanings.some(m => m.text.toLowerCase().includes(q))) return 3;
        return 4;
      };
      list = list.slice().sort((a, b) => scoreOf(a) - scoreOf(b) || a.word.length - b.word.length);
    }
    return list;
  }

  function libraryRow(w, i) {
    const st = STATUS_META[statusOf(w.id)];
    const p = pOf(w.id);
    const errors = (p?.wrong || 0) + (p?.fuzzy || 0);
    return `<div class="word-row" data-word-id="${esc(w.id)}">
      <span class="row-index">${String(i + 1).padStart(2, '0')}</span>
      <div class="row-word"><b>${esc(w.word)}</b><span>${esc(w.phonetic || '')}</span></div>
      <div class="row-meaning">${esc(meaningPreview(w))}</div>
      <span class="status-pill ${st.cls}"><i></i>${st.label}</span>
      <span class="row-errors">${errors ? `<b>${errors}</b> 次错` : '—'}</span>
      <span class="row-chevron">${ico('chevron', 'icon-sm')}</span>
    </div>`;
  }

  function libraryResultsHTML() {
    const list = filterWords();
    const slice = list.slice(0, libraryState.limit);
    return `<div class="library-count">找到 <b>${num(list.length)}</b> 个词${libraryState.sort === 'shuffle' ? ' · 已为你打乱顺序' : ''}</div>
      ${slice.length ? `<div class="word-list">${slice.map((w, i) => libraryRow(w, i)).join('')}</div>` : `<div class="empty-state"><div class="empty-art">${ico('search')}</div><h3>没有找到这个词</h3><p>试试更短的拼写，或者直接搜索中文意思。比如「放弃」或「abandon」。</p><button class="btn btn-ghost" data-action="clear-search">清空搜索</button></div>`}
      ${slice.length < list.length ? `<div class="load-more"><button data-action="load-more">再看 ${Math.min(60, list.length - slice.length)} 个词</button></div>` : ''}`;
  }

  function libraryHTML() {
    const c = counts();
    const filters = [
      ['all', '全部'],
      ['new', '未学'],
      ['learning', '学习中'],
      ['mastered', '已掌握'],
      ['weak', '易错']
    ];
    return `
      <div class="view-inner">
        <section class="library-head rise">
          <div>
            <div class="eyebrow">THE WHOLE ISLAND</div>
            <h1>词库</h1>
            <p>${num(c.total)} 个词 · 已学 ${num(c.learned)} · 默认乱序，让每次遇见都不太一样。</p>
          </div>
        </section>
        <section class="rise rise-2">
          <div class="library-tools">
            <div class="search-box">
              ${ico('search', 'icon-sm')}
              <input id="librarySearch" type="search" autocomplete="off" spellcheck="false" placeholder="搜索单词或中文释义…" value="${esc(libraryState.query)}" aria-label="搜索词库">
              <button class="search-clear ${libraryState.query ? 'visible' : ''}" id="searchClear" data-action="clear-search" aria-label="清空搜索">${ico('x', 'icon-sm')}</button>
            </div>
          </div>
          <div class="toolbar-row">
            ${filters.map(([key, label]) => `<button class="filter-chip ${libraryState.filter === key ? 'active' : ''}" data-filter="${key}">${label}</button>`).join('')}
            <div class="toolbar-spacer"></div>
            <div class="select-wrap">
              <select id="sortSelect" aria-label="排序方式">
                <option value="shuffle" ${libraryState.sort === 'shuffle' ? 'selected' : ''}>随机乱序</option>
                <option value="az" ${libraryState.sort === 'az' ? 'selected' : ''}>字母 A–Z</option>
                <option value="weak" ${libraryState.sort === 'weak' ? 'selected' : ''}>最易错</option>
                <option value="recent" ${libraryState.sort === 'recent' ? 'selected' : ''}>最近学习</option>
              </select>
            </div>
            <button class="shuffle-btn" data-action="shuffle">${ico('shuffle', 'icon-sm')} 换一批</button>
          </div>
        </section>
        <section id="libraryResults" class="rise rise-3" style="margin-top:8px">${libraryResultsHTML()}</section>
      </div>`;
  }

  function updateLibraryResults() {
    const el = document.getElementById('libraryResults');
    if (el) el.innerHTML = libraryResultsHTML();
  }

  /* ---------------- stats ---------------- */

  function statsHTML() {
    const c = counts();
    const weak = weakWords();
    const due = dueCount();
    const recent = recentLearned(6);
    const fmt = formatStats();
    const total = c.total || 1;
    const mPct = (c.mastered / total) * 100;
    const lPct = (c.learning / total) * 100;
    const wPct = (c.weak / total) * 100;
    const donut = `conic-gradient(var(--ink) 0 ${mPct}%, var(--sage) ${mPct}% ${mPct + lPct}%, var(--accent) ${mPct + lPct}% ${mPct + lPct + wPct}%, var(--surface-3) ${mPct + lPct + wPct}% 100%)`;
    return `
      <div class="view-inner">
        <section class="page-head rise">
          <div class="eyebrow">THE SHAPE OF MEMORY</div>
          <h1>学习数据</h1>
          <p>不数天数，也不记连续。只看哪些词已经相熟，哪些还在等你。</p>
        </section>
        <section class="stats-grid rise rise-2">
          <div class="stat-card"><span>Encountered</span><b>${num(c.learned)}</b><i>已经打过照面的词</i></div>
          <div class="stat-card"><span>Familiar</span><b>${num(c.mastered)}</b><i>${Math.round(mPct)}% 已经慢慢相熟</i></div>
          <div class="stat-card"><span>Echoing</span><b>${num(c.weak)}</b><i>${due ? `${num(due)} 个词到了复习的时候` : '还会想起来的词'}</i></div>
          <div class="stat-card"><span>Unopened</span><b>${num(c.fresh)}</b><i>还没有翻开的词</i></div>
        </section>
        <section class="stats-main rise rise-3">
          <div class="panel">
            <div class="panel-head"><div class="panel-title">${ico('target', 'icon-sm')} 熟悉的光谱</div><span style="font-size:9px;color:var(--faint)">共 ${num(c.total)} 词</span></div>
            <div class="donut-layout">
              <div class="donut" style="background:${donut}"><div class="donut-center"><b>${Math.round(mPct)}%</b><span>已相熟</span></div></div>
              <div class="dist-legend">
                <div class="dist-row"><i></i><span>已相熟</span><b>${num(c.mastered)}</b></div>
                <div class="dist-row"><i></i><span>正在熟悉</span><b>${num(c.learning)}</b></div>
                <div class="dist-row"><i></i><span>常想起</span><b>${num(c.weak)}</b></div>
                <div class="dist-row"><i></i><span>未见</span><b>${num(c.fresh)}</b></div>
              </div>
            </div>
            <div class="progress-foot"><span>已遇见 ${num(c.learned)} 词</span><span>还有 ${num(c.fresh)} 个词没见过</span></div>
          </div>
          <div class="panel">
            <div class="panel-head"><div class="panel-title">${ico('spark', 'icon-sm')} 你习惯怎么记</div><span style="font-size:9px;color:var(--faint)">${fmt.total ? `${num(fmt.total)} 次作答` : '还没有记录'}</span></div>
            ${fmt.total ? `<div class="format-list">${fmt.items.map(item => `
              <div class="format-row" data-format="${item.key}">
                <span class="format-name">${item.label}</span>
                <div class="format-track"><span style="width:${item.pct}%"></span></div>
                <b>${item.pct}%</b>
              </div>`).join('')}</div>
              <div class="format-note">没有标准答案，顺手就好。</div>` : `<div class="empty-mini"><div class="empty-icon">${ico('spark', 'icon-sm')}</div>做一组练习后，<br>这里会留下你的偏好。</div>`}
          </div>
          <div class="panel">
            <div class="panel-head"><div class="panel-title">${ico('leaf', 'icon-sm')} 最近翻过</div><span style="font-size:9px;color:var(--faint)">最近翻过的词</span></div>
            ${recent.length ? `<div class="mistake-list">${recent.map(w => {
              const st = STATUS_META[statusOf(w.id)];
              return `<div class="mistake-row" data-word-id="${esc(w.id)}">
                <div class="mistake-main">
                  <div class="mistake-word">${esc(w.word)}</div>
                  <div class="mistake-meaning">${esc(firstMeaning(w))}</div>
                </div>
                <span class="status-pill ${st.cls}"><i></i>${st.label}</span>
              </div>`;
            }).join('')}</div>` : `<div class="empty-mini"><div class="empty-icon">${ico('leaf', 'icon-sm')}</div>还没有遇见的词。<br>读几个，就会留下痕迹。</div>`}
          </div>
          <div class="panel">
            <div class="panel-head"><div class="panel-title">${ico('flame', 'icon-sm')} 最难记的词</div><a class="panel-link" href="#/review">去重练 ${ico('chevron', 'icon-sm')}</a></div>
            ${weak.length ? `<div class="hard-list">${weak.slice(0, 8).map((w, i) => {
              const p = pOf(w.id);
              return `<div class="hard-row" data-word-id="${esc(w.id)}"><span class="hard-rank">${String(i + 1).padStart(2, '0')}</span><b>${esc(w.word)}</b><span>${(p.wrong || 0) + (p.fuzzy || 0)} 次</span></div>`;
            }).join('')}</div>` : `<div class="empty-mini"><div class="empty-icon">${ico('leaf', 'icon-sm')}</div>还没有易错记录，继续慢慢学。</div>`}
          </div>
        </section>
      </div>`;
  }

  /* ---------------- modal & palette ---------------- */

  function openWord(id) {
    const w = byId.get(id);
    if (!w) return;
    addRecent(id);
    const p = pOf(id);
    const st = STATUS_META[statusOf(id)];
    const errors = (p?.wrong || 0) + (p?.fuzzy || 0);
    modalOpen = true;
    modalRoot.innerHTML = `
      <div class="modal-overlay" data-modal-overlay>
        <article class="word-modal" role="dialog" aria-modal="true" aria-label="${esc(w.word)} 的释义">
          <button class="modal-close" data-modal-close aria-label="关闭">${ico('x', 'icon-sm')}</button>
          <div class="tag accent" style="display:inline-flex">CET-4 · ${st.label}</div>
          <div class="modal-word ${wordSizeClass(w.word)}">${esc(w.word)}</div>
          <div class="modal-phon"><span>${esc(w.phonetic || '')}</span></div>
          ${w.tags.filter(t => t !== 'CET-4').length ? `<div class="modal-tags">${w.tags.filter(t => t !== 'CET-4').map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
          <div class="modal-section">
            <div class="modal-section-label">释义</div>
            <div class="modal-meanings">${w.meanings.map(m => `<div class="modal-meaning"><span class="pos ${m.pos ? '' : 'pos-empty'}">${esc(m.pos || '释')}</span><span>${esc(m.text)}</span></div>`).join('')}</div>
          </div>
          ${w.definition ? `<div class="modal-section"><div class="modal-section-label">English Definition</div><p class="modal-def">${esc(w.definition)}</p></div>` : ''}
          <div class="modal-actions">
            <button class="btn btn-primary" data-modal-learn="${esc(w.id)}">${ico('bookOpen', 'icon-sm')} 学这个词</button>
            <button class="btn btn-ghost" data-modal-weak="${esc(w.id)}">${ico('repeat', 'icon-sm')} 加入易错本</button>
          </div>
          <div class="modal-meta"><span>CET-4 · 词库第 ${w.order} 词</span><span>${errors ? `已错 ${errors} 次` : '还没有错误记录'}</span></div>
        </article>
      </div>`;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOpen = false;
    modalRoot.innerHTML = '';
    document.body.style.overflow = '';
  }

  function markWeak(id) {
    const p = store.progress[id] || { seen: 0, box: 0, correct: 0, wrong: 0, fuzzy: 0, last: 0, due: 0 };
    p.seen = Math.max(1, p.seen || 0);
    p.box = 0;
    p.wrong = (p.wrong || 0) + 1;
    p.due = Date.now();
    p.last = Date.now();
    store.progress[id] = p;
    save();
    closeModal();
    showToast('已加入易错本');
    if (routeName() === 'home' || routeName() === 'review' || routeName() === 'stats') render();
  }

  function searchWords(query, limit = 8) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits = [];
    for (const w of WORDS) {
      const word = w.word.toLowerCase();
      let score = 5;
      if (word === q || w.id === q) score = 0;
      else if (word.startsWith(q)) score = 1;
      else if (word.includes(q)) score = 2;
      else if (w.meanings.some(m => m.text.toLowerCase().includes(q))) score = 3;
      else if (w.definition && w.definition.toLowerCase().includes(q)) score = 4;
      if (score < 5) hits.push({ w, score });
    }
    hits.sort((a, b) => a.score - b.score || a.w.word.length - b.w.word.length);
    return hits.slice(0, limit).map(x => x.w);
  }

  function paletteItemsHTML(items, activeIndex, emptyQuery) {
    if (!items.length) {
      return `<div class="palette-empty">${emptyQuery ? '输入英文单词或中文释义开始查找' : '没有找到匹配的词，换个拼写试试'}</div>`;
    }
    return `<div class="palette-label">${emptyQuery ? '随手看看' : '搜索结果'}</div>` + items.map((w, i) => `
      <div class="palette-item ${i === activeIndex ? 'active' : ''}" data-palette-id="${esc(w.id)}">
        <span class="pi-word">${esc(w.word)}</span>
        <span class="pi-phon">${esc(w.phonetic || '')}</span>
        <span class="pi-meaning">${esc(meaningPreview(w))}</span>
      </div>`).join('');
  }

  function openPalette(initial = '') {
    if (modalOpen) closeModal();
    closePalette();
    paletteState.open = true;
    paletteState.index = 0;
    paletteState.items = initial ? searchWords(initial, 8) : (store.recent.length ? store.recent.map(id => byId.get(id)).filter(Boolean).slice(0, 8) : shuffledWords().slice(0, 8));
    modalRoot.innerHTML = `
      <div class="palette-overlay" data-palette-overlay>
        <div class="palette" role="dialog" aria-modal="true" aria-label="搜索词库">
          <div class="palette-input">
            ${ico('search')}
            <input id="paletteInput" type="text" autocomplete="off" spellcheck="false" placeholder="搜索单词或中文释义…" value="${esc(initial)}" aria-label="搜索词库">
            <kbd>ESC</kbd>
          </div>
          <div class="palette-results" id="paletteResults">${paletteItemsHTML(paletteState.items, 0, !initial)}</div>
          <div class="palette-foot">
            <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span><kbd>Enter</kbd> 查看</span>
            <span><kbd>Esc</kbd> 关闭</span>
          </div>
        </div>
      </div>`;
    const input = document.getElementById('paletteInput');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      const refreshPalette = () => {
        const q = input.value;
        paletteState.index = 0;
        paletteState.items = q.trim() ? searchWords(q, 8) : (store.recent.length ? store.recent.map(id => byId.get(id)).filter(Boolean).slice(0, 8) : shuffledWords().slice(0, 8));
        const results = document.getElementById('paletteResults');
        if (results) results.innerHTML = paletteItemsHTML(paletteState.items, 0, !q.trim());
      };
      input.oninput = refreshPalette;
      input.addEventListener('input', refreshPalette);
    }
    document.body.style.overflow = 'hidden';
  }

  function closePalette() {
    if (!paletteState.open) return;
    paletteState.open = false;
    modalRoot.innerHTML = '';
    document.body.style.overflow = '';
  }

  function paletteMove(delta) {
    if (!paletteState.items.length) return;
    paletteState.index = (paletteState.index + delta + paletteState.items.length) % paletteState.items.length;
    const results = document.getElementById('paletteResults');
    if (results) {
      results.innerHTML = paletteItemsHTML(paletteState.items, paletteState.index, !document.getElementById('paletteInput')?.value.trim());
      const active = results.querySelector('.palette-item.active');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }
  }

  function paletteChoose() {
    const w = paletteState.items[paletteState.index];
    if (!w) return;
    closePalette();
    openWord(w.id);
  }

  /* ---------------- render ---------------- */

  function render() {
    const route = routeName();
    const routeChanged = route !== lastRoute;
    const previousRoute = lastRoute;
    const previousScroller = document.querySelector('.main-wrap');
    if (routeChanged && previousRoute && previousScroller) {
      scrollPositions[previousRoute] = previousScroller.scrollTop;
    }
    if (route !== 'home') goalEditing = false;
    if (routeChanged) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      lastRoute = route;
    }
    let content;
    if (route === 'study') content = studyBody();
    else if (route === 'library') content = libraryHTML();
    else if (route === 'review') content = reviewHTML();
    else if (route === 'stats') content = statsHTML();
    else content = homeHTML();
    document.documentElement.dataset.theme = store.settings.theme;
    document.body.dataset.route = route;
    app.innerHTML = shell(route, content);
    if (routeChanged) {
      document.getElementById('view')?.classList.add('route-enter');
      const scroller = document.querySelector('.main-wrap');
      if (scroller) {
        const target = route === 'study' ? 0 : (scrollPositions[route] || 0);
        requestAnimationFrame(() => {
          scroller.scrollTop = target;
        });
      }
    }
    if (route === 'home') bindHome();
    if (route === 'library') bindLibrary();
  }

  function bindHome() {
    const form = document.getElementById('customGoalForm');
    if (form) {
      const input = document.getElementById('customGoalInput');
      form.addEventListener('submit', event => {
        event.preventDefault();
        const value = Math.round(Number(input?.value));
        if (!Number.isFinite(value) || value < 1) {
          showToast(`请输入 1–${MAX_GOAL} 之间的数字`);
          input?.focus();
          return;
        }
        store.settings.dailyGoal = clamp(value, 1, MAX_GOAL);
        goalEditing = false;
        save();
        render();
        showToast(`每日目标：${store.settings.dailyGoal} 词`);
      });
      setTimeout(() => input?.focus(), 40);
    }
    const select = document.getElementById('practiceSelect');
    if (select) {
      select.addEventListener('change', () => {
        if (PRACTICE_KEYS.includes(select.value)) {
          store.settings.studyMode = select.value;
          save();
        }
      });
    }
  }

  function bindLibrary() {
    const input = document.getElementById('librarySearch');
    const clear = document.getElementById('searchClear');
    const select = document.getElementById('sortSelect');
    if (input) {
      input.addEventListener('input', () => {
        libraryState.query = input.value;
        libraryState.limit = 60;
        if (clear) clear.classList.toggle('visible', !!input.value);
        updateLibraryResults();
      });
    }
    if (select) {
      select.addEventListener('change', () => {
        libraryState.sort = select.value;
        libraryState.limit = 60;
        updateLibraryResults();
      });
    }
  }

  /* ---------------- events ---------------- */

  app.addEventListener('click', event => {
    const optionEl = event.target.closest('[data-option]');
    if (optionEl) {
      event.preventDefault();
      answerOption(Number(optionEl.dataset.option));
      return;
    }
    const rateEl = event.target.closest('[data-rate]');
    if (rateEl) {
      event.preventDefault();
      rate(rateEl.dataset.rate);
      return;
    }
    const practiceEl = event.target.closest('[data-practice]');
    if (practiceEl) {
      event.preventDefault();
      event.stopPropagation();
      startSession('review', { ids: [practiceEl.dataset.practice] });
      return;
    }
    const goalEl = event.target.closest('[data-goal]');
    if (goalEl) {
      if (goalEl.dataset.goal === 'custom') {
        goalEditing = true;
        render();
        return;
      }
      const goal = Number(goalEl.dataset.goal);
      if (PRESET_GOALS.includes(goal)) {
        store.settings.dailyGoal = goal;
        goalEditing = false;
        save();
        render();
      }
      return;
    }
    const filterEl = event.target.closest('[data-filter]');
    if (filterEl) {
      libraryState.filter = filterEl.dataset.filter;
      libraryState.limit = 60;
      document.querySelectorAll('[data-filter]').forEach(el => el.classList.toggle('active', el === filterEl));
      updateLibraryResults();
      return;
    }
    const tabEl = event.target.closest('[data-tab]');
    if (tabEl) {
      reviewTab = tabEl.dataset.tab;
      render();
      return;
    }
    const actionEl = event.target.closest('[data-action]');
    if (actionEl) {
      const action = actionEl.dataset.action;
      if (action === 'start-daily') startSession('daily');
      else if (action === 'random-word') {
        const pool = shuffledWords();
        openWord(pool[Math.floor(Math.random() * pool.length)]?.id || WORDS[0].id);
      }
      else if (action === 'start-review') startSession('review', { size: 20 });
      else if (action === 'exit-study') exitStudy();
      else if (action === 'next-question') nextQuestion();
      else if (action === 'next-session') startSession(session?.mode === 'review' ? 'review' : 'daily', { size: session?.mode === 'review' ? 20 : store.settings.dailyGoal });
      else if (action === 'toggle-theme') {
        store.settings.theme = store.settings.theme === 'dark' ? 'light' : 'dark';
        save();
        render();
      } else if (action === 'open-palette') openPalette();
      else if (action === 'clear-search') {
        libraryState.query = '';
        libraryState.limit = 60;
        const input = document.getElementById('librarySearch');
        if (input) input.value = '';
        const clear = document.getElementById('searchClear');
        if (clear) clear.classList.remove('visible');
        updateLibraryResults();
        if (routeName() === 'library') document.getElementById('librarySearch')?.focus();
      } else if (action === 'shuffle') {
        reshuffle();
        libraryState.limit = 60;
        updateLibraryResults();
        showToast('已经换了一个顺序');
      } else if (action === 'load-more') {
        libraryState.limit += 60;
        updateLibraryResults();
      } else if (action === 'reveal') {
        if (session && !session.revealed) {
          session.revealed = true;
          paintStudy();
        }
      }
      return;
    }
    const wordEl = event.target.closest('[data-word-id]');
    if (wordEl) {
      openWord(wordEl.dataset.wordId);
    }
  });

  app.addEventListener('submit', event => {
    if (event.target.id === 'spellForm') {
      event.preventDefault();
      submitSpelling();
    }
  });

  app.addEventListener('keydown', event => {
    if (event.target.closest('input, textarea, select')) return;
    if (event.key === ' ' && event.target.closest('#flashCard') && session && !session.revealed) {
      event.preventDefault();
      session.revealed = true;
      paintStudy();
    }
  });

  modalRoot.addEventListener('click', event => {
    if (event.target.closest('[data-palette-id]')) {
      const id = event.target.closest('[data-palette-id]').dataset.paletteId;
      closePalette();
      openWord(id);
      return;
    }
    if (event.target.closest('[data-palette-close]') || (event.target.classList.contains('palette-overlay'))) {
      closePalette();
      return;
    }
    const learn = event.target.closest('[data-modal-learn]');
    if (learn) {
      const id = learn.dataset.modalLearn;
      closeModal();
      startSession('random', { ids: [id] });
      return;
    }
    const weak = event.target.closest('[data-modal-weak]');
    if (weak) {
      markWeak(weak.dataset.modalWeak);
      return;
    }
    if (event.target.closest('[data-modal-close]') || event.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (paletteState.open) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        paletteMove(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        paletteMove(-1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        paletteChoose();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closePalette();
      }
      return;
    }
    if (modalOpen) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      }
      return;
    }
    const typing = event.target.closest('input, textarea, select, [contenteditable="true"]');
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openPalette();
      return;
    }
    if (routeName() === 'study' && session) {
      const q = currentQuestion();
      if (event.key === 'Escape') {
        event.preventDefault();
        exitStudy();
      } else if (!q) {
        return;
      } else if (q.format === 'card') {
        if (event.key === ' ' && !typing) {
          if (event.target.closest('button')) return;
          event.preventDefault();
          if (!session.revealed) {
            session.revealed = true;
            paintStudy();
          }
        } else if (!typing && session.revealed && ['1', '2', '3'].includes(event.key)) {
          event.preventDefault();
          rate({ '1': 'again', '2': 'hard', '3': 'good' }[event.key]);
        }
      } else if (session.answered) {
        if (!typing && !event.target.closest('button, a') && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          nextQuestion();
        }
      } else if (q.format === 'spell') {
        if (!typing && event.key === 'Enter') {
          event.preventDefault();
          submitSpelling();
        }
      } else if (!typing) {
        const key = event.key.toLowerCase();
        const numeric = ['1', '2', '3', '4'].indexOf(key);
        const alpha = ['a', 'b', 'c', 'd'].indexOf(key);
        const optionIndex = numeric >= 0 ? numeric : alpha;
        if (optionIndex >= 0) {
          event.preventDefault();
          answerOption(optionIndex);
        }
      }
      return;
    }
    if (!typing && event.key === '/' && routeName() === 'library') {
      event.preventDefault();
      document.getElementById('librarySearch')?.focus();
    }
  });

  window.addEventListener('hashchange', () => {
    closePalette();
    closeModal();
    render();
  });

  initGrain();
  if (!location.hash) location.hash = '#/home';
  render();
})();
