const toggleButton = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Check if a theme was saved from a previous visit
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    toggleButton.textContent = savedTheme === 'light' ? '☀️' : '🌙';
}

toggleButton.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    toggleButton.textContent = newTheme === 'light' ? '☀️' : '🌙';
});