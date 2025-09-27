// Инициализация Telegram WebApp
if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.setHeaderColor('#000000');
    Telegram.WebApp.setBackgroundColor('#000000');
    Telegram.WebApp.enableClosingConfirmation();
    
    // Настройка темы
    if (Telegram.WebApp.colorScheme === 'dark') {
        Telegram.WebApp.setHeaderColor('#000000');
        Telegram.WebApp.setBackgroundColor('#000000');
    }
    
    // Принудительный сброс отступов
    setTimeout(() => {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        
        // Убираем возможные отступы от Telegram
        const telegramRoot = document.getElementById('telegram-web-app');
        if (telegramRoot) {
            telegramRoot.style.margin = '0';
            telegramRoot.style.padding = '0';
        }
    }, 100);
    
    console.log('Telegram WebApp инициализирован');
} else {
    console.warn('Telegram WebApp не доступен - работаем в режиме браузера');
}

// Получаем элементы DOM
const usernameEl = document.getElementById("username");
const pointsEl = document.getElementById("points");
const logoEl = document.getElementById("logo");
const qrCodeEl = document.getElementById("qr-code");
const mainContentEl = document.getElementById("mainContent");
const cafeBtnEl = document.getElementById("cafe-btn");

// Состояние приложения
let startX = 0;
let startY = 0;
let currentUser = null;

// Плавная анимация появления элемента
function animateElement(element, delay = 0) {
    if (!element) return;
    element.style.opacity = '0';
    element.style.transform = 'translateY(40px)';
    element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, delay);
}

// Обновление баллов с анимацией
function updatePoints(points) {
    pointsEl.textContent = `${points} баллов`;
    pointsEl.style.transform = 'scale(1.1)';
    setTimeout(() => {
        pointsEl.style.transform = 'scale(1)';
    }, 200);
}

// Создание QR-кода (из строки/хеша)
function generateQRCode(data) {
    qrCodeEl.innerHTML = '';
    try {
        if (!data || data === 'error') {
            qrCodeEl.innerHTML = '<div style="padding:20px;color:#333;text-align:center;font-size:16px;font-weight:500;">QR недоступен</div>';
            return;
        }
        
        if (data === 'guest') {
            qrCodeEl.innerHTML = '<div style="padding:20px;color:#333;text-align:center;font-size:16px;font-weight:500;">Войдите в Telegram</div>';
            return;
        }
        
        new QRCode(qrCodeEl, {
            text: String(data),
            width: 210,
            height: 210,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });
    } catch (e) {
        qrCodeEl.innerHTML = '<div style="padding:20px;color:#333;text-align:center;font-size:16px;font-weight:500;">QR недоступен</div>';
        console.error('QR render error', e);
    }
}

// Тактильная обратная связь
function createHapticFeedback() {
    if ('vibrate' in navigator) navigator.vibrate(30);
}



// Обработка swipe-жестов
function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    // Обработка свайпов удалена
}

// Получение данных пользователя из Telegram WebApp
function getUserData() {
    if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
        console.warn('Telegram WebApp недоступен');
        return null;
    }
    
    const user = 
        Telegram.WebApp.initDataUnsafe?.user ||
        Telegram.WebApp.initData?.user ||
        null;
    
    console.log('Telegram WebApp data:', {
        initDataUnsafe: Telegram.WebApp.initDataUnsafe,
        initData: Telegram.WebApp.initData,
        user: user
    });
    
    return user;
}

// Получение имени пользователя
function getUserDisplayName(user) {
    if (!user) return 'Гость';
    
    console.log('User data:', user);
    
    if (user.first_name) {
        return user.first_name;
    } else if (user.username) {
        return `@${user.username}`;
    } else {
        return `user_${user.id}`;
    }
}

