// Получаем элементы DOM
const loadBtn = document.getElementById('load-btn');
const submitBtn = document.getElementById('submit-btn');
const postsList = document.getElementById('posts-list');
const form = document.getElementById('post-form');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const statusMessage = document.getElementById('status-message');

// Адреса API
const GET_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';
// ошибка 404 для обработки удалить предыдущую строку
//const GET_URL = 'https://jsonplaceholder.typicode.com/postz';
const POST_URL = 'https://jsonplaceholder.typicode.com/posts';

// Функция для отображения сообщений о статусе
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    statusMessage.classList.remove('hidden');
}

// Функция для создания карточки поста
function createPostElement(title, body, id = null) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const postTitle = document.createElement('h3');
    postTitle.textContent = title;

    const postBody = document.createElement('p');
    postBody.textContent = body;

    card.appendChild(postTitle);
    card.appendChild(postBody);

    if (id) {
        const postId = document.createElement('small');
        postId.textContent = `ID: ${id}`;
        postId.style.display = 'block';
        postId.style.marginTop = '10px';
        postId.style.color = '#7f8c8d';
        card.appendChild(postId);
    }

    return card;
}

// ==========================================
// 1. ЛОГИКА ЗАГРУЗКИ (GET) - Код 200 OK / 404
// ==========================================
loadBtn.addEventListener('click', async () => {
    loadBtn.disabled = true;
    postsList.innerHTML = ''; 
    showStatus('Загрузка...', 'loading');

    try {
        const response = await fetch(GET_URL);

        // Если сервер вернул 404 (например, если поменять URL на postz)
        if (!response.ok) {
            throw new Error(`404 Not Found`);
        }

        const data = await response.json();

        data.forEach(post => {
            const postElement = createPostElement(post.title, post.body);
            postsList.appendChild(postElement);
        });

        // УСПЕХ: 200 OK
        showStatus('Успех! HTTP-код: 200 OK. Публикации загружены.', 'success');

    } catch (error) {
        // ОШИБКА: 404 Not Found
        showStatus('Ошибка! HTTP-код: 404 Not Found. Неверный адрес или нет сети.', 'error');
    } finally {
        loadBtn.disabled = false;
    }
});

// ==========================================
// 2. ЛОГИКА СОЗДАНИЯ (POST) - Код 201 Created / 400 Bad Request
// ==========================================
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // --- ВАЛИДАЦИЯ И ЭМУЛЯЦИЯ 400 BAD REQUEST ---
    if (!title || !body) {
        // Если поля пустые, мы НЕ отправляем запрос на сервер.
        // Мы принудительно показываем ошибку 400 Bad Request, 
        // так как это ошибка со стороны клиента (пользователя).
        showStatus('Ошибка! HTTP-код: 400 Bad Request. Заголовок и текст не могут быть пустыми!', 'error');
        
        // Опционально: можно добавить красную рамку полям, чтобы было нагляднее
        titleInput.style.borderColor = title ? '#ccc' : 'red';
        bodyInput.style.borderColor = body ? '#ccc' : 'red';
        
        return; // Прерываем функцию, запрос не отправляется
    }

    // Если всё ок, убираем красные рамки
    titleInput.style.borderColor = '#ccc';
    bodyInput.style.borderColor = '#ccc';

    submitBtn.disabled = true;
    showStatus('Отправка...', 'loading');

    try {
        const response = await fetch(POST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });

        if (!response.ok) {
            throw new Error(`Код: ${response.status}`);
        }

        const data = await response.json();

        // УСПЕХ: 201 Created
        showStatus(`Успех! HTTP-код: 201 Created. Создан пост с ID: ${data.id}`, 'success');

        // Добавляем пост в начало списка
        const newPostElement = createPostElement(data.title, data.body, data.id);
        postsList.prepend(newPostElement);

        form.reset();

    } catch (error) {
        // Ошибка сервера или сети
        showStatus('Ошибка сервера или сети (Код 500)', 'error');
    } finally {
        submitBtn.disabled = false;
    }
});
