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
const POST_URL = 'https://jsonplaceholder.typicode.com/posts';

// Функция для отображения сообщений о статусе
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
}

// Функция для скрытия сообщений
function hideStatus() {
    statusMessage.className = 'status hidden';
}

// Функция для создания DOM-элемента карточки поста
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

// --- ЛОГИКА ЗАГРУЗКИ (GET) ---
loadBtn.addEventListener('click', async () => {
    loadBtn.disabled = true;
    postsList.innerHTML = ''; // Очищаем список перед новой загрузкой
    showStatus('Загрузка публикаций...', 'loading');

    try {
        const response = await fetch(GET_URL);

        // Проверка успешности HTTP-ответа
        if (!response.ok) {
            // Если сервер вернул ошибку (например, 404), выбрасываем исключение с кодом
            throw new Error(`HTTP-код ошибки: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Вывод данных через DOM
        data.forEach(post => {
            const postElement = createPostElement(post.title, post.body);
            postsList.appendChild(postElement);
        });

        // Выводим сообщение об успехе с HTTP-кодом (обычно 200)
        showStatus(`Успех! HTTP-код: ${response.status} ${response.statusText}. Публикации загружены.`, 'success');
    } catch (error) {
        // Выводим сообщение об ошибке (сетевой или HTTP)
        showStatus(`Не удалось загрузить: ${error.message}`, 'error');
    } finally {
        loadBtn.disabled = false; // Возвращаем кнопку в активное состояние
    }
});

// --- ЛОГИКА СОЗДАНИЯ (POST) ---
form.addEventListener('submit', async (event) => {
    // Отменяем стандартное поведение формы (перезагрузку страницы)
    event.preventDefault();

    // Получаем значения и удаляем пробелы по краям
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Валидация
    if (!title || !body) {
        showStatus('Ошибка валидации: Заголовок и текст не могут быть пустыми!', 'error');
        return; // Прерываем выполнение, запрос не отправляется
    }

    submitBtn.disabled = true;
    showStatus('Отправка публикации...', 'loading');

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
            throw new Error(`HTTP-код ошибки: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Выводим информацию об успехе с HTTP-кодом (обычно 201 Created)
        showStatus(`Успех! HTTP-код: ${response.status} ${response.statusText}. Создан пост ID: ${data.id}`, 'success');

        // Добавляем новый пост в начало списка (визуально)
        const newPostElement = createPostElement(data.title, data.body, data.id);
        postsList.prepend(newPostElement);

        // Очищаем форму
        form.reset();

    } catch (error) {
        showStatus(`Не удалось создать: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false; // Возвращаем кнопку в активное состояние
    }
});