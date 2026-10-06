// Общий контрольный набор. Для своего варианта ниже предусмотрен отдельный массив.
// Идентификатор задачи не совпадает с её индексом в массиве.
export const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
  { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

// Индивидуальный вариант: N = 19, variant = ((19 - 1) % 8) + 1 = 3.
// Тема варианта 3: создание сайта-портфолио.
// Шесть задач с id 11, 23, 37, 41, 58, 64 в указанном порядке.
// Выполнены первые K = 2 задачи, поэтому начальный прогресс 2 / 6 = 33.3%.
// Присутствуют все три приоритета: low, medium, high.
export const variantNumber = 3;
export const variantTasks = [
  { id: 11, title: "Выбрать структуру разделов портфолио", completed: true, priority: "medium" },
  { id: 23, title: "Подготовить описания проектов", completed: true, priority: "high" },
  { id: 37, title: "Сверстать главную страницу", completed: false, priority: "high" },
  { id: 41, title: "Добавить адаптивность для телефона", completed: false, priority: "medium" },
  { id: 58, title: "Собрать форму обратной связи", completed: false, priority: "low" },
  { id: 64, title: "Опубликовать сайт на хостинге", completed: false, priority: "low" },
];

// Приоритет новой задачи id = 80 в индивидуальном сценарии (таблица варианта 3).
export const variantNewTaskPriority = "low";
