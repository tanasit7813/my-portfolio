// theme.js
function setTheme() {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const htmlElement = document.documentElement;

    if (isDarkMode) {
        htmlElement.setAttribute('data-theme', 'business');
    } else {
        htmlElement.setAttribute('data-theme', 'nord');
    }
}

setTheme();