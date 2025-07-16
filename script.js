// Telegram WebApp инициализация
let tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.enableClosingConfirmation();
}

// Глобальные переменные
let mobileMenu = null;
let currentSite = null;
let isFirstLoad = true;

// Данные о сайтах
const sites = [
    {
        id: 1,
        title: "Лендинг для бизнеса",
        description: "Современный одностраничный сайт для презентации вашего бизнеса или услуги. Адаптивный дизайн, форма заявки, галерея работ.",
        price: "123 руб.",
        category: "landing",
        theme: "light",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        time: "1-2 дня",
        url: "./sites/svai/index.html"
    },
    {
        id: 2,
        title: "Портфолио фотографа",
        description: "Элегантный сайт-портфолио для фотографов с галереей работ, информацией об услугах и контактной формой.",
        price: "123 руб.",
        category: "portfolio",
        theme: "light",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        time: "2-3 дня"
    },
    {
        id: 3,
        title: "Блог о путешествиях",
        description: "Красивый блог с системой категорий, тегов, комментариями и адаптивным дизайном для чтения на любом устройстве.",
        price: "123 руб.",
        category: "blog",
        theme: "dark",
        image: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        time: "2-4 дня"
    },
    {
        id: 4,
        title: "Лендинг для приложения",
        description: "Яркий лендинг для мобильного приложения с описанием функций, скриншотами, кнопками загрузки и формой подписки.",
        price: "123 руб.",
        category: "landing",
        theme: "dark",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        time: "1-3 дня"
    }
];

// Основная функция инициализации
function initApp() {
  // Настройка viewport для Telegram
  if (tg) {
    setupTelegramViewport();
  }

  // Инициализация компонентов
  initComponents();
  
  // Первоначальная загрузка страницы
  loadInitialPage();
  
  // После полной загрузки
  setTimeout(() => {
    isFirstLoad = false;
    adjustLayout();
    forceRedraw(); // Принудительное обновление отображения
  }, 100);
}

function setupTelegramViewport() {
  // Установка безопасных зон
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  document.documentElement.style.setProperty('--tg-viewport-height', `${window.innerHeight}px`);
  
  // Применение темной темы
  if (tg.colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

function initComponents() {
  // Бургер-меню
  initBurgerMenu();

  // Навигация
  initNavigation();

  // Кнопка в каталог
  document.getElementById('go-to-catalog')?.addEventListener('click', () => {
    navigateTo('catalog');
  });

  // Инициализация каталога
  initCatalog();

  // Модальное окно
  initModal();
}

function initBurgerMenu() {
  const burgerButton = document.getElementById('burger-button');
  mobileMenu = document.getElementById('mobile-menu');
  const closeMenu = document.getElementById('close-menu');

  burgerButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.remove('translate-x-full');
  });

  closeMenu?.addEventListener('click', () => {
    mobileMenu.classList.add('translate-x-full');
  });

  document.addEventListener('click', (event) => {
    if (!mobileMenu.classList.contains('translate-x-full')) {
      const isClickInside = mobileMenu.contains(event.target) || 
                          burgerButton.contains(event.target);
      if (!isClickInside) {
        mobileMenu.classList.add('translate-x-full');
      }
    }
  });
}

function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  window.addEventListener('popstate', () => {
    const page = window.location.hash.substring(1) || 'home';
    showPage(page);
  });
}

function initCatalog() {
  renderSites(sites);
  
  document.getElementById('category-filter')?.addEventListener('change', filterSites);
  document.getElementById('theme-filter')?.addEventListener('change', filterSites);
  document.getElementById('search-input')?.addEventListener('input', filterSites);
}

function initModal() {
  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  document.getElementById('buy-button')?.addEventListener('click', handleBuyButtonClick);
}

function loadInitialPage() {
  const page = window.location.hash.substring(1) || 'home';
  showPage(page, true);
}

function navigateTo(page) {
  if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
    mobileMenu.classList.add('translate-x-full');
  }

  window.history.pushState({}, '', `#${page}`);
  showPage(page);
}

function showPage(page, initialLoad = false) {
  // Скрываем все страницы
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });

  // Показываем выбранную
  const pageElement = document.getElementById(page);
  if (pageElement) {
    pageElement.classList.add('active');
    
    if (page === 'catalog') {
      filterSites();
    }
  }

  updateNavLinks(page);

  if (!initialLoad) {
    adjustLayout();
  }

  // Telegram BackButton
  if (tg) {
    if (page === 'home') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigateTo('home'));
    }
  }
}

