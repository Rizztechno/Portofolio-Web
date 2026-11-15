(() => {
    'use strict';

    /* Nomor WhatsApp (format internasional tanpa +) */
    const WA_NUMBER = '6282233129573';

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

    /* ---------- Reveal saat scroll ---------- */
    const revealEls = $$('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
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

    /* ---------- Efek mengetik di hero ---------- */
    const typedEl = $('#typed');
    if (typedEl && !reduceMotion) {
        const words = ['CineMedia', 'Web Developer', 'App Premium Store'];
        let wi = 0, ci = 0, deleting = false;
        const tick = () => {
            const word = words[wi];
            ci += deleting ? -1 : 1;
            typedEl.textContent = word.slice(0, ci);
            let wait = deleting ? 45 : 95;
            if (!deleting && ci === word.length) { deleting = true; wait = 1600; }
            else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; wait = 350; }
            setTimeout(tick, wait);
        };
        typedEl.textContent = '';
        setTimeout(tick, 900);
    }

    /* ---------- Parallax teks raksasa di hero (hanya perangkat mouse) ---------- */
    const stage = $('#heroStage');
    const giant = $('#giantText');
    if (stage && giant && canHover && !reduceMotion) {
        let raf = 0;
        stage.addEventListener('pointermove', (e) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                const r = stage.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                giant.style.transform = `translate3d(${x * -26}px, ${y * -14}px, 0)`;
                raf = 0;
            });
        }, { passive: true });
        stage.addEventListener('pointerleave', () => { giant.style.transform = ''; });
    }

    /* ---------- Spotlight kartu layanan (hanya perangkat mouse) ---------- */
    if (canHover && !reduceMotion) {
        $$('.card-lite').forEach((card) => {
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

    /* ---------- Pilih layanan -> isi form kontak ---------- */
    const form = $('#contactForm');
    const nameInput = $('#cName');
    const emailInput = $('#cEmail');
    const serviceSelect = $('#cService');
    const msgInput = $('#cMsg');
    const hint = $('#formHint');
    const defaultHint = hint.textContent;

    $$('.service-btn').forEach((btn) => btn.addEventListener('click', () => {
        serviceSelect.value = btn.dataset.service;
        setTimeout(() => (nameInput.value ? msgInput : nameInput).focus({ preventScroll: true }), reduceMotion ? 0 : 650);
    }));

    /* ---------- Form kontak -> WhatsApp ---------- */
    const setHint = (text, isError) => {
        hint.textContent = text;
        hint.classList.toggle('is-error', !!isError);
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const service = serviceSelect.value;
        const msg = msgInput.value.trim();

        nameInput.parentElement.classList.toggle('is-error', !name);
        msgInput.parentElement.classList.toggle('is-error', !msg);
        if (!name || !msg) {
            setHint('Nama dan pesan wajib diisi.', true);
            return;
        }

        const text = `Halo Itzy, saya ${name}${email ? ` (${email})` : ''}.\nLayanan: ${service}\n\n${msg}`;
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        setHint(defaultHint, false);
        form.reset();
    });
    [nameInput, msgInput].forEach((el) => el.addEventListener('input', () => {
        el.parentElement.classList.remove('is-error');
        if (hint.classList.contains('is-error')) setHint(defaultHint, false);
    }));

    /* ---------- Embed Instagram (dimuat hanya saat section mendekati layar) ---------- */
    const igPosts = $$('.instagram-post');
    const portfolio = $('#portfolio');
    let igStarted = false;

    const markFallback = () => {
        igPosts.forEach((post) => {
            if (!post.querySelector('iframe')) post.classList.add('embed-fallback');
        });
    };

    const loadInstagram = () => {
        if (igStarted) return;
        igStarted = true;
        const s = document.createElement('script');
        s.src = 'https://www.instagram.com/embed.js';
        s.async = true;
        s.onload = () => window.instgrm?.Embeds?.process();
        s.onerror = markFallback;
        document.body.append(s);
        setTimeout(markFallback, 9000); // kalau embed tidak muncul (diblokir/offline), tampilkan tombol cadangan
    };

    if (portfolio && igPosts.length) {
        if ('IntersectionObserver' in window) {
            const igObserver = new IntersectionObserver((entries) => {
                if (entries.some((en) => en.isIntersecting)) { loadInstagram(); igObserver.disconnect(); }
            }, { rootMargin: '600px 0px' });
            igObserver.observe(portfolio);
        } else {
            loadInstagram();
        }
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
