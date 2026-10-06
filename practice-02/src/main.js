import {
  demoTasks,
  variantNumber,
  variantTasks,
  variantNewTaskPriority,
} from "./data.js";
import {
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

// ---------- Вспомогательные функции вывода ----------
// Здесь только показ результатов. Вся логика (поиск, фильтры, подсчёт)
// находится в task-service.js и здесь не дублируется.

// Печатает сводку. Деструктуризация достаёт нужные поля из объекта сводки.
function printStats(tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);

  console.log(`Всего: ${total}; выполнено: ${completed}; осталось: ${pending}`);

  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    // toFixed возвращает строку и нужен только для отображения.
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

// Применяет результат операции к текущему состоянию.
// Успех: возвращаем новый массив из result.tasks.
// Отказ: печатаем ошибку и возвращаем прежнее состояние без изменений.
function applyResult(title, result, currentTasks) {
  if (result.ok) {
    console.log(`${title}: успешно`);
    return result.tasks;
  }

  console.error(`${title}: ОШИБКА, ${result.error}`);
  return currentTasks;
}

// Снимок данных для проверки, что исходный набор не был изменён.
function takeSnapshot(tasks) {
  return JSON.stringify(tasks);
}

function printHeader(text) {
  console.log("");
  console.log(`===== ${text} =====`);
}

// ---------- Общий сценарий на demoTasks ----------

function runDemoScenario() {
  const snapshot = takeSnapshot(demoTasks);

  printHeader("Общий сценарий (demoTasks)");

  console.log("Исходные задачи:");
  console.table(demoTasks);
  console.log("Названия:", getTaskTitles(demoTasks));
  console.log(
    "Невыполненные (id):",
    getPendingTasks(demoTasks).map((task) => task.id),
  );
  const foundTask = findTaskById(demoTasks, 4);
  console.log("Поиск id = 4:", foundTask);
  printStats(demoTasks);

  // Текущее состояние хранится в локальной переменной и заменяется только при успехе.
  let currentTasks = demoTasks;

  console.log("");
  currentTasks = applyResult(
    "1) Добавить задачу id = 20",
    addTask(currentTasks, 20, "Добавить проверку", "high"),
    currentTasks,
  );
  printStats(currentTasks);

  console.log("");
  currentTasks = applyResult(
    "2) Выполнить задачу id = 4",
    setTaskCompleted(currentTasks, 4, true),
    currentTasks,
  );
  printStats(currentTasks);

  console.log("");
  currentTasks = applyResult(
    "3) Переименовать задачу id = 10",
    renameTask(currentTasks, 10, "Подготовить инструкцию запуска"),
    currentTasks,
  );
  printStats(currentTasks);

  console.log("");
  currentTasks = applyResult(
    "4) Удалить задачу id = 7",
    removeTask(currentTasks, 7),
    currentTasks,
  );
  printStats(currentTasks);

  console.log("");
  console.log("Итоговые задачи:");
  console.table(currentTasks);
  console.log(
    "Идентификаторы итогового массива:",
    currentTasks.map((task) => task.id),
  );

  // Обработанный отказ: состояние не должно измениться.
  console.log("");
  const stateBeforeError = currentTasks;
  currentTasks = applyResult(
    "5) Повторно добавить id = 20 (ожидается отказ)",
    addTask(currentTasks, 20, "Дубликат", "low"),
    currentTasks,
  );
  console.log(
    "Состояние после отказа то же самое:",
    currentTasks === stateBeforeError,
  );
  printStats(currentTasks);

  // Ещё два примера обработанных отказов.
  applyResult(
    "6) Статус строкой \"true\" (ожидается отказ)",
    setTaskCompleted(currentTasks, 4, "true"),
    currentTasks,
  );
  applyResult(
    "7) Удалить несуществующую задачу id = 999 (ожидается отказ)",
    removeTask(currentTasks, 999),
    currentTasks,
  );

  console.log("");
  console.log(
    "Исходный demoTasks не изменился:",
    takeSnapshot(demoTasks) === snapshot,
  );
  console.log("Длина demoTasks:", demoTasks.length);
}

// ---------- Индивидуальный сценарий на variantTasks ----------

function runVariantScenario() {
  const snapshot = takeSnapshot(variantTasks);

  printHeader(`Индивидуальный сценарий (вариант ${variantNumber}, сайт-портфолио)`);

  console.log("Исходные данные варианта:");
  console.table(variantTasks);
  printStats(variantTasks);

  let currentTasks = variantTasks;

  console.log("");
  currentTasks = applyResult(
    "1) Добавить задачу id = 80",
    addTask(
      currentTasks,
      80,
      "Настроить домен и сертификат",
      variantNewTaskPriority,
    ),
    currentTasks,
  );
  printStats(currentTasks);

  // Задача 11 уже выполнена, но операция всё равно проверяется по контракту:
  // повторная установка того же статуса считается успешной.
  console.log("");
  currentTasks = applyResult(
    "2) Выполнить задачу id = 11 (уже выполнена)",
    setTaskCompleted(currentTasks, 11, true),
    currentTasks,
  );
  printStats(currentTasks);

  console.log("");
  currentTasks = applyResult(
    "3) Переименовать задачу id = 23",
    renameTask(currentTasks, 23, "Согласовать тексты описаний проектов"),
    currentTasks,
  );
  printStats(currentTasks);

  console.log("");
  currentTasks = applyResult(
    "4) Удалить задачу id = 37",
    removeTask(currentTasks, 37),
    currentTasks,
  );
  printStats(currentTasks);

  console.log("");
  const stateBeforeError = currentTasks;
  currentTasks = applyResult(
    "5) Повторно добавить id = 80 (ожидается отказ)",
    addTask(currentTasks, 80, "Ещё одна задача", "low"),
    currentTasks,
  );
  console.log(
    "Состояние после отказа то же самое:",
    currentTasks === stateBeforeError,
  );

  console.log("");
  console.log("Итоговые задачи варианта:");
  console.table(currentTasks);
  printStats(currentTasks);

  console.log(
    "Исходный variantTasks не изменился:",
    takeSnapshot(variantTasks) === snapshot,
  );
  console.log("Длина variantTasks:", variantTasks.length);
}

runDemoScenario();
runVariantScenario();
