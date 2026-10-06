"use strict";

const totalTasks = 9;
const completedTasks = 9;
const dailyLimit = 3;

if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  console.log("Ошибка: вместо числа передана строка");
} else if (!Number.isFinite(totalTasks) || !Number.isFinite(completedTasks)) {
  console.log("Ошибка: недопустимое числовое значение");
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: дробное количество");
} else if (totalTasks < 0 || completedTasks < 0) {
  console.log("Ошибка: отрицательное количество");
} else if (totalTasks > 1000) {
  console.log("Ошибка: превышена верхняя граница количества задач");
} else if (completedTasks > totalTasks) {
  console.log("Ошибка: выполнено больше, чем существует");
} else if (typeof dailyLimit !== "number") {
  console.log("Ошибка: дневная норма задана строкой");
} else if (!Number.isFinite(dailyLimit) || !Number.isInteger(dailyLimit)) {
  console.log("Ошибка: дробной дневной нормы быть не должно");
} else if (dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: недопустимая дневная норма");
} else {
  let remainingTasks = totalTasks - completedTasks;

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены");
    console.log("Потребуется дней: 0");
  } else {
    console.log("Осталось задач:", remainingTasks);

    let dayNumber = 0;

    while (remainingTasks > 0) {
      dayNumber += 1;
      const doneToday = Math.min(dailyLimit, remainingTasks);
      remainingTasks -= doneToday;
      console.log(`День ${dayNumber}: выполнено ${doneToday}, осталось ${remainingTasks}`);
    }

    console.log("Потребуется дней:", dayNumber);
  }
}