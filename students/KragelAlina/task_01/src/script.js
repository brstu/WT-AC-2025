document.addEventListener('DOMContentLoaded', () => {
    const buttonToggle = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;

    const themeFromStorage = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = themeFromStorage || (prefersDarkScheme ? 'dark' : 'light');
    
    rootElement.setAttribute('data-theme', initialTheme);
    buttonToggle.textContent = initialTheme === 'dark' ? '☀' : '🌙';

    buttonToggle.addEventListener('click', () => {
        const currentTheme = rootElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        rootElement.setAttribute('data-theme', nextTheme);
        buttonToggle.textContent = nextTheme === 'dark' ? '☀' : '🌙';
        localStorage.setItem('theme', nextTheme);
    });

    buttonToggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            buttonToggle.click();
        }
    });

    const habitForm = document.getElementById('habit-form');
    const habitsTableBody = document.querySelector('#habits-table tbody');

    habitForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const habitSelect = document.getElementById('habit');
        const dateInput = document.getElementById('date');

        const habit = habitSelect.value;
        const date = dateInput.value;

        if (habit && date) {
            const newRow = document.createElement('tr');
            newRow.setAttribute('tabindex', '0');
            const dateCell = document.createElement('td');
            const habitCell = document.createElement('td');

            dateCell.textContent = date;
            habitCell.textContent = habit;

            newRow.appendChild(dateCell);
            newRow.appendChild(habitCell);
            habitsTableBody.appendChild(newRow);

            habitSelect.value = '';
            dateInput.value = '';
        }
    });
});