// Telegram WebApp инициализация
let tg = window.Telegram?.WebApp;

// Глобальные переменные
let mobileMenu = null;
let currentSite = null;

// Данные о сайтах
const sites = [
    {
        id: 1,
        title: "Лендинг для бизнеса",
        video: "svai.webm",
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
    console.log('Initializing app...');
    
    // Инициализация Telegram WebApp
    if (tg) {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();
        tg.BackButton.hide();
        
        if (tg.colorScheme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }

    // Принудительно устанавливаем отступы до инициализации компонентов
    adjustLayout();
    
    // Инициализация компонентов
    initBurgerMenu();
    initNavigation();
    initCatalog();
    initModal();
    
    // Принудительно показываем главную страницу
    showPage('home');
    
    // Повторная корректировка макета после загрузки
    setTimeout(adjustLayout, 100);

    initLazyVideo();
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
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });

    // Обработка кнопки "Перейти к каталогу"
    document.getElementById('go-to-catalog')?.addEventListener('click', () => {
        navigateTo('catalog');
    });

    window.addEventListener('popstate', () => {
        const page = window.location.hash.substring(1) || 'home';
        showPage(page);
    });

    // Обновляем отступы при изменении размера окна
    window.addEventListener('resize', () => {
        setTimeout(adjustLayout, 100);
    });
}

function navigateTo(page) {
    // Закрываем меню если открыто
    if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
        mobileMenu.classList.add('translate-x-full');
    }

    window.history.pushState({}, '', `#${page}`);
    showPage(page);
}

function showPage(page) {
    console.log(`Showing page: ${page}`);
    
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    // Показываем выбранную страницу
    const pageElement = document.getElementById(page);
    if (pageElement) {
        pageElement.classList.add('active');
        
        // Особые действия для каталога
        if (page === 'catalog') {
            filterSites();
        }
    }

    // Обновляем активные ссылки в навигации
    updateNavLinks(page);

    // Управление кнопкой "Назад" в Telegram
    if (tg) {
        if (page === 'home') {
            tg.BackButton.hide();
        } else {
            tg.BackButton.setText("Закрыть");
            tg.BackButton.onClick(() => tg.close());
            tg.BackButton.show();
        }
    }
}

function updateNavLinks(activePage) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === activePage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function adjustLayout() {
  const header = document.querySelector('.tg-header');
  const main = document.querySelector('.tg-content');
  
  if (header && main) {
    // Учитываем safe-area (актуально для iPhone)
    const safeArea = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat')) || 0;
    const headerHeight = header.offsetHeight + safeArea;
    
    main.style.marginTop = `${headerHeight}px`;
    main.style.minHeight = `calc(100vh - ${headerHeight}px)`;
  }
}

function initCatalog() {
    renderSites(sites);
    
    // Инициализация фильтров
    document.getElementById('category-filter')?.addEventListener('change', filterSites);
    document.getElementById('theme-filter')?.addEventListener('change', filterSites);
    document.getElementById('search-input')?.addEventListener('input', filterSites);
}

function renderSites(sitesToRender) {
    const container = document.getElementById('sites-container');
    container.innerHTML = '';

    sitesToRender.forEach(site => {
        const card = document.createElement('div');
        card.className = 'site-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden';

        // Добавляем видео-превью
        const videoHTML = `
        <video autoplay loop muted playsinline class="w-full h-48 object-cover">
            <source src="media-intro/${site.video}" type="video/webm">
            <source src="media-intro/${site.video.replace('.webm', '.mp4')}" type="video/mp4">
        </video>
        `;

        card.innerHTML = `
        ${site.video ? videoHTML : '<div class="h-48 bg-gray-100 dark:bg-gray-700"></div>'}
        <div class="p-4">
            <div class="flex items-start justify-between mb-2">
                <h3 class="font-bold text-lg">${site.title}</h3>
                <span class="px-2 py-1 ${getCategoryClass(site.category)} text-xs rounded-full">
                    ${getCategoryName(site.category)}
                </span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                ${site.description}
            </p>
            <div class="flex items-center justify-between">
                <span class="font-bold">${site.price}</span>
                <button class="view-details-btn px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm" data-id="${site.id}">
                    Подробнее
                </button>
            </div>
        </div>
        `;

        container.appendChild(card);
    });

    // Добавляем обработчики для кнопок "Подробнее"
    attachDetailsHandlers();
}

function attachDetailsHandlers() {
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const siteId = parseInt(this.getAttribute('data-id'));
      showSiteDetails(siteId);
    });
  });
}

// Ленивая загрузка
function initLazyVideo() {
  const lazyVideos = document.querySelectorAll('.lazy-video');
  
  const lazyVideoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const sources = video.querySelectorAll('source');
        
        sources.forEach(source => {
          source.src = source.dataset.src;
        });
        
        video.load();
        lazyVideoObserver.unobserve(video);
      }
    });
  });

  lazyVideos.forEach(video => {
    lazyVideoObserver.observe(video);
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

function initModal() {
    document.getElementById('close-modal')?.addEventListener('click', closeModal);
    document.getElementById('buy-button')?.addEventListener('click', handleBuyButtonClick);
}

function showSiteDetails(siteId) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    currentSite = site;

    // Заполняем модальное окно данными
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

    // Показываем модальное окно
    document.getElementById('site-modal').classList.remove('hidden');

    // Настраиваем кнопку просмотра сайта
    const buyButton = document.getElementById('buy-button');
    if (buyButton) {
        buyButton.textContent = "Посмотреть сайт";
        buyButton.onclick = function() {
            if (site.url) {
                if (window.Telegram?.WebApp?.openLink) {
                    // Открываем внутри Telegram WebApp
                    Telegram.WebApp.openLink(site.url, { 
                        try_instant_view: true // Пробуем открыть как Instant View
                    });
                } else {
                    // Фолбэк для обычного браузера
                    window.open(site.url, '_blank', 'noopener,noreferrer');
                }
            } else {
                alert("Ссылка на сайт не указана.");
            }
        };
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

// Вспомогательные функции
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