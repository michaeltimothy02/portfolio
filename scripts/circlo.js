const progressBar = document.getElementById('progress-bar');

function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
}

window.addEventListener('scroll', updateProgress, { passive: true });

const toggle = document.getElementById('dark-toggle');
const html   = document.documentElement;

if (localStorage.getItem('theme') === 'dark') {
    html.classList.add('dark');
    toggle.textContent = 'light_mode';
}

toggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    toggle.textContent = isDark ? 'light_mode' : 'dark_mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

(function () {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <div class="lightbox-inner" id="lb-inner">
            <img class="lightbox-img" id="lb-img" src="" alt="" />
        </div>
        <button class="lightbox-close" id="lb-close" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
        </button>
        <div class="lightbox-controls">
            <button class="lightbox-btn" id="lb-zoom-out" aria-label="Zoom out">
                <span class="material-symbols-outlined">zoom_out</span>
            </button>
            <span class="lightbox-zoom-label" id="lb-zoom-label">100%</span>
            <button class="lightbox-btn" id="lb-zoom-in" aria-label="Zoom in">
                <span class="material-symbols-outlined">zoom_in</span>
            </button>
            <button class="lightbox-btn" id="lb-zoom-reset" aria-label="Reset zoom" title="Reset">
                <span class="material-symbols-outlined">center_focus_strong</span>
            </button>
        </div>
    `;
    document.body.appendChild(overlay);

    const lbImg       = document.getElementById('lb-img');
    const lbClose     = document.getElementById('lb-close');
    const lbZoomIn    = document.getElementById('lb-zoom-in');
    const lbZoomOut   = document.getElementById('lb-zoom-out');
    const lbZoomReset = document.getElementById('lb-zoom-reset');
    const lbLabel     = document.getElementById('lb-zoom-label');
    const lbInner     = document.getElementById('lb-inner');

    let scale = 1, panX = 0, panY = 0, isPanning = false, startX, startY;
    const MIN_SCALE = 0.5, MAX_SCALE = 4, STEP = 0.25;

    function applyTransform() {
        lbImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        lbLabel.textContent   = Math.round(scale * 100) + '%';
        lbImg.style.cursor    = scale > 1 ? 'grab' : 'default';
    }

    function resetView() { scale = 1; panX = 0; panY = 0; applyTransform(); }

    function openLightbox(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || '';
        resetView();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { lbImg.src = ''; resetView(); }, 300);
    }

    lbZoomIn.addEventListener('click', () => { scale = Math.min(MAX_SCALE, scale + STEP); applyTransform(); });
    lbZoomOut.addEventListener('click', () => { scale = Math.max(MIN_SCALE, scale - STEP); if (scale <= 1) { panX = 0; panY = 0; } applyTransform(); });
    lbZoomReset.addEventListener('click', resetView);

    lbInner.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? STEP : -STEP;
        scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
        if (scale <= 1) { panX = 0; panY = 0; }
        applyTransform();
    }, { passive: false });

    lbImg.addEventListener('mousedown', (e) => {
        if (scale <= 1) return;
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        lbImg.classList.add('grabbing');
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        applyTransform();
    });

    window.addEventListener('mouseup', () => {
        if (!isPanning) return;
        isPanning = false;
        lbImg.classList.remove('grabbing');
    });

    let lastTouchDist = null;

    lbInner.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            lastTouchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        } else if (e.touches.length === 1 && scale > 1) {
            isPanning = true;
            startX = e.touches[0].clientX - panX;
            startY = e.touches[0].clientY - panY;
        }
    }, { passive: true });

    lbInner.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && lastTouchDist !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (dist / lastTouchDist)));
            lastTouchDist = dist;
            if (scale <= 1) { panX = 0; panY = 0; }
            applyTransform();
            e.preventDefault();
        } else if (e.touches.length === 1 && isPanning) {
            panX = e.touches[0].clientX - startX;
            panY = e.touches[0].clientY - startY;
            applyTransform();
            e.preventDefault();
        }
    }, { passive: false });

    lbInner.addEventListener('touchend', () => { lastTouchDist = null; isPanning = false; });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target === lbInner) closeLightbox();
    });
    lbClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeLightbox();
    });

    window.openLightbox = openLightbox;
})();

(function () {
    const track  = document.getElementById('interface-carousel');
    const card   = track.closest('.carousel-card');
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const dots   = Array.from(document.getElementById('carousel-dots').querySelectorAll('.dot'));
    const btnL   = document.getElementById('arrow-left');
    const btnR   = document.getElementById('arrow-right');
    const total  = slides.length;
    let current  = 0;

    function goToSlide(index) {
        current = index;
        const slideW = slides[0].offsetWidth;
        const gap    = 20;
        const cardW  = card.getBoundingClientRect().width;
        const offset = (cardW / 2) - (index * (slideW + gap)) - (slideW / 2);

        track.style.transform = `translateX(${offset}px)`;
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i)   => d.classList.toggle('active', i === index));

        btnL.disabled = index === 0;
        btnR.disabled = index === total - 1;

        const labelEl = document.getElementById('caption-label');
        const descEl  = document.getElementById('caption-desc');
        labelEl.style.opacity = '0';
        descEl.style.opacity  = '0';

        setTimeout(() => {
            labelEl.textContent = slides[index].dataset.label;
            descEl.textContent  = slides[index].dataset.desc;
            labelEl.style.opacity = '1';
            descEl.style.opacity  = '1';
        }, 180);
    }

    btnL.addEventListener('click', () => { if (current > 0) goToSlide(current - 1); });
    btnR.addEventListener('click', () => { if (current < total - 1) goToSlide(current + 1); });
    dots.forEach((d, i) => d.addEventListener('click', () => goToSlide(i)));
    window.addEventListener('resize', () => goToSlide(current));

    slides.forEach((slide) => {
        const img = slide.querySelector('.phone-screen-img');
        if (!img) return;
        img.addEventListener('click', () => {
            const idx = slides.indexOf(slide);
            if (idx === current) {
                window.openLightbox(img.src, img.alt);
            } else {
                goToSlide(idx);
            }
        });
    });

    card.addEventListener('touchstart', e => { card._touchX = e.touches[0].clientX; }, { passive: true });
    card.addEventListener('touchend', e => {
        const diff = card._touchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0 && current < total - 1) goToSlide(current + 1);
            if (diff < 0 && current > 0)         goToSlide(current - 1);
        }
    }, { passive: true });

    function init() {
        track.style.transition = 'none';
        goToSlide(0);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            track.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
        }));
    }

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
})();

document.querySelectorAll('.hero-zoomable').forEach(img => {
    img.addEventListener('click', () => window.openLightbox(img.src, img.alt));
});