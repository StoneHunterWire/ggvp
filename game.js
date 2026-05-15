// ============ DATA ============

const CARS_DB = [
    {
        id: 'civic', name: 'Honda Civic', price: 5000, sellPrice: 3000,
        baseStats: { engine: 2, turbo: 0, tires: 2, weight: 3, nos: 0 },
        color: '#3498db', bodyStyle: 'sedan'
    },
    {
        id: 'mustang', name: 'Ford Mustang', price: 15000, sellPrice: 9000,
        baseStats: { engine: 4, turbo: 1, tires: 3, weight: 4, nos: 1 },
        color: '#e74c3c', bodyStyle: 'muscle'
    },
    {
        id: 'supra', name: 'Toyota Supra', price: 30000, sellPrice: 18000,
        baseStats: { engine: 5, turbo: 3, tires: 4, weight: 3, nos: 2 },
        color: '#f39c12', bodyStyle: 'sport'
    },
    {
        id: 'skyline', name: 'Nissan GT-R', price: 50000, sellPrice: 30000,
        baseStats: { engine: 6, turbo: 4, tires: 5, weight: 4, nos: 3 },
        color: '#9b59b6', bodyStyle: 'sport'
    },
    {
        id: 'lambo', name: 'Lamborghini', price: 100000, sellPrice: 60000,
        baseStats: { engine: 8, turbo: 5, tires: 6, weight: 3, nos: 4 },
        color: '#2ecc71', bodyStyle: 'super'
    },
    {
        id: 'bugatti', name: 'Bugatti Chiron', price: 200000, sellPrice: 120000,
        baseStats: { engine: 10, turbo: 7, tires: 8, weight: 5, nos: 5 },
        color: '#1abc9c', bodyStyle: 'hyper'
    }
];

const UPGRADES = [
    { id: 'engine', name: 'Двигатель', desc: 'Увеличивает мощность', maxLevel: 5, baseCost: 2000, costMult: 1.8 },
    { id: 'turbo', name: 'Турбонаддув', desc: 'Ускоряет набор оборотов', maxLevel: 5, baseCost: 3000, costMult: 2.0 },
    { id: 'tires', name: 'Шины', desc: 'Лучший старт и сцепление', maxLevel: 5, baseCost: 1500, costMult: 1.5 },
    { id: 'weight', name: 'Облегчение', desc: 'Снижает вес авто', maxLevel: 5, baseCost: 2500, costMult: 1.7 },
    { id: 'nos', name: 'Закись азота', desc: 'Мощный кратковременный буст', maxLevel: 5, baseCost: 4000, costMult: 2.2 }
];

const RACE_LEVELS = [
    { id: 1, name: 'Новичок', opponentPower: 15, reward: 3000, desc: 'Лёгкий противник' },
    { id: 2, name: 'Любитель', opponentPower: 25, reward: 6000, desc: 'Средний уровень' },
    { id: 3, name: 'Про', opponentPower: 40, reward: 12000, desc: 'Серьёзный соперник' },
    { id: 4, name: 'Элита', opponentPower: 55, reward: 25000, desc: 'Быстрые тачки' },
    { id: 5, name: 'Легенда', opponentPower: 75, reward: 50000, desc: 'Лучшие из лучших' },
    { id: 6, name: 'Босс', opponentPower: 95, reward: 100000, desc: 'Финальный вызов' }
];

// ============ GAME STATE ============

let gameState = loadGame() || {
    money: 10000,
    ownedCars: [
        { carId: 'civic', upgrades: { engine: 0, turbo: 0, tires: 0, weight: 0, nos: 0 } }
    ],
    selectedCarIndex: 0
};

function saveGame() {
    localStorage.setItem('dragRacingSave', JSON.stringify(gameState));
}

function loadGame() {
    const data = localStorage.getItem('dragRacingSave');
    return data ? JSON.parse(data) : null;
}

// ============ SCREEN MANAGEMENT ============

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + screenId).classList.add('active');
    updateMoneyDisplays();

    switch (screenId) {
        case 'garage': renderGarage(); break;
        case 'shop': renderShop(); break;
        case 'upgrade': renderUpgrade(); break;
        case 'race-select': renderRaceSelect(); break;
    }
}

