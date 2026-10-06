import { findTaskById, normalizeTitle } from "./task-service.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Приводит сырое значение поля id к числу или возвращает текст ошибки.
// Из FormData приходит строка; пустая строка не должна превращаться в 0,
// а "4abc" не должна превращаться в 4, поэтому используется Number, а не parseInt.
function parseId(rawId) {
  let id;
  if (typeof rawId === "string") {
    const text = rawId.trim();
    if (text === "") {
      return { error: "Укажите идентификатор" };
    }
    id = Number(text);
  } else if (typeof rawId === "number") {
    id = rawId;
  } else {
    return { error: "Идентификатор должен быть числом" };
  }

  if (!Number.isSafeInteger(id) || id <= 0) {
    return { error: "Идентификатор должен быть положительным целым числом" };
  }
  return { id };
}

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
// Входные значения не изменяются: возвращается новый объект value.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let id;

  if (editingId === null) {
    // Создание: id берём из черновика и он должен быть свободен.
    const parsed = parseId(draft.id);
    if (parsed.error) {
      errors.id = parsed.error;
    } else if (findTaskById(tasks, parsed.id) !== undefined) {
      errors.id = `Задача с id ${parsed.id} уже существует`;
    } else {
      id = parsed.id;
    }
  } else {
    // Редактирование: draft.id не используется (поле заблокировано и не попадает
    // в FormData). Совпадение с редактируемой задачей дубликатом не считается.
    const parsed = parseId(editingId);
    if (parsed.error) {
      errors.id = parsed.error;
    } else if (findTaskById(tasks, parsed.id) === undefined) {
      errors.id = `Задача с id ${parsed.id} не найдена`;
    } else {
      id = parsed.id;
    }
  }

  // Правило названия то же, что в сервисе: сначала тип, потом trim и длина.
  const titleResult = normalizeTitle(draft.title);
  if (!titleResult.ok) {
    errors.title = titleResult.error;
  }

  // Строгое сравнение: "HIGH" и " high " не проходят.
  if (!ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = 'Выберите приоритет: "low", "medium" или "high"';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { id, title: titleResult.title, priority: draft.priority },
  };
}
