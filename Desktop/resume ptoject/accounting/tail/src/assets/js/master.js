// Storage
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let banks = JSON.parse(localStorage.getItem("banks")) || [];
let transfers = JSON.parse(localStorage.getItem("transfers")) || [];

//toggletheme

function toggletheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', newTheme)
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  renderTransactions();
  renderBanks();
  updateDashboard();
  setupCardInputs();
  createBankSelector();
});

////////////////////////////////////

function showToast(message) {
  const toast = document.getElementById('toast')
  toast.innerText = message
  toast.classList.remove('hidden')
  setTimeout(() => {
    toast.classList.add('hidden')
  }, 3000);
}

////////////////////////////////


// Create Bank Selector
function createBankSelector() {
  const form = document.getElementById("transaction-form");

  if (document.getElementById("transaction-bank")) return;

  const wrapper = document.createElement("div");

  wrapper.className = "mb-4";

  wrapper.innerHTML = `
  
    <label class="block mb-1 font-bold text-lg">Select Bank:</label>
    <select id="transaction-bank"class="border border-cyan-500 rounded-xl p-1">
      <option class="px-4 py-1 rounded-full bg-cyan-900 text-sm font-semibold" value="">Choose Bank</option>
      ${banks
      .map((bank) => `
            <option value="${bank.id}">
              ${bank.type} - ${bank.account}
            </option>
          `
      )
      .join("")}
    </select>
  `;

  const category = document.getElementById("transaction-category").parentElement;

  form.insertBefore(wrapper, category.nextSibling);
}

// Refresh Bank Selector

function refreshBankSelector() {
  const select = document.getElementById("transaction-bank");

  if (!select) return;

  select.innerHTML = `
    <option value="">Choose Bank</option>

    ${banks
      .map(
        (bank) => `
          <option value="${bank.id}">
            ${bank.type} - ${bank.account}
          </option>
        `
      )
      .join("")}
  `;
}

// Forms Toggle

function openTransactionForm() {
  const form = document.getElementById("transaction-form");

  form.classList.remove("hidden");

  refreshBankSelector();
}

function closeTransactionForm() {
  const form = document.getElementById("transaction-form");

  form.classList.add("hidden");

  document.getElementById("transaction-amount").value = "";
  document.getElementById("transaction-date").value = "";
  document.getElementById("transaction-category").value = "food";
  document.getElementById("transaction-description").value = "";

  const bankSelect = document.getElementById("transaction-bank");

  if (bankSelect) {
    bankSelect.value = "";
  }
}
function openBankForm() {
  document.getElementById("bank-form").style.display = "block";
}

function closeBankForm() {
  document.getElementById("bank-form").style.display = "none";
  document.getElementById("bank-type").value = ""
  document.getElementById("bank-branch").value = ""
  document.getElementById("account").value = ""
  document.getElementById("bank-description").value = ""
  document.getElementById("money").value = ""
  document.getElementById("c1").value = ""
  document.getElementById("c2").value = ""
  document.getElementById("c3").value = ""
  document.getElementById("c4").value = ""
}

// Save Transaction

