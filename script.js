// Прокрутка

// (function() {
//     // Настройки (можно менять)
//     const config = {
//         startDelay: 5,          // Задержка перед стартом (секунд)
//         pixelsPerSecond: 300    // Скорость прокрутки (пикселей в секунду)
//     };
    
//     console.log(`Прокрутка начнётся через ${config.startDelay} сек со скоростью ${config.pixelsPerSecond}px/сек`);

//     setTimeout(() => {
//         const startTime = Date.now();
//         const startPos = window.scrollY;
//         const maxPos = document.body.scrollHeight - window.innerHeight;
//         const distance = maxPos - startPos;
//         const duration = distance / config.pixelsPerSecond * 1000; // в мс
        
//         function scrollStep() {
//             const elapsed = Date.now() - startTime;
//             const progress = Math.min(elapsed / duration, 1);
            
//             // Линейная прокрутка с постоянной скоростью
//             window.scrollTo(0, startPos + distance * progress);
            
//             if (progress < 1) {
//                 requestAnimationFrame(scrollStep);
//             } else {
//                 console.log('Прокрутка завершена');
//             }
//         }
        
//         requestAnimationFrame(scrollStep);
        
//     }, config.startDelay * 1000);
// })();

// ffpeg

// ffmpeg -i input.mov -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 -speed 1 \
// -c:a libopus -b:a 64k -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
// -auto-alt-ref 0 -deadline good -threads 4 output.webm

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
        description: "Современный одностраничный сайт для презентации вашего бизнеса или услуги. Адаптивный дизайн, форма заявки, галерея работ.",
        price: "123 руб.",
        category: "landing",
        theme: "light",
        video: "./media-intro/svai.webm",
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
    
    console.log('Initializing app...');
    
    // Инициализация Telegram WebApp
    if (tg) {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();
        tg.BackButton.hide();
        
        // Устанавливаем обработчик для кнопки Назад
        tg.BackButton.onClick(() => {
            const currentPage = window.location.hash.substring(1) || 'home';
            handleBackButton(currentPage);
        });
        
        if (tg.colorScheme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }

    // Добавляем обработчик для ссылки на бота
    document.getElementById('bot-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (tg) {
            // Закрываем WebApp и открываем чат с ботом
            tg.close();
            tg.openTelegramLink('https://t.me/EasySiteAppBot');
        } else {
            // Для браузера просто открываем ссылку
            window.open('https://t.me/EasySiteAppBot', '_blank');
        }
    });

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
        
        if (page === 'catalog') {
            filterSites();
        }
    }

    updateNavLinks(page);

    if (tg) {
        if (page === 'home') {
            tg.BackButton.hide();
        } else {
            tg.BackButton.setText("Назад");
            tg.BackButton.onClick(() => handleBackButton(page));
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
    const previewPage = document.getElementById('site-preview');
    
    if (header && main) {
        const safeArea = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat')) || 0;
        const headerHeight = header.offsetHeight + safeArea;
        
        main.style.marginTop = `${headerHeight}px`;
        main.style.minHeight = `calc(100vh - ${headerHeight}px)`;
        
        if (previewPage) {
            previewPage.style.top = `${headerHeight}px`;
        }
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
    if (!container) return;
    
    container.innerHTML = '';
    
    sitesToRender.forEach(site => {
        const categoryClass = getCategoryClass(site.category);
        const categoryName = getCategoryName(site.category);
        
        const card = document.createElement('div');
        card.className = 'site-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer';
        card.dataset.id = site.id;
        
        // Определяем, что показывать - видео или изображение
        const mediaContent = site.video 
            ? `<video autoplay loop muted playsinline class="w-full h-full object-cover">
                  <source src="${site.video}" type="video/webm">
                  Ваш браузер не поддерживает видео
               </video>`
            : `<img src="${site.image}" alt="${site.title}" class="w-full h-full object-cover">`;
        
        card.innerHTML = `
            <div class="relative h-48 overflow-hidden">
                ${mediaContent}
                <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
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
    
    // Обработчик клика по карточке
    document.querySelectorAll('.site-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Проверяем, не был ли клик по кнопке "Подробнее"
            if (!e.target.closest('.view-details-btn')) {
                const siteId = parseInt(this.dataset.id);
                showSiteDetails(siteId);
            }
        });
    });
    
    // Обработчик клика по кнопке "Подробнее" (оставляем существующий)
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Предотвращаем всплытие события до карточки
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

function initModal() {
    document.getElementById('close-modal')?.addEventListener('click', closeModal);
    document.getElementById('buy-button')?.addEventListener('click', handleBuyButtonClick);
}

function showSiteDetails(siteId) {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    currentSite = site;

    // Заполняем модальное окно
    document.getElementById('modal-title').textContent = site.title;
    
    // Обновляем медиа-контент (видео или изображение)
    const modalMediaContainer = document.getElementById('modal-media-container');
    if (modalMediaContainer) {
        if (site.video) {
            modalMediaContainer.innerHTML = `
                <video id="modal-video" autoplay loop muted playsinline class="w-full h-full object-cover">
                    <source src="${site.video}" type="video/webm">
                    Ваш браузер не поддерживает видео
                </video>
                <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            `;
        } else {
            modalMediaContainer.innerHTML = `
                <img src="${site.image}" alt="${site.title}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            `;
        }
    }
    
    document.getElementById('modal-description').textContent = site.description;
    document.getElementById('modal-price').textContent = site.price;
    document.getElementById('modal-time').textContent = `Срок разработки: ${site.time}`;


    const categoryClass = getCategoryClass(site.category);
    const categoryName = getCategoryName(site.category);
    const categoryElement = document.getElementById('modal-category');
    categoryElement.textContent = categoryName;
    categoryElement.className = `px-3 py-1 ${categoryClass} text-sm rounded-full`;

    // Показываем модальное окно
    const modal = document.getElementById('site-modal');
    modal.classList.remove('hidden');

    // Добавляем обработчик клика вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Настраиваем кнопку просмотра сайта
    const buyButton = document.getElementById('buy-button');
    if (buyButton) {
        buyButton.textContent = "Посмотреть сайт";
        buyButton.onclick = function() {
            if (site.url) {
                createPreviewPage(site);
                showPage('site-preview');
                closeModal();
            } else {
                alert("Ссылка на сайт не указана.");
            }
        };
    }
}

function createPreviewPage(site) {
    document.body.classList.add('site-preview-active');
    
    let previewContainer = document.getElementById('site-preview');
    if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = 'site-preview';
        previewContainer.className = 'page';
        document.querySelector('main').appendChild(previewContainer);
    }
    
    previewContainer.innerHTML = `
        <div class="preview-wrapper">
            <iframe src="${site.url}"></iframe>
        </div>
    `;
    
    // Изменено: кнопка закрытия теперь слева
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-6 left-6 z-50 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg backdrop-blur-sm';
    closeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    `;
    closeButton.addEventListener('click', () => showPage('catalog'));
    previewContainer.appendChild(closeButton);
    
    // Обработчик для восстановления скролла
    const observer = new MutationObserver(() => {
        if (!previewContainer.classList.contains('active')) {
            document.body.classList.remove('site-preview-active');
            observer.disconnect();
        }
    });
    observer.observe(previewContainer, { attributes: true, attributeFilter: ['class'] });
}

function handleBackButton(currentPage) {
    if (currentPage === 'site-preview') {
        document.body.classList.remove('site-preview-active');
    }
    
    switch(currentPage) {
        case 'catalog':
            showPage('home');
            break;
        case 'about':
        case 'site-preview':
            showPage('catalog');
            break;
        default:
            showPage('home');
    }
}

function handleBuyButtonClick() {
    if (currentSite?.url) {
        // Полностью закрываем модальное окно
        closeModal();
        
        // Создаем и показываем страницу предпросмотра
        createPreviewPage(currentSite);
        showPage('site-preview');
    } else {
        alert("Ссылка на сайт не указана.");
    }
}

function closeModal() {
    const modal = document.getElementById('site-modal');
    modal.classList.add('hidden');
    // Удаляем обработчик клика по фону
    modal.removeEventListener('click', modal.clickHandler);
    currentSite = null;
    if (tg) {
        tg.MainButton.hide();
    }
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