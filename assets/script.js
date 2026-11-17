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

    /* ---------- Portfolio: folder -> popup galeri ----------
       EDIT DI SINI: tambah/ubah folder dan nama file foto.
       Letakkan foto di folder `dir` (mis. images/portfolio/cinemedia/01.jpg).
       Foto pertama dipakai sebagai cover. Kalau file belum ada, tampil placeholder. */
    const PORTFOLIO = [
        {
            title: 'CineMedia', desc: 'Foto & video sinematik', hue: [275, 330],
            dir: 'images/portfolio/cinemedia/',
            photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg']
        },
        {
            title: 'Portrait', desc: 'Sesi foto personal & profil', hue: [200, 260],
            dir: 'images/portfolio/portrait/',
            photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg']
        },
        {
            title: 'Event', desc: 'Dokumentasi acara & momen', hue: [330, 20],
            dir: 'images/portfolio/event/',
            photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg']
        },
        {
            title: 'Web Design', desc: 'Tampilan website & landing page', hue: [175, 230],
            dir: 'images/portfolio/web/',
            photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg']
        }
    ];

    const placeholder = (label, hue) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>` +
        `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
        `<stop offset='0' stop-color='hsl(${hue[0]},65%,38%)'/><stop offset='1' stop-color='hsl(${hue[1]},65%,18%)'/></linearGradient></defs>` +
        `<rect width='800' height='800' fill='url(#g)'/>` +
        `<text x='50%' y='50%' fill='rgba(255,255,255,.75)' font-family='sans-serif' font-size='46' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`
    );

    const setPhoto = (img, folder, i) => {
        img.onerror = () => { img.onerror = null; img.src = placeholder(`${folder.title} ${String(i + 1).padStart(2, '0')}`, folder.hue); };
        img.src = folder.dir + folder.photos[i];
    };
    const makeImg = (folder, i, alt) => {
        const img = new Image();
        img.alt = alt;
        img.decoding = 'async';
        img.loading = 'lazy';
        setPhoto(img, folder, i);
        return img;
    };

    const folderGrid = $('#folderGrid');
    const gm = $('#galleryModal');
    const gmGrid = $('#gmGrid');
    const gmClose = $('#gmClose');
    const lb = $('#lightbox');
    const lbImg = $('#lbImg');
    const lbCap = $('#lbCap');
    let current = null, lbIndex = 0, lastFocus = null;

    const lockScroll = (on) => document.documentElement.classList.toggle('no-scroll', on);
    const isOpen = (el) => el.classList.contains('is-open');

    const openGallery = (folder, trigger) => {
        current = folder;
        lastFocus = trigger;
        $('#gmTitle').textContent = folder.title;
        $('#gmCount').textContent = `${folder.photos.length} foto`;
        gmGrid.replaceChildren();
        folder.photos.forEach((_, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'gm-item';
            b.setAttribute('aria-label', `Buka foto ${i + 1} dari ${folder.photos.length}`);
            b.append(makeImg(folder, i, `${folder.title} - foto ${i + 1}`));
            b.addEventListener('click', () => openLightbox(i));
            gmGrid.append(b);
        });
        gmGrid.scrollTop = 0;
        gm.classList.add('is-open');
        gm.setAttribute('aria-hidden', 'false');
        lockScroll(true);
        gmClose.focus({ preventScroll: true });
    };

    const closeGallery = () => {
        gm.classList.remove('is-open');
        gm.setAttribute('aria-hidden', 'true');
        lockScroll(false);
        lastFocus?.focus({ preventScroll: true });
    };

    const showPhoto = (i) => {
        const n = current.photos.length;
        lbIndex = (i + n) % n;
        lbImg.alt = `${current.title} - foto ${lbIndex + 1}`;
        setPhoto(lbImg, current, lbIndex);
        lbCap.textContent = `${current.title} · ${lbIndex + 1} / ${n}`;
    };
    const openLightbox = (i) => {
        showPhoto(i);
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        $('#lbClose').focus({ preventScroll: true });
    };
    const closeLightbox = () => {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        const thumb = gmGrid.children[lbIndex];
        (thumb || gmClose).focus({ preventScroll: true });
    };

    PORTFOLIO.forEach((folder, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'folder reveal';
        btn.style.setProperty('--i', i);
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.setAttribute('aria-label', `Buka folder ${folder.title}, ${folder.photos.length} foto`);
        btn.innerHTML =
            '<span class="folder-photos" aria-hidden="true"></span>' +
            `<span class="folder-front"><strong>${folder.title}</strong><small>${folder.desc}</small><em>${folder.photos.length} foto</em></span>`;
        const stack = btn.firstElementChild;
        folder.photos.slice(0, 3).forEach((_, k) => stack.append(makeImg(folder, k, '')));
        btn.addEventListener('click', () => openGallery(folder, btn));
        folderGrid.append(btn);
    });

    gmClose.addEventListener('click', closeGallery);
    gm.addEventListener('click', (e) => { if (e.target === gm) closeGallery(); });
    $('#lbClose').addEventListener('click', closeLightbox);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    $('#lbPrev').addEventListener('click', () => showPhoto(lbIndex - 1));
    $('#lbNext').addEventListener('click', () => showPhoto(lbIndex + 1));

    let touchX = null;
    lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        const layer = isOpen(lb) ? lb : isOpen(gm) ? gm : null;
        if (!layer) return;
        if (e.key === 'Escape') { layer === lb ? closeLightbox() : closeGallery(); return; }
        if (layer === lb && e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
        if (layer === lb && e.key === 'ArrowRight') showPhoto(lbIndex + 1);
        if (e.key === 'Tab') { // fokus tetap di dalam popup
            const items = $$('button', layer);
            const first = items[0], last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

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

    /* ---------- Hemat baterai: pause video logo saat tab tidak aktif ---------- */
    const logoVideo = $('.logo-frame video');
    if (logoVideo) {
        document.addEventListener('visibilitychange', () => {
            document.hidden ? logoVideo.pause() : logoVideo.play().catch(() => {});
        });
        if (reduceMotion) logoVideo.pause();
    }
})();
