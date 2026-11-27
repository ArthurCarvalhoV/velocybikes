/**
 * VeloceBikes - Script Principal (v2)
 * Acessibilidade, menu mobile, carrossel, catálogo, carrinho persistente, modais e formulários.
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* sem storage */ } }
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Região "sr-only" para avisar leitores de tela
  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  document.body.append(status);

  // ===== 1. ACESSIBILIDADE (o estado inicial vem do script no <head>) =====
  const root = document.documentElement;
  const themeToggle = $('#theme-toggle');
  const contrastToggle = $('#contrast-toggle');
  let fontSize = Number(store.get('veloce-font-size')) || 16;

  const setFont = (px) => {
    fontSize = px;
    root.style.setProperty('--font-size-base', `${px}px`);
    store.set('veloce-font-size', px);
  };
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(dark));
    $('#theme-icon').textContent = dark ? '☀️' : '🌙';
    $('#theme-text').textContent = dark ? 'Modo Claro' : 'Modo Escuro';
    $('meta[name="theme-color"]').content = dark ? '#0B1120' : '#0F4C5C';
  };
  syncTheme();
  contrastToggle.setAttribute('aria-pressed', String(root.dataset.contrast === 'high'));

  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    store.set('veloce-theme', root.dataset.theme);
    syncTheme();
  });
  contrastToggle.addEventListener('click', () => {
    const on = root.dataset.contrast !== 'high';
    if (on) root.dataset.contrast = 'high';
    else root.removeAttribute('data-contrast');
    store.set('veloce-contrast', on ? 'high' : 'normal');
    contrastToggle.setAttribute('aria-pressed', String(on));
  });
  $('#font-increase').addEventListener('click', () => { if (fontSize < 22) setFont(fontSize + 2); });
  $('#font-decrease').addEventListener('click', () => { if (fontSize > 14) setFont(fontSize - 2); });
  $('#font-reset').addEventListener('click', () => setFont(16));

  // ===== 2. MENU MOBILE =====
  const menuBtn = $('#menu-toggle');
  const nav = $('#main-nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // ===== 3. CARROSSEL (pausa, foco, toque e movimento reduzido) =====
  const slides = $$('.carousel-slide');
  const dots = $$('.indicator');
  const box = $('.carousel-container');
  const pauseBtn = $('#pause-slide');
  let current = 0;
  let timer = null;
  let userPaused = reduceMotion;

  const show = (i) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      const on = n === current;
      s.classList.toggle('active', on);
      s.setAttribute('aria-hidden', String(!on));
      s.inert = !on;
    });
    dots.forEach((d, n) => {
      d.classList.toggle('active', n === current);
      d.setAttribute('aria-selected', String(n === current));
    });
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const play = () => {
    stop();
    if (!userPaused) timer = setInterval(() => show(current + 1), 6000);
  };
  const syncPause = () => {
    pauseBtn.textContent = userPaused ? '▶' : '❚❚';
    pauseBtn.setAttribute('aria-label', userPaused ? 'Retomar rotação automática' : 'Pausar rotação automática');
  };

  $('#next-slide').addEventListener('click', () => show(current + 1));
  $('#prev-slide').addEventListener('click', () => show(current - 1));
  dots.forEach((d) => d.addEventListener('click', () => show(Number(d.dataset.slide))));
  pauseBtn.addEventListener('click', () => { userPaused = !userPaused; syncPause(); play(); });
  box.addEventListener('mouseenter', stop);
  box.addEventListener('mouseleave', play);
  box.addEventListener('focusin', stop);
  box.addEventListener('focusout', play);
  let startX = 0;
  box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });
  show(0);
  syncPause();
  play();

  // ===== 4. CATÁLOGO: tamanhos, filtro, busca sem acento e ordenação =====
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const grid = $('#product-grid');
  const filterBtns = $$('.tab-btn');
  const search = $('#bike-search');
  const sort = $('#sort-select');
  let category = 'todas';

  // Os tamanhos viram botões selecionáveis (o tamanho do quadro importa na compra)
  $$('.size-selector').forEach((group) => {
    const hint = document.createElement('p');
    hint.className = 'size-hint';
    hint.setAttribute('aria-live', 'polite');
    group.after(hint);
    group.setAttribute('aria-label', 'Escolha o tamanho do quadro');
    $$('.size-pill', group).forEach((pill) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'size-pill';
      b.textContent = pill.textContent;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        $$('.size-pill', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        hint.textContent = '';
      });
      pill.replaceWith(b);
    });
  });

  const updateCatalog = () => {
    const term = norm(search.value.trim());
    const cards = $$('.product-card', grid).sort((a, b) => {
      const pa = Number(a.dataset.price);
      const pb = Number(b.dataset.price);
      if (sort.value === 'menor-preco') return pa - pb;
      if (sort.value === 'maior-preco') return pb - pa;
      return Number(a.dataset.id) - Number(b.dataset.id);
    });
    let visible = 0;
    cards.forEach((c) => {
      grid.appendChild(c);
      const ok = (category === 'todas' || c.dataset.category === category) && norm(c.textContent).includes(term);
      c.classList.toggle('hidden', !ok);
      if (ok) visible++;
    });
    $('#no-results').classList.toggle('hidden', visible > 0);
    $('#result-count').textContent = visible === 1 ? '1 bicicleta encontrada' : `${visible} bicicletas encontradas`;
  };

  filterBtns[0].textContent = `Todas (${$$('.product-card').length})`;
  filterBtns.forEach((b) => b.addEventListener('click', () => {
    filterBtns.forEach((x) => {
      x.classList.toggle('active', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    category = b.dataset.category;
    updateCatalog();
  }));
  search.addEventListener('input', updateCatalog);
  sort.addEventListener('change', updateCatalog);
  $('#reset-filters-btn').addEventListener('click', () => {
    search.value = '';
    sort.value = 'destaque';
    filterBtns[0].click();
  });

  // ===== 5. CARRINHO (quantidade, tamanho e persistência) =====
  let cart = [];
  try { cart = JSON.parse(store.get('veloce-cart')); } catch { cart = []; }
  if (!Array.isArray(cart)) cart = [];

  const cartBtn = $('#open-cart-btn');
  const list = $('#cart-items-container');
  const checkout = $('#checkout-btn');
  const checkoutMsg = $('#checkout-feedback');

  const renderCart = () => {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
    $('#cart-count').textContent = count;
    cartBtn.setAttribute('aria-label', `Abrir carrinho de compras com ${count} ${count === 1 ? 'item' : 'itens'}`);
    $('#cart-total-value').textContent = formatBRL(total);
    checkout.disabled = !count;
    list.innerHTML = count ? cart.map((i) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${esc(i.name)}</strong>
          <span>Tamanho ${esc(i.size)} • ${formatBRL(i.price)}</span>
          <div class="qty" role="group" aria-label="Quantidade de ${esc(i.name)}">
            <button type="button" data-key="${esc(i.key)}" data-d="-1" aria-label="Diminuir quantidade">−</button>
            <span>${i.qty}</span>
            <button type="button" data-key="${esc(i.key)}" data-d="1" aria-label="Aumentar quantidade">+</button>
          </div>
        </div>
        <div class="cart-item-side">
          <strong>${formatBRL(i.price * i.qty)}</strong>
          <button type="button" class="remove-item-btn" data-key="${esc(i.key)}" data-d="0" aria-label="Remover ${esc(i.name)} do carrinho">Remover</button>
        </div>
      </div>`).join('') : '<p class="empty-cart-msg">Seu carrinho está vazio no momento.</p>';
    store.set('veloce-cart', JSON.stringify(cart));
  };

  list.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-key]');
    const item = b && cart.find((i) => i.key === b.dataset.key);
    if (!item) return;
    item.qty += Number(b.dataset.d);
    if (b.dataset.d === '0' || item.qty < 1) cart = cart.filter((i) => i !== item);
    renderCart();
    const again = $(`[data-key="${CSS.escape(b.dataset.key)}"][data-d="${b.dataset.d}"]`, list);
    (again || $('.close-modal', $('#cart-modal'))).focus();
  });

  $$('.add-to-cart').forEach((btn) => {
    btn.textContent = 'Adicionar';
    btn.setAttribute('aria-label', `Adicionar ${btn.dataset.name} ao carrinho`);
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const chosen = $('.size-pill[aria-pressed="true"]', card);
      if (!chosen) {
        $('.size-hint', card).textContent = 'Escolha um tamanho para adicionar ao carrinho.';
        $('.size-pill', card).focus();
        return;
      }
      const { id, name, price } = btn.dataset;
      const size = chosen.textContent;
      const key = `${id}-${size}`;
      const found = cart.find((i) => i.key === key);
      if (found) found.qty += 1;
      else cart.push({ key, id, name, size, price: Number(price), qty: 1 });
      renderCart();
      status.textContent = `${name}, tamanho ${size}, adicionada ao carrinho.`;
      btn.textContent = 'Adicionado ✓';
      setTimeout(() => { btn.textContent = 'Adicionar'; }, 1100);
    });
  });

  checkout.addEventListener('click', () => {
    checkoutMsg.textContent = 'Pedido confirmado! Um consultor enviará os detalhes do Bike Fit por e-mail.';
    cart = [];
    renderCart();
    setTimeout(() => { checkoutMsg.textContent = ''; closeModal('cart-modal'); }, 2200);
  });
  renderCart();

  // ===== 6. FICHA TÉCNICA =====
  const bikeSpecsDB = {
      '1': {
          title: 'Veloce Trail X-Pro Carbon',
          weight: '11,4 kg',
          frame: 'Fibra de Carbono Toray T800 com cabeamento interno',
          suspension: 'RockShox Pike Select+ 140mm Air',
          groupset: 'Shimano Deore XT M8100 12 velocidades (10-51D)',
          brakes: 'Freios a disco hidráulicos Shimano XT 4 pistões'
      },
      '2': {
          title: 'Veloce AeroCarbon RS',
          weight: '7,6 kg',
          frame: 'Carbono Aero HM certificado UCI',
          suspension: 'Garfo rígido Full Carbon Aero',
          groupset: 'Shimano 105 Di2 R7150 Eletrônico 24v',
          brakes: 'Shimano 105 Hidráulico Rotores Ice-Tech 160mm'
      },
      '3': {
          title: 'Veloce E-City Volt 500W',
          weight: '19,8 kg',
          frame: 'Alumínio 6061 Step-Thru com bateria integrada',
          suspension: 'Garfo hidráulico urbano 65mm com trava',
          groupset: 'Shimano Altus 8v + Assistência Elétrica 5 níveis',
          brakes: 'Disco Hidráulico Tektro com sensor de corte de motor'
      },
      '4': {
          title: 'Veloce Peak Alumínio 6061',
          weight: '13,9 kg',
          frame: 'Alumínio 6061 T6 Hidroformado',
          suspension: 'SR Suntour XCM 100mm com trava remota',
          groupset: 'Shimano Altus 24 velocidades',
          brakes: 'Disco Hidráulico Shimano MT200'
      },
      '5': {
          title: 'Veloce Strada Endurance',
          weight: '8,9 kg',
          frame: 'Alumínio Ultralight com geometria Endurance',
          suspension: 'Garfo em Fibra de Carbono',
          groupset: 'Shimano Tiagra 4700 20 velocidades',
          brakes: 'Disco Mecânico/Hidráulico TRP Spyre'
      },
      '6': {
          title: 'Veloce Commuter Classic 7v',
          weight: '12,8 kg',
          frame: 'Aço Chromoly 4130 leve e absorvedor de impactos',
          suspension: 'Garfo rígido urbano',
          groupset: 'Shimano Tourney TX 7 velocidades',
          brakes: 'V-Brake Alumínio de alta precisão'
      }
  };

  $$('.view-details').forEach((btn) => btn.addEventListener('click', () => {
    const s = bikeSpecsDB[btn.dataset.id];
    const rows = [['Peso aproximado', s.weight], ['Quadro', s.frame], ['Suspensão / garfo', s.suspension], ['Transmissão', s.groupset], ['Freios', s.brakes]];
    $('#details-body').innerHTML = `<h3>${esc(s.title)}</h3><dl class="specs">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
    openModal('details-modal', btn);
  }));

  // ===== 7. MODAIS (foco preso, retorno de foco, Esc e bloqueio de rolagem) =====
  let lastFocus = null;

  function openModal(id, opener) {
    const m = document.getElementById(id);
    lastFocus = opener || document.activeElement;
    m.classList.remove('hidden');
    document.body.classList.add('modal-open');
    (m.querySelector('input') || m.querySelector('.close-modal')).focus();
  }

  function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    if (!$('.modal-backdrop:not(.hidden)')) document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  }

  $('#open-login-btn').addEventListener('click', (e) => openModal('login-modal', e.currentTarget));
  cartBtn.addEventListener('click', (e) => openModal('cart-modal', e.currentTarget));
  $$('.close-modal').forEach((b) => b.addEventListener('click', () => closeModal(b.dataset.close)));
  $$('.modal-backdrop').forEach((b) => b.addEventListener('click', (e) => { if (e.target === b) closeModal(b.id); }));

  document.addEventListener('keydown', (e) => {
    const open = $('.modal-backdrop:not(.hidden)');
    if (!open) return;
    if (e.key === 'Escape') { closeModal(open.id); return; }
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), input, select, textarea', open).filter((x) => x.offsetParent !== null);
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // ===== 8. FORMULÁRIOS COM VALIDAÇÃO POR CAMPO =====
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const emailRule = (v) => (!v ? 'Informe seu e-mail.' : !isEmail(v) ? 'Use um e-mail válido, como nome@exemplo.com.' : '');

  const setError = (input, msg) => {
    let err = input.parentNode.querySelector('.field-error');
    if (!msg) {
      if (err) err.remove();
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      return true;
    }
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.id = `${input.id}-error`;
      input.after(err);
    }
    err.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', err.id);
    return false;
  };

  const validate = (rules) => {
    let firstBad = null;
    Object.entries(rules).forEach(([id, check]) => {
      const input = document.getElementById(id);
      if (!setError(input, check(input.value.trim())) && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  };

  [$('#login-form'), $('#contact-form')].forEach((f) => f.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) setError(e.target, '');
  }));

  const userGreeting = $('#user-greeting');
  const savedUser = store.get('veloce-user');
  if (savedUser) userGreeting.textContent = `Olá, ${savedUser}`;

  $('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate({ 'login-email': emailRule, 'login-password': (v) => (v.length < 6 ? 'A senha precisa ter ao menos 6 caracteres.' : '') })) return;
    const name = $('#login-email').value.trim().split('@')[0];
    if ($('#remember-me').checked) store.set('veloce-user', name);
    $('#login-feedback').textContent = `Bem-vindo, ${name}! Autenticação concluída.`;
    userGreeting.textContent = `Olá, ${name}`;
    setTimeout(() => { closeModal('login-modal'); $('#login-feedback').textContent = ''; }, 1200);
  });

  const contact = $('#contact-form');
  const contactMsg = $('#form-feedback');
  contact.addEventListener('submit', (e) => {
    e.preventDefault();
    contactMsg.className = 'form-feedback';
    const ok = validate({
      nome: (v) => (v.length < 3 ? 'Informe seu nome completo.' : ''),
      email: emailRule,
      mensagem: (v) => (v.length < 10 ? 'Escreva ao menos 10 caracteres.' : '')
    });
    if (!ok) {
      contactMsg.classList.add('error');
      contactMsg.textContent = 'Corrija os campos destacados e envie novamente.';
      return;
    }
    contactMsg.textContent = `Obrigado, ${$('#nome').value.trim().split(' ')[0]}! Recebemos sua solicitação e retornamos em breve.`;
    contact.reset();
  });
});
