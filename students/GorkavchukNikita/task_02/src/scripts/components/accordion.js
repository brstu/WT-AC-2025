export function initializeAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => toggleAccordion(header));
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAccordion(header);
            }
        });
    });
}

function toggleAccordion(header) {
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    const panel = document.getElementById(header.getAttribute('aria-controls'));
    
    header.setAttribute('aria-expanded', !isExpanded);
    panel.setAttribute('aria-hidden', isExpanded);
}