import { getTaskStats } from "./task-service.js";

// Здесь создаётся DOM, но не изменяется состояние приложения.
// Все значения выводятся через textContent: названия не превращаются в HTML.
// innerHTML, outerHTML и insertAdjacentHTML не используются.

const PRIORITY_LABELS = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

// Вспомогательная функция: создаёт элемент с классом и текстом.
function createElementWithText(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

// Вспомогательная функция: кнопка действия с вложенной подписью span.action-label.
function createActionButton(action, labelText) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;

  const label = createElementWithText("span", "action-label", labelText);
  button.append(label);
  return button;
}

export function createTaskElement(task) {
  const card = document.createElement("li");
  card.className = "task-card";
  // dataset хранит строку; число из неё обработчик получит через Number().
  card.dataset.taskId = String(task.id);
  card.classList.toggle("is-completed", task.completed);

  const title = createElementWithText("h3", "task-title", task.title);
  const status = createElementWithText(
    "span",
    "task-status",
    task.completed ? "Выполнена" : "В работе",
  );
  const priority = createElementWithText(
    "span",
    "task-priority",
    PRIORITY_LABELS[task.priority],
  );

  // Кнопка статуса: подпись постоянная, меняется только aria-pressed.
  const toggleButton = createActionButton("toggle", "Выполнена");
  toggleButton.setAttribute("aria-pressed", String(task.completed));

  // Новое в ПР4: кнопка «Изменить». Сама карточка ничего не редактирует,
  // действие edit обрабатывает main.js.
  const editButton = createActionButton("edit", "Изменить");

  const deleteButton = createActionButton("delete", "Удалить");

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(toggleButton, editButton, deleteButton);

  card.append(title, status, priority, actions);
  return card;
}

export function renderTaskList(listElement, tasks) {
  // replaceChildren заменяет только содержимое: сам ul и его обработчик остаются.
  // Повторный вызов не накапливает карточки, потому что старые узлы убираются.
  const cards = tasks.map((task) => createTaskElement(task));
  listElement.replaceChildren(...cards);
}

// Вспомогательная функция: записывает значение в элемент [data-stat="..."].
function setStat(summaryElement, name, value) {
  const node = summaryElement.querySelector(`[data-stat="${name}"]`);
  if (node !== null) {
    node.textContent = String(value);
  }
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  // tasks: ВЕСЬ текущий массив, поэтому фильтр не влияет на общие показатели.
  const { total, completed, pending, progress } = getTaskStats(tasks);

  setStat(summaryElement, "total", total);
  setStat(summaryElement, "completed", completed);
  setStat(summaryElement, "pending", pending);
  // toFixed(1) возвращает строку и нужен только для отображения.
  setStat(summaryElement, "progress", `${progress.toFixed(1)}%`);
  setStat(summaryElement, "visible", visibleCount);
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if (visibleCount > 0) {
    // Есть что показывать: сообщение очищается и скрывается.
    messageElement.textContent = "";
    messageElement.hidden = true;
    return;
  }

  // Видимых задач нет. Причина определяет текст:
  // список пуст совсем или ничего не подошло под фильтр.
  messageElement.textContent =
    total === 0 ? "Список задач пуст." : "Нет задач по выбранному фильтру.";
  messageElement.hidden = false;
}
