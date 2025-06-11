"use strict";

const account1 = {
  owner: "Omar Taha",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2024-11-18T21:31:17.178Z",
    "2024-12-23T07:42:02.383Z",
    "2025-05-23T09:15:04.904Z",
    "2025-05-24T10:17:24.185Z",
    "2025-05-25T14:11:59.604Z",
    "2025-05-26T17:01:17.194Z",
    "2025-05-27T23:36:17.929Z",
    "2025-05-28T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Mohamed Taha",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2024-11-01T13:15:33.035Z",
    "2024-11-30T09:48:16.867Z",
    "2024-12-25T06:04:23.907Z",
    "2025-01-25T14:18:46.235Z",
    "2025-02-05T16:33:06.386Z",
    "2025-04-10T14:43:26.374Z",
    "2025-06-25T18:49:59.371Z",
    "2025-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};
const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const createUsernames = function (accs) {
  accs.forEach((acc) => {
    acc.userName = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);

const formatMovementDate = (date, locale) => {
  const calcDayPassed = (date1, date2) => {
    return Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
  };

  const now = new Date();

  const daysPassed = Math.floor(calcDayPassed(now, date));

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov);

  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

let sort = false;

const displayMovments = function (acc, sort) {
  const movements = sort
    ? acc.movements.slice(0).sort((a, b) => a - b)
    : acc.movements;
  containerMovements.innerHTML = "";

  movements.forEach((mov, index) => {
    let type = mov > 0 ? "deposit" : "withdrawal";

    const displayDate = formatMovementDate(
      new Date(acc.movementsDates.at(index)),
      acc.locale
    );

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCurrency(
          mov,
          acc.locale,
          acc.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov);

  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((mov) => (mov * 1.2) / 100)
    .filter((mov) => mov >= 1)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const updateUI = (acc) => {
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
  displayMovments(acc, sort);
};

let currAcc, timer;

const startLogoutTimer = () => {
  const tick = () => {
    let mins = String(Math.trunc(time / 60)).padStart(2, 0);
    let secs = String(time % 60).padStart(2, 0);

    labelTimer.innerHTML = `${mins}:${secs} `;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.innerHTML = "Log in to get started";
    }

    time--;
  };

  let time = 300;

  tick();

  timer = setInterval(tick, 1000);
  return timer;
};

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  //find cuurent Account
  currAcc = accounts.find((acc) => acc.userName === inputLoginUsername.value);

  if (currAcc?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome Back, ${currAcc.owner.split(" ")[0]}`;

    containerApp.style.opacity = 100;

    const now = new Date();

    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };

    const formatDate = new Intl.DateTimeFormat(currAcc.locale, options).format(
      now
    );

    labelDate.innerHTML = `${formatDate}`;

    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    startLogoutTimer();

    updateUI(currAcc);
  }
});

btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();
  const personRecivedAmount = inputTransferTo.value;
  const amount = Math.floor(inputTransferAmount.value);
  const personRecived = accounts.find(
    (acc) => acc.userName === personRecivedAmount
  );

  if (currAcc.userName === personRecivedAmount) return;

  inputTransferTo.value = inputTransferAmount.value = "";

  if (
    personRecived &&
    amount > 0 &&
    currAcc.balance > amount &&
    currAcc.userName !== personRecived
  ) {
    currAcc.movements.push(-amount);
    currAcc.movementsDates.push(new Date());
    updateUI(currAcc);
    personRecived.movements.push(amount);
    personRecived.movementsDates.push(new Date());

    clearInterval(timer);
    startLogoutTimer();
  }
});

btnLoan.addEventListener("click", (e) => {
  e.preventDefault();

  const amount = +inputLoanAmount.value;
  if (amount > 0 && currAcc.movements.some((mov) => mov >= amount * 0.1)) {
    currAcc.movements.push(amount);
    currAcc.movementsDates.push(new Date());
    updateUI(currAcc);

    clearInterval(timer);
    startLogoutTimer();
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", (e) => {
  e.preventDefault();

  if (
    currAcc.userName === inputCloseUsername.value &&
    currAcc.pin === +inputClosePin.value
  ) {
    const DeletedAcoountIndex = accounts.findIndex(
      (acc) => acc.userName === currAcc.userName
    );
    accounts.slice("").splice(DeletedAcoountIndex, 1);

    containerApp.style.opacity = 0;
    labelWelcome.innerHTML = "Login to start";
  }
  inputCloseUsername.value = inputClosePin.value = "";
});
btnSort.addEventListener("click", () => {
  sort = !sort;
  displayMovments(currAcc, sort);
});
