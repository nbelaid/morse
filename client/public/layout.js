const THEME_STORAGE_KEY = 'morse-theme';

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch (error) {
    console.warn('Could not load theme preference:', error);
    return 'dark';
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0f172a');
}

applyTheme(getSavedTheme());

class MorseLayout extends HTMLElement {
  connectedCallback() {
    const pageTitle = this.getAttribute('page-title') || '';
    const currentPage = this.getAttribute('current-page') || '';
    const content = document.createElement('main');
    content.className = 'app';

    while (this.firstChild) content.appendChild(this.firstChild);

    this.append(
      this.createBackdrop(),
      this.createMenu(currentPage),
      content
    );
    content.prepend(this.createHeader(pageTitle));
  }

  createBackdrop() {
    const backdrop = document.createElement('button');
    backdrop.className = 'menu-backdrop';
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', 'Close navigation menu');
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.tabIndex = -1;
    backdrop.addEventListener('click', () => this.setMenuOpen(false));
    this.backdrop = backdrop;
    return backdrop;
  }

  createMenu(currentPage) {
    const menu = document.createElement('nav');
    menu.className = 'side-menu';
    menu.id = 'sideMenu';
    menu.setAttribute('aria-label', 'Main navigation');
    menu.setAttribute('aria-hidden', 'true');

    const links = [
      ['index.html', 'Trainer'],
      ['translator.html', 'Text translator'],
      ['tree.html', 'Morse tree'],
      ['settings.html', 'Sound settings']
    ];
    menu.innerHTML = '<p class="side-menu-title">Morse tools</p>';
    links.forEach(([href, label]) => {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      if (href === currentPage) link.setAttribute('aria-current', 'page');
      menu.appendChild(link);
    });
    this.menu = menu;
    return menu;
  }

  createHeader(pageTitle) {
    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `
      <button class="menu-btn" type="button" aria-label="Open navigation menu" aria-controls="sideMenu" aria-expanded="false">
        <span class="menu-icon" aria-hidden="true"></span>
      </button>
      <h1>${pageTitle}</h1>
      <button class="theme-btn" type="button"></button>`;
    this.menuButton = header.querySelector('.menu-btn');
    this.menuButton.addEventListener('click', () => this.setMenuOpen(!document.body.classList.contains('menu-open')));
    this.themeButton = header.querySelector('.theme-btn');
    this.themeButton.addEventListener('click', () => this.setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
    this.updateThemeButton();
    return header;
  }

  setTheme(theme) {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
    this.updateThemeButton();
  }

  updateThemeButton() {
    const isLight = document.documentElement.dataset.theme === 'light';
    const action = isLight ? 'dark' : 'light';
    this.themeButton.textContent = isLight ? '☾' : '☀';
    this.themeButton.setAttribute('aria-label', `Switch to ${action} mode`);
    this.themeButton.title = `Switch to ${action} mode`;
  }

  setMenuOpen(isOpen) {
    document.body.classList.toggle('menu-open', isOpen);
    this.menuButton.setAttribute('aria-expanded', String(isOpen));
    this.menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    this.backdrop.setAttribute('aria-hidden', String(!isOpen));
    this.menu.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) this.menu.querySelector('a').focus();
    else this.menuButton.focus();
  }
}

customElements.define('morse-layout', MorseLayout);

document.addEventListener('keydown', event => {
  const layout = document.querySelector('morse-layout');
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) layout?.setMenuOpen(false);
});
