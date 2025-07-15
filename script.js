// Инициализация Telegram WebApp
window.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;

    if (!tg) {
      console.error("Telegram WebApp не инициализирован.");
      return;
    }

    tg.ready();
  
// Бургер-меню
let mobileMenu;

document.addEventListener("DOMContentLoaded", function () {
    const burgerButton = document.getElementById("burger-button");
    mobileMenu = document.getElementById("mobile-menu");
    const closeMenu = document.getElementById("close-menu");

    // Открытие меню
    burgerButton.addEventListener("click", function (e) {
        e.stopPropagation();
        mobileMenu.classList.remove("translate-x-full");
    });

    // Закрытие по кнопке "крестик"
    closeMenu.addEventListener("click", function () {
        mobileMenu.classList.add("translate-x-full");
    });

    // Закрытие при клике вне меню
    document.addEventListener("click", function (event) {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnBurger = burgerButton.contains(event.target);

        if (!isClickInsideMenu && !isClickOnBurger) {
            mobileMenu.classList.add("translate-x-full");
        }
    });
});


// Включение кнопки "Назад" в Telegram
tg.BackButton.show();
tg.BackButton.onClick(() => {
    navigateTo('home');
    tg.BackButton.hide();
});
        
// Обработка нажатия кнопки "Назад" в браузере
window.addEventListener('popstate', function(event) {
    const page = window.location.hash.substring(1) || 'home';
    showPage(page);
});
        
// Установка темы в соответствии с настройками Telegram
if (tg.colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
}
        
// Отображение информации о пользователе
if (tg.initDataUnsafe?.user) {
    const user = tg.initDataUnsafe.user;
    document.getElementById('user-name').textContent = user.first_name || 'Пользователь';
    document.getElementById('user-info').classList.remove('hidden');
}
        
// Текущий выбранный сайт для покупки
let currentSite = null;
        
// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация навигации
    initNavigation();
            
    // Загрузка начальной страницы
    const initialPage = window.location.hash.substring(1) || 'home';
    showPage(initialPage);
            
    // Инициализация каталога
    renderSites(sites);
            
    // Обработчики событий
    document.getElementById('go-to-catalog').addEventListener('click', function() {
        navigateTo('catalog');
    });
            
    document.getElementById('category-filter').addEventListener('change', filterSites);
    document.getElementById('theme-filter').addEventListener('change', filterSites);

    document.getElementById('search-input').addEventListener('input', filterSites);
            
    document.getElementById('close-modal').addEventListener('click', closeModal);
            
    document.getElementById('buy-button').addEventListener('click', function() {
        if (currentSite) {
            buySite(currentSite);
        }
    });
            
    // Инициализация MainButton Telegram
    tg.MainButton.setText("Купить выбранный сайт");
    tg.MainButton.hide();
});
        
// Инициализация навигации
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
            
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateTo(page);
        });
    });
}
        
// Навигация между страницами
function navigateTo(page) {
    // Если меню открыто, закрываем его
    if (mobileMenu && !mobileMenu.classList.contains("translate-x-full")) {
        mobileMenu.classList.add("translate-x-full");
    }

    // Обновляем URL без перезагрузки страницы
    window.history.pushState({}, '', `#${page}`);

    // Показываем соответствующую страницу
    showPage(page);

    // Управление кнопкой "Назад" в Telegram
    if (page === 'home') {
        tg.BackButton.hide();
    } else {
        tg.BackButton.show();
    }
}
        
// Показать страницу
function showPage(page) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
            
    // Показать выбранную страницу
    document.getElementById(page).classList.add('active');
            
    // Обновить активную ссылку в навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
            
    // Дополнительные действия для конкретных страниц
    if (page === 'catalog') {
        filterSites();
    }
}
        
// Рендер карточек сайтов
function renderSites(sitesToRender) {
    const container = document.getElementById('sites-container');
    container.innerHTML = '';
            
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
            
    // Добавляем обработчики для кнопок "Подробнее"
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const siteId = parseInt(this.getAttribute('data-id'));
            showSiteDetails(siteId);
        });
    });
}
        
// Фильтрация сайтов
function filterSites() {
    const category = document.getElementById('category-filter').value;
    const theme = document.getElementById('theme-filter').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
            
    let filteredSites = sites;
            
    // Фильтрация по категории
    if (category !== 'all') {
        filteredSites = filteredSites.filter(site => site.category === category);
    }

    // Фильтрация по теме
    if (theme !== 'all') {
        filteredSites = filteredSites.filter(site => site.theme === theme);
    }
            
    // Фильтрация по поисковому запросу
    if (searchQuery) {
        filteredSites = filteredSites.filter(site => 
            site.title.toLowerCase().includes(searchQuery) || 
            site.description.toLowerCase().includes(searchQuery)
        );
    }
            
    renderSites(filteredSites);
}
        
// Показать детали сайта в модальном окне
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

    // Показать модальное окно
    document.getElementById('site-modal').classList.remove('hidden');

    // Меняем кнопку на "Посмотреть сайт"
    const buyButton = document.getElementById('buy-button');
    buyButton.textContent = "Посмотреть сайт";

    // При клике открываем ссылку сайта в том же окне
    buyButton.onclick = function() {
        if (site.url) {
            window.location.href = site.url;
        } else {
            alert("Ссылка на сайт не задана.");
        }
    };

    // Если используешь Telegram MainButton, можешь скрыть его или оставить по желанию
    tg.MainButton.hide();
}

        
// Закрыть модальное окно
function closeModal() {
    document.getElementById('site-modal').classList.add('hidden');
    tg.MainButton.hide();
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
    initApp();
});
