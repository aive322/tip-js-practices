// Модуль прикладной логики. Здесь нет console.log, DOM и глобального списка задач:
// каждая функция работает только с переданными аргументами и возвращает результат.
// Ожидаемые ошибки возвращаются как данные: { ok: false, error: "..." }.

const ALLOWED_PRIORITIES = ["low", "medium", "high"];
const MAX_TITLE_LENGTH = 100;

// ---------- Внутренние функции проверки (наружу не экспортируются) ----------

// Проверка идентификатора: положительное безопасное целое число, без приведения типов.
// Возвращает текст ошибки или null, если id корректен.
function getIdError(id) {
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
    return "Идентификатор должен быть положительным целым числом";
  }
  return null;
}

// Проверка и очистка названия. Сначала тип, и только потом trim(),
// иначе на не-строке trim() вызвал бы исключение.
function normalizeTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название должно быть строкой" };
  }

  const cleanTitle = title.trim();

  if (cleanTitle.length === 0) {
    return { ok: false, error: "Название не должно быть пустым" };
  }

  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Название не должно быть длиннее ${MAX_TITLE_LENGTH} символов`,
    };
  }

  return { ok: true, title: cleanTitle };
}

// ---------- Создание задачи ----------

export function createTask(id, title, priority = "medium") {
  const idError = getIdError(id);
  if (idError !== null) {
    return { ok: false, error: idError };
  }

  const titleResult = normalizeTitle(title);
  if (!titleResult.ok) {
    return { ok: false, error: titleResult.error };
  }

  // includes() сравнивает строго: "HIGH", " high ", null и 1 не пройдут.
  if (!ALLOWED_PRIORITIES.includes(priority)) {
    return {
      ok: false,
      error: 'Приоритет должен быть "low", "medium" или "high"',
    };
  }

  return {
    ok: true,
    task: {
      id,
      title: titleResult.title,
      completed: false,
      priority,
    },
  };
}

// ---------- Чтение списка (исходный массив не меняется) ----------

export function findTaskById(tasks, id) {
  // find() вернёт сам объект из массива или undefined, если совпадений нет.
  // Строгое сравнение: строка "4" не найдёт задачу с id = 4.
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  // filter() всегда возвращает новый массив, в том числе пустой.
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  // Процент не округляем: округление делается только при выводе (toFixed).
  // Для пустого списка деления на ноль нет: progress = 0 по соглашению модели.
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return { total, completed, pending, progress };
}

// ---------- Изменение данных (всегда возвращаем НОВЫЙ массив) ----------

export function addTask(tasks, id, title, priority = "medium") {
  // Все проверки полей уже есть в createTask, не дублируем их.
  const created = createTask(id, title, priority);
  if (!created.ok) {
    return { ok: false, error: created.error };
  }

  // Уникальность id можно проверить только здесь: createTask списка не видит.
  if (findTaskById(tasks, id) !== undefined) {
    return { ok: false, error: `Задача с id ${id} уже существует` };
  }

  // Spread создаёт новый массив; исходный остаётся прежним.
  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  const idError = getIdError(id);
  if (idError !== null) {
    return { ok: false, error: idError };
  }

  // Только настоящие true/false: "false" и 0 не преобразуются.
  if (typeof completed !== "boolean") {
    return { ok: false, error: "Признак выполнения должен быть true или false" };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  // map() создаёт новый массив. Выбранную задачу заменяем новым объектом
  // (spread + новое значение поля), остальные записи берём как есть.
  const updatedTasks = tasks.map((task) =>
    task.id === id ? { ...task, completed } : task,
  );

  return { ok: true, tasks: updatedTasks };
}

export function renameTask(tasks, id, title) {
  const idError = getIdError(id);
  if (idError !== null) {
    return { ok: false, error: idError };
  }

  const titleResult = normalizeTitle(title);
  if (!titleResult.ok) {
    return { ok: false, error: titleResult.error };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  // Меняем только title, остальные поля сохраняются через spread.
  const updatedTasks = tasks.map((task) =>
    task.id === id ? { ...task, title: titleResult.title } : task,
  );

  return { ok: true, tasks: updatedTasks };
}

export function removeTask(tasks, id) {
  const idError = getIdError(id);
  if (idError !== null) {
    return { ok: false, error: idError };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  // filter() даёт новый массив без выбранной записи; порядок остальных сохраняется.
  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}