function saveTransaction() {
  const type = document.getElementById("transaction-type").value;

  const amount = parseFloat(document.getElementById("transaction-amount").value
  );

  const date = document.getElementById("transaction-date").value;

  const category = document.getElementById("transaction-category").value;

  const description = document.getElementById("transaction-description").value;

  const bankId = document.getElementById("transaction-bank").value;

  if (!amount || !date || !bankId) {
    showToast("Fill required fields");
    return;
  }

  const selectedBank = banks.find((bank) => bank.id == bankId);

  if (type === "income") {
    selectedBank.money = Number(selectedBank.money) + Number(amount);
  }

  if (type === "expense") {
    if (selectedBank.money < amount) {
      showToast('Not enough money in this bank')
      return;
    }
    selectedBank.money = Number(selectedBank.money) - Number(amount)
  }

  transactions.push({
    id: Date.now(),
    type,
    amount,
    date,
    category,
    description,
    bankId,
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("banks", JSON.stringify(banks));

  renderTransactions();
  renderBanks();
  updateDashboard();
  closeTransactionForm();
}

// Render Transactions

function renderTransactions() {
  const table = document.getElementById("transactions-table");

  table.className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5";

  table.innerHTML = "";

  transactions.forEach((t) => {
    const bank = banks.find(
      (b) => b.id == t.bankId
    );

    const card = document.createElement("div");

    card.className = "bg-(--surface-secondary) border border-(--border) rounded-3xl p-5 shadow-2xl";

    card.innerHTML = `
    
      <div class="py-2">
        <span class="font-bold">Kind :</span>
        ${t.type}
      </div>

      <div class="py-2">
        <span class="font-bold">Amount :</span>
        ${t.amount}
      </div>

      <div class="py-2">
        <span class="font-bold">Date :</span>
        ${t.date}
      </div>

      <div class="py-2">
        <span class="font-bold">Category :</span>
        ${t.category}
      </div>

      <div class="py-2">
        <span class="font-bold">Bank :</span>

        <a href="#Bank-table" class="text-(--danger) underline">${bank ? bank.type : "No Bank"}</a>
      </div>

      <div class="py-2 break-words"><span class="font-bold">Description :</span>
        ${t.description || "-"}
      </div>

      <button class="mt-6 w-full py-3 rounded-2xl bg-(--secondary) border border-(--border) text-(--danger) hover:scale-[1.02] transition-all duration-300 font-bold" onclick="deleteTransaction(${t.id})">Delete</button>
    `;

    table.appendChild(card);
  });
}


// Delete Transaction

function deleteTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);

  if (transaction) {
    const bank = banks.find((b) => b.id == transaction.bankId);

    if (transaction.type === "expense") {
      bank.money += transaction.amount;
    }

    if (transaction.type === "income") {
      bank.money -= transaction.amount;
    }
  }

  transactions = transactions.filter((t) => t.id !== id);

  localStorage.setItem("transactions", JSON.stringify(transactions));

  localStorage.setItem("banks", JSON.stringify(banks));

  renderTransactions();
  renderBanks();
  updateDashboard();
}


// Save Bank
function saveBank() {
  const type = document.getElementById("bank-type").value;

  const branch = document.getElementById("bank-branch").value;

  const account = document.getElementById("account").value;

  const description = document.getElementById("bank-description").value;

  const money = parseFloat(document.getElementById("money").value) || 0;

  const card =
    document.getElementById("c1").value +
    document.getElementById("c2").value +
    document.getElementById("c3").value +
    document.getElementById("c4").value;

  if (!type || !account) {
    showToast("Fill required fields");
    return;
  }

  banks.push({
    id: Date.now(),
    type,
    branch,
    account,
    description,
    money,
    card,
  });
  localStorage.setItem("banks", JSON.stringify(banks));

  renderBanks();
  updateDashboard();
  refreshBankSelector();
  closeBankForm();
}
// Render Banks

function renderBanks() {
  const table = document.getElementById("Bank-table");

  table.className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5";

  table.innerHTML = "";

  banks.forEach((b) => {
    const card = document.createElement("div");

    card.className = "bg-(--surface-secondary) border border-(--border) rounded-3xl p-5 shadow-2xl";

    card.innerHTML = `

      <div class="py-2">
        <span class="font-bold">Bank :</span>
        ${b.type}
      </div>

      <div class="py-2">
        <span class="font-bold">Branch :</span>
        ${b.branch}
      </div>

      <div class="py-2">
        <span class="font-bold">Account :</span>
        ${b.account}
      </div>

      <div class="py-2">
        <span class="font-bold">Money :</span>
        ${b.money}
      </div>

      <div class="py-2 break-all">
        <span class="font-bold">Card :</span>
        ${b.card}
      </div>

      <button class="mt-6 w-full py-3 rounded-2xl bg-(--secondary) border border-(--border) text-(--danger) hover:scale-[1.02] transition-all duration-300 font-bold" onclick="deleteBank(${b.id})">Delete</button>
    `;

    table.appendChild(card);
  });
}


// Delete Bank

function deleteBank(id) {
  banks = banks.filter((b) => b.id !== id);

  transactions = transactions.filter((t) => t.bankId != id);

  localStorage.setItem("banks", JSON.stringify(banks));

  localStorage.setItem("transactions", JSON.stringify(transactions));

  renderBanks();
  renderTransactions();
  updateDashboard();
  refreshBankSelector();
}


// Dashboard

