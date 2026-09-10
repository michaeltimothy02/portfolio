/*
 * Renders the "Internship Experience" cards on the homepage.
 * Data lives in scripts/data.js — edit that file to add/change internships.
 * This script tag sits at the end of <body>, so the DOM is already parsed
 * by the time it runs — no need to wait for DOMContentLoaded.
 */
(() => {
    const container = document.getElementById('internship-cards');
    if (!container || typeof internships === 'undefined') return;

    internships.forEach((internship) => {
        const card = document.createElement('a');
        card.href = `experience-detail.html?id=${internship.id}`;
        card.className = 'group relative flex items-start gap-5 md:gap-6 p-5 md:p-6 rounded-[24px] bg-surface-container border border-outline-variant/20 ambient-shadow hover:translate-y-[-2px] transition-all duration-300';

        card.innerHTML = `
            <div class="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/20">
                <img src="${internship.logo}" alt="${internship.company} logo" class="w-full h-full object-contain" />
            </div>
            <div class="min-w-0 flex-1 pr-8">
                <h3 class="font-headline-md text-headline-md text-primary leading-tight mb-1">${internship.company}</h3>
                <p class="font-label-md text-label-md text-secondary mb-1">${internship.role}</p>
                <p class="text-on-surface-variant text-body-md">${internship.startDate} – ${internship.endDate}</p>
            </div>
            <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all absolute top-5 right-5 md:top-6 md:right-6">arrow_forward</span>
        `;

        container.appendChild(card);
    });
})();
