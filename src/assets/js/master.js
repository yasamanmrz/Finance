// Storage
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let banks = JSON.parse(localStorage.getItem("banks")) || [];
let transfers = JSON.parse(localStorage.getItem("transfers")) || [];

// Init
document.addEventListener("DOMContentLoaded", () => {
  renderTransactions();
  renderBanks();
  updateDashboard();
  setupCardInputs();
  createBankSelector();
});

////////////////////////////////////

function showToast(message){
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
 document.getElementById("transaction-form").style.display = "block";

  refreshBankSelector();
}

function closeTransactionForm() {
  document.getElementById("transaction-form").style.display = "none";
  document.getElementById('transaction-amount').value=''
  document.getElementById('transaction-date').value=''
  document.getElementById('transaction-category').value='food'
  document.getElementById('transaction-description').value=''
  document.getElementById('transaction-bank').value=''
}

function openBankForm() {
  document.getElementById("bank-form").style.display = "block";
}

function closeBankForm() {
  document.getElementById("bank-form").style.display = "none";
  document.getElementById("bank-type").value=""
  document.getElementById("bank-branch").value=""
  document.getElementById("account").value=""
  document.getElementById("bank-description").value=""
  document.getElementById("money").value=""
  document.getElementById("c1").value=""
  document.getElementById("c2").value=""
  document.getElementById("c3").value=""
  document.getElementById("c4").value=""
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
    selectedBank.money = Number (selectedBank.money) + Number(amount);
  }

  if (type === "expense") {
    if(selectedBank.money < amount){
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
  
  localStorage.setItem("transactions",JSON.stringify(transactions));
  localStorage.setItem("banks",JSON.stringify(banks));

  renderTransactions();
  renderBanks();
  updateDashboard();
  closeTransactionForm();
}

// Render Transactions

function renderTransactions() {
  const table = document.getElementById("transactions-table");

  table.className ="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5";

  table.innerHTML = "";

  transactions.forEach((t) => {
    const bank = banks.find(
      (b) => b.id == t.bankId
    );

    const card = document.createElement("div");

    card.className ="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-2xl";

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

        <a href="#Bank-table" class="text-blue-600 underline">${bank ? bank.type : "No Bank"}</a>
      </div>

      <div class="py-2 break-words"><span class="font-bold">Description :</span>
        ${t.description || "-"}
      </div>

      <button class="mt-6 w-full py-3 rounded-2xl bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500 hover:text-white hover:scale-[1.02] transition-all duration-300 font-bold" onclick="deleteTransaction(${t.id})">Delete</button>
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

  localStorage.setItem("transactions",JSON.stringify(transactions));

  localStorage.setItem("banks",JSON.stringify(banks));

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
  localStorage.setItem("banks",JSON.stringify(banks));

  renderBanks();
  updateDashboard();
  refreshBankSelector();
  closeBankForm();
}
// Render Banks

function renderBanks() {
  const table = document.getElementById("Bank-table");

  table.className ="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5";

  table.innerHTML = "";

  banks.forEach((b) => {
    const card = document.createElement("div");

    card.className ="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-2xl";

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

      <button class="mt-6 w-full py-3 rounded-2xl bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500 hover:text-white hover:scale-[1.02] transition-all duration-300 font-bold" onclick="deleteBank(${b.id})">Delete</button>
    `;

    table.appendChild(card);
  });
}


// Delete Bank

function deleteBank(id) {
  banks = banks.filter((b) => b.id !== id);

  transactions = transactions.filter((t) => t.bankId != id);

  localStorage.setItem("banks",JSON.stringify(banks));

  localStorage.setItem("transactions",JSON.stringify(transactions));

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

  transactions.forEach((t) => {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  });

  banks.forEach((b) => {
    bankMoney += b.money;
  });

  const balance = bankMoney;

  document.getElementById("dashboard-income").innerText = income;

  document.getElementById("dashboard-expense").innerText = expense;

  document.getElementById("dashboard-balance").innerText = balance;

  document.getElementById("dashboard-budget").innerText = balance;
}
 
///////////////////////
function openTransferForm(){
  document.getElementById("transfer-form").style.display="block"
  renderTransferBanks()
}

function renderTransferBanks(){
  const from = document.getElementById("transfer-from")
  const to = document.getElementById("transfer-to")
  from.innerHTML=""
  to.innerHTML=""
  banks.forEach((bank)=>{
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

  localStorage.setItem("banks",JSON.stringify(banks));

  localStorage.setItem("transfers",JSON.stringify(transfers));

  renderBanks();
  updateDashboard();

  showToast("Transfer successful");
  document.getElementById("transfer-form").style.display="none"
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

    input.addEventListener("keydown",(e) => {
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