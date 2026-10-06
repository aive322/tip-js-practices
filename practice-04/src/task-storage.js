import { createTask } from "./task-service.js";

export const STORAGE_VERSION = 1;

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage.

// Независимая копия списка: и массив, и объекты новые.
function copyTasks(tasks) {
  return tasks.map((task) => ({ ...task }));
}

// Проверка одной сохранённой задачи. Правила id, названия и приоритета
// берутся из createTask, чтобы не дублировать модель из ПР2.
function isValidStoredTask(task) {
  if (task === null || typeof task !== "object" || Array.isArray(task)) {
    return false;
  }
  if (typeof task.completed !== "boolean") {
    return false;
  }
  const checked = createTask(task.id, task.title, task.priority);
  // Нормализация при чтении не выполняется: название должно уже быть чистым.
  return checked.ok && checked.task.title === task.title;
}

export function isValidTaskList(value) {
  if (!Array.isArray(value)) {
    return false;
  }
  if (!value.every(isValidStoredTask)) {
    return false;
  }
  // Set хранит уникальные значения: размер меньше длины значит есть повтор id.
  return new Set(value.map((task) => task.id)).size === value.length;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallback = copyTasks(fallbackTasks);

  try {
    const raw = storage.getItem(key);

    // Ключа нет — это не ошибка, просто данные ещё не сохранялись.
    if (raw === null) {
      return { ok: true, source: "initial", tasks: fallback };
    }

    // Успешный JSON.parse означает только корректный синтаксис, поэтому дальше
    // проверяются оболочка, версия и вся схема задач.
    const data = JSON.parse(raw);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Сохранённая запись имеет неверную структуру");
    }
    if (data.version !== STORAGE_VERSION) {
      throw new Error("Неизвестная версия сохранённых данных");
    }
    if (!isValidTaskList(data.tasks)) {
      throw new Error("Сохранённые задачи не соответствуют схеме");
    }

    return { ok: true, source: "storage", tasks: copyTasks(data.tasks) };
  } catch (error) {
    // Повреждённая запись не используется частично и не удаляется автоматически.
    return {
      ok: false,
      source: "fallback",
      tasks: fallback,
      error: `Сохранённые данные не загружены, показан исходный набор: ${error.message}`,
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач некорректен и не был сохранён" };
  }

  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Не удалось сохранить данные: после перезагрузки изменения могут быть потеряны (${error.message})`,
    };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    // Удаляется ровно один ключ; localStorage.clear() не используется.
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось удалить сохранённые данные: ${error.message}` };
  }
}