function updateNavLinks(activePage) {
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.page === activePage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function adjustLayout() {
  const header = document.querySelector('header');
  const main = document.querySelector('main');
  
  if (header && main) {
    const headerHeight = header.offsetHeight;
    
    if (tg) {
      main.style.paddingTop = `calc(${headerHeight}px + env(safe-area-inset-top))`;
      main.style.minHeight = `calc(var(--tg-viewport-height, 100vh) - ${headerHeight}px)`;
    } else {
      main.style.paddingTop = `${headerHeight}px`;
      main.style.minHeight = `calc(100vh - ${headerHeight}px)`;
    }
  }
}

function forceRedraw() {
  // Принудительный рефлоу для применения стилей
  const body = document.body;
  body.style.display = 'none';
  body.offsetHeight; // Триггер рефлоу
  body.style.display = '';
}

function renderSites(sitesToRender) {
  const container = document.getElementById('sites-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!sitesToRender?.length) {
    container.innerHTML = '<p class="text-center py-4 text-gray-500">Нет доступных сайтов</p>';
    return;
  }
  
  sitesToRender.forEach(site => {
    const categoryClass = getCategoryClass(site.category);
    const categoryName = getCategoryName(site.category);
    
    const card = document.createElement('div');
    card.className = 'site-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden';
    card.innerHTML = `
      <img src="${site.image}" alt="${site.title}" class="w-full h-48 object-cover">
      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-bold text-lg">${site.title}</h3>
          <span class="px-2 py-1 ${categoryClass} text-xs rounded-full">${categoryName}</span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">${site.description}</p>
        <div class="flex items-center justify-between">
          <span class="font-bold">${site.price}</span>
          <button class="view-details-btn px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition" data-id="${site.id}">
            Подробнее
          </button>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const siteId = parseInt(this.getAttribute('data-id'));
      showSiteDetails(siteId);
    });
  });
}

function filterSites() {
  const category = document.getElementById('category-filter')?.value || 'all';
  const theme = document.getElementById('theme-filter')?.value || 'all';
  const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';
  
  let filteredSites = [...sites];
  
  if (category !== 'all') {
    filteredSites = filteredSites.filter(site => site.category === category);
  }
  
  if (theme !== 'all') {
    filteredSites = filteredSites.filter(site => site.theme === theme);
  }
  
  if (searchQuery) {
    filteredSites = filteredSites.filter(site => 
      site.title.toLowerCase().includes(searchQuery) || 
      site.description.toLowerCase().includes(searchQuery)
    );
  }
  
  renderSites(filteredSites);
}

function showSiteDetails(siteId) {
  const site = sites.find(s => s.id === siteId);
  if (!site) return;

  currentSite = site;

  document.getElementById('modal-title').textContent = site.title;
  document.getElementById('modal-image').src = site.image;
  document.getElementById('modal-image').alt = site.title;
  document.getElementById('modal-description').textContent = site.description;
  document.getElementById('modal-price').textContent = site.price;
  document.getElementById('modal-time').textContent = `Срок разработки: ${site.time}`;

  const categoryClass = getCategoryClass(site.category);
  const categoryName = getCategoryName(site.category);
  const categoryElement = document.getElementById('modal-category');
  categoryElement.textContent = categoryName;
  categoryElement.className = `px-3 py-1 ${categoryClass} text-sm rounded-full`;

  document.getElementById('site-modal').classList.remove('hidden');

  const buyButton = document.getElementById('buy-button');
  if (buyButton) {
    buyButton.textContent = "Посмотреть сайт";
    buyButton.onclick = function() {
      if (site.url) {
        tg ? tg.openLink(site.url) : window.open(site.url, '_blank');
      } else {
        alert("Ссылка на сайт не указана.");
      }
    };
  }

  if (tg) {
    tg.MainButton.setText("Купить сайт");
    tg.MainButton.onClick(() => {
      if (site.url) {
        tg.openLink(site.url);
      }
    });
    tg.MainButton.show();
  }
}

function handleBuyButtonClick() {
  if (currentSite?.url) {
    tg ? tg.openLink(currentSite.url) : window.open(currentSite.url, '_blank');
  } else {
    alert("Ссылка на сайт не указана.");
  }
  closeModal();
}

function closeModal() {
  document.getElementById('site-modal').classList.add('hidden');
  if (tg) {
    tg.MainButton.hide();
  }
  currentSite = null;
}

function getCategoryClass(category) {
  const classes = {
    landing: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    shop: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    portfolio: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    blog: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
  };
  return classes[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
}

function getCategoryName(category) {
  const names = {
    landing: 'Лендинг',
    shop: 'Магазин',
    portfolio: 'Портфолио',
    blog: 'Блог'
  };
  return names[category] || 'Другое';
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('resize', adjustLayout);