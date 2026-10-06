// Новый модуль ПР3. Вход: корректный массив задач и фильтр all/pending/completed.
// Результат: новый массив, исходный порядок и объекты сохраняются.
// Здесь нет DOM и нет изменения данных: только вычисление того, что показывать.
export function getVisibleTasks(tasks, filter = "all") {
  switch (filter) {
    case "pending":
      // filter() всегда возвращает новый массив, порядок записей сохраняется.
      return tasks.filter((task) => task.completed === false);
    case "completed":
      return tasks.filter((task) => task.completed === true);
    case "all":
    default:
      // Копия массива: вызывающий код получает свой массив, а не общий.
      // Недопустимые значения фильтра отсеиваются в обработчике (main.js),
      // поэтому сюда они обычно не попадают.
      return [...tasks];
  }
}