function updateDashboard() {
  let income = 0;
  let expense = 0;
  let bankMoney = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  transactions.forEach((t) => {
    if (t.type === "income") {
      income += Number(t.amount)
      incomeCount++
    }
    if (t.type === "expense") {
      expense += Number(t.amount)
      expenseCount++
    }
  });

  banks.forEach((b) => {
    bankMoney += Number(b.money)
  });

  const balance = bankMoney;

  document.getElementById("dashboard-income").innerText = income.toLocaleString();

  document.getElementById("dashboard-income-count").innerText = incomeCount;

  document.getElementById("dashboard-expense").innerText = expense.toLocaleString();

  document.getElementById("dashboard-expense-count").innerText = expenseCount;

  document.getElementById("dashboard-balance").innerText = balance.toLocaleString();

  document.getElementById("dashboard-budget").innerText = balance.toLocaleString();

  document.getElementById("dashboard-total-transactions").innerText = transactions.length;

  const lastTransaction =
    transactions.length > 0
      ? transactions[transactions.length - 1]
      : null;

  const lastTransactionElement =
    document.getElementById("dashboard-last-transaction");

  const lastDateElement =
    document.getElementById("dashboard-last-date");

  if (lastTransaction) {
    lastTransactionElement.innerText =
      `${lastTransaction.type} - ${Number(lastTransaction.amount).toLocaleString()}`;

    lastDateElement.innerText =
      lastTransaction.date;
  } else {
    lastTransactionElement.innerText = "No transaction";
    lastDateElement.innerText = "-";
  }
}

// =========================
// REPORTS
// =========================

function updateReports() {

  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Current Month
  const currentMonthTransactions = transactions.filter((transaction) => {

    const transactionDate = new Date(transaction.date);

    return (
      transactionDate.getFullYear() === currentYear &&
      transactionDate.getMonth() === currentMonth
    );

  });


  // Previous Month
  const previousMonthDate = new Date(
    currentYear,
    currentMonth - 1,
    1
  );

  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth();


  const previousMonthTransactions = transactions.filter((transaction) => {

    const transactionDate = new Date(transaction.date);

    return (
      transactionDate.getFullYear() === previousYear &&
      transactionDate.getMonth() === previousMonth
    );

  });


  // =========================
  // CURRENT MONTH
  // =========================

  let currentIncome = 0;
  let currentExpense = 0;

  currentMonthTransactions.forEach((transaction) => {

    const amount = Number(transaction.amount);

    if (transaction.type === "income") {
      currentIncome += amount;
    }

    if (transaction.type === "expense") {
      currentExpense += amount;
    }

  });


  // =========================
  // PREVIOUS MONTH
  // =========================

  let previousIncome = 0;
  let previousExpense = 0;

  previousMonthTransactions.forEach((transaction) => {

    const amount = Number(transaction.amount);

    if (transaction.type === "income") {
      previousIncome += amount;
    }

    if (transaction.type === "expense") {
      previousExpense += amount;
    }

  });


  // =========================
  // UPDATE MONTHLY CARDS
  // =========================

  const monthExpenseElement =
    document.getElementById("report-month-expense");

  const monthIncomeElement =
    document.getElementById("report-month-income");

  const lastMonthElement =
    document.getElementById("report-last-month");


  if (monthExpenseElement) {

    monthExpenseElement.innerText =
      currentExpense.toLocaleString();

  }


  if (monthIncomeElement) {

    monthIncomeElement.innerText =
      currentIncome.toLocaleString();

  }


  if (lastMonthElement) {

    lastMonthElement.innerText =
      previousMonthTransactions.length;

  }


  // =========================
  // MONTH COMPARISON
  // =========================

  const expenseDifference =
    currentExpense - previousExpense;

  const incomeDifference =
    currentIncome - previousIncome;


  const expenseComparison =
    document.getElementById("report-expense-comparison");

  const incomeComparison =
    document.getElementById("report-income-comparison");

  const expenseChange =
    document.getElementById("report-expense-change");

  const incomeChange =
    document.getElementById("report-income-change");


  if (expenseComparison) {

    if (previousExpense === 0) {

      expenseComparison.innerText =
        "Compared to last month: No data";

    } else {

      const percentage =
        ((expenseDifference / previousExpense) * 100).toFixed(1);

      expenseComparison.innerText =
        `Compared to last month: ${percentage}%`;

    }

  }


  if (incomeComparison) {

    if (previousIncome === 0) {

      incomeComparison.innerText =
        "Compared to last month: No data";

    } else {

      const percentage =
        ((incomeDifference / previousIncome) * 100).toFixed(1);

      incomeComparison.innerText =
        `Compared to last month: ${percentage}%`;

    }

  }


  if (expenseChange) {

    if (previousExpense === 0) {

      expenseChange.innerText = "No data";

    } else {

      const percentage =
        ((expenseDifference / previousExpense) * 100).toFixed(1);

      expenseChange.innerText =
        `${percentage}%`;

    }

  }


  if (incomeChange) {

    if (previousIncome === 0) {

      incomeChange.innerText = "No data";

    } else {

      const percentage =
        ((incomeDifference / previousIncome) * 100).toFixed(1);

      incomeChange.innerText =
        `${percentage}%`;

    }

  }


  // =========================
  // TOP EXPENSE CATEGORY
  // =========================

  const categoryTotals = {};

  currentMonthTransactions.forEach((transaction) => {

    if (transaction.type !== "expense") {
      return;
    }

    const category = transaction.category;

    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }

    categoryTotals[category] +=
      Number(transaction.amount);

  });


  let topCategory = "-";
  let topCategoryAmount = 0;


  Object.keys(categoryTotals).forEach((category) => {

    if (categoryTotals[category] > topCategoryAmount) {

      topCategory = category;

      topCategoryAmount =
        categoryTotals[category];

    }

  });


  const topCategoryElement =
    document.getElementById("report-top-category");

  const topCategoryAmountElement =
    document.getElementById("report-top-category-amount");


  if (topCategoryElement) {

    topCategoryElement.innerText =
      topCategory;

  }


  if (topCategoryAmountElement) {

    topCategoryAmountElement.innerText =
      topCategoryAmount > 0
        ? topCategoryAmount.toLocaleString()
        : "0";

  }

}