function updateMoneyDisplays() {
    const moneyStr = '$' + gameState.money.toLocaleString();
    document.getElementById('menu-money').textContent = moneyStr;
    document.getElementById('garage-money').textContent = moneyStr;
    document.getElementById('shop-money').textContent = moneyStr;
    document.getElementById('upgrade-money').textContent = moneyStr;
    document.getElementById('race-money').textContent = moneyStr;
}

// ============ CAR STATS CALCULATION ============

function getCarStats(ownedCar) {
    const carData = CARS_DB.find(c => c.id === ownedCar.carId);
    return {
        engine: carData.baseStats.engine + ownedCar.upgrades.engine * 2,
        turbo: carData.baseStats.turbo + ownedCar.upgrades.turbo * 2,
        tires: carData.baseStats.tires + ownedCar.upgrades.tires * 2,
        weight: carData.baseStats.weight + ownedCar.upgrades.weight * 1.5,
        nos: carData.baseStats.nos + ownedCar.upgrades.nos * 2
    };
}

function getCarPower(ownedCar) {
    const stats = getCarStats(ownedCar);
    return stats.engine * 3 + stats.turbo * 2.5 + stats.tires * 2 + stats.weight * 1.5 + stats.nos * 2;
}

// ============ DRAWING CARS ============

