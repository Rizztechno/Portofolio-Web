(() => {
    'use strict';

    /* Ganti dengan nomor WhatsApp kamu (format internasional tanpa +), contoh: 6281234567890 */
    const WA_NUMBER = '62xxxxxxxxxx';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- Loading screen ---------- */
    const loader = $('#loader');
    let loaderDone = false;
    const hideLoader = () => {
        if (loaderDone || !loader) return;
        loaderDone = true;
        loader.classList.add('is-done');
        setTimeout(() => loader.remove(), 600);
    };
    if (document.readyState === 'complete') setTimeout(hideLoader, 300);
    else addEventListener('load', () => setTimeout(hideLoader, 300));
    setTimeout(hideLoader, 2500); // jaga-jaga kalau ada aset yang lambat

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

    /* ---------- Count-up statistik ---------- */
    const countUp = (el) => {
        const end = parseInt(el.dataset.count, 10) || 0;
        if (reduceMotion) { el.textContent = end; return; }
        const dur = 1200, t0 = performance.now();
        const step = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    /* ---------- Reveal saat scroll ---------- */
    const revealEls = $$('.reveal');
    const reveal = (el) => {
        el.classList.add('is-visible');
        $$('[data-count]', el).forEach(countUp);
    };
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach(reveal);
    }

    /* ---------- Scroll progress + link aktif + tombol ke atas ---------- */
    const bar = $('#scrollProgress');
    const toTop = $('#toTop');
    const links = $$('[data-link]');
    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    let ticking = false;

    const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        toTop.classList.toggle('show', scrollY > 600);

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

    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

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
            card.classList.add('is-visible');
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

    /* ---------- Form kontak -> WhatsApp ---------- */
    const form = $('#contactForm');
    const hint = $('#formHint');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const msg = form.message.value.trim();

        [form.name, form.message].forEach((el) => el.parentElement.classList.toggle('is-error', !el.value.trim()));
        if (!name || !msg) {
            hint.textContent = 'Nama dan pesan wajib diisi.';
            return;
        }

        const text = `Halo KYO, saya ${name}${email ? ` (${email})` : ''}.\n\n${msg}`;
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        hint.textContent = 'Pesan dibuka di WhatsApp dengan teks yang sudah terisi.';
        form.reset();
    });
    $$('input, textarea', form).forEach((el) => el.addEventListener('input', () => el.parentElement.classList.remove('is-error')));

    /* ---------- Hemat baterai: pause video logo saat tab tidak aktif ---------- */
    const logoVideo = $('.logo-frame video');
    if (logoVideo) {
        document.addEventListener('visibilitychange', () => {
            document.hidden ? logoVideo.pause() : logoVideo.play().catch(() => {});
        });
        if (reduceMotion) logoVideo.pause();
    }
})();
