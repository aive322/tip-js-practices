// Собственные проверки ПР2 (дополняют готовый checks.js, не заменяют его).
// Для каждого случая сначала задан ожидаемый результат, затем выполняется вызов,
// и фактическое значение сравнивается с ожидаемым через assert.
import assert from "node:assert/strict";
import { demoTasks } from "./src/data.js";
import {
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./src/task-service.js";

let passed = 0;
let failed = 0;

function runCase(name, testFunction) {
  try {
    testFunction();
    console.log(`OK: ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL: ${name}`);
    console.log(`  ${error.message}`);
    failed += 1;
  }
}

// Глубокая копия простого массива задач для сравнения "до" и "после".
function snapshot(tasks) {
  return JSON.parse(JSON.stringify(tasks));
}

// Собственный случай 1: добавление после удаления.
// Ожидание: после удаления id = 7 этот id снова свободен, и задачу с ним
// можно добавить; она попадает в конец, порядок остальных записей не меняется.
runCase("Собственный 1. Добавление после удаления того же id", () => {
  const before = snapshot(demoTasks);

  const removed = removeTask(demoTasks, 7);
  assert.equal(removed.ok, true);
  assert.deepEqual(
    removed.tasks.map((task) => task.id),
    [1, 4, 10],
  );

  const added = addTask(removed.tasks, 7, "Новая задача на старом id", "high");
  assert.equal(added.ok, true);
  assert.deepEqual(
    added.tasks.map((task) => task.id),
    [1, 4, 10, 7],
  );
  assert.equal(added.tasks[3].completed, false);
  assert.equal(added.tasks[3].priority, "high");

  // Исходный набор и промежуточный массив не изменились.
  assert.deepEqual(demoTasks, before);
  assert.equal(removed.tasks.length, 3);
});

// Собственный случай 2: изменение первой и последней записи.
// Ожидание: меняются только выбранные записи; у них новые объекты,
// а средние записи остаются теми же объектами (повторное использование разрешено).
runCase("Собственный 2. Изменение первой и последней записи", () => {
  const before = snapshot(demoTasks);

  const first = setTaskCompleted(demoTasks, 1, false);
  assert.equal(first.ok, true);
  assert.equal(first.tasks[0].completed, false);
  assert.notEqual(first.tasks[0], demoTasks[0]);
  assert.equal(first.tasks[1], demoTasks[1]);

  const last = renameTask(first.tasks, 10, "  Финальная правка README  ");
  assert.equal(last.ok, true);
  assert.equal(last.tasks[3].title, "Финальная правка README");
  assert.equal(last.tasks[3].completed, true);
  assert.equal(last.tasks[3].priority, "medium");
  assert.notEqual(last.tasks[3], first.tasks[3]);

  // Первая запись после второй операции осталась такой, какой её сделала первая.
  assert.equal(last.tasks[0].completed, false);
  assert.deepEqual(demoTasks, before);
});

// Собственный случай 3: последовательное обновление нескольких задач.
// Ожидание по шагам рассчитано заранее:
//   старт 4 задачи, выполнено 2      -> 50
//   выполнить id 4                   -> выполнено 3, всего 4 -> 75
//   выполнить id 7                   -> выполнено 4, всего 4 -> 100
//   снять выполнение с id 1          -> выполнено 3, всего 4 -> 75
//   удалить id 10                    -> выполнено 2, всего 3 -> 66.666...
runCase("Собственный 3. Последовательное обновление нескольких задач", () => {
  const before = snapshot(demoTasks);
  let current = demoTasks;

  const steps = [
    [() => setTaskCompleted(current, 4, true), 3, 4, 75],
    [() => setTaskCompleted(current, 7, true), 4, 4, 100],
    [() => setTaskCompleted(current, 1, false), 3, 4, 75],
    [() => removeTask(current, 10), 2, 3, (2 / 3) * 100],
  ];

  assert.equal(getTaskStats(current).progress, 50);

  for (const [operation, expectedCompleted, expectedTotal, expectedProgress] of steps) {
    const previous = current;
    const previousSnapshot = snapshot(previous);

    const result = operation();
    assert.equal(result.ok, true);
    assert.notEqual(result.tasks, previous);
    // Предыдущее состояние после операции не изменилось.
    assert.deepEqual(previous, previousSnapshot);

    current = result.tasks;
    const stats = getTaskStats(current);
    assert.equal(stats.completed, expectedCompleted);
    assert.equal(stats.total, expectedTotal);
    assert.equal(stats.progress, expectedProgress);
  }

  assert.deepEqual(
    current.map((task) => task.id),
    [1, 4, 7],
  );
  assert.deepEqual(demoTasks, before);
});

// Собственный случай 4 (дополнительно): отказ посреди цепочки не портит состояние.
runCase("Собственный 4. Отказ в цепочке не меняет текущее состояние", () => {
  const before = snapshot(demoTasks);

  const step1 = addTask(demoTasks, 20, "Первая", "low");
  assert.equal(step1.ok, true);

  const failedStep = addTask(step1.tasks, 20, "Дубликат", "low");
  assert.equal(failedStep.ok, false);
  assert.equal(failedStep.tasks, undefined);

  // Состояние после отказа продолжает работать как обычно.
  const step2 = renameTask(step1.tasks, 20, "Первая, исправлено");
  assert.equal(step2.ok, true);
  assert.equal(step2.tasks.length, 5);
  assert.deepEqual(demoTasks, before);
});

console.log("");
console.log(`Собственных проверок пройдено: ${passed}; не пройдено: ${failed}.`);

if (failed > 0) {
  process.exitCode = 1;
}