function drawCarSide(ctx, x, y, carData, scale = 1) {
    const s = scale;
    const color = carData.color;
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(60 * s, 45 * s, 55 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    if (carData.bodyStyle === 'sedan') {
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(5 * s, 30 * s);
        ctx.lineTo(15 * s, 15 * s);
        ctx.lineTo(45 * s, 10 * s);
        ctx.lineTo(85 * s, 10 * s);
        ctx.lineTo(110 * s, 18 * s);
        ctx.lineTo(118 * s, 30 * s);
        ctx.lineTo(118 * s, 38 * s);
        ctx.lineTo(2 * s, 38 * s);
        ctx.lineTo(2 * s, 30 * s);
        ctx.closePath();
        ctx.fill();
        // Roof
        ctx.fillStyle = darken(color, 20);
        ctx.beginPath();
        ctx.moveTo(30 * s, 15 * s);
        ctx.lineTo(42 * s, 5 * s);
        ctx.lineTo(78 * s, 5 * s);
        ctx.lineTo(88 * s, 15 * s);
        ctx.closePath();
        ctx.fill();
        // Windows
        ctx.fillStyle = '#81d4fa';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(33 * s, 14 * s);
        ctx.lineTo(43 * s, 6 * s);
        ctx.lineTo(58 * s, 6 * s);
        ctx.lineTo(58 * s, 14 * s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(62 * s, 14 * s);
        ctx.lineTo(62 * s, 6 * s);
        ctx.lineTo(76 * s, 6 * s);
        ctx.lineTo(85 * s, 14 * s);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    } else if (carData.bodyStyle === 'muscle') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(2 * s, 28 * s);
        ctx.lineTo(10 * s, 18 * s);
        ctx.lineTo(40 * s, 12 * s);
        ctx.lineTo(90 * s, 12 * s);
        ctx.lineTo(115 * s, 20 * s);
        ctx.lineTo(120 * s, 28 * s);
        ctx.lineTo(120 * s, 38 * s);
        ctx.lineTo(0 * s, 38 * s);
        ctx.lineTo(0 * s, 28 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = darken(color, 25);
        ctx.beginPath();
        ctx.moveTo(35 * s, 14 * s);
        ctx.lineTo(45 * s, 4 * s);
        ctx.lineTo(75 * s, 4 * s);
        ctx.lineTo(82 * s, 14 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#81d4fa';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(38 * s, 5 * s, 16 * s, 8 * s);
        ctx.fillRect(62 * s, 5 * s, 16 * s, 8 * s);
        ctx.globalAlpha = 1;
    } else if (carData.bodyStyle === 'sport') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0 * s, 30 * s);
        ctx.lineTo(8 * s, 20 * s);
        ctx.lineTo(35 * s, 14 * s);
        ctx.lineTo(95 * s, 14 * s);
        ctx.lineTo(118 * s, 22 * s);
        ctx.lineTo(122 * s, 30 * s);
        ctx.lineTo(122 * s, 38 * s);
        ctx.lineTo(0 * s, 38 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = darken(color, 30);
        ctx.beginPath();
        ctx.moveTo(38 * s, 14 * s);
        ctx.lineTo(48 * s, 4 * s);
        ctx.lineTo(80 * s, 4 * s);
        ctx.lineTo(88 * s, 14 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#80deea';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(40 * s, 13 * s);
        ctx.lineTo(49 * s, 5 * s);
        ctx.lineTo(79 * s, 5 * s);
        ctx.lineTo(86 * s, 13 * s);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    } else if (carData.bodyStyle === 'super' || carData.bodyStyle === 'hyper') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0 * s, 32 * s);
        ctx.lineTo(5 * s, 22 * s);
        ctx.lineTo(30 * s, 16 * s);
        ctx.lineTo(100 * s, 16 * s);
        ctx.lineTo(122 * s, 24 * s);
        ctx.lineTo(125 * s, 32 * s);
        ctx.lineTo(125 * s, 38 * s);
        ctx.lineTo(0 * s, 38 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = darken(color, 30);
        ctx.beginPath();
        ctx.moveTo(40 * s, 16 * s);
        ctx.lineTo(50 * s, 6 * s);
        ctx.lineTo(82 * s, 6 * s);
        ctx.lineTo(90 * s, 16 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#80deea';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(42 * s, 15 * s);
        ctx.lineTo(51 * s, 7 * s);
        ctx.lineTo(81 * s, 7 * s);
        ctx.lineTo(88 * s, 15 * s);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        // Spoiler
        if (carData.bodyStyle === 'hyper') {
            ctx.fillStyle = darken(color, 40);
            ctx.fillRect(108 * s, 8 * s, 14 * s, 3 * s);
            ctx.fillRect(114 * s, 11 * s, 3 * s, 6 * s);
        }
    }

    // Wheels
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(25 * s, 40 * s, 9 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(95 * s, 40 * s, 9 * s, 0, Math.PI * 2);
    ctx.fill();
    // Rims
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(25 * s, 40 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(95 * s, 40 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Headlight
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(5 * s, 30 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();

    // Taillight
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(118 * s, 30 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function darken(hex, amount) {
    let c = hex.replace('#', '');
    let r = Math.max(0, parseInt(c.substring(0, 2), 16) - amount);
    let g = Math.max(0, parseInt(c.substring(2, 4), 16) - amount);
    let b = Math.max(0, parseInt(c.substring(4, 6), 16) - amount);
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}



// ============ GARAGE ============

let garageSelectedIndex = 0;

function renderGarage() {
    garageSelectedIndex = gameState.selectedCarIndex;
    const list = document.getElementById('garage-cars-list');
    list.innerHTML = '';

    gameState.ownedCars.forEach((car, i) => {
        const carData = CARS_DB.find(c => c.id === car.carId);
        const div = document.createElement('div');
        div.className = 'garage-car-item' + (i === garageSelectedIndex ? ' selected' : '');
        div.textContent = carData.name;
        div.onclick = () => { garageSelectedIndex = i; gameState.selectedCarIndex = i; saveGame(); renderGarage(); };
        list.appendChild(div);
    });

    const ownedCar = gameState.ownedCars[garageSelectedIndex];
    if (!ownedCar) return;
    const carData = CARS_DB.find(c => c.id === ownedCar.carId);
    const stats = getCarStats(ownedCar);

    document.getElementById('garage-car-name').textContent = carData.name;

    const maxStat = 20;
    document.getElementById('stat-engine').style.width = (stats.engine / maxStat * 100) + '%';
    document.getElementById('stat-turbo').style.width = (stats.turbo / maxStat * 100) + '%';
    document.getElementById('stat-tires').style.width = (stats.tires / maxStat * 100) + '%';
    document.getElementById('stat-weight').style.width = (stats.weight / maxStat * 100) + '%';
    document.getElementById('stat-nos').style.width = (stats.nos / maxStat * 100) + '%';

    // Draw car
    const canvas = document.getElementById('garage-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCarSide(ctx, 200, 60, carData, 2.5);

    // Sell button
    const btnSell = document.getElementById('btn-sell');
    if (gameState.ownedCars.length <= 1) {
        btnSell.style.display = 'none';
    } else {
        btnSell.style.display = 'block';
        btnSell.textContent = `ПРОДАТЬ за $${carData.sellPrice.toLocaleString()}`;
    }
}

function sellCar() {
    if (gameState.ownedCars.length <= 1) return;
    const ownedCar = gameState.ownedCars[garageSelectedIndex];
    const carData = CARS_DB.find(c => c.id === ownedCar.carId);
    gameState.money += carData.sellPrice;
    gameState.ownedCars.splice(garageSelectedIndex, 1);
    if (gameState.selectedCarIndex >= gameState.ownedCars.length) {
        gameState.selectedCarIndex = 0;
    }
    garageSelectedIndex = 0;
    saveGame();
    renderGarage();
    updateMoneyDisplays();
}

// ============ SHOP ============

function renderShop() {
    const container = document.getElementById('shop-list');
    container.innerHTML = '';

    CARS_DB.forEach(car => {
        const owned = gameState.ownedCars.some(c => c.carId === car.id);
        const canBuy = gameState.money >= car.price && !owned;

        const card = document.createElement('div');
        card.className = 'shop-card';

        const canvas = document.createElement('canvas');
        canvas.width = 280;
        canvas.height = 80;
        card.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        drawCarSide(ctx, 70, 15, car, 1.2);

        const h4 = document.createElement('h4');
        h4.textContent = car.name;
        card.appendChild(h4);

        const price = document.createElement('div');
        price.className = 'shop-price';
        price.textContent = owned ? 'КУПЛЕНО' : '$' + car.price.toLocaleString();
        card.appendChild(price);

        const statsDiv = document.createElement('div');
        statsDiv.className = 'shop-stats';
        statsDiv.textContent = `Двигатель: ${car.baseStats.engine} | Турбо: ${car.baseStats.turbo} | Шины: ${car.baseStats.tires}`;
        card.appendChild(statsDiv);

        const btn = document.createElement('button');
        btn.textContent = owned ? 'В ГАРАЖЕ' : 'КУПИТЬ';
        btn.disabled = !canBuy;
        if (!owned) {
            btn.onclick = () => buyCar(car.id);
        }
        card.appendChild(btn);

        container.appendChild(card);
    });
}

function buyCar(carId) {
    const car = CARS_DB.find(c => c.id === carId);
    if (gameState.money < car.price) return;
    if (gameState.ownedCars.some(c => c.carId === carId)) return;

    gameState.money -= car.price;
    gameState.ownedCars.push({
        carId: carId,
        upgrades: { engine: 0, turbo: 0, tires: 0, weight: 0, nos: 0 }
    });
    saveGame();
    renderShop();
    updateMoneyDisplays();
}

// ============ UPGRADE ============

function renderUpgrade() {
    const select = document.getElementById('upgrade-car-select');
    select.innerHTML = '';
    gameState.ownedCars.forEach((car, i) => {
        const carData = CARS_DB.find(c => c.id === car.carId);
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = carData.name;
        if (i === gameState.selectedCarIndex) opt.selected = true;
        select.appendChild(opt);
    });
    selectUpgradeCar();
}

function selectUpgradeCar() {
    const select = document.getElementById('upgrade-car-select');
    const carIndex = parseInt(select.value);
    const ownedCar = gameState.ownedCars[carIndex];
    if (!ownedCar) return;

    const list = document.getElementById('upgrade-list');
    list.innerHTML = '';

    UPGRADES.forEach(upg => {
        const currentLevel = ownedCar.upgrades[upg.id];
        const cost = Math.floor(upg.baseCost * Math.pow(upg.costMult, currentLevel));
        const maxed = currentLevel >= upg.maxLevel;
        const canAfford = gameState.money >= cost;

        const item = document.createElement('div');
        item.className = 'upgrade-item';

        const info = document.createElement('div');
        info.className = 'upgrade-item-info';
        info.innerHTML = `<h4>${upg.name}</h4><p>${upg.desc}</p>`;

        const levelDiv = document.createElement('div');
        levelDiv.className = 'upgrade-item-level';
        for (let i = 0; i < upg.maxLevel; i++) {
            const dot = document.createElement('div');
            dot.className = 'lvl-dot' + (i < currentLevel ? ' active' : '');
            levelDiv.appendChild(dot);
        }
        info.appendChild(levelDiv);
        item.appendChild(info);

        const btn = document.createElement('button');
        btn.textContent = maxed ? 'МАКС' : '$' + cost.toLocaleString();
        btn.disabled = maxed || !canAfford;
        if (!maxed && canAfford) {
            btn.onclick = () => upgradeCarPart(carIndex, upg.id, cost);
        }
        item.appendChild(btn);

        list.appendChild(item);
    });
}

function upgradeCarPart(carIndex, partId, cost) {
    if (gameState.money < cost) return;
    gameState.money -= cost;
    gameState.ownedCars[carIndex].upgrades[partId]++;
    saveGame();
    renderUpgrade();
    updateMoneyDisplays();
}



// ============ RACE SELECT ============

function renderRaceSelect() {
    const select = document.getElementById('race-car-select');
    select.innerHTML = '';
    gameState.ownedCars.forEach((car, i) => {
        const carData = CARS_DB.find(c => c.id === car.carId);
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = carData.name + ' (Power: ' + Math.floor(getCarPower(car)) + ')';
        if (i === gameState.selectedCarIndex) opt.selected = true;
        select.appendChild(opt);
    });

    const levelsDiv = document.getElementById('race-levels');
    levelsDiv.innerHTML = '';

    RACE_LEVELS.forEach(level => {
        const card = document.createElement('div');
        card.className = 'race-level-card';
        card.innerHTML = `
            <h4>${level.name}</h4>
            <p>${level.desc}</p>
            <p>Сила противника: ${level.opponentPower}</p>
            <div class="reward">Награда: $${level.reward.toLocaleString()}</div>
        `;
        card.onclick = () => startRace(level);
        levelsDiv.appendChild(card);
    });
}

// ============ RACE ENGINE ============

let raceState = null;
let raceAnimFrame = null;
let gasPressed = false;
let nosActive = false;

function startRace(level) {
    const carIndex = parseInt(document.getElementById('race-car-select').value);
    const ownedCar = gameState.ownedCars[carIndex];
    const carData = CARS_DB.find(c => c.id === ownedCar.carId);
    const stats = getCarStats(ownedCar);

    // Generate opponent
    const opponentColor = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c'][Math.floor(Math.random() * 5)];
    const opponentStyles = ['sedan', 'muscle', 'sport', 'super', 'hyper'];
    const opIndex = Math.min(Math.floor(level.opponentPower / 20), 4);
    const opponentCar = {
        color: opponentColor,
        bodyStyle: opponentStyles[opIndex],
        name: ['Street Racer', 'Speed Demon', 'Turbo King', 'Phantom', 'Thunder', 'Lightning'][level.id - 1]
    };

    raceState = {
        phase: 'countdown', // countdown, racing, finished
        countdown: 3,
        countdownTimer: 0,
        distance: 402, // meters (quarter mile)

        // Player
        playerCar: carData,
        playerStats: stats,
        playerPos: 0,
        playerSpeed: 0,
        playerRPM: 0,
        playerGear: 1,
        playerMaxGear: 6,
        playerNOS: stats.nos * 20, // NOS fuel
        playerMaxNOS: stats.nos * 20,
        playerNOSActive: false,

        // Opponent
        opponentCar: opponentCar,
        opponentPower: level.opponentPower,
        opponentPos: 0,
        opponentSpeed: 0,
        opponentGear: 1,
        opponentRPM: 0,

        // Timing
        startTime: 0,
        playerTime: 0,
        opponentTime: 0,

        // Level info
        level: level,
        carIndex: carIndex,

        // Visual
        scrollOffset: 0,
        roadMarkers: []
    };

    // Init road markers
    for (let i = 0; i < 30; i++) {
        raceState.roadMarkers.push(i * 50);
    }

    showScreen('race');
    document.getElementById('race-player-name').textContent = carData.name;
    document.getElementById('race-opponent-name').textContent = opponentCar.name;
    document.getElementById('race-countdown').textContent = '';
    document.getElementById('race-distance').textContent = '0m / 402m';
    document.getElementById('race-gear').textContent = 'N';
    document.getElementById('rpm-fill').style.width = '0%';

    // Reset controls
    gasPressed = false;
    nosActive = false;

    // Start countdown
    setTimeout(() => startCountdown(), 500);
}

function startCountdown() {
    raceState.countdown = 3;
    raceState.phase = 'countdown';
    document.getElementById('race-countdown').textContent = '3';

    let count = 3;
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            document.getElementById('race-countdown').textContent = count;
        } else if (count === 0) {
            document.getElementById('race-countdown').textContent = 'GO!';
            document.getElementById('race-countdown').style.color = '#4caf50';
            raceState.phase = 'racing';
            raceState.startTime = performance.now();
            raceLoop();
        } else {
            document.getElementById('race-countdown').textContent = '';
            document.getElementById('race-countdown').style.color = '#e94560';
            clearInterval(interval);
        }
    }, 1000);
}

function raceLoop() {
    if (raceState.phase !== 'racing') return;

    updatePlayer();
    updateOpponent();
    drawRace();
    updateRaceHUD();

    // Check finish
    if (raceState.playerPos >= raceState.distance && raceState.playerTime === 0) {
        raceState.playerTime = (performance.now() - raceState.startTime) / 1000;
    }
    if (raceState.opponentPos >= raceState.distance && raceState.opponentTime === 0) {
        raceState.opponentTime = (performance.now() - raceState.startTime) / 1000;
    }

    if (raceState.playerTime > 0 && raceState.opponentTime > 0) {
        raceState.phase = 'finished';
        setTimeout(() => showRaceResult(), 500);
        return;
    }

    // If one finished but other hasn't, give opponent a bit more time
    if (raceState.playerPos >= raceState.distance && raceState.opponentPos < raceState.distance) {
        // Keep running for opponent
    }
    if (raceState.opponentPos >= raceState.distance && raceState.playerPos < raceState.distance) {
        // Keep running for player
    }

    // Timeout check
    const elapsed = (performance.now() - raceState.startTime) / 1000;
    if (elapsed > 30) {
        if (raceState.playerTime === 0) raceState.playerTime = elapsed;
        if (raceState.opponentTime === 0) raceState.opponentTime = elapsed;
        raceState.phase = 'finished';
        setTimeout(() => showRaceResult(), 500);
        return;
    }

    raceAnimFrame = requestAnimationFrame(raceLoop);
}

function updatePlayer() {
    const stats = raceState.playerStats;
    const gear = raceState.playerGear;

    if (gasPressed && raceState.playerPos < raceState.distance) {
        // RPM increases based on turbo
        const rpmGain = 1.5 + stats.turbo * 0.3;
        raceState.playerRPM = Math.min(100, raceState.playerRPM + rpmGain);

        // Speed based on engine power, gear, and RPM
        const gearRatio = 1 - (gear - 1) * 0.12;
        const engineForce = (stats.engine * 0.8 + stats.turbo * 0.4) * (raceState.playerRPM / 100);
        const weightFactor = 1 / (1 + stats.weight * 0.02);
        const tireFactor = 1 + stats.tires * 0.05;

        let accel = engineForce * gearRatio * weightFactor * tireFactor * 0.015;

        // NOS boost
        if (raceState.playerNOSActive && raceState.playerNOS > 0) {
            accel *= 1.8;
            raceState.playerNOS -= 0.5;
            if (raceState.playerNOS <= 0) {
                raceState.playerNOS = 0;
                raceState.playerNOSActive = false;
            }
        }

        // Top speed per gear
        const maxSpeedForGear = (8 + stats.engine * 1.2) * gear * 0.6;
        if (raceState.playerSpeed < maxSpeedForGear) {
            raceState.playerSpeed += accel;
        } else {
            raceState.playerSpeed *= 0.99;
        }

        // Over-rev penalty
        if (raceState.playerRPM >= 100) {
            raceState.playerSpeed *= 0.98;
        }
    } else {
        // No gas - RPM drops
        raceState.playerRPM = Math.max(0, raceState.playerRPM - 3);
        raceState.playerSpeed *= 0.995;
    }

    // Traction from tires (start)
    if (raceState.playerPos < 10 && raceState.playerSpeed > 2) {
        const tractionLimit = stats.tires * 0.8;
        if (raceState.playerSpeed > tractionLimit) {
            raceState.playerSpeed = tractionLimit + (raceState.playerSpeed - tractionLimit) * 0.9;
        }
    }

    raceState.playerPos += raceState.playerSpeed * 0.016;
    raceState.playerPos = Math.min(raceState.distance, raceState.playerPos);
}

function updateOpponent() {
    if (raceState.opponentPos >= raceState.distance) return;

    const power = raceState.opponentPower;
    const elapsed = (performance.now() - raceState.startTime) / 1000;

    // Simple AI: accelerates based on power level with some variation
    raceState.opponentRPM += 2 + power * 0.04;
    if (raceState.opponentRPM >= 95) {
        raceState.opponentGear = Math.min(6, raceState.opponentGear + 1);
        raceState.opponentRPM = 40;
    }

    const gearRatio = 1 - (raceState.opponentGear - 1) * 0.1;
    const accel = power * 0.012 * gearRatio * (raceState.opponentRPM / 100);
    const maxSpeed = power * 0.6 * raceState.opponentGear * 0.5;

    if (raceState.opponentSpeed < maxSpeed) {
        raceState.opponentSpeed += accel;
    }

    // Some randomness
    raceState.opponentSpeed *= (0.998 + Math.random() * 0.004);

    raceState.opponentPos += raceState.opponentSpeed * 0.016;
    raceState.opponentPos = Math.min(raceState.distance, raceState.opponentPos);
}

function shiftGear() {
    if (raceState.phase !== 'racing') return;
    if (raceState.playerGear >= raceState.playerMaxGear) return;

    // Perfect shift bonus around 85-95 RPM
    const rpm = raceState.playerRPM;
    let shiftBonus = 1;
    if (rpm >= 85 && rpm <= 95) {
        shiftBonus = 1.1; // Perfect shift
    } else if (rpm >= 95) {
        shiftBonus = 0.85; // Over-rev penalty
    } else if (rpm < 60) {
        shiftBonus = 0.8; // Too early
    }

    raceState.playerGear++;
    raceState.playerRPM = 30 + (rpm - 60) * 0.2;
    raceState.playerSpeed *= shiftBonus;
}

function gasOn() { gasPressed = true; }
function gasOff() { gasPressed = false; }
function activateNOS() {
    if (raceState && raceState.phase === 'racing' && raceState.playerNOS > 0) {
        raceState.playerNOSActive = true;
    }
}
function deactivateNOS() {
    if (raceState) raceState.playerNOSActive = false;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!raceState || raceState.phase !== 'racing') return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        gasPressed = true;
        e.preventDefault();
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'ArrowRight') {
        shiftGear();
        e.preventDefault();
    }
    if (e.code === 'KeyN' || e.code === 'ArrowDown') {
        activateNOS();
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        gasPressed = false;
    }
    if (e.code === 'KeyN' || e.code === 'ArrowDown') {
        deactivateNOS();
    }
});



// ============ RACE DRAWING ============

function drawRace() {
    const canvas = document.getElementById('race-canvas');
    const ctx = canvas.getContext('2d');

    // Resize canvas to container
    canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth || 900 : 900;
    canvas.height = 400;

    const W = canvas.width;
    const H = canvas.height;

    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, H * 0.4);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H * 0.4);

    // City skyline background
    ctx.fillStyle = '#0f0f1a';
    for (let i = 0; i < 15; i++) {
        const bx = (i * 80 - raceState.scrollOffset * 0.1) % (W + 200) - 100;
        const bh = 40 + Math.sin(i * 2.5) * 30;
        ctx.fillRect(bx, H * 0.4 - bh, 50, bh);
        // Windows
        ctx.fillStyle = '#ffeb3b33';
        for (let wy = 5; wy < bh - 5; wy += 12) {
            for (let wx = 5; wx < 45; wx += 12) {
                if (Math.random() > 0.3) ctx.fillRect(bx + wx, H * 0.4 - bh + wy, 6, 6);
            }
        }
        ctx.fillStyle = '#0f0f1a';
    }

    // Road
    const roadY = H * 0.4;
    const roadH = H * 0.35;
    ctx.fillStyle = '#333';
    ctx.fillRect(0, roadY, W, roadH);

    // Road lane divider
    const scrollX = raceState.scrollOffset % 60;
    ctx.strokeStyle = '#ffeb3b55';
    ctx.lineWidth = 2;
    ctx.setLineDash([30, 30]);
    ctx.beginPath();
    ctx.moveTo(-scrollX, roadY + roadH / 2);
    ctx.lineTo(W, roadY + roadH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Road markings (distance markers)
    ctx.fillStyle = '#ffffff22';
    ctx.font = '12px sans-serif';
    for (let m = 0; m < raceState.distance; m += 50) {
        const xPos = ((m - raceState.playerPos) * 3 + 150);
        if (xPos > -50 && xPos < W + 50) {
            ctx.fillRect(xPos, roadY + roadH - 5, 2, 5);
            ctx.fillText(m + 'm', xPos - 10, roadY + roadH + 15);
        }
    }

    // Finish line
    const finishX = (raceState.distance - raceState.playerPos) * 3 + 150;
    if (finishX > -50 && finishX < W + 200) {
        ctx.fillStyle = '#fff';
        for (let fy = 0; fy < roadH; fy += 12) {
            for (let fx = 0; fx < 20; fx += 12) {
                if ((Math.floor(fy / 12) + Math.floor(fx / 12)) % 2 === 0) {
                    ctx.fillRect(finishX + fx, roadY + fy, 12, 12);
                }
            }
        }
    }

    // Ground below road
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, roadY + roadH, W, H - roadY - roadH);

    // Draw player car (bottom lane)
    const playerDrawX = 150;
    const playerDrawY = roadY + roadH * 0.55;
    drawCarSide(ctx, playerDrawX, playerDrawY, raceState.playerCar, 1.8);

    // NOS flames effect
    if (raceState.playerNOSActive && raceState.playerNOS > 0) {
        ctx.fillStyle = '#42a5f5';
        ctx.globalAlpha = 0.6 + Math.random() * 0.4;
        for (let i = 0; i < 5; i++) {
            const fx = playerDrawX + 200 + Math.random() * 20;
            const fy = playerDrawY + 50 + Math.random() * 10;
            ctx.beginPath();
            ctx.arc(fx, fy, 4 + Math.random() * 6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // Exhaust fire when gas pressed
    if (gasPressed && raceState.playerRPM > 60) {
        ctx.fillStyle = '#ff6b00';
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        const fx = playerDrawX + 210;
        const fy = playerDrawY + 52;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + 8 + Math.random() * 12, fy - 3);
        ctx.lineTo(fx + 8 + Math.random() * 12, fy + 3);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Draw opponent car (top lane)
    const opponentRelativePos = (raceState.opponentPos - raceState.playerPos) * 3;
    const opponentDrawX = 150 + opponentRelativePos;
    const opponentDrawY = roadY + roadH * 0.08;
    if (opponentDrawX > -200 && opponentDrawX < W + 200) {
        drawCarSide(ctx, opponentDrawX, opponentDrawY, raceState.opponentCar, 1.6);
    }

    // Scroll offset
    raceState.scrollOffset = raceState.playerPos * 3;

    // Speed lines effect at high speed
    if (raceState.playerSpeed > 5) {
        ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.3, raceState.playerSpeed * 0.02) + ')';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const ly = roadY + Math.random() * roadH;
            const lx = Math.random() * W;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx + 30 + raceState.playerSpeed * 3, ly);
            ctx.stroke();
        }
    }
}

function updateRaceHUD() {
    document.getElementById('rpm-fill').style.width = raceState.playerRPM + '%';
    document.getElementById('race-gear').textContent = raceState.playerGear;
    document.getElementById('race-distance').textContent =
        Math.floor(raceState.playerPos) + 'm / ' + raceState.distance + 'm';

    // NOS button state
    const nosBtn = document.getElementById('btn-nos');
    if (raceState.playerNOS <= 0) {
        nosBtn.disabled = true;
    } else {
        nosBtn.disabled = false;
        nosBtn.textContent = 'NOS (' + Math.floor(raceState.playerNOS) + ')';
    }
}

// ============ RACE RESULT ============

function showRaceResult() {
    const won = raceState.playerTime <= raceState.opponentTime;
    const title = document.getElementById('result-title');
    title.textContent = won ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ';
    title.className = won ? 'win' : 'lose';

    document.getElementById('result-time').textContent = 'Твоё время: ' + raceState.playerTime.toFixed(2) + 's';
    document.getElementById('result-opponent-time').textContent = 'Противник: ' + raceState.opponentTime.toFixed(2) + 's';

    if (won) {
        const reward = raceState.level.reward;
        gameState.money += reward;
        document.getElementById('result-reward').textContent = 'Награда: +$' + reward.toLocaleString();
    } else {
        document.getElementById('result-reward').textContent = 'Награда: $0';
    }

    saveGame();
    showScreen('result');
}

// ============ INIT ============

updateMoneyDisplays();
