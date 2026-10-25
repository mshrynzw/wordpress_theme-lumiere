/*
 * SAMPLE HAIR デザインモックアップ — 表示とインタラクション
 * 仮データ（sample-data.js）を各テンプレートの data-render 枠に流し込みます。
 * WordPress テーマ実装時はこのファイルをそのまま使わず、PHP テンプレートで作り直す前提です。
 */
(function () {
  'use strict';

  const D = window.LUMIERE_SAMPLE;
  const root = document.documentElement;
  const page = document.body.dataset.page;
  if (!D) return;

  /* ---------- 小さな道具 ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const snsIconFiles = {
    facebook: 'facebook-brands-solid-full.svg',
    instagram: 'instagram-brands-solid-full.svg',
    line: 'line-brands-solid-full.svg',
    pinterest: 'pinterest-brands-solid-full.svg',
    tiktok: 'tiktok-brands-solid-full.svg',
    threads: 'threads-brands-solid-full.svg',
    x: 'x-twitter-brands-solid-full.svg',
    youtube: 'youtube-brands-solid-full.svg'
  };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 保存できない環境では無視 */ } }
  };
  const params = new URLSearchParams(location.search);
  const fmtDate = (iso) => { const [y, m, d] = iso.split('-'); return `${y}年${Number(m)}月${Number(d)}日`; };
  const dateTag = (iso) => `<time datetime="${esc(iso)}">${fmtDate(iso)}</time>`;

  // 画像：幅・高さを持たせてレイアウトのずれを防ぎ、画面外は遅延読み込み。
  // 実装時は WordPress が生成する複数サイズを srcset に並べる想定（ここでは1サイズのみ）。
  function img(im, opt) {
    const o = Object.assign({ sizes: '100vw', eager: false, cls: '' }, opt);
    const load = o.eager ? 'fetchpriority="high"' : 'loading="lazy"';
    return `<img class="${o.cls}" src="${esc(im.src)}" srcset="${esc(im.src)} ${im.w}w" sizes="${o.sizes}" width="${im.w}" height="${im.h}" alt="${esc(im.alt)}" ${load} decoding="async">`;
  }
  const tags = (list, cls) => `<ul class="tags${cls ? ' ' + cls : ''}">${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

  /* ---------- 動きの設定 ---------- */
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionPref = store.get('mock-motion'); // 'off' | 'on' | null
  function motionOK() {
    if (root.classList.contains('reduce-motion')) return false;
    return !reduceQuery.matches;
  }
  if (motionPref === 'off') root.classList.add('reduce-motion');

  /* ---------- 共通パーツ ---------- */
  const currentNav = { 'news-detail': 'news', 'column-detail': 'column' }[page] || page;

  function header() {
    const items = D.nav.filter((n) => !n.footerOnly);
    const all = D.nav;
    const li = (n) => `<li><a href="${n.href}"${n.page === currentNav ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`;
    return `
      <div class="container header-inner">
        <a class="logo" href="index.html">
          <span class="logo-mark">${esc(D.site.name)}</span>
          <span class="logo-sub">${esc(D.site.nameJa)}</span>
        </a>
        <nav class="global-nav" aria-label="メインメニュー">
          <ul class="nav-wide">${items.map(li).join('')}</ul>
        </nav>
        <a class="btn btn-primary btn-small header-reserve" href="reserve.html">予約する</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="drawer">
          <span class="menu-toggle-bars" aria-hidden="true"></span><span class="menu-toggle-label">メニュー</span>
        </button>
      </div>
      <div class="drawer" id="drawer" hidden>
        <nav aria-label="メインメニュー（全ページ）">
          <ul>${all.map(li).join('')}</ul>
        </nav>
        <p class="drawer-tel">お電話：<span>${esc(D.site.tel)}</span></p>
      </div>`;
  }

  function footer() {
    const s = D.site;
    return `
      <div class="container footer-inner">
        <div class="footer-shop" data-edit="店舗情報">
          <p class="logo-mark">${esc(s.name)}</p>
          <p class="footer-tagline">${esc(s.tagline)}</p>
          <address>
            ${esc(s.postal)} ${esc(s.address)}<br>
            ${esc(s.station)}<br>
            電話 ${esc(s.tel)}
          </address>
          <p>${s.hours.map((h) => `${esc(h.label)} ${esc(h.value)}`).join('<br>')}<br>定休日 ${esc(s.closed)}</p>
        </div>
        <nav class="footer-nav" aria-label="フッターメニュー">
          <ul>${D.nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}</ul>
        </nav>
        <div class="footer-sns" data-edit="SNSリンク（任意）">
          <p class="footer-label">SNS</p>
          <ul>${s.sns.map((x) => {
            const iconFile = snsIconFiles[x.platform];
            const icon = iconFile ? `<img class="footer-sns-icon" src="assets/img/icon/${iconFile}" alt="" width="20" height="20" loading="lazy" decoding="async">` : '';
            return `<li><a href="#" data-placeholder-link><span class="footer-sns-profile">${icon}<span>${esc(x.label)}</span></span><span class="sub">${esc(x.handle)}</span></a></li>`;
          }).join('')}</ul>
        </div>
      </div>
      <div class="container footer-bottom">
        <p><span class="sample-badge">SAMPLE</span> このサイトはデザイン確認用のモックアップです。掲載内容はすべて架空のものです。</p>
        <p><small>${esc(s.copyright)}</small></p>
      </div>`;
  }

  function mobileCta() {
    const second = page === 'reserve'
      ? '<a class="btn btn-secondary" href="access.html">アクセス</a>'
      : '<a class="btn btn-primary" href="reserve.html">予約する</a>';
    const first = page === 'styles'
      ? '<a class="btn btn-secondary" href="menu.html">メニュー・料金</a>'
      : '<a class="btn btn-secondary" href="styles.html">スタイルを見る</a>';
    return first + second;
  }

  function breadcrumb(trail) {
    const items = [{ href: 'index.html', label: 'ホーム' }].concat(trail);
    return `<nav class="breadcrumb" aria-label="パンくずリスト"><ol>${items.map((it, i) =>
      i === items.length - 1 ? `<li><span aria-current="page">${esc(it.label)}</span></li>` : `<li><a href="${it.href}">${esc(it.label)}</a></li>`
    ).join('')}</ol></nav>`;
  }

  function pageHead() {
    const p = D.pages[page];
    if (!p) return '';
    return `<div class="container">
      ${breadcrumb([{ label: p.title }])}
      <h1 class="page-title">${esc(p.title)}</h1>
      ${p.lead ? `<p class="page-lead">${esc(p.lead)}</p>` : ''}
    </div>`;
  }

  function reserveCta() {
    return `<div class="container reserve-band-inner">
      <p class="eyebrow">Reserve</p>
      <h2 class="reserve-band-title">ご予約・ご相談</h2>
      <p>電話・予約サイト・LINEから受け付けています。<br>メニューが決まっていなくても大丈夫です。</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="reserve.html">予約方法を見る</a>
        <a class="btn btn-secondary" href="faq.html">よくある質問</a>
      </div>
    </div>`;
  }

  /* ---------- スタイルカード（ギャラリー・一覧共通） ---------- */
  function styleCard(s, opt) {
    const o = Object.assign({ sizes: '(min-width: 1100px) 260px, (min-width: 700px) 30vw, 46vw', heading: 'h3' }, opt);
    const H = o.heading;
    return `<article class="style-card">
      <div class="style-photo">${img(s.image, { sizes: o.sizes, cls: 'arch' })}</div>
      ${s.recommended ? '<p class="badge-reco">おすすめ</p>' : ''}
      <${H} class="style-name">${esc(s.name)}</${H}>
      <p class="style-text">${esc(s.text)}</p>
      <p class="style-meta">${esc(s.length)}／${s.menus.map(esc).join('・')}<span class="style-staff">担当 ${esc(s.staff)}</span></p>
    </article>`;
  }

  /* ---------- ホーム ---------- */
  const homeSections = {
    hero() {
      const h = D.home.hero;
      const slides = (Array.isArray(h.images) ? h.images : h.image ? [h.image] : []).filter((image) => image && image.src);
      const hasCarousel = slides.length > 1;
      const heroSlides = slides.map((image, index) => {
        const markup = img(image, {
          eager: index === 0,
          sizes: '(min-width: 900px) 54vw, 92vw',
          cls: `hero-slide${index === 0 ? ' is-active' : ''}`
        });
        return markup.replace('<img ', `<img data-hero-slide aria-hidden="${index === 0 ? 'false' : 'true'}" `);
      }).join('');
      const heroControls = hasCarousel ? `<div class="hero-carousel-controls">
        <button class="hero-carousel-toggle" type="button" data-hero-toggle aria-label="スライドショーを一時停止" aria-pressed="false">
          <span aria-hidden="true" data-hero-toggle-icon>Ⅱ</span>
        </button>
        <div class="hero-carousel-dots" role="group" aria-label="表示する写真を選択">
          ${slides.map((image, index) => `<button type="button" data-hero-slide-to="${index}" aria-label="写真${index + 1}を表示" aria-pressed="${index === 0 ? 'true' : 'false'}"></button>`).join('')}
        </div>
      </div>` : '';
      return `<section class="hero" aria-labelledby="hero-title" data-edit="ホーム：メイン画像・キャッチコピー">
        <div class="hero-shape" data-depth="0.08" aria-hidden="true"></div>
        <svg class="hero-flow" data-depth="0.9" viewBox="0 0 240 720" aria-hidden="true" focusable="false">
          <path d="M210 8C90 110 230 190 100 300C-10 400 210 450 80 580C-20 670 170 690 50 712" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <path d="M228 40C120 150 240 230 130 340C30 440 220 490 110 610C20 690 180 700 80 716" fill="none" stroke="currentColor" stroke-width=".8" opacity=".5"/>
        </svg>
        <div class="hero-frame">
          <p class="hero-kicker">Hair Salon</p>
          <div class="hero-layout">
            <h1 class="hero-copy" id="hero-title">${h.copy.map((l) => `<span>${esc(l)}</span>`).join('')}</h1>
            <div class="hero-photo arch"${hasCarousel ? ' data-hero-slideshow role="group" aria-roledescription="カルーセル" aria-label="ヘアスタイル写真"' : ''}>
              ${heroSlides}
              ${heroControls}
            </div>
            <div class="hero-sub">${img(h.subImage, { eager: true, sizes: '(min-width: 900px) 16vw, 0px', cls: 'soft' })}</div>
            <div class="hero-actions">
              <p class="hero-lead">${esc(h.lead)}</p>
              <div class="btn-row">
                <a class="btn btn-primary" href="styles.html">ヘアスタイルを見る</a>
                <a class="btn btn-secondary" href="reserve.html">予約する</a>
              </div>
            </div>
          </div>
        </div>
      </section>`;
    },
    intro() {
      const it = D.home.intro;
      return `<section class="section section-intro has-flow" aria-labelledby="intro-title" data-edit="ホーム：店舗の紹介">
        <div class="flow" aria-hidden="true"></div>
        <div class="container split">
          <div class="split-text reveal">
            <p class="eyebrow">About</p>
            <h2 class="section-title title-display" id="intro-title">${esc(it.title)}</h2>
            ${it.body.map((p) => `<p>${esc(p)}</p>`).join('')}
            <p><a class="text-link" href="about.html">美容院について</a></p>
          </div>
          <div class="split-media">${img(it.image, { sizes: '(min-width: 900px) 42vw, 100vw', cls: 'soft' })}</div>
        </div>
      </section>`;
    },
    styles() {
      const list = D.styles.slice().sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0)).slice(0, 8);
      return `<section class="section has-flow" aria-labelledby="home-styles-title" data-edit="ヘアスタイル（新着・おすすめ）">
        <div class="flow" aria-hidden="true"></div>
        <div class="container section-head reveal">
          <p class="eyebrow">Looks</p>
          <h2 class="section-title title-display" id="home-styles-title">ヘアスタイル</h2>
          <p>おすすめのスタイルから順に並べています。横にスクロールして見られます。</p>
        </div>
        ${gallery(list)}
        <div class="container center"><a class="btn btn-primary" href="styles.html">すべてのスタイルを見る</a></div>
      </section>`;
    },
    menu() {
      const popular = [];
      D.menu.forEach((c) => c.items.forEach((i) => { if (i.popular) popular.push(Object.assign({ category: c.category }, i)); }));
      return `<section class="section section-quiet" aria-labelledby="home-menu-title" data-edit="メニュー（人気メニュー）">
        <div class="container narrow">
          <div class="section-head reveal">
            <p class="eyebrow">Menu</p>
            <h2 class="section-title title-display" id="home-menu-title">人気のメニュー</h2>
            <p>料金はすべて表示例です。</p>
          </div>
          <ul class="price-list">${popular.map((i) => priceRow(i, true)).join('')}</ul>
          <p class="center"><a class="text-link" href="menu.html">メニュー・料金をすべて見る</a></p>
        </div>
      </section>`;
    },
    staff() {
      return `<section class="section section-cocoa has-flow" aria-labelledby="home-staff-title" data-edit="スタッフ">
        <div class="flow flow-light" aria-hidden="true"></div>
        <div class="container">
          <div class="section-head reveal">
            <p class="eyebrow">Staff</p>
            <h2 class="section-title title-display" id="home-staff-title">スタッフ</h2>
            <p>得意な施術はそれぞれ。指名なしでも大丈夫です。</p>
          </div>
          <ul class="staff-mini">${D.staff.map((s) => `<li>
            ${img(s.image, { sizes: '(min-width: 900px) 200px, 40vw', cls: 'round' })}
            <p class="staff-mini-name">${esc(s.name)}<span>${esc(s.role)}</span></p>
            <p class="staff-mini-skill">${s.skills.slice(0, 2).map(esc).join('・')}</p>
          </li>`).join('')}</ul>
          <p class="center"><a class="text-link" href="staff.html">スタッフ紹介を見る</a></p>
        </div>
      </section>`;
    },
    updates() {
      return `<section class="section" aria-label="お知らせとコラム">
        <div class="container updates">
          <div class="updates-news" data-edit="お知らせ（新着3件）">
            <h2 class="section-title">お知らせ</h2>
            <ul class="news-list">${D.news.slice(0, 3).map(newsRow).join('')}</ul>
            <p><a class="text-link" href="news.html">お知らせ一覧</a></p>
          </div>
          <div class="updates-column" data-edit="コラム（新着2件）">
            <h2 class="section-title">ヘアケア・美容コラム</h2>
            <div class="column-grid two">${D.columns.slice(0, 2).map((c) => columnCard(c, 'h3')).join('')}</div>
            <p><a class="text-link" href="column.html">コラム一覧</a></p>
          </div>
        </div>
      </section>`;
    },
    access() {
      const s = D.site;
      return `<section class="section section-linen has-flow" aria-labelledby="home-access-title" data-edit="店舗情報・アクセス">
        <div class="flow" aria-hidden="true"></div>
        <div class="container split">
          <div class="split-text">
            <p class="eyebrow">Visit</p>
            <h2 class="section-title title-display" id="home-access-title">アクセス</h2>
            <p>${esc(s.postal)} ${esc(s.address)}<br>${esc(s.station)}</p>
            ${hoursTable()}
            <p><a class="text-link" href="access.html">店舗情報・アクセスを見る</a></p>
          </div>
          <div class="split-media map-box">${img(D.access.mapImage, { sizes: '(min-width: 900px) 50vw, 100vw', cls: 'soft' })}</div>
        </div>
      </section>`;
    },
    reserve() {
      return `<section class="reserve-band has-flow" data-edit="予約導線"><div class="flow flow-light" aria-hidden="true"></div>${reserveCta()}</section>`;
    }
  };

  function gallery(list) {
    return `<div class="gallery reveal">
      <div class="gallery-track" tabindex="0" role="region" aria-label="スタイルギャラリー。左右の矢印キーまたはスクロールで移動できます">
        <ul class="gallery-list">${list.map((s, i) => `<li${i === 0 ? ' class="is-lead"' : ''}>${styleCard(s, { sizes: '(min-width: 900px) 40vw, 84vw' })}</li>`).join('')}</ul>
      </div>
      <div class="container gallery-controls">
        <button class="gallery-btn" type="button" data-dir="-1" aria-label="前のスタイルへ"><span aria-hidden="true">‹</span></button>
        <button class="gallery-btn" type="button" data-dir="1" aria-label="次のスタイルへ"><span aria-hidden="true">›</span></button>
      </div>
    </div>`;
  }

  function priceRow(i, showCat) {
    return `<li class="price-row">
      <div class="price-main">
        ${showCat ? `<span class="price-cat">${esc(i.category)}</span>` : ''}
        <p class="price-name">${esc(i.name)}${i.popular && !showCat ? ' <span class="badge-pop">人気</span>' : ''}</p>
        <p class="price-text">${esc(i.text)}</p>
      </div>
      <p class="price-value"><span class="price">${esc(i.price)}</span><span class="time">${esc(i.time)}</span></p>
    </li>`;
  }

  function hoursTable() {
    const s = D.site;
    return `<table class="hours">
      <caption class="visually-hidden">営業時間</caption>
      <tbody>
        ${s.hours.map((h) => `<tr><th scope="row">${esc(h.label)}</th><td>${esc(h.value)}</td></tr>`).join('')}
        <tr><th scope="row">定休日</th><td>${esc(s.closed)}</td></tr>
      </tbody>
    </table>`;
  }

  function newsRow(n) {
    return `<li><a class="news-row" href="news-detail.html?id=${n.id}">
      <span class="news-meta">${dateTag(n.date)}<span class="cat">${esc(n.category)}</span></span>
      <span class="news-title">${esc(n.title)}</span>
    </a></li>`;
  }

  function columnCard(c, H) {
    return `<article class="column-card">
      <a href="column-detail.html?id=${c.id}">
        ${img(c.image, { sizes: '(min-width: 900px) 33vw, 100vw', cls: 'soft' })}
        <p class="column-meta">${dateTag(c.date)}<span class="cat">${esc(c.category)}</span></p>
        <${H} class="column-title">${esc(c.title)}</${H}>
      </a>
      <p class="column-excerpt">${esc(c.excerpt)}</p>
    </article>`;
  }

  /* ---------- 下層ページ ---------- */
  const renderers = {
    header, footer, 'mobile-cta': mobileCta, 'page-head': pageHead, 'reserve-cta': reserveCta,

    'home-sections'() {
      return D.home.sections.filter((s) => s.visible && homeSections[s.id]).map((s) => homeSections[s.id]()).join('');
    },

    'styles-list'() {
      const f = D.styleFilters;
      const btn = (group, v, label) => `<button type="button" class="chip" data-group="${group}" data-value="${esc(v)}" aria-pressed="${v === '' ? 'true' : 'false'}">${esc(label)}</button>`;
      return `<div class="container">
        <div class="filters" role="group" aria-label="スタイルの絞り込み">
          <div class="filter-row"><p class="filter-label" id="f-menu">施術メニュー</p>
            <div class="chips" role="group" aria-labelledby="f-menu">${btn('menu', '', 'すべて')}${f.menus.map((m) => btn('menu', m, m)).join('')}</div></div>
          <div class="filter-row"><p class="filter-label" id="f-len">髪の長さ</p>
            <div class="chips" role="group" aria-labelledby="f-len">${btn('length', '', 'すべて')}${f.lengths.map((m) => btn('length', m, m)).join('')}</div></div>
          <label class="check"><input type="checkbox" id="f-reco"> おすすめのみ表示</label>
        </div>
        <p class="result-count" aria-live="polite"></p>
        <ul class="style-grid">${D.styles.map((s) => `<li data-menu="${s.menus.join(' ')}" data-length="${esc(s.length)}" data-reco="${s.recommended ? 1 : 0}">${styleCard(s, { heading: 'h2' })}</li>`).join('')}</ul>
        <p class="empty" hidden>条件に合うスタイルがありません。絞り込みを1つ外してみてください。</p>
      </div>`;
    },

    'menu-list'() {
      return `<div class="container narrow">
        <nav class="jump" aria-label="メニューの分類"><ul>${D.menu.map((c) => `<li><a href="#menu-${c.id}">${esc(c.category)}</a></li>`).join('')}</ul></nav>
        <div class="notice"><ul>${D.menuNotes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>
        ${D.menu.map((c) => `<section class="menu-cat" id="menu-${c.id}" aria-labelledby="menu-${c.id}-t">
          <h2 class="section-title" id="menu-${c.id}-t">${esc(c.category)}</h2>
          <ul class="price-list">${c.items.map((i) => priceRow(i, false)).join('')}</ul>
          ${c.note ? `<p class="small-note">${esc(c.note)}</p>` : ''}
        </section>`).join('')}
      </div>`;
    },

    'staff-list'() {
      return `<div class="container"><ul class="staff-grid">${D.staff.map((s) => `<li class="staff-card">
        ${img(s.image, { sizes: '(min-width: 900px) 240px, 40vw', cls: 'round' })}
        <div class="staff-body">
          <p class="staff-role">${esc(s.role)}</p>
          <h2 class="staff-name">${esc(s.name)}</h2>
          <p>${esc(s.intro)}</p>
          <p class="staff-skill-label">得意な施術</p>
          ${tags(s.skills)}
          ${s.sns ? `<p class="staff-sns"><a href="#" data-placeholder-link>${esc(s.sns.label)} ${esc(s.sns.handle)}</a></p>` : ''}
        </div>
      </li>`).join('')}</ul></div>`;
    },

    about() {
      const a = D.about;
      return `<section class="section" aria-labelledby="concept-t">
        <div class="container split">
          <div class="split-text">
            <h2 class="section-title" id="concept-t">${esc(a.concept.title)}</h2>
            ${a.concept.body.map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>
          <div class="split-media">${img(a.concept.image, { sizes: '(min-width: 900px) 50vw, 100vw', cls: 'soft' })}</div>
        </div>
      </section>
      <section class="section section-linen" aria-labelledby="feature-t">
        <div class="container">
          <h2 class="section-title" id="feature-t">SAMPLE HAIR の特徴</h2>
          <ul class="features">${a.features.map((f) => `<li><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></li>`).join('')}</ul>
          <p class="small-note">${esc(a.featuresNote)}</p>
        </div>
      </section>
      <section class="section" aria-labelledby="atmos-t">
        <div class="container">
          <div class="narrow-left">
            <h2 class="section-title" id="atmos-t">${esc(a.atmosphere.title)}</h2>
            <p>${esc(a.atmosphere.body)}</p>
          </div>
          <ul class="photo-grid">${a.gallery.map((g) => `<li>${img(g, { sizes: '(min-width: 900px) 50vw, 100vw', cls: 'soft' })}</li>`).join('')}</ul>
        </div>
      </section>`;
    },

    access() {
      const s = D.site, a = D.access;
      return `<div class="container access">
        <section class="access-info" aria-labelledby="shop-t">
          <h2 class="section-title" id="shop-t">店舗情報</h2>
          <dl class="info-list">
            <div><dt>店名</dt><dd>${esc(s.name)}（${esc(s.nameJa)}）</dd></div>
            <div><dt>住所</dt><dd>${esc(s.postal)}<br>${esc(s.address)}</dd></div>
            <div><dt>アクセス</dt><dd>${esc(s.station)}</dd></div>
            <div><dt>営業時間</dt><dd>${s.hours.map((h) => `${esc(h.label)}　${esc(h.value)}`).join('<br>')}<br><span class="sub">${esc(s.lastEntry)}</span></dd></div>
            <div><dt>定休日</dt><dd>${esc(s.closed)}</dd></div>
            <div><dt>電話</dt><dd>${esc(s.tel)}</dd></div>
            <div><dt>設備</dt><dd>${esc(s.seats)}</dd></div>
            <div><dt>駐車場</dt><dd>${esc(s.parking)}</dd></div>
            <div><dt>お支払い</dt><dd>${esc(s.payment)}</dd></div>
          </dl>
        </section>
        <section class="access-map" aria-labelledby="map-t">
          <h2 class="section-title" id="map-t">地図</h2>
          <div class="map-box">${img(a.mapImage, { sizes: '(min-width: 900px) 50vw, 100vw', cls: 'soft' })}</div>
          <p class="small-note">${esc(a.mapNote)}</p>
          <h3 class="sub-title">駅からの道順</h3>
          <ol class="route">${a.route.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>
        </section>
      </div>`;
    },

    reserve() {
      const r = D.reservation;
      return `<div class="container narrow">
        <p class="page-lead">${esc(r.lead)}</p>
        <ul class="reserve-options">${r.options.map((o) => `<li class="reserve-option" id="${o.id}">
          <h2 class="reserve-title">${esc(o.title)}</h2>
          <p>${esc(o.text)}</p>
          <p class="reserve-detail">${esc(o.detail)}</p>
          <button type="button" class="btn ${o.id === 'tel' ? 'btn-primary' : 'btn-secondary'}" data-placeholder-action="${esc(o.title)}">${esc(o.button)}</button>
        </li>`).join('')}</ul>
        <section class="notice" aria-labelledby="rnote-t">
          <h2 class="sub-title" id="rnote-t">ご予約の前に</h2>
          <ul>${r.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
          <p><a class="text-link" href="faq.html">よくある質問</a>　<a class="text-link" href="menu.html">メニュー・料金</a></p>
        </section>
      </div>`;
    },

    'news-list'() {
      return `<div class="container narrow">
        <ul class="news-list large">${D.news.map((n) => `<li><a class="news-row" href="news-detail.html?id=${n.id}">
          ${n.image ? `<span class="news-thumb">${img(n.image, { sizes: '120px', cls: 'soft' })}</span>` : '<span class="news-thumb empty" aria-hidden="true"></span>'}
          <span class="news-body"><span class="news-meta">${dateTag(n.date)}<span class="cat">${esc(n.category)}</span></span>
          <span class="news-title">${esc(n.title)}</span></span>
        </a></li>`).join('')}</ul>
        ${pager()}
      </div>`;
    },

    'news-detail'() {
      const idx = Math.max(0, D.news.findIndex((n) => n.id === params.get('id')));
      const n = D.news[idx];
      document.title = `${n.title}｜お知らせ｜SAMPLE HAIR（デザインモックアップ）`;
      const prev = D.news[idx + 1], next = D.news[idx - 1];
      return `<div class="container narrow">
        ${breadcrumb([{ href: 'news.html', label: 'お知らせ' }, { label: n.title }])}
        <article class="article">
          <header class="article-head">
            <p class="article-meta">${dateTag(n.date)}<span class="cat">${esc(n.category)}</span></p>
            <h1 class="page-title">${esc(n.title)}</h1>
          </header>
          ${n.image ? `<figure class="article-figure">${img(n.image, { sizes: '(min-width: 760px) 720px, 100vw', eager: true, cls: 'soft' })}</figure>` : ''}
          <div class="article-body">${n.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        </article>
        ${prevNext(prev, next, 'news-detail.html', 'news.html', 'お知らせ一覧へ')}
      </div>`;
    },

    'column-list'() {
      const cats = [...new Set(D.columns.map((c) => c.category))];
      return `<div class="container">
        <p class="cat-list"><span class="filter-label">分類</span>${tags(cats, 'inline')}</p>
        <div class="column-grid">${D.columns.map((c) => columnCard(c, 'h2')).join('')}</div>
        ${pager()}
      </div>`;
    },

    'column-detail'() {
      const idx = Math.max(0, D.columns.findIndex((c) => c.id === params.get('id')));
      const c = D.columns[idx];
      document.title = `${c.title}｜コラム｜SAMPLE HAIR（デザインモックアップ）`;
      const related = D.columns.filter((x) => x.id !== c.id).slice(0, 2);
      return `<div class="container narrow">
        ${breadcrumb([{ href: 'column.html', label: 'コラム' }, { label: c.title }])}
        <article class="article">
          <header class="article-head">
            <p class="article-meta">${dateTag(c.date)}<span class="cat">${esc(c.category)}</span></p>
            <h1 class="page-title">${esc(c.title)}</h1>
            <p class="page-lead">${esc(c.excerpt)}</p>
          </header>
          <figure class="article-figure">${img(c.image, { sizes: '(min-width: 760px) 720px, 100vw', eager: true, cls: 'soft' })}</figure>
          <div class="article-body">${c.body.map((b) => b.h ? `<h2>${esc(b.h)}</h2>` : `<p>${esc(b.p)}</p>`).join('')}</div>
          <p class="small-note">※ 仮の文章です。髪や頭皮の状態に合わせたお手入れは、来店時にご相談ください。</p>
        </article>
        ${prevNext(D.columns[idx + 1], D.columns[idx - 1], 'column-detail.html', 'column.html', 'コラム一覧へ')}
      </div>
      <section class="section section-linen" aria-labelledby="rel-t">
        <div class="container">
          <h2 class="section-title" id="rel-t">ほかのコラム</h2>
          <div class="column-grid two">${related.map((r) => columnCard(r, 'h3')).join('')}</div>
        </div>
      </section>`;
    },

    faq() {
      return `<div class="container narrow">
        <nav class="jump" aria-label="質問の分類"><ul>${D.faq.map((c) => `<li><a href="#faq-${c.id}">${esc(c.category)}</a></li>`).join('')}</ul></nav>
        ${D.faq.map((c) => `<section class="faq-cat" id="faq-${c.id}" aria-labelledby="faq-${c.id}-t">
          <h2 class="section-title" id="faq-${c.id}-t">${esc(c.category)}</h2>
          ${c.items.map((it) => `<details class="faq-item"><summary><span class="q">${esc(it.q)}</span></summary><div class="a"><p>${esc(it.a)}</p></div></details>`).join('')}
        </section>`).join('')}
      </div>`;
    },

    privacy() {
      const p = D.privacy;
      return `<div class="container narrow">
        <div class="notice"><p>${esc(p.note)}</p></div>
        <div class="article-body">
          ${p.sections.map((s) => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join('')}
          <p class="small-note">制定日：${esc(p.updated)}</p>
        </div>
      </div>`;
    }
  };

  function prevNext(prev, next, href, listHref, listLabel) {
    return `<nav class="prev-next" aria-label="前後の記事">
      ${prev ? `<a class="pn-prev" href="${href}?id=${prev.id}"><span class="sub">前の記事</span>${esc(prev.title)}</a>` : '<span></span>'}
      <a class="pn-list" href="${listHref}">${esc(listLabel)}</a>
      ${next ? `<a class="pn-next" href="${href}?id=${next.id}"><span class="sub">次の記事</span>${esc(next.title)}</a>` : '<span></span>'}
    </nav>`;
  }

  function pager() {
    return `<nav class="pager" aria-label="ページ送り"><ul>
      <li><span aria-current="page">1</span></li>
      <li><a href="#" data-placeholder-link>2</a></li>
      <li><a href="#" data-placeholder-link>次へ</a></li>
    </ul><p class="small-note">ページ送りは表示例です（2ページ目以降はありません）。</p></nav>`;
  }

  /* ---------- 描画 ---------- */
  document.querySelectorAll('[data-render]').forEach((el) => {
    const fn = renderers[el.dataset.render];
    if (fn) el.innerHTML = fn();
  });

  /* ---------- ホームでは、最初の画面のボタンが見えている間は固定ボタンをしまう ---------- */
  const hero = document.querySelector('.hero');
  const mcta = document.querySelector('.mobile-cta');
  if (hero && mcta && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => mcta.classList.toggle('is-tucked', en.isIntersecting), { threshold: 0.25 }).observe(hero);
  }

  /* ---------- トースト（仮リンク・仮予約先の案内） ---------- */
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-shown'), 4200);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-placeholder-link]');
    if (a) { e.preventDefault(); showToast('モックアップのため、このリンク先は設定していません。'); return; }
    const b = e.target.closest('[data-placeholder-action]');
    if (b) showToast(`「${b.dataset.placeholderAction}」の接続先は未設定です。実際の予約先は管理画面で設定する想定です。`);
  });

  /* ---------- メニュー（ドロワー） ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.getElementById('drawer');
  if (toggle && drawer) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.menu-toggle-label').textContent = open ? '閉じる' : 'メニュー';
      drawer.hidden = !open;
      document.body.classList.toggle('nav-open', open);
      if (open) drawer.querySelector('a').focus();
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
  }

  /* ---------- 横送りギャラリー ---------- */
  document.querySelectorAll('.gallery').forEach((g) => {
    const track = g.querySelector('.gallery-track');
    const btns = g.querySelectorAll('.gallery-btn');
    const step = () => { const li = track.querySelector('li'); return li ? li.getBoundingClientRect().width + 20 : 300; };
    const update = () => {
      btns[0].disabled = track.scrollLeft <= 2;
      btns[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    btns.forEach((b) => b.addEventListener('click', () => {
      track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: motionOK() ? 'smooth' : 'auto' });
    }));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: step() * (e.key === 'ArrowRight' ? 1 : -1), behavior: motionOK() ? 'smooth' : 'auto' });
      }
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- ヘアスタイルの絞り込み ---------- */
  const grid = document.querySelector('.style-grid');
  if (grid) {
    const state = { menu: '', length: '' };
    const reco = document.getElementById('f-reco');
    const count = document.querySelector('.result-count');
    const empty = document.querySelector('.empty');
    const apply = () => {
      let n = 0;
      grid.querySelectorAll('li').forEach((li) => {
        const ok = (!state.menu || li.dataset.menu.split(' ').includes(state.menu)) &&
          (!state.length || li.dataset.length === state.length) &&
          (!reco.checked || li.dataset.reco === '1');
        li.hidden = !ok; if (ok) n++;
      });
      count.textContent = `${n}件のスタイルを表示しています`;
      empty.hidden = n > 0;
    };
    document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
      const g = c.dataset.group;
      document.querySelectorAll(`.chip[data-group="${g}"]`).forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
      state[g] = c.dataset.value;
      apply();
    }));
    reco.addEventListener('change', apply);
    apply();
  }

  /* ---------- ホーム写真のスライドショー ---------- */
  function setupHeroSlideshow() {
    const carousel = document.querySelector('[data-hero-slideshow]');
    if (!carousel) return { updateMotion() {} };

    const slides = [...carousel.querySelectorAll('[data-hero-slide]')];
    const dots = [...carousel.querySelectorAll('[data-hero-slide-to]')];
    const toggle = carousel.querySelector('[data-hero-toggle]');
    const toggleIcon = carousel.querySelector('[data-hero-toggle-icon]');
    if (slides.length < 2 || !toggle) return { updateMotion() {} };

    let activeIndex = 0;
    let paused = false;
    let timer = null;

    function stop() {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    }

    function show(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === activeIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === activeIndex)));
    }

    function updateToggle() {
      const motionEnabled = motionOK();
      toggle.disabled = !motionEnabled;
      toggle.setAttribute('aria-pressed', String(paused || !motionEnabled));
      toggle.setAttribute('aria-label', !motionEnabled ? '動きを減らす設定が有効です' : paused ? 'スライドショーを再開' : 'スライドショーを一時停止');
      toggleIcon.textContent = paused || !motionEnabled ? '▶' : 'Ⅱ';
    }

    function updateMotion() {
      stop();
      if (!motionOK()) show(0);
      updateToggle();
      if (motionOK() && !paused && !document.hidden) {
        timer = window.setInterval(() => show(activeIndex + 1), 6500);
      }
    }

    toggle.addEventListener('click', () => {
      if (!motionOK()) return;
      paused = !paused;
      updateMotion();
    });
    dots.forEach((dot) => dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroSlideTo));
      if (motionOK() && !paused) updateMotion();
    }));
    document.addEventListener('visibilitychange', updateMotion);
    updateMotion();
    return { updateMotion };
  }

  /* ---------- スクロール時の表示・背景の奥行き ---------- */
  /* 背景のうねり線だけを本文より遅らせる。移動量は画面幅で切り替える。 */
  let io = null, depthEls = [], parallaxEls = [], ticking = false, motionRunning = false;
  function softClamp(value, max) {
    return max * Math.tanh(value / max);
  }
  function startMotion() {
    if (!motionOK() || motionRunning) return;
    motionRunning = true;
    root.classList.add('motion');
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      }), { rootMargin: '0px 0px -10% 0px' });
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => io.observe(el));
    } else {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    }
    depthEls = [...document.querySelectorAll('[data-depth]')];
    parallaxEls = [...document.querySelectorAll('.has-flow')];
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
  function stopMotion() {
    motionRunning = false;
    ticking = false;
    root.classList.remove('motion');
    if (io) { io.disconnect(); io = null; }
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    depthEls.forEach((el) => { el.style.transform = ''; });
    parallaxEls.forEach((el) => {
      el.style.removeProperty('--parallax-y');
      delete el._parallaxY;
    });
    depthEls = [];
    parallaxEls = [];
  }
  function onScroll() {
    if (!motionRunning || ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollMotion);
  }
  function updateScrollMotion() {
    if (!motionRunning) { ticking = false; return; }
    const y = window.scrollY;
    const vh = window.innerHeight;
    const wide = window.innerWidth >= 900;
    const rate = 1.24;
    const max = wide ? 520 : 280;
    const decoHeight = wide ? Math.min(window.innerWidth * 0.72, 680) : Math.min(window.innerWidth * 0.7, 320);
    const decoTop = wide ? -0.08 : -0.04;
    const mid = vh * 0.5;
    depthEls.forEach((el) => { el.style.transform = `translate3d(0, ${(y * Number(el.dataset.depth)).toFixed(1)}px, 0)`; });
    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const decoCenter = rect.top + rect.height * decoTop + decoHeight * 0.5;
      const shift = Math.round(softClamp((mid - decoCenter) * rate, max) * 10) / 10;
      if (el._parallaxY === shift) return;
      el._parallaxY = shift;
      el.style.setProperty('--parallax-y', shift + 'px');
    });
    ticking = false;
  }
  /* PCではヒーローの下端を、ヘッダー（と上部の帯）を除いた画面の下端に合わせる */
  function fitHeroFrame() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (!window.matchMedia('(min-width: 900px)').matches) {
      hero.style.height = '';
      hero.style.maxHeight = '';
      return;
    }
    const offset = Math.ceil(hero.getBoundingClientRect().top + window.scrollY);
    const height = `calc(100dvh - ${offset}px)`;
    hero.style.height = height;
    hero.style.maxHeight = height;
  }
  fitHeroFrame();
  window.addEventListener('resize', fitHeroFrame);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroFrame);

  const heroSlideshow = setupHeroSlideshow();
  startMotion();
  reduceQuery.addEventListener('change', () => {
    const optMotion = document.getElementById('opt-motion');
    if (optMotion) {
      optMotion.disabled = reduceQuery.matches;
      optMotion.checked = reduceQuery.matches || root.classList.contains('reduce-motion');
    }
    stopMotion();
    startMotion();
    heroSlideshow.updateMotion();
  });

  /* ---------- 確認パネル（モックアップ専用） ---------- */
  const strip = document.querySelector('.sample-strip .container');
  if (strip) {
    strip.insertAdjacentHTML('beforeend', `
      <button class="panel-toggle" type="button" aria-expanded="false" aria-controls="mock-panel">確認パネル</button>
      <div class="mock-panel" id="mock-panel" hidden>
        <label class="check"><input type="checkbox" id="opt-edit"> 管理画面で編集する範囲を枠で表示</label>
        <label class="check"><input type="checkbox" id="opt-motion"> 動きを止める（テーマ設定の候補）</label>
        <p class="small-note">ホームのセクションの表示・順序は sample-data.js の home.sections で変更できます。端末で「視差効果を減らす」等が有効な場合、動きは自動で止まります。</p>
      </div>`);
    const pt = strip.querySelector('.panel-toggle');
    const panel = document.getElementById('mock-panel');
    pt.addEventListener('click', () => {
      const open = pt.getAttribute('aria-expanded') !== 'true';
      pt.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
    const optEdit = document.getElementById('opt-edit');
    const optMotion = document.getElementById('opt-motion');
    optEdit.checked = store.get('mock-edit') === 'on';
    root.classList.toggle('show-edit', optEdit.checked);
    optEdit.addEventListener('change', () => { root.classList.toggle('show-edit', optEdit.checked); store.set('mock-edit', optEdit.checked ? 'on' : 'off'); });
    optMotion.checked = root.classList.contains('reduce-motion') || reduceQuery.matches;
    optMotion.disabled = reduceQuery.matches;
    optMotion.addEventListener('change', () => {
      root.classList.toggle('reduce-motion', optMotion.checked);
      store.set('mock-motion', optMotion.checked ? 'off' : 'on');
      if (optMotion.checked) stopMotion(); else startMotion();
      heroSlideshow.updateMotion();
    });
  }
})();
