/**
 * VeloceBikes - Script Principal
 * Recursos: Acessibilidade WCAG 2.1 AA, Carrossel, Filtros, Ordenação, Carrinho Dinâmico e Modais
 */
document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. ACESSIBILIDADE (Tema Escuro/Claro, Fonte A-/A/A+, Alto Contraste)
    // =========================================================================
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const contrastToggle = document.getElementById('contrast-toggle');
    let currentFontSize = Number(localStorage.getItem('veloce-font-size')) || 16;

    // Restaurar preferências salvas
    htmlEl.style.setProperty('--font-size-base', `${currentFontSize}px`);
    if (localStorage.getItem('veloce-theme') === 'dark') {
        htmlEl.setAttribute('data-theme', 'dark');
        themeToggle.setAttribute('aria-pressed', 'true');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Modo Claro';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = htmlEl.getAttribute('data-theme') === 'dark';
        const nextTheme = isDark ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', nextTheme);
        localStorage.setItem('veloce-theme', nextTheme);
        themeToggle.setAttribute('aria-pressed', String(!isDark));
        themeIcon.textContent = isDark ? '🌙' : '☀️';
        themeText.textContent = isDark ? 'Modo Escuro' : 'Modo Claro';
    });

    contrastToggle.addEventListener('click', () => {
        const isHigh = htmlEl.getAttribute('data-contrast') === 'high';
        if (isHigh) {
            htmlEl.removeAttribute('data-contrast');
            contrastToggle.setAttribute('aria-pressed', 'false');
        } else {
            htmlEl.setAttribute('data-contrast', 'high');
            contrastToggle.setAttribute('aria-pressed', 'true');
        }
    });

    document.getElementById('font-increase').addEventListener('click', () => {
        if (currentFontSize < 22) {
            currentFontSize += 2;
            htmlEl.style.setProperty('--font-size-base', `${currentFontSize}px`);
            localStorage.setItem('veloce-font-size', currentFontSize);
        }
    });

    document.getElementById('font-decrease').addEventListener('click', () => {
        if (currentFontSize > 14) {
            currentFontSize -= 2;
            htmlEl.style.setProperty('--font-size-base', `${currentFontSize}px`);
            localStorage.setItem('veloce-font-size', currentFontSize);
        }
    });

    document.getElementById('font-reset').addEventListener('click', () => {
        currentFontSize = 16;
        htmlEl.style.setProperty('--font-size-base', '16px');
        localStorage.setItem('veloce-font-size', 16);
    });

    // =========================================================================
    // 2. CARROSSEL INTERATIVO COM PAUSA NO HOVER E SUPORTE A TECLADO
    // =========================================================================
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const carouselContainer = document.querySelector('.carousel-container');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            const active = i === index;
            slide.classList.toggle('active', active);
            slide.setAttribute('aria-hidden', String(!active));
        });
        indicators.forEach((dot, i) => {
            const active = i === index;
            dot.classList.toggle('active', active);
            dot.setAttribute('aria-selected', String(active));
        });
        currentSlide = index;
    }

    document.getElementById('next-slide').addEventListener('click', () => {
        showSlide((currentSlide + 1) % slides.length);
    });

    document.getElementById('prev-slide').addEventListener('click', () => {
        showSlide((currentSlide - 1 + slides.length) % slides.length);
    });

    indicators.forEach((dot) => {
        dot.addEventListener('click', () => showSlide(Number(dot.dataset.slide)));
    });

    let autoplay = setInterval(() => showSlide((currentSlide + 1) % slides.length), 6000);
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoplay));
    carouselContainer.addEventListener('mouseleave', () => {
        autoplay = setInterval(() => showSlide((currentSlide + 1) % slides.length), 6000);
    });

    // =========================================================================
    // 3. FILTRAGEM POR ABAS, PESQUISA EM TEMPO REAL E ORDENAÇÃO POR PREÇO
    // =========================================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('bike-search');
    const sortSelect = document.getElementById('sort-select');
    const productGrid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    let activeCategory = 'todas';

    function updateCatalog() {
        const term = searchInput.value.toLowerCase().trim();
        const sortBy = sortSelect.value;
        const cards = Array.from(productGrid.querySelectorAll('.product-card'));

        // Ordenar cartões
        cards.sort((a, b) => {
            const priceA = Number(a.dataset.price);
            const priceB = Number(b.dataset.price);
            if (sortBy === 'menor-preco') return priceA - priceB;
            if (sortBy === 'maior-preco') return priceB - priceA;
            return Number(a.dataset.id) - Number(b.dataset.id);
        });

        let visibleCount = 0;
        cards.forEach((card) => {
            productGrid.appendChild(card);
            const matchCat = activeCategory === 'todas' || card.dataset.category === activeCategory;
            const matchSearch = card.dataset.title.toLowerCase().includes(term) ||
                                card.textContent.toLowerCase().includes(term);

            if (matchCat && matchSearch) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        noResults.classList.toggle('hidden', visibleCount > 0);
    }

    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            activeCategory = btn.dataset.category;
            updateCatalog();
        });
    });

    searchInput.addEventListener('input', updateCatalog);
    sortSelect.addEventListener('change', updateCatalog);

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        sortSelect.value = 'destaque';
        tabBtns[0].click();
    });

    // =========================================================================
    // 4. CARRINHO DE COMPRAS INTERATIVO (Adicionar, Remover e Totalizar)
    // =========================================================================
    let cart = [];
    const cartCountEl = document.getElementById('cart-count');
    const openCartBtn = document.getElementById('open-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalValue = document.getElementById('cart-total-value');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutFeedback = document.getElementById('checkout-feedback');

    function formatBRL(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function renderCart() {
        const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

        cartCountEl.textContent = totalQty;
        openCartBtn.setAttribute('aria-label', `Abrir carrinho de compras com ${totalQty} itens`);
        cartTotalValue.textContent = formatBRL(totalPrice);
        checkoutBtn.disabled = cart.length === 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Seu carrinho está vazio no momento.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map((item) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span>Qtd: ${item.qty} × ${formatBRL(item.price)}</span>
                </div>
                <button class="remove-item-btn" data-id="${item.id}" aria-label="Remover ${item.name} do carrinho">Remover</button>
            </div>
        `).join('');

        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                cart = cart.filter((item) => item.id !== btn.dataset.id);
                renderCart();
            });
        });
    }

    document.querySelectorAll('.add-to-cart').forEach((btn) => {
        btn.addEventListener('click', () => {
            const { id, name, price } = btn.dataset;
            const existing = cart.find((item) => item.id === id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ id, name, price: Number(price), qty: 1 });
            }
            renderCart();

            const originalText = btn.textContent;
            btn.textContent = 'Adicionado ✓';
            setTimeout(() => { btn.textContent = originalText; }, 1100);
        });
    });

    checkoutBtn.addEventListener('click', () => {
        checkoutFeedback.textContent = 'Pedido confirmado! Um consultor enviará os detalhes do Bike Fit por e-mail.';
        cart = [];
        renderCart();
        setTimeout(() => {
            checkoutFeedback.textContent = '';
            closeModal('cart-modal');
        }, 2000);
    });

    // =========================================================================
    // 5. MODAL DE FICHA TÉCNICA DOS PRODUTOS
    // =========================================================================
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

    const detailsBody = document.getElementById('details-body');
    document.querySelectorAll('.view-details').forEach((btn) => {
        btn.addEventListener('click', () => {
            const spec = bikeSpecsDB[btn.dataset.id];
            detailsBody.innerHTML = `
                <h3 style="margin-bottom: 0.75rem;">${spec.title}</h3>
                <ul style="list-style: none; display: grid; gap: 0.6rem; font-size: 0.95rem;">
                    <li><strong>Peso Aproximado:</strong> ${spec.weight}</li>
                    <li><strong>Quadro:</strong> ${spec.frame}</li>
                    <li><strong>Suspensão / Garfo:</strong> ${spec.suspension}</li>
                    <li><strong>Transmissão:</strong> ${spec.groupset}</li>
                    <li><strong>Sistema de Freios:</strong> ${spec.brakes}</li>
                </ul>
            `;
            openModal('details-modal');
        });
    });

    // =========================================================================
    // 6. GERENCIAMENTO DE MODAIS (Login, Carrinho, Detalhes) E FORMULÁRIOS
    // =========================================================================
    function openModal(id) {
        const modal = document.getElementById(id);
        modal.classList.remove('hidden');
        const firstInput = modal.querySelector('input, button');
        if (firstInput) firstInput.focus();
    }

    function closeModal(id) {
        document.getElementById(id).classList.add('hidden');
    }

    document.getElementById('open-login-btn').addEventListener('click', () => openModal('login-modal'));
    openCartBtn.addEventListener('click', () => openModal('cart-modal'));

    document.querySelectorAll('.close-modal').forEach((btn) => {
        btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) backdrop.classList.add('hidden');
        });
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.add('hidden'));
        }
    });

    // Login
    const loginForm = document.getElementById('login-form');
    const loginFeedback = document.getElementById('login-feedback');
    const userGreeting = document.getElementById('user-greeting');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const userName = email.split('@')[0];
        loginFeedback.textContent = `Bem-vindo, ${userName}! Autenticação concluída.`;
        userGreeting.textContent = `Olá, ${userName}`;
        setTimeout(() => {
            closeModal('login-modal');
            loginFeedback.textContent = '';
        }, 1200);
    });

    // Formulário de Contato
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensagem = document.getElementById('mensagem').value.trim();

        if (!nome || !email || !mensagem) {
            formFeedback.style.color = '#C84B11';
            formFeedback.textContent = 'Por favor, preencha todos os campos obrigatórios (*).';
            return;
        }

        formFeedback.style.color = '#1B6B50';
        formFeedback.textContent = `Obrigado, ${nome}! Sua solicitação foi enviada com sucesso. Retornaremos em breve.`;
        contactForm.reset();
    });
});
