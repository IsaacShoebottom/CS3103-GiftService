// Detects the user's preferred color scheme and sets the theme accordingly
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.getElementsByTagName('html')[0].setAttribute('data-bs-theme', 'dark');
} else {
    document.getElementsByTagName('html')[0].setAttribute('data-bs-theme', 'light');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    let theme = event.matches ? "dark" : "light";
    document.getElementsByTagName('html')[0].setAttribute('data-bs-theme', theme);
});