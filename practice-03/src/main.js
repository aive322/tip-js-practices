import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { findTaskById, setTaskCompleted, removeTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderTaskList, renderSummary, renderEmptyState } from "./task-view.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
};

// Готовая служебная часть: ?dataset=variant включает данные своего варианта.
// Наборы не смешиваются, редактировать код для переключения не требуется.
const isVariant = new URLSearchParams(window.location.search).get("dataset") === "variant";
const initialTasks = isVariant ? variantTasks : demoTasks;
let currentTasks = initialTasks.map((task) => ({ ...task }));
let currentFilter = "all";

elements.datasetLabel.textContent = isVariant
  ? `Индивидуальный вариант: ${variantNumber ?? "не указан"}`
  : "Общий контрольный набор";

const VALID_FILTERS = ["all", "pending", "completed"];

// Сообщение об операции выводится как текст; пустая строка очищает его.
function showMessage(text) {
  elements.message.textContent = text;
}

// Полная схема: полный массив + фильтр -> видимая выборка -> карточки.
// Функция только отображает данные: currentTasks она не меняет
// и обработчики событий не назначает.
function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);

  renderTaskList(elements.list, visibleTasks);
  // В сводку идёт ПОЛНЫЙ массив, а длина выборки передаётся отдельно.
  renderSummary(elements.summary, currentTasks, visibleTasks.length);
  renderEmptyState(elements.empty, currentTasks.length, visibleTasks.length);

  for (const button of elements.filters.querySelectorAll("button[data-filter]")) {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

// Делегирование: один обработчик на контейнере списка. Карточки пересоздаются
// при каждой отрисовке, поэтому обработчики на них не назначаются.
function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;

  // Клик мог прийти по вложенному span.action-label, поэтому ищем ближайшую кнопку.
  const button = event.target.closest("button[data-action]");
  if (button === null || !elements.list.contains(button)) return;

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete") return;

  const card = button.closest("li[data-task-id]");
  if (card === null || !elements.list.contains(card)) return;

  // dataset хранит строку. Number("4abc") даёт NaN, а parseInt("4abc") дал бы 4,
  // поэтому для проверки границы используется Number.
  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    showMessage("Некорректный идентификатор задачи");
    return;
  }

  let result;
  if (action === "toggle") {
    // Текущий статус берём из массива, а не из текста кнопки или класса.
    const task = findTaskById(currentTasks, id);
    if (task === undefined) {
      showMessage(`Задача с id ${id} не найдена`);
      return;
    }
    result = setTaskCompleted(currentTasks, id, !task.completed);
  } else {
    result = removeTask(currentTasks, id);
  }

  // При отказе result.tasks не существует: массив и интерфейс остаются прежними.
  if (!result.ok) {
    showMessage(result.error);
    return;
  }

  currentTasks = result.tasks;
  showMessage("");
  renderApp();
  restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-filter]");
  if (button === null || !elements.filters.contains(button)) return;

  const filter = button.dataset.filter;
  if (!VALID_FILTERS.includes(filter)) return;

  // Меняется только режим показа. Полный currentTasks остаётся нетронутым.
  currentFilter = filter;
  showMessage("");
  renderApp();
}

// Готовая вспомогательная функция. Сохраняет понятную позицию клавиатурного фокуса
// после замены карточек. Если карточки больше нет, фокус получает активный фильтр.
function restoreTaskFocus(id, action) {
  const actionButton = elements.list.querySelector(
    `[data-task-id="${id}"] button[data-action="${action}"]`,
  );
  const filterButton = elements.filters.querySelector(`[data-filter="${currentFilter}"]`);
  (actionButton ?? filterButton)?.focus();
}

// Подписки выполняются один раз. Эти контейнеры не заменяются при перерисовке.
elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);

// До реализации renderApp ожидается сообщение о заглушке.
// try/catch здесь — готовая диагностика старта, а не замена проверки result.ok.
try {
  renderApp();
} catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}
