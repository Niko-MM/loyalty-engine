// Инициализация Telegram WebApp
if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.setHeaderColor('#000');
    Telegram.WebApp.setBackgroundColor('#000');
    
    // Принудительный сброс отступов
    setTimeout(() => {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
    }, 100);
} else {
    console.warn('Telegram WebApp не доступен');
}

// Получаем элементы DOM
const usernameEl = document.getElementById("username");
const pointsEl = document.getElementById("points");
const logoEl = document.getElementById("logo");
const qrCodeEl = document.getElementById("qr-code");
const mainContentEl = document.getElementById("mainContent");
const cafeOverlayEl = document.getElementById("cafeOverlay");
const cafeTextEl = document.getElementById("cafeText");
const closeBtnEl = document.getElementById("closeBtn");
const cafeBtnEl = document.getElementById("cafe-btn");

// Состояние приложения
let isCafeActive = false;
let startX = 0;
let startY = 0;

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
        new QRCode(qrCodeEl, {
            text: String(data ?? ''),
            width: 180,
            height: 180,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });
    } catch (e) {
        qrCodeEl.innerHTML = '<div style="padding:12px;color:#333;">QR недоступен</div>';
        console.error('QR render error', e);
    }
}

// Тактильная обратная связь
function createHapticFeedback() {
    if ('vibrate' in navigator) navigator.vibrate(30);
}

// Показать информацию о кафе
function showCafeInfo() {
    isCafeActive = true;
    cafeBtnEl.classList.add('active');
    mainContentEl.classList.add('overlay-active');
    cafeOverlayEl.classList.add('active');
    createHapticFeedback();
}

// Скрыть информацию о кафе
function hideCafeInfo() {
    isCafeActive = false;
    cafeBtnEl.classList.remove('active');
    mainContentEl.classList.remove('overlay-active');
    cafeOverlayEl.classList.remove('active');
    createHapticFeedback();
}

// Обработка swipe-жестов
function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    if (!isCafeActive) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = startX - endX;
    const deltaY = startY - endY;
    
    // Проверяем, что это горизонтальный свайп
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            // Свайп влево - закрываем
            hideCafeInfo();
        }
    }
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
    console.log('Элемент cafeOverlay найден:', cafeOverlayEl);
    
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

            const resp = await fetch('/users/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ telegram_id: String(telegramId) })
            });
            if (!resp.ok) throw new Error('Profile fetch failed');
            const data = await resp.json();

            updatePoints(Number(data.points ?? 0));
            generateQRCode(String(data.qr_code ?? ''));
        } catch (err) {
            console.error('Profile load error', err);
            updatePoints(0);
            generateQRCode('');
        }
    })();
    
    // Анимация появления элементов
    const elements = [logoEl, usernameEl, pointsEl, qrCodeEl];
    elements.forEach((el, i) => animateElement(el, i * 150));
    
    // Обработчик кнопки "О кафе"
    if (cafeBtnEl) {
        cafeBtnEl.onclick = async function() {
            console.log('Кнопка "О кафе" нажата!');
            
            if (isCafeActive) {
                hideCafeInfo();
                return;
            }
            
            showCafeInfo();
            cafeTextEl.textContent = 'Загрузка информации...';

            // На этом этапе текст о кафе не подгружаем с сервера — оставляем как есть
            cafeTextEl.textContent = 'Информация появится позже';
        };
        console.log('Обработчик для cafe-btn установлен');
    } else {
        console.error('Кнопка cafe-btn не найдена!');
    }

    // Обработчик кнопки закрытия
    if (closeBtnEl) {
        closeBtnEl.onclick = function() {
            hideCafeInfo();
        };
    }

    // Обработчики swipe-жестов
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Остальные кнопки
    ['history-btn', 'loyalty-btn'].forEach(id => {
        document.getElementById(id).onclick = function() {
            createHapticFeedback();
            alert('Этот раздел будет доступен в следующем обновлении');
        };
    });
    
    // Анимация при клике на QR-код
    qrCodeEl.addEventListener('click', function() {
        createHapticFeedback();
        this.style.transform = 'scale(0.95)';
        setTimeout(() => { 
            this.style.transform = 'scale(1)'; 
        }, 150);
    });
    
    // Обновление имени пользователя с задержкой
    setTimeout(updateUsername, 1000);
    setTimeout(updateUsername, 2000);
    setTimeout(updateUsername, 3000);
});