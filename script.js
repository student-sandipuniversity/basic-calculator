
const screen = document.getElementById("screen");
const expression = document.getElementById("expression");
const buttons = document.querySelector(".buttons");

let current = "0";
let stored = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    throw new Error("Invalid calculation");
  }

  const rounded = Number(number.toPrecision(12));
  return String(rounded);
}

function symbol(op) {
  return { "+": "+", "-": "−", "*": "×",
           "/": "÷", "%": "%" }[op] || op;
}

function calculate(a, op, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/":
      if (b === 0) throw new Error("Cannot divide by zero");
      return a / b;
    case "%":
      if (b === 0) throw new Error("Cannot divide by zero");
      return a % b;
    default: return b;
  }
}

function updateDisplay() {
  screen.textContent = current;

  // Show a live result preview while entering the second number.
  if (operator !== null && stored !== null &&
      !waitingForOperand) {
    try {
      const result = calculate(
        Number(stored), operator, Number(current)
      );

      expression.textContent =
        `${stored} ${symbol(operator)} ${current} = ${formatNumber(result)}`;
    } catch (error) {
      expression.textContent = error.message;
    }
  }
}

function inputDigit(digit) {
  if (current === "Error" || justCalculated) {
    current = digit;
    stored = null;
    operator = null;
    justCalculated = false;
    expression.textContent = "";
  } else if (waitingForOperand) {
    current = digit;
    waitingForOperand = false;
  } else {
    current = current === "0" ? digit : current + digit;
  }

  updateDisplay();
}

function inputDecimal() {
  if (current === "Error" || justCalculated) {
    current = "0.";
    stored = null;
    operator = null;
    justCalculated = false;
    waitingForOperand = false;
    expression.textContent = "";
  } else if (waitingForOperand) {
    current = "0.";
    waitingForOperand = false;
  } else if (!current.includes(".")) {
    current += ".";
  }

  updateDisplay();
}

function chooseOperator(nextOperator) {
  if (current === "Error") return;

  if (operator !== null && !waitingForOperand) {
    performCalculation(false);
    if (current === "Error") return;
  }

  stored = current;
  operator = nextOperator;
  waitingForOperand = true;
  justCalculated = false;

  expression.textContent =
    `${stored} ${symbol(operator)}`;

  updateDisplay();
}

function performCalculation(finish = true) {
  if (operator === null || stored === null ||
      waitingForOperand) return;

  const a = Number(stored);
  const b = Number(current);
  const oldExpression =
    `${stored} ${symbol(operator)} ${current}`;

  try {
    const result = calculate(a, operator, b);
    current = formatNumber(result);

    if (finish) {
      expression.textContent = `${oldExpression} =`;
      stored = null;
      operator = null;
      waitingForOperand = true;
      justCalculated = true;
    } else {
      stored = current;
      waitingForOperand = true;
    }
  } catch (error) {
    current = "Error";
    expression.textContent = error.message;
    stored = null;
    operator = null;
    waitingForOperand = true;
    justCalculated = true;
  }

  screen.textContent = current;
}

function clearCalculator() {
  current = "0";
  stored = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = false;
  expression.textContent = "Ready to calculate";
  updateDisplay();
}

function backspace() {
  if (current === "Error" || justCalculated) {
    clearCalculator();
    return;
  }

  if (waitingForOperand) return;

  current = current.length > 1
    ? current.slice(0, -1)
    : "0";

  if (current === "-") current = "0";

  updateDisplay();
}

function toggleSign() {
  if (current === "Error") return;

  if (justCalculated) justCalculated = false;

  if (current !== "0") {
    current = current.startsWith("-")
      ? current.slice(1)
      : "-" + current;
  }

  updateDisplay();
}

// Handle calculator button clicks
buttons.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.value !== undefined) {
    const value = button.dataset.value;

    if ("0123456789".includes(value) && value.length === 1) {
      inputDigit(value);
    } else {
      chooseOperator(value);
    }

    return;
  }

  switch (button.dataset.action) {
    case "clear":
      clearCalculator();
      break;
    case "backspace":
      backspace();
      break;
    case "decimal":
      inputDecimal();
      break;
    case "sign":
      toggleSign();
      break;
    case "equals":
      performCalculation(true);
      break;
  }
});

// Bonus: Keyboard support
document.addEventListener("keydown", event => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (["+", "-", "*", "/", "%"].includes(key)) {
    chooseOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    performCalculation(true);
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape" || key === "Delete") {
    clearCalculator();
  }
});

clearCalculator();
