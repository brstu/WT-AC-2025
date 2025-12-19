/**
 * Компонент постов
 * Обрабатывает посты фанатов с делегированием событий для действий лайк/удалить
 */

import { showConfirmModal } from "./confirmModal.js";

const STORAGE_KEY = "posts-data";

/**
 * Инициализация функционала постов
 */
export function initPosts() {
  const postsContainer = document.getElementById("posts-container");
  if (!postsContainer) {
    return;
  }

  // Загрузить сохранённое состояние из localStorage
  loadPostsState(postsContainer);

  // Использовать делегирование событий на контейнере
  postsContainer.addEventListener("click", handlePostAction);
}

/**
 * Обработать действия над постами через делегирование
 * @param {Event} e - Событие клика
 */
function handlePostAction(e) {
  const target = e.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const action = target.getAttribute("data-action");
  const postCard = target.closest(".post-card");

  if (!postCard) {
    return;
  }

  switch (action) {
    case "like":
      handleLike(target, postCard);
      break;
    case "delete":
      handleDelete(postCard, target);
      break;
  }
}

/**
 * Обработка нажатия кнопки лайка
 * @param {HTMLElement} button - Кнопка лайка
 * @param {HTMLElement} _postCard - Элемент карточки поста (не используется, но передается для консистентности)
 */
function handleLike(button, _postCard) {
  const isLiked = button.getAttribute("aria-pressed") === "true";
  const likeCountElement = button.querySelector(".like-count");
  const likeIcon = button.querySelector(".like-icon");

  if (!likeCountElement) {
    return;
  }

  let count = parseInt(likeCountElement.textContent) || 0;

  if (isLiked) {
    // Снять лайк
    button.setAttribute("aria-pressed", "false");
    likeIcon.textContent = "🤍";
    count = Math.max(0, count - 1);
  } else {
    // Поставить лайк
    button.setAttribute("aria-pressed", "true");
    likeIcon.textContent = "❤️";
    count++;
  }

  likeCountElement.textContent = count;

  // Сохранить состояние в localStorage
  savePostsState();
}

/**
 * Обработка нажатия кнопки удаления
 * @param {HTMLElement} postCard - Элемент карточки поста
 * @param {HTMLElement} deleteButton - Кнопка удаления (для возврата фокуса)
 */
async function handleDelete(postCard, deleteButton) {
  // Подтвердить удаление через кастомную модалку
  const confirmed = await showConfirmModal(
    "Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.",
    deleteButton
  );
  if (!confirmed) {
    return;
  }

  // Добавить класс анимации удаления
  postCard.classList.add("removing");

  // Удалить элемент после анимации
  setTimeout(() => {
    postCard.remove();
    savePostsState();
  }, 300);
}

/**
 * Save posts state to localStorage
 */
function savePostsState() {
  const postsContainer = document.getElementById("posts-container");
  if (!postsContainer) {
    return;
  }

  const posts = postsContainer.querySelectorAll(".post-card");
  const state = [];

  posts.forEach((post) => {
    const postId = post.getAttribute("data-post-id");
    const likeButton = post.querySelector('[data-action="like"]');
    const likeCount = post.querySelector(".like-count");

    if (postId) {
      state.push({
        id: postId,
        liked: likeButton?.getAttribute("aria-pressed") === "true",
        likeCount: parseInt(likeCount?.textContent || "0"),
      });
    }
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save posts state to localStorage", e);
  }
}

/**
 * Load posts state from localStorage
 * @param {HTMLElement} postsContainer - Posts container element
 */
function loadPostsState(postsContainer) {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      return;
    }

    const state = JSON.parse(savedState);
    const stateMap = {};

    // Создать карту для быстрого поиска
    state.forEach((item) => {
      stateMap[item.id] = item;
    });

    // Получить все текущие посты
    const posts = postsContainer.querySelectorAll(".post-card");
    const currentPostIds = Array.from(posts).map((p) =>
      p.getAttribute("data-post-id")
    );

    // Удалить посты, которых нет в сохранённом состоянии (были удалены)
    posts.forEach((post) => {
      const postId = post.getAttribute("data-post-id");
      if (!stateMap[postId]) {
        post.remove();
      }
    });

    // Обновить оставшиеся посты
    state.forEach((savedPost) => {
      if (currentPostIds.includes(savedPost.id)) {
        const post = postsContainer.querySelector(
          `[data-post-id="${savedPost.id}"]`
        );
        if (post) {
          const likeButton = post.querySelector('[data-action="like"]');
          const likeCount = post.querySelector(".like-count");
          const likeIcon = post.querySelector(".like-icon");

          if (likeButton) {
            likeButton.setAttribute(
              "aria-pressed",
              savedPost.liked ? "true" : "false"
            );
          }

          if (likeIcon) {
            likeIcon.textContent = savedPost.liked ? "❤️" : "🤍";
          }

          if (likeCount) {
            likeCount.textContent = savedPost.likeCount;
          }
        }
      }
    });
  } catch (e) {
    console.warn("Failed to load posts state from localStorage", e);
  }
}
