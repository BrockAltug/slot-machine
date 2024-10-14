let balance = 0;
let currentBet = 0.50;
let canSpin = true; // Control delay between spins

const icons = [
    'assets/images/icon-01.png', // lemons
    'assets/images/icon-02.png', // grapes
    'assets/images/icon-03.png', // strawberries
    'assets/images/icon-04.png', // watermelons
    'assets/images/icon-05.png', // fruit baskets
    'assets/images/icon-06.png' // stars
];

const payouts = {
    'assets/images/icon-01.png': 2,
    'assets/images/icon-02.png': 5,
    'assets/images/icon-03.png': 10,
    'assets/images/icon-04.png': 20,
    'assets/images/icon-05.png': 50,
    'assets/images/icon-06.png': 5000
};

// Define winning odds for each icon
const odds = {
    'assets/images/icon-01.png': 20,  // 20% chance
    'assets/images/icon-02.png': 20,  // 20% chance 
    'assets/images/icon-03.png': 20,  // 20% chance   
    'assets/images/icon-04.png': 15,  // 15% chance    
    'assets/images/icon-05.png': 5,   // 5% chance
    'assets/images/icon-06.png': 2    // 2% chance
};

// Deposit money
function depositMoney() {
    let deposit = prompt("How much would you like to deposit?");
    if (deposit !== null && !isNaN(deposit) && deposit > 0) {
        balance = parseFloat(deposit);
        updateBalance();
    } else {
        alert("Please enter a valid amount.");
        depositMoney();
    }
}

// Update balance display
function updateBalance() {
    document.getElementById('balance').innerText = `Balance: $${balance.toFixed(2)}`;
}

// Load win history from localStorage
function loadWinHistory() {
    const winList = document.getElementById("win-list");
    winList.innerHTML = '';

    let winHistory = JSON.parse(localStorage.getItem('winHistory')) || [];

    winHistory.slice(-10).forEach((win, index) => {
        const li = document.createElement('li');
        li.innerText = `Win #${index + 1}: $${win.toFixed(2)}`;
        winList.appendChild(li);
    });
}

// Save win to localStorage
function saveWin(winAmount) {
    let winHistory = JSON.parse(localStorage.getItem('winHistory')) || [];
    winHistory.push(winAmount);
    localStorage.setItem('winHistory', JSON.stringify(winHistory));
    loadWinHistory();
}

// Clear win history
function clearWinHistory() {
    localStorage.removeItem('winHistory');
    loadWinHistory();
}

// Calculate weighted random selection based on odds
function getRandomIcon() {
    const totalWeight = Object.values(odds).reduce((acc, val) => acc + val, 0);
    const randomNum = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    for (let icon in odds) {
        cumulativeWeight += odds[icon];
        if (randomNum < cumulativeWeight) {
            return icon;
        }
    }
}

// Spin slots function
function spinSlots() {
    const message = document.getElementById("message");

    if (!canSpin) return; // Prevent spamming the spin button

    if (balance < currentBet) {
        alert("Insufficient balance! Please deposit more.");
        depositMoney();
        return;
    }

    // Disable spin button and allow it after 2 seconds
    canSpin = false;
    document.getElementById('spin-btn').disabled = true;
    setTimeout(() => {
        canSpin = true;
        document.getElementById('spin-btn').disabled = false;
    }, 2000);

    balance -= currentBet;
    updateBalance();
    message.innerText = '';

    let results = [];
    for (let i = 1; i <= 9; i++) {
        const slot = document.getElementById(`slot-${i}`);
        slot.classList.add('spin-animation');

        setTimeout(() => {
            slot.classList.remove('spin-animation');
            const icon = getRandomIcon();
            slot.src = icon;
            results.push(icon);
        }, 1000); // Match with CSS animation duration (1s)
    }

    setTimeout(() => {
        checkWin(results);
    }, 1200);
}

// Check for wins
function checkWin(results) {
    const message = document.getElementById("message");

    const row1 = [results[0], results[1], results[2]];
    const row2 = [results[3], results[4], results[5]];
    const row3 = [results[6], results[7], results[8]];

    let winAmount = 0;
    [row1, row2, row3].forEach(row => {
        if (row.every(icon => icon === row[0])) {
            const payout = payouts[row[0]] * currentBet;
            winAmount += payout;
            applyWinningAnimation();
        }
    });

    if (winAmount > 0) {
        balance += winAmount;
        updateBalance();
        message.innerText = `You win $${winAmount.toFixed(2)}!`;
        playSound('win');
        saveWin(winAmount);
    } else {
        message.innerText = 'You lost. Try again!';
        playSound('lose');
    }
}

// Winning animation
function applyWinningAnimation() {
    document.querySelectorAll('.slot').forEach(slot => {
        slot.classList.add('winning-animation');
        setTimeout(() => slot.classList.remove('winning-animation'), 2000);
    });
}

// Play sound on win/lose
function playSound(type) {
    const audio = new Audio(type === 'win' ? 'assets/sounds/win-sound.mp3' : 'assets/sounds/lose-sound.mp3');
    audio.play();
}

// On window load, set up event listeners
window.onload = function() {
    depositMoney();
    loadWinHistory(); // Load the win history on page load

    document.querySelectorAll('.bet-btn').forEach(button => {
        button.addEventListener('click', function() {
            currentBet = parseFloat(this.getAttribute('data-bet'));
            document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    document.getElementById('spin-btn').addEventListener('click', spinSlots);
    
    // Event listener for clearing win history
    document.getElementById('clear-history-btn').addEventListener('click', clearWinHistory);
};