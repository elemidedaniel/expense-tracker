let currentMonth = new Date().toLocaleString('default', { month: 'long' });
let monthlyTransactions = JSON.parse(localStorage.getItem("monthlyTransactions")) || {};
let balance = parseFloat(localStorage.getItem("currentBalance")) || 0;
let lastDeleted = {};

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-enter");
  const enterSection = document.querySelector(".enter");
  const balanceDisplay = document.querySelector(".balance h2");
  const spentDisplay = document.querySelector(".spent h3");
  const incomeDisplay = document.querySelector(".income h3");

  updateBalanceDisplay();

  toggleBtn.addEventListener("click", () => {
    const isVisible = enterSection.style.display === "block";
    enterSection.style.display = isVisible ? "none" : "block";
    toggleBtn.textContent = isVisible ? "Add" : "Close";
  });

  document.querySelector(".submit").addEventListener("click", () => {
    const amountInput = document.querySelector('.enter input[placeholder="Enter Amount"]');
    const descInput = document.querySelector('.enter input[placeholder="Description"]');
    const typeInput = document.querySelector('input[name="attendance"]:checked');

    const amount = parseFloat(amountInput.value);
    const desc = descInput.value;
    const type = typeInput ? typeInput.value : null;

    if (!amount || !desc || !type) return alert("Please fill all fields");

    const now = new Date();
    const date = now.toLocaleString();
    const month = now.toLocaleString('default', { month: 'long' });
    const dayName = now.toLocaleString('default', { weekday: 'long' });

    if (!monthlyTransactions[month]) {
      monthlyTransactions[month] = [];
    }

    if (month !== currentMonth) {
      currentMonth = month;
      balance = 0;
    }

    monthlyTransactions[month].push({ amount, desc, type, date, day: dayName });

    if (type === "out") {
      balance += amount;
    } else {
      balance -= amount;
    }

    localStorage.setItem("monthlyTransactions", JSON.stringify(monthlyTransactions));
    localStorage.setItem("currentBalance", balance);

    updateBalanceDisplay();
    updateTotals();
    renderTransactions(month);

    amountInput.value = "";
    descInput.value = "";
    if (typeInput) typeInput.checked = false;
  });

  document.getElementById("month-dropdown").addEventListener("change", (e) => {
    const selectedMonth = e.target.value;
    renderTransactions(selectedMonth);
    updateTotals(selectedMonth);
  });

  function updateBalanceDisplay() {
    balanceDisplay.textContent = `Balance: $${balance}`;
    balanceDisplay.style.color = balance < 0 ? "red" : "green";
  }

  function updateTotals(month = currentMonth) {
    const monthData = monthlyTransactions[month] || [];
    let totalIncome = 0;
    let totalExpense = 0;

    monthData.forEach(t => {
      if (t.type === "out") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    document.querySelector(".month-income").textContent = `Total Income: $${totalIncome}`;
    document.querySelector(".month-expense").textContent = `Total Expense: $${totalExpense}`;
    incomeDisplay.textContent = `$${totalIncome}`;
    spentDisplay.textContent = `$${totalExpense}`;
  }

  function renderTransactions(month = currentMonth) {
    const list = document.querySelector(".transactions-list");
    list.innerHTML = "";
    const data = monthlyTransactions[month] || [];
    let currentDay = "";

    data.forEach((t, index) => {
      if (t.day !== currentDay) {
        currentDay = t.day;
        const dayHeader = document.createElement("h4");
        dayHeader.textContent = currentDay;
        list.appendChild(dayHeader);
      }
      const item = document.createElement("div");
      item.className = `transaction-item ${t.type === "out" ? "income" : "expense"}`;
      const sign = t.type === "out" ? "+" : "-";
      item.innerHTML = `<strong>${t.desc}</strong> - ${sign}$${t.amount} <small>${t.date}</small> <button class="delete-btn" data-index="${index}">Delete</button>`;
      list.appendChild(item);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        monthlyTransactions[month].splice(index, 1);
        localStorage.setItem("monthlyTransactions", JSON.stringify(monthlyTransactions));

        if (month === currentMonth) {
          balance = monthlyTransactions[month].reduce((acc, t) => t.type === "out" ? acc + t.amount : acc - t.amount, 0);
          localStorage.setItem("currentBalance", balance);
          updateBalanceDisplay();
        }
        updateTotals(month);
        renderTransactions(month);
      });
    });
  }

  updateTotals();
  renderTransactions();
});