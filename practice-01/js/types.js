"use strict";

// 1. "8" + 2
const result1 = "8" + 2;
console.log("1)", '"8" + 2 =', result1, "| тип:", typeof result1);

// 2. "8" - 2
const result2 = "8" - 2;
console.log("2)", '"8" - 2 =', result2, "| тип:", typeof result2);

// 3. Number("8") + 2
const result3 = Number("8") + 2;
console.log("3)", 'Number("8") + 2 =', result3, "| тип:", typeof result3);

// 4. "12" > "3"
const result4 = "12" > "3";
console.log("4)", '"12" > "3" =', result4, "| тип:", typeof result4);

// 5. 12 === "12"
const result5 = 12 === "12";
console.log("5)", '12 === "12" =', result5, "| тип:", typeof result5);

// 6. Number("")
const result6 = Number("");
console.log("6)", 'Number("") =', result6, "| тип:", typeof result6);

// 7. Number("text")
const result7 = Number("text");
console.log("7)", 'Number("text") =', result7, "| тип:", typeof result7);

// 8. Boolean("false")
const result8 = Boolean("false");
console.log("8)", 'Boolean("false") =', result8, "| тип:", typeof result8);

// 9. typeof null
const result9 = typeof null;
console.log("9)", "typeof null =", result9, "| тип результата этого выражения:", typeof result9);

// 10. typeof NaN
const result10 = typeof NaN;
console.log("10)", "typeof NaN =", result10, "| тип результата этого выражения:", typeof result10);