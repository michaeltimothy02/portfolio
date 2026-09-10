/*
 * Populates the dynamic parts of the internship detail page from scripts/data.js:
 * the header (logo, name, role, period) based on the `id` query parameter, plus
 * each project's image carousel(s) and CTA button. All descriptive text lives
 * directly in pages/experience-detail.html so it can be edited without touching
 * this file.
 *
 * This script tag sits at the end of <body>, so the DOM is already parsed
 * by the time it runs — no need to wait for DOMContentLoaded.
 */

// Scroll progress line under the navbar — same component used on the other project detail pages.
const progressBar = document.getElementById('progress-bar');
function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

// Dark mode toggle — same behavior as the other project detail pages.
const toggle = document.getElementById('dark-toggle');
const html = document.documentElement;
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

// Lightbox for zooming into carousel/ERD images — same component used on the other project detail pages.
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

    const lbImg = document.getElementById('lb-img');
    const lbClose = document.getElementById('lb-close');
    const lbZoomIn = document.getElementById('lb-zoom-in');
    const lbZoomOut = document.getElementById('lb-zoom-out');
    const lbZoomReset = document.getElementById('lb-zoom-reset');
    const lbLabel = document.getElementById('lb-zoom-label');
    const lbInner = document.getElementById('lb-inner');

    let scale = 1, panX = 0, panY = 0, isPanning = false, startX, startY;
    const MIN_SCALE = 0.5, MAX_SCALE = 4, STEP = 0.25;

    function applyTransform() {
        lbImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        lbLabel.textContent = Math.round(scale * 100) + '%';
        lbImg.style.cursor = scale > 1 ? 'grab' : 'default';
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
            lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        } else if (e.touches.length === 1 && scale > 1) {
            isPanning = true;
            startX = e.touches[0].clientX - panX;
            startY = e.touches[0].clientY - panY;
        }
    }, { passive: true });

    lbInner.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && lastTouchDist !== null) {
            const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
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

    overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target === lbInner) closeLightbox(); });
    lbClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('active')) closeLightbox(); });

    window.openLightbox = openLightbox;
})();

// ERD image click-to-zoom (the Database Design image is static content in the HTML).
document.querySelectorAll('.erd-wrap img').forEach((img) => {
    img.addEventListener('click', () => window.openLightbox(img.src, img.alt));
});

// Generic swipeable carousel — same behavior as scripts/stylezone.js's initCarousel,
// parametrized so multiple carousels (one per project section) can share the same logic.
function initCarousel(carouselId, dotsId, leftBtnId, rightBtnId, labelId, descId) {
    const track = document.getElementById(carouselId);
    const card = track.closest('.carousel-card');
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.getElementById(dotsId).querySelectorAll('.dot'));
    const btnL = document.getElementById(leftBtnId);
    const btnR = document.getElementById(rightBtnId);
    const total = slides.length;
    let current = 0;

    // Match the track height to the active image's natural aspect ratio so the
    // frame always fits the image exactly (no letterbox gaps, no cropping),
    // even though slides can have different heights.
    let sized = false;
    function syncTrackHeight() {
        const img = slides[current].querySelector('img');
        if (!img || !img.naturalWidth) return;
        // offsetWidth is the un-transformed layout width, so this stays correct
        // even while the slide is mid-way through its scale() transition.
        const renderedW = img.offsetWidth;
        const h = renderedW * (img.naturalHeight / img.naturalWidth);
        if (h <= 0) return;
        if (!sized) {
            // First real measurement — apply instantly so the carousel doesn't
            // animate its height in from zero on initial load.
            const prevTransition = track.style.transition;
            track.style.transition = 'none';
            track.style.height = h + 'px';
            void track.offsetHeight;
            track.style.transition = prevTransition;
            sized = true;
        } else {
            track.style.height = h + 'px';
        }
    }

    function goToSlide(index) {
        current = index;

        const slideW = slides[0].offsetWidth;
        const gap = 20;
        const cardW = card.getBoundingClientRect().width;
        const offset = (cardW / 2) - (index * (slideW + gap)) - (slideW / 2);
        track.style.transform = `translateX(${offset}px)`;

        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
        syncTrackHeight();

        btnL.disabled = index === 0;
        btnR.disabled = index === total - 1;

        const labelEl = document.getElementById(labelId);
        const descEl = document.getElementById(descId);
        labelEl.style.opacity = '0';
        descEl.style.opacity = '0';
        setTimeout(() => {
            labelEl.textContent = slides[index].dataset.label;
            descEl.textContent = slides[index].dataset.desc;
            labelEl.style.opacity = '1';
            descEl.style.opacity = '1';
        }, 180);
    }

    btnL.addEventListener('click', () => { if (current > 0) goToSlide(current - 1); });
    btnR.addEventListener('click', () => { if (current < total - 1) goToSlide(current + 1); });
    dots.forEach((d, i) => d.addEventListener('click', () => goToSlide(i)));
    window.addEventListener('resize', () => goToSlide(current));

    slides.forEach((slide) => {
        const img = slide.querySelector('img');
        img.addEventListener('load', syncTrackHeight);
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
            if (diff < 0 && current > 0) goToSlide(current - 1);
        }
    }, { passive: true });

    function init() {
        track.style.transition = 'none';
        goToSlide(0);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            track.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1), height 0.45s cubic-bezier(0.4,0,0.2,1)';
        }));
    }

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
}

// Builds one carousel's markup (arrows, slides, dots, caption).
function renderCarousel(carousel, uid) {
    const ids = {
        track: `carousel-${uid}`,
        dots: `dots-${uid}`,
        arrowLeft: `arrow-left-${uid}`,
        arrowRight: `arrow-right-${uid}`,
        label: `caption-label-${uid}`,
        desc: `caption-desc-${uid}`
    };

    const slidesHtml = carousel.slides.map((slide, i) => `
        <div class="carousel-slide${i === 0 ? ' active' : ''}" data-label="${slide.label}" data-desc="${slide.desc}">
            <img src="${slide.image}" alt="${slide.label}" />
        </div>
    `).join('');

    const dotsHtml = carousel.slides.map((_, i) => `
        <button class="dot${i === 0 ? ' active' : ''}" data-index="${i}"></button>
    `).join('');

    const wrapper = document.createElement('div');
    wrapper.className = 'carousel-wrapper reveal';
    wrapper.innerHTML = `
        <p class="carousel-section-label">${carousel.sectionLabel}</p>
        <div class="carousel-outer">
            <button class="carousel-arrow carousel-arrow-left" id="${ids.arrowLeft}" aria-label="Previous">
                <span class="material-symbols-outlined">arrow_back_ios</span>
            </button>
            <div class="carousel-card">
                <div class="carousel-slides" id="${ids.track}">${slidesHtml}</div>
            </div>
            <button class="carousel-arrow carousel-arrow-right" id="${ids.arrowRight}" aria-label="Next">
                <span class="material-symbols-outlined">arrow_forward_ios</span>
            </button>
        </div>
        <div class="carousel-footer">
            <div class="carousel-dots" id="${ids.dots}">${dotsHtml}</div>
            <div class="carousel-caption">
                <span class="caption-label" id="${ids.label}">${carousel.slides[0].label}</span>
                <p class="caption-desc" id="${ids.desc}">${carousel.slides[0].desc}</p>
            </div>
            <p class="carousel-click-hint">
                <span class="material-symbols-outlined">zoom_in</span>
                Click active image to enlarge
            </p>
        </div>
    `;

    return { wrapper, ids };
}

// Renders every carousel for a project into its mount point in the static HTML.
function renderCarousels(carousels, mountId, uidPrefix) {
    const mount = document.getElementById(mountId);
    if (!mount || !carousels) return;

    carousels.forEach((carousel, i) => {
        const uid = carousels.length > 1 ? `${uidPrefix}c${i}` : uidPrefix;
        const { wrapper, ids } = renderCarousel(carousel, uid);
        mount.appendChild(wrapper);
        initCarousel(ids.track, ids.dots, ids.arrowLeft, ids.arrowRight, ids.label, ids.desc);
    });
}

// Renders a project's CTA button into its mount point in the static HTML.
function renderCta(cta, mountId, isLast) {
    const mount = document.getElementById(mountId);
    if (!mount || !cta) return;

    mount.className = 'figma-cta-wrap';
    mount.style.marginBottom = isLast ? '48px' : '36px';
    mount.innerHTML = `
        <a href="${cta.url}" target="_blank" rel="noopener noreferrer" class="figma-cta">
            <span class="material-symbols-outlined">${cta.icon || 'open_in_new'}</span>
            ${cta.label}
        </a>
    `;
}

(function () {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    const internship = internships.find((item) => item.id === id);

    const headerEl = document.getElementById('internship-header');
    const breadcrumbEl = document.getElementById('breadcrumb-company');

    if (!internship) {
        headerEl.innerHTML = '<p class="text-on-surface-variant">Internship not found.</p>';
        return;
    }

    document.title = `${internship.company} | Internship Experience`;
    if (breadcrumbEl) breadcrumbEl.textContent = internship.company;

    // Header: company photo, name, role, period. The logo container is sized
    // generously with object-contain so the full logo shows without cropping.
    headerEl.innerHTML = `
        <div class="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/20">
            <img src="${internship.logo}" alt="${internship.company} logo" class="w-full h-full object-contain" />
        </div>
        <div>
            <h1 class="font-headline-lg text-headline-lg text-primary mb-2">${internship.company}</h1>
            <p class="font-label-md text-label-md text-secondary mb-1">${internship.role}</p>
            <p class="text-on-surface-variant">${internship.startDate} – ${internship.endDate}</p>
        </div>
    `;

    // Each project's image carousel(s) and CTA button — everything else on this
    // page (Overview, project write-ups, Design Process, Visual Language, User
    // Roles, Database Design) is static content directly in the HTML.
    const [project1, project2] = internship.projects;
    renderCarousels(project1.carousels, 'project1-carousels', 'p0');
    renderCta(project1.cta, 'project1-cta', false);
    renderCarousels(project2.carousels, 'project2-carousels', 'p1');
    renderCta(project2.cta, 'project2-cta', true);

    // Fade-in-on-scroll for every .reveal block on the page (static sections plus
    // whatever carousels were just injected above).
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
})();
