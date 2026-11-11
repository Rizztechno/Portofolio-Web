(() => {
    'use strict';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- Menu dropdown ---------- */
    const toggle = $('#menuToggle');
    const menu = $('#dropdownMenu');

    const setMenu = (open) => {
        menu.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    };

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setMenu(!menu.classList.contains('active'));
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    matchMedia('(min-width: 861px)').addEventListener('change', () => setMenu(false));

    /* ---------- Reveal saat scroll (satu observer, berhenti setelah tampil) ---------- */
    const revealEls = $$('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add('is-visible');
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    /* ---------- Scroll progress + link aktif (di-throttle dengan rAF) ---------- */
    const bar = $('#scrollProgress');
    const links = $$('[data-link]');
    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    let ticking = false;

    const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;

        const pos = scrollY + innerHeight * 0.35;
        let current = sections[0];
        sections.forEach((s) => { if (s.offsetTop <= pos) current = s; });
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current.id));
        ticking = false;
    };
    addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ---------- Filter karya ---------- */
    const chips = $$('.chip');
    const cards = $$('.card[data-cat]');

    chips.forEach((chip) => chip.addEventListener('click', () => {
        const f = chip.dataset.filter;
        chips.forEach((c) => {
            const on = c === chip;
            c.classList.toggle('is-active', on);
            c.setAttribute('aria-selected', String(on));
        });

        cards.forEach((card) => {
            const show = f === 'all' || card.dataset.cat === f;
            card.classList.add('is-visible'); // pastikan tidak tersangkut state reveal
            if (show) {
                if (card.classList.contains('is-hidden')) {
                    card.classList.remove('is-hidden');
                    card.classList.add('is-fading');
                    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-fading')));
                }
            } else {
                card.classList.add('is-fading');
                setTimeout(() => card.classList.add('is-hidden'), reduceMotion ? 0 : 250);
            }
        });
    }));

    /* ---------- Spotlight kartu (hanya perangkat mouse) ---------- */
    if (canHover && !reduceMotion) {
        $$('.card, .card-lite').forEach((card) => {
            let raf = 0;
            card.addEventListener('pointermove', (e) => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    const r = card.getBoundingClientRect();
                    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                    card.style.setProperty('--my', `${e.clientY - r.top}px`);
                    raf = 0;
                });
            }, { passive: true });
        });
    }

    /* ---------- Hemat baterai: pause video logo saat tab tidak aktif ---------- */
    const logoVideo = $('.logo-frame video');
    if (logoVideo) {
        document.addEventListener('visibilitychange', () => {
            document.hidden ? logoVideo.pause() : logoVideo.play().catch(() => {});
        });
        if (reduceMotion) logoVideo.pause();
    }
})();