// =========================
// FILTER REPORTS
// =========================

function filterReports() {

  const fromDate =
    document.getElementById("report-date-from").value;

  const toDate =
    document.getElementById("report-date-to").value;

  const type =
    document.getElementById("report-type").value;

  const category =
    document.getElementById("report-category").value;


  let filteredTransactions = [...transactions];


  // =========================
  // DATE FILTER
  // =========================

  if (fromDate) {

    filteredTransactions =
      filteredTransactions.filter((transaction) => {

        return transaction.date >= fromDate;

      });

  }


  if (toDate) {

    filteredTransactions =
      filteredTransactions.filter((transaction) => {

        return transaction.date <= toDate;

      });

  }


  // =========================
  // TYPE FILTER
  // =========================

  if (type !== "all") {

    filteredTransactions =
      filteredTransactions.filter((transaction) => {

        return transaction.type === type;

      });

  }


  // =========================
  // CATEGORY FILTER
  // =========================

  if (category !== "all") {

    filteredTransactions =
      filteredTransactions.filter((transaction) => {

        return transaction.category === category;

      });

  }


  renderReportResults(filteredTransactions);

}


// =========================
// RENDER REPORT RESULTS
// =========================

function renderReportResults(filteredTransactions) {

  const results =
    document.getElementById("report-results");

  const totalElement =
    document.getElementById("report-filtered-total");

  const summaryElement =
    document.getElementById("report-result-summary");


  if (!results) return;


  results.innerHTML = "";


  let totalAmount = 0;


  filteredTransactions.forEach((transaction) => {

    const amount =
      Number(transaction.amount);

    totalAmount += amount;


    const bank =
      banks.find(
        (bank) => bank.id == transaction.bankId
      );


    const card =
      document.createElement("div");


    card.className =
      "rounded-3xl p-5 shadow-lg bg-(--surface) border border-(--border)";


    card.innerHTML = `

    <div class="flex items-center justify-between gap-3 mb-4">

      <span
        class="text-sm font-semibold text-(--text-muted)"
      >
        Type
      </span>

      <span
        class="font-bold
        ${transaction.type === "income"
        ? "text-(--success)"
        : "text-(--danger)"
      }"
      >
        ${transaction.type}
      </span>

    </div>


    <div class="py-2">

      <span class="font-semibold text-(--text-muted)">
        Amount:
      </span><span class="font-bold text-(--text)">
      ${amount.toLocaleString()}
    </span>

  </div>


  <div class="py-2">

    <span class="font-semibold text-(--text-muted)">
      Date:
    </span>

    <span class="text-(--text)">
      ${transaction.date}
    </span>

  </div>


  <div class="py-2">

    <span class="font-semibold text-(--text-muted)">
      Category:
    </span>

    <span class="text-(--text)">
      ${transaction.category}
    </span>

  </div>


  <div class="py-2">

    <span class="font-semibold text-(--text-muted)">
      Bank:
    </span>

    <span class="text-(--text)">
      ${bank ? bank.type : "No Bank"}
    </span>

  </div>


  <div class="py-2 break-words">

    <span class="font-semibold text-(--text-muted)">
      Description:
    </span>

    <span class="text-(--text)">
      ${transaction.description || "-"}
    </span>

  </div>

`;


    results.appendChild(card);

  });


  // =========================
  // TOTAL
  // =========================

  if (totalElement) {

    totalElement.innerText =
      totalAmount.toLocaleString();

  }


  // =========================
  // SUMMARY
  // =========================

  if (summaryElement) {

    if (filteredTransactions.length === 0) {

      summaryElement.innerText =
        "No transactions found";

    } else {

      summaryElement.innerText =
        `${filteredTransactions.length} transaction(s) found`;

    }

  }

}


