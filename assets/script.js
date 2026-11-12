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

    if (toggle && menu) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenu(!menu.classList.contains('active'));
        });
        menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
        document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setMenu(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
        matchMedia('(min-width: 861px)').addEventListener('change', () => setMenu(false));
    }

    /* ---------- Reveal saat scroll ---------- */
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

    /* ---------- Scroll progress + link aktif ---------- */
    const bar = $('#scrollProgress');
    const links = $$('[data-link]');
    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    let ticking = false;

    const onScroll = () => {
        if (bar) {
            const max = document.documentElement.scrollHeight - innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        }

        const pos = scrollY + innerHeight * 0.35;
        let current = sections[0];
        sections.forEach((s) => { if (s && s.offsetTop <= pos) current = s; });
        if (current) {
            links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current.id));
        }
        ticking = false;
    };
    addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ---------- FOLDER INTERAKTIF LOGIC ---------- */
    const folderGridView = $('#folderGridView');
    const categoryDetailView = $('#categoryDetailView');
    const backFolderBtn = $('#backFolderBtn');
    const currentFolderTitle = $('#currentFolderTitle');
    const folderCards = $$('.folder-card');
    const cards = $$('.card[data-cat]');

    const categoryTitles = {
        'video': 'Cinematography & Video',
        'web': 'Web Development',
        'photo': 'Photography Session'
    };

    const openFolder = (cat) => {
        if (!folderGridView || !categoryDetailView) return;

        if (currentFolderTitle) {
            currentFolderTitle.textContent = categoryTitles[cat] || 'Karya Terpilih';
        }

        folderGridView.style.display = 'none';
        categoryDetailView.classList.add('active');

        cards.forEach((card) => {
            const show = card.dataset.cat === cat;
            if (show) {
                card.classList.remove('is-hidden', 'is-fading');
                card.classList.add('is-visible');
            } else {
                card.classList.add('is-hidden');
            }
        });

        $('#works').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    const closeFolder = () => {
        if (!folderGridView || !categoryDetailView) return;

        categoryDetailView.classList.remove('active');
        folderGridView.style.display = 'grid';

        $('#works').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    folderCards.forEach((folder) => {
        const cat = folder.dataset.category;
        folder.addEventListener('click', () => openFolder(cat));
        folder.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFolder(cat);
            }
        });
    });

    if (backFolderBtn) {
        backFolderBtn.addEventListener('click', closeFolder);
    }

    /* ---------- Spotlight kartu (perangkat mouse) ---------- */
    if (canHover && !reduceMotion) {
        $$('.card, .card-lite, .folder-card').forEach((card) => {
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

    /* ---------- Hemat baterai video logo ---------- */
    const logoVideo = $('.logo-frame video');
    if (logoVideo) {
        document.addEventListener('visibilitychange', () => {
            document.hidden ? logoVideo.pause() : logoVideo.play().catch(() => {});
        });
        if (reduceMotion) logoVideo.pause();
    }
})();