// Обновление имени пользователя
function updateUsername() {
    const user = getUserData();
    const displayName = getUserDisplayName(user);
    console.log('Display name:', displayName);
    usernameEl.textContent = displayName;
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    console.log('Telegram доступен:', typeof Telegram !== 'undefined');
    console.log('Telegram.WebApp доступен:', typeof Telegram !== 'undefined' && Telegram.WebApp);
    
    // Проверяем элементы
    console.log('Кнопка cafe-btn найдена:', cafeBtnEl);
    
    // Обновляем имя пользователя
    updateUsername();
    
    // Загружаем профиль пользователя и обновляем баллы/QR
    (async () => {
        try {
            const user = getUserData();
            const telegramId = user ? user.id : null;
            if (!telegramId) {
                // Гость — можно отрисовать гостевой QR и 0 баллов
                updatePoints(0);
                generateQRCode('guest');
                return;
            }

            // Показываем индикатор загрузки
            pointsEl.textContent = 'Загрузка...';
            
            const resp = await fetch(`/users/profile?telegram_id=${telegramId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!resp.ok) {
                if (resp.status === 404) {
                    // Пользователь не найден - создаем нового
                    console.log('Пользователь не найден, создаем нового');
                    const createResp = await fetch('/users/init', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            telegram_id: telegramId,
                            nick_name: user.first_name || user.username || `user_${telegramId}`
                        })
                    });
                    
                    if (createResp.ok) {
                        // Перезагружаем профиль после создания
                        const profileResp = await fetch(`/users/profile?telegram_id=${telegramId}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (profileResp.ok) {
                            const data = await profileResp.json();
                            currentUser = {
                                id: telegramId,
                                nick_name: data.nick_name,
                                points: data.points,
                                qr_code: data.qr_code
                            };
                            updatePoints(Number(data.points ?? 0));
                            generateQRCode(telegramId);
                        } else {
                            throw new Error('Failed to load profile after creation');
                        }
                    } else {
                        throw new Error('Failed to create user');
                    }
                } else {
                    throw new Error(`Profile fetch failed: ${resp.status}`);
                }
            } else {
                const data = await resp.json();
                
                // Сохраняем данные пользователя
                currentUser = {
                    id: telegramId,
                    nick_name: data.nick_name,
                    points: data.points,
                    qr_code: data.qr_code
                };

                updatePoints(Number(data.points ?? 0));
                generateQRCode(telegramId);
            }
        } catch (err) {
            console.error('Profile load error', err);
            updatePoints(0);
            generateQRCode('error');
            // Показываем уведомление об ошибке
            setTimeout(() => {
                if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Ошибка загрузки данных. Проверьте подключение к интернету.');
                }
            }, 1000);
        }
    })();
    
    // Анимация появления элементов
    const headerSection = document.querySelector('.header-section');
    const userInfo = document.querySelector('.user-info');
    const qrSection = document.querySelector('.qr-section');
    
    // Исключаем user-info из анимации, так как у него есть свой transform
    const elements = [headerSection, qrSection];
    elements.forEach((el, i) => {
        if (el) animateElement(el, i * 200);
    });
    
    // Применяем transform для user-info после загрузки
    if (userInfo) {
        setTimeout(() => {
            // Определяем размер экрана и применяем соответствующий transform
            const screenWidth = window.innerWidth;
            let transformValue;
            
            if (screenWidth <= 360) {
                transformValue = 'translateY(-70px)'; // Очень маленькие экраны
            } else if (screenWidth <= 480) {
                transformValue = 'translateY(-80px)'; // Мобильные устройства
            } else {
                transformValue = 'translateY(-60px)'; // Десктоп
            }
            
            userInfo.style.transform = transformValue;
        }, 500);
    }
    
    // Обработчик кнопки "О кафе" (пустой)
    if (cafeBtnEl) {
        cafeBtnEl.onclick = function() {
            // Ничего не делаем
        };
    }

    // Обработчики swipe-жестов
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Обработчик кнопки истории (пустой)
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
        historyBtn.onclick = function() {
            // Ничего не делаем
        };
    }

    
    // Простой клик на QR-код без анимаций
    qrCodeEl.addEventListener('click', function() {
        createHapticFeedback();
    });

    // Анимация вибрации логотипа при касании экрана
    function addLogoVibration() {
        const logo = document.getElementById('logo');
        if (!logo) return;

        // Обработчик касания экрана
        document.addEventListener('touchstart', function(e) {
            // Проверяем, что касание не по меню или кнопкам
            if (e.target.closest('.bottom-menu') || 
                e.target.closest('.menu-btn') || 
                e.target.closest('.action-btn') ||
                e.target.closest('.user-info')) {
                return; // Не запускаем анимацию
            }
            
            logo.classList.add('vibrate');
            createHapticFeedback();
            
            // Убираем класс после анимации (0.8 секунды)
            setTimeout(() => {
                logo.classList.remove('vibrate');
            }, 800);
        });

        // Обработчик клика мыши (для тестирования)
        document.addEventListener('click', function(e) {
            // Проверяем, что клик не по меню или кнопкам
            if (e.target.closest('.bottom-menu') || 
                e.target.closest('.menu-btn') || 
                e.target.closest('.action-btn') ||
                e.target.closest('.user-info')) {
                return; // Не запускаем анимацию
            }
            
            // Вибрация при клике на пустую область или QR-код
            if (e.target === document.body || 
                e.target === document.documentElement ||
                e.target.closest('.qr-code')) {
                logo.classList.add('vibrate');
                createHapticFeedback();
                
                setTimeout(() => {
                    logo.classList.remove('vibrate');
                }, 800);
            }
        });
    }

    // Запускаем анимацию вибрации
    addLogoVibration();
    
    // Обновление имени пользователя с задержкой
    setTimeout(updateUsername, 1000);
    setTimeout(updateUsername, 2000);
    setTimeout(updateUsername, 3000);
    
    // Обработка кнопки "Назад" в Telegram
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        Telegram.WebApp.onEvent('backButtonClicked', function() {
            Telegram.WebApp.close();
        });
        
        // Скрываем кнопку "Назад"
        Telegram.WebApp.BackButton.hide();
    }
    
    // Обработка изменения размера экрана
    function handleResize() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Обновляем высоту контейнера для мобильных устройств
        const container = document.querySelector('.container');
        if (container) {
            container.style.minHeight = `${window.innerHeight}px`;
        }
        
        // Обновляем transform для user-info при изменении размера экрана
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            const screenWidth = window.innerWidth;
            let transformValue;
            
            if (screenWidth <= 360) {
                transformValue = 'translateY(-70px)';
            } else if (screenWidth <= 480) {
                transformValue = 'translateY(-80px)';
            } else {
                transformValue = 'translateY(-60px)';
            }
            
            userInfo.style.transform = transformValue;
        }
    }
    
    // Инициализация и обработка изменения размера
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
    });
});