// =========================
// CLEAR REPORT FILTER
// =========================

function clearReportFilter() {

  document.getElementById("report-date-from").value = "";

  document.getElementById("report-date-to").value = "";

  document.getElementById("report-type").value = "all";

  document.getElementById("report-category").value = "all";


  renderReportResults(transactions);

}


// =========================
// REPORT EVENTS
// =========================

document.addEventListener("DOMContentLoaded", () => {

  const applyButton =
    document.getElementById("apply-report-filter");

  const clearButton =
    document.getElementById("clear-report-filter");


  if (applyButton) {

    applyButton.addEventListener(
      "click",
      filterReports
    );

  }


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearReportFilter
    );

  }


  updateReports();

  renderReportResults(transactions);

});



///////////////////////
function openTransferForm() {
  const form = document.getElementById("transfer-form")
  form.classList.remove('hidden')
  renderTransferBanks()
}

function closeTransferForm() {
  const form = document.getElementById("transfer-form");

  form.classList.add("hidden");

  document.getElementById("transfer-amount").value = "";
  document.getElementById("transfer-description").value = "";
}

function renderTransferBanks() {
  const from = document.getElementById("transfer-from")
  const to = document.getElementById("transfer-to")
  from.innerHTML = ""
  to.innerHTML = ""
  banks.forEach((bank) => {
    from.innerHTML += `
     <option value="${bank.id}">${bank.type} - ${bank.account}</option>
    `
    to.innerHTML += `
     <option value="${bank.id}">${bank.type} - ${bank.account}</option>
    `
  })
}

function saveTransfer() {

  const fromId =
    document.getElementById("transfer-from").value;

  const toId = document.getElementById("transfer-to").value;

  const amount = parseFloat(document.getElementById("transfer-amount").value
  );

  const description = document.getElementById("transfer-description").value;

  // validation
  if (!fromId || !toId || !amount) {
    showToast("Fill all fields");
    return;
  }

  if (fromId === toId) {
    showToast("Choose different banks");
    return;
  }

  const fromBank = banks.find(
    (b) => b.id == fromId
  );

  const toBank = banks.find(
    (b) => b.id == toId
  );


  if (fromBank.money < amount) {
    showToast("Not enough money");
    return;
  }


  fromBank.money -= amount;

  toBank.money += amount;

  // save history
  transfers.push({
    id: Date.now(),
    from: fromBank.type,
    to: toBank.type,
    amount,
    description,
  });

  localStorage.setItem("banks", JSON.stringify(banks));

  localStorage.setItem("transfers", JSON.stringify(transfers));

  renderBanks();
  updateDashboard();

  showToast("Transfer successful");
  closeTransferForm()
}


// Card Input Auto Move

function setupCardInputs() {
  const inputs =
    document.querySelectorAll(
      "input[data-type='bankcard']"
    );

  inputs.forEach((input) => {
    input.addEventListener(
      "input",
      () => {
        const next = input.getAttribute("data-next");

        if (input.value.length === 4 && next) {
          document.getElementById(next)?.focus();
        }
      }
    );

    input.addEventListener("keydown", (e) => {
      const prev = input.getAttribute("data-prev");

      if (e.key === "Backspace" && input.value.length === 0 && prev) {
        document.getElementById(prev)?.focus();
      }
    }
    );
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.log("SW failed", err));
  });
}