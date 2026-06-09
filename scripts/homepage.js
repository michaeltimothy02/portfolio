const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
}

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a:not(.bg-primary)');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('text-primary');
        link.classList.add('text-on-surface-variant');

        if (current && link.getAttribute('href').includes(current)) {
            link.classList.add('text-primary');
            link.classList.remove('text-on-surface-variant');
        }
    });
});

const themeToggle = document.querySelector('button[data-icon="dark_mode"]');
const html = document.documentElement;

if (savedTheme === 'dark') {
    themeToggle.textContent = 'light_mode';
}

themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    themeToggle.textContent = isDark ? 'light_mode' : 'dark_mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

const filterButtons = document.querySelectorAll('#projects .flex.gap-4 button');

const categoryMap = {
    'stylezone': ['web'],
    'mono': ['web'],
    'bitenbrew': ['uiux'],
    'circlo': ['uiux', 'mobile'],
    'moviezone': ['mobile'],
};

document.querySelectorAll('#projects a[href]').forEach(card => {
    const href = card.getAttribute('href') || '';
    const key = Object.keys(categoryMap).find(k => href.includes(k));
    if (key) {
        card.setAttribute('data-category', categoryMap[key].join(' '));
    }
    card.setAttribute('data-original-class', card.className);
    card.setAttribute('data-original-parent', card.parentElement.className);
});

const projectsContainer = document.querySelector('#projects .max-w-\\[1200px\\]');
let filterGrid = document.createElement('div');
filterGrid.id = 'filter-grid';
filterGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-8 mt-8';
filterGrid.style.display = 'none';
projectsContainer.appendChild(filterGrid);

const originalGrids = document.querySelectorAll('#projects .grid');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
            b.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
            b.classList.add('text-on-surface-variant');
        });
        btn.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
        btn.classList.remove('text-on-surface-variant');

        const filterKey = btn.textContent.trim().toLowerCase().replace(/[\s\/]/g, '');

        if (filterKey === 'all') {
            filterGrid.style.display = 'none';
            filterGrid.innerHTML = '';
            originalGrids.forEach(g => g.style.display = '');

            document.querySelectorAll('#projects a[data-category]').forEach(card => {
                card.style.display = '';
                card.className = card.getAttribute('data-original-class');
            });
        } else {
            originalGrids.forEach(g => g.style.display = 'none');

            filterGrid.style.display = 'grid';
            filterGrid.innerHTML = '';

            document.querySelectorAll('#projects a[data-category]').forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                if (categories.includes(filterKey)) {
                    // Clone card dan reset col-span
                    const clone = card.cloneNode(true);
                    clone.className = clone.className
                        .replace(/lg:col-span-\d+/g, '')
                        .replace(/md:col-span-\d+/g, '');
                    filterGrid.appendChild(clone);
                }
            });
        }
    });
});

const contactForm = document.querySelector('#contact form');
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbym3rwI43jD0FWv3JXi2Sp_yTVVavEpkfQyLMReNdKMlcX0AMGR90MBzfxYcNbp_5bf/exec';

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const inputs = contactForm.querySelectorAll('input, textarea');
    const [name, email, subject, message] = [...inputs].map(i => i.value.trim());

    contactForm.querySelectorAll('.error-msg').forEach(el => el.remove());
    contactForm.querySelectorAll('input, textarea').forEach(el => {
        el.classList.remove('border-red-400');
    });

    const fields = [
        { el: inputs[0], val: name, msg: 'Full name is required.' },
        { el: inputs[1], val: email, msg: 'Email address is required.' },
        { el: inputs[2], val: subject, msg: 'Subject is required.' },
        { el: inputs[3], val: message, msg: 'Message is required.' },
    ];

    let hasError = false;
    fields.forEach(({ el, val, msg }) => {
        if (!val) {
            el.classList.add('border-red-400');
            const err = document.createElement('p');
            err.className = 'error-msg text-red-500 text-xs mt-1';
            err.textContent = msg;
            el.parentElement.appendChild(err);
            hasError = true;
        }
    });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        inputs[1].classList.add('border-red-400');
        const existing = inputs[1].parentElement.querySelector('.error-msg');
        if (!existing) {
            const err = document.createElement('p');
            err.className = 'error-msg text-red-500 text-xs mt-1';
            err.textContent = 'Please enter a valid email address.';
            inputs[1].parentElement.appendChild(err);
        }
        hasError = true;
    }

    if (hasError) return; 

    btn.innerHTML = 'Sending... <span class="material-symbols-outlined text-[18px]">hourglass_empty</span>';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('subject', subject);
    formData.append('message', message);

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
        btn.innerHTML = 'Message Sent ✓';
        btn.style.background = '#356668';
        contactForm.reset();
    } catch {
        btn.innerHTML = 'Failed. Try again.';
        btn.disabled = false;
    }
});