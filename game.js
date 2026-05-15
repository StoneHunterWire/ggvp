// ============ DATA ============

const CARS_DB = [
    {
        id: 'civic', name: 'Honda Civic EK9', price: 5000, sellPrice: 3000,
        baseStats: { engine: 2, turbo: 0, tires: 2, weight: 3, nos: 0 },
        color: '#3498db', accentColor: '#2980b9'
    },
    {
        id: 'mustang', name: 'Ford Mustang GT', price: 15000, sellPrice: 9000,
        baseStats: { engine: 4, turbo: 1, tires: 3, weight: 4, nos: 1 },
        color: '#e74c3c', accentColor: '#c0392b'
    },
    {
        id: 'supra', name: 'Toyota Supra MK4', price: 30000, sellPrice: 18000,
        baseStats: { engine: 5, turbo: 3, tires: 4, weight: 3, nos: 2 },
        color: '#f39c12', accentColor: '#d68910'
    },
    {
        id: 'skyline', name: 'Nissan GT-R R35', price: 50000, sellPrice: 30000,
        baseStats: { engine: 6, turbo: 4, tires: 5, weight: 4, nos: 3 },
        color: '#7f8c8d', accentColor: '#5d6d7e'
    },
    {
        id: 'lambo', name: 'Lamborghini Aventador', price: 100000, sellPrice: 60000,
        baseStats: { engine: 8, turbo: 5, tires: 6, weight: 3, nos: 4 },
        color: '#2ecc71', accentColor: '#1e8449'
    },
    {
        id: 'bugatti', name: 'Bugatti Chiron', price: 200000, sellPrice: 120000,
        baseStats: { engine: 10, turbo: 7, tires: 8, weight: 5, nos: 5 },
        color: '#1a1a2e', accentColor: '#2c3e50'
    }
];

const UPGRADES = [
    { id: 'engine', name: 'Двигатель', desc: 'Увеличивает мощность и крутящий момент', maxLevel: 5, baseCost: 2000, costMult: 1.8 },
    { id: 'turbo', name: 'Турбонаддув', desc: 'Быстрый набор оборотов', maxLevel: 5, baseCost: 3000, costMult: 2.0 },
    { id: 'tires', name: 'Шины', desc: 'Лучшее сцепление на старте', maxLevel: 5, baseCost: 1500, costMult: 1.5 },
    { id: 'weight', name: 'Облегчение', desc: 'Меньше масса — быстрее разгон', maxLevel: 5, baseCost: 2500, costMult: 1.7 },
    { id: 'nos', name: 'Закись азота', desc: 'Мощный буст на короткое время', maxLevel: 5, baseCost: 4000, costMult: 2.2 }
];

const RACE_LEVELS = [
    { id: 1, name: 'Районные', opponentPower: 15, reward: 3000, desc: 'Лёгкий противник', distance: 201 },
    { id: 2, name: 'Городские', opponentPower: 25, reward: 6000, desc: 'Средний уровень', distance: 402 },
    { id: 3, name: 'Про лига', opponentPower: 40, reward: 12000, desc: 'Серьёзный соперник', distance: 402 },
    { id: 4, name: 'Элитный клуб', opponentPower: 55, reward: 25000, desc: 'Быстрые тачки', distance: 402 },
    { id: 5, name: 'Легенды', opponentPower: 75, reward: 50000, desc: 'Лучшие из лучших', distance: 804 },
    { id: 6, name: 'Финальный босс', opponentPower: 95, reward: 100000, desc: 'Максимальная скорость', distance: 804 }
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

// ============ CAR STATS ============

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

// ============ CAR DRAWING — REALISTIC PROFILES ============

function drawCarSide(ctx, x, y, carData, scale = 1) {
    const s = scale;
    const c1 = carData.color;
    const c2 = carData.accentColor || darken(c1, 30);
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(60 * s, 48 * s, 58 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const id = carData.id;

    if (id === 'civic') {
        // Honda Civic EK9 — compact hatchback, short rear, sloped hatch
        // Lower body
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(2*s, 35*s);
        ctx.lineTo(6*s, 28*s);
        ctx.lineTo(14*s, 22*s);
        ctx.lineTo(30*s, 18*s);
        ctx.lineTo(95*s, 18*s);
        ctx.lineTo(112*s, 22*s);
        ctx.lineTo(118*s, 30*s);
        ctx.lineTo(120*s, 35*s);
        ctx.lineTo(120*s, 42*s);
        ctx.lineTo(0*s, 42*s);
        ctx.lineTo(0*s, 35*s);
        ctx.closePath();
        ctx.fill();
        // Roof — hatchback shape
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(30*s, 18*s);
        ctx.lineTo(38*s, 8*s);
        ctx.lineTo(72*s, 6*s);
        ctx.lineTo(92*s, 10*s);
        ctx.lineTo(98*s, 18*s);
        ctx.closePath();
        ctx.fill();
        // Front window
        ctx.fillStyle = '#b3e5fc';
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(33*s, 17*s);
        ctx.lineTo(40*s, 9*s);
        ctx.lineTo(56*s, 7*s);
        ctx.lineTo(56*s, 17*s);
        ctx.closePath();
        ctx.fill();
        // Rear window (hatch)
        ctx.beginPath();
        ctx.moveTo(60*s, 17*s);
        ctx.lineTo(60*s, 7*s);
        ctx.lineTo(74*s, 7*s);
        ctx.lineTo(90*s, 11*s);
        ctx.lineTo(95*s, 17*s);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        // Side line
        ctx.strokeStyle = darken(c1, 40);
        ctx.lineWidth = 1*s;
        ctx.beginPath();
        ctx.moveTo(8*s, 32*s);
        ctx.lineTo(115*s, 32*s);
        ctx.stroke();
        // Door line
        ctx.beginPath();
        ctx.moveTo(55*s, 18*s);
        ctx.lineTo(55*s, 40*s);
        ctx.stroke();
    } else if (id === 'mustang') {
        // Ford Mustang GT — long hood, short deck, muscular fenders
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(0*s, 33*s);
        ctx.lineTo(4*s, 26*s);
        ctx.lineTo(12*s, 20*s);
        ctx.lineTo(35*s, 17*s);
        ctx.lineTo(100*s, 17*s);
        ctx.lineTo(116*s, 22*s);
        ctx.lineTo(122*s, 30*s);
        ctx.lineTo(124*s, 35*s);
        ctx.lineTo(124*s, 42*s);
        ctx.lineTo(0*s, 42*s);
        ctx.closePath();
        ctx.fill();
        // Roof — fastback
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(42*s, 17*s);
        ctx.lineTo(50*s, 7*s);
        ctx.lineTo(76*s, 5*s);
        ctx.lineTo(95*s, 10*s);
        ctx.lineTo(100*s, 17*s);
        ctx.closePath();
        ctx.fill();
        // Windows
        ctx.fillStyle = '#b3e5fc';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(44*s, 16*s);
        ctx.lineTo(51*s, 8*s);
        ctx.lineTo(64*s, 6*s);
        ctx.lineTo(64*s, 16*s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(67*s, 16*s);
        ctx.lineTo(67*s, 6*s);
        ctx.lineTo(78*s, 6*s);
        ctx.lineTo(93*s, 11*s);
        ctx.lineTo(97*s, 16*s);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        // Hood scoop
        ctx.fillStyle = '#222';
        ctx.fillRect(18*s, 16*s, 18*s, 3*s);
        // Muscle fender bulge
        ctx.strokeStyle = darken(c1, 35);
        ctx.lineWidth = 1.2*s;
        ctx.beginPath();
        ctx.moveTo(6*s, 30*s);
        ctx.quadraticCurveTo(20*s, 25*s, 35*s, 30*s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(100*s, 30*s);
        ctx.quadraticCurveTo(112*s, 25*s, 122*s, 30*s);
        ctx.stroke();
        // Side stripe
        ctx.fillStyle = '#fff3';
        ctx.fillRect(10*s, 28*s, 108*s, 2*s);
    } else if (id === 'supra') {
        // Toyota Supra MK4 — rounded body, big rear wing, bubble roof
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(2*s, 34*s);
        ctx.lineTo(6*s, 26*s);
        ctx.lineTo(14*s, 20*s);
        ctx.lineTo(40*s, 16*s);
        ctx.lineTo(100*s, 16*s);
        ctx.lineTo(114*s, 20*s);
        ctx.lineTo(120*s, 28*s);
        ctx.lineTo(122*s, 34*s);
        ctx.lineTo(122*s, 42*s);
        ctx.lineTo(0*s, 42*s);
        ctx.closePath();
        ctx.fill();
        // Roof — bubble
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(40*s, 16*s);
        ctx.quadraticCurveTo(50*s, 3*s, 65*s, 3*s);
        ctx.quadraticCurveTo(80*s, 3*s, 90*s, 12*s);
        ctx.lineTo(95*s, 16*s);
        ctx.closePath();
        ctx.fill();
        // Big rear wing
        ctx.fillStyle = '#222';
        ctx.fillRect(100*s, 6*s, 18*s, 3*s);
        ctx.fillRect(105*s, 9*s, 3*s, 7*s);
        ctx.fillRect(114*s, 9*s, 3*s, 7*s);
        // Windows
        ctx.fillStyle = '#b3e5fc';
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(43*s, 15*s);
        ctx.quadraticCurveTo(52*s, 5*s, 62*s, 4*s);
        ctx.lineTo(62*s, 15*s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(65*s, 15*s);
        ctx.lineTo(65*s, 4*s);
        ctx.quadraticCurveTo(78*s, 4*s, 88*s, 12*s);
        ctx.lineTo(92*s, 15*s);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        // Round headlight area
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.ellipse(8*s, 28*s, 4*s, 3*s, 0, 0, Math.PI*2);
        ctx.fill();
    } else if (id === 'skyline') {
        // Nissan GT-R R35 — aggressive angular design, wide body
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(0*s, 34*s);
        ctx.lineTo(4*s, 25*s);
        ctx.lineTo(12*s, 19*s);
        ctx.lineTo(38*s, 15*s);
        ctx.lineTo(98*s, 15*s);
        ctx.lineTo(114*s, 19*s);
        ctx.lineTo(122*s, 27*s);
        ctx.lineTo(125*s, 34*s);
        ctx.lineTo(125*s, 42*s);
        ctx.lineTo(0*s, 42*s);
        ctx.closePath();
        ctx.fill();
        // Roof — angular
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(40*s, 15*s);
        ctx.lineTo(48*s, 5*s);
        ctx.lineTo(78*s, 4*s);
        ctx.lineTo(92*s, 8*s);
        ctx.lineTo(98*s, 15*s);
        ctx.closePath();
        ctx.fill();
        // Windows
        ctx.fillStyle = '#b3e5fc';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(42*s, 14*s);
        ctx.lineTo(49*s, 6*s);
        ctx.lineTo(62*s, 5*s);
        ctx.lineTo(62*s, 14*s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(65*s, 14*s);
        ctx.lineTo(65*s, 5*s);
        ctx.lineTo(77*s, 5*s);
        ctx.lineTo(90*s, 9*s);
        ctx.lineTo(95*s, 14*s);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        // Aggressive side intake
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.moveTo(96*s, 20*s);
        ctx.lineTo(105*s, 18*s);
        ctx.lineTo(112*s, 22*s);
        ctx.lineTo(105*s, 25*s);
        ctx.closePath();
        ctx.fill();
        // Angular headlight
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(4*s, 27*s);
        ctx.lineTo(14*s, 22*s);
        ctx.lineTo(20*s, 24*s);
        ctx.lineTo(10*s, 30*s);
        ctx.closePath();
        ctx.fill();
        // C-shape taillight
        ctx.fillStyle = '#f44336';
        ctx.beginPath();
        ctx.arc(120*s, 28*s, 4*s, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(120*s, 34*s, 3*s, 0, Math.PI*2);
        ctx.fill();
    } else if (id === 'lambo') {
        // Lamborghini Aventador — very low, sharp wedge, angular panels
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(0*s, 35*s);
        ctx.lineTo(3*s, 27*s);
        ctx.lineTo(10*s, 22*s);
        ctx.lineTo(30*s, 19*s);
        ctx.lineTo(100*s, 19*s);
        ctx.lineTo(118*s, 22*s);
        ctx.lineTo(126*s, 28*s);
        ctx.lineTo(128*s, 35*s);
        ctx.lineTo(128*s, 42*s);
        ctx.lineTo(0*s, 42*s);
        ctx.closePath();
        ctx.fill();
        // Roof — very low wedge
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(42*s, 19*s);
        ctx.lineTo(50*s, 11*s);
        ctx.lineTo(78*s, 10*s);
        ctx.lineTo(88*s, 14*s);
        ctx.lineTo(92*s, 19*s);
        ctx.closePath();
        ctx.fill();
        // Windows — angular
        ctx.fillStyle = '#80deea';
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(44*s, 18*s);
        ctx.lineTo(51*s, 12*s);
        ctx.lineTo(64*s, 11*s);
        ctx.lineTo(64*s, 18*s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(67*s, 18*s);
        ctx.lineTo(67*s, 11*s);
        ctx.lineTo(77*s, 11*s);
        ctx.lineTo(86*s, 15*s);
        ctx.lineTo(90*s, 18*s);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        // Sharp side panels
        ctx.strokeStyle = darken(c1, 50);
        ctx.lineWidth = 1*s;
        ctx.beginPath();
        ctx.moveTo(30*s, 30*s);
        ctx.lineTo(70*s, 26*s);
        ctx.lineTo(110*s, 30*s);
        ctx.stroke();
        // Angular headlight
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.moveTo(3*s, 29*s);
        ctx.lineTo(12*s, 24*s);
        ctx.lineTo(16*s, 27*s);
        ctx.lineTo(6*s, 32*s);
        ctx.closePath();
        ctx.fill();
        // Y-shaped taillight
        ctx.fillStyle = '#f44336';
        ctx.fillRect(122*s, 26*s, 5*s, 2*s);
        ctx.fillRect(124*s, 28*s, 3*s, 6*s);
    } else if (id === 'bugatti') {
        // Bugatti Chiron — flowing curves, massive width, C-line
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(0*s, 34*s);
        ctx.quadraticCurveTo(4*s, 24*s, 15*s, 20*s);
        ctx.lineTo(35*s, 17*s);
        ctx.lineTo(100*s, 17*s);
        ctx.quadraticCurveTo(118*s, 18*s, 125*s, 26*s);
        ctx.lineTo(128*s, 34*s);
        ctx.lineTo(128*s, 42*s);
        ctx.lineTo(0*s, 42*s);
        ctx.closePath();
        ctx.fill();
        // Signature C-line (lighter panel)
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.moveTo(55*s, 18*s);
        ctx.quadraticCurveTo(62*s, 25*s, 55*s, 38*s);
        ctx.lineTo(58*s, 38*s);
        ctx.quadraticCurveTo(65*s, 25*s, 58*s, 18*s);
        ctx.closePath();
        ctx.fill();
        // Roof — smooth dome
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(42*s, 17*s);
        ctx.quadraticCurveTo(55*s, 4*s, 72*s, 4*s);
        ctx.quadraticCurveTo(86*s, 4*s, 95*s, 12*s);
        ctx.lineTo(98*s, 17*s);
        ctx.closePath();
        ctx.fill();
        // Windows
        ctx.fillStyle = '#80deea';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(44*s, 16*s);
        ctx.quadraticCurveTo(54*s, 6*s, 64*s, 5*s);
        ctx.lineTo(64*s, 16*s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(67*s, 16*s);
        ctx.lineTo(67*s, 5*s);
        ctx.quadraticCurveTo(80*s, 5*s, 92*s, 13*s);
        ctx.lineTo(95*s, 16*s);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        // Horseshoe grille (front)
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 2*s;
        ctx.beginPath();
        ctx.arc(6*s, 30*s, 5*s, -0.8, 0.8);
        ctx.stroke();
        // Rear light bar
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(118*s, 26*s, 8*s, 2*s);
        ctx.fillRect(120*s, 29*s, 6*s, 2*s);
    }

    // WHEELS — common for all (with proper positioning per car)
    const wFront = (id === 'lambo' || id === 'bugatti') ? 28 : (id === 'mustang' ? 22 : 24);
    const wRear = (id === 'lambo' || id === 'bugatti') ? 100 : (id === 'mustang' ? 100 : 95);
    const wRadius = (id === 'lambo' || id === 'bugatti') ? 10 : 9;

    // Tire
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(wFront*s, 42*s, wRadius*s, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wRear*s, 42*s, wRadius*s, 0, Math.PI*2);
    ctx.fill();
    // Rim
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.arc(wFront*s, 42*s, (wRadius-3)*s, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wRear*s, 42*s, (wRadius-3)*s, 0, Math.PI*2);
    ctx.fill();
    // Rim center
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(wFront*s, 42*s, 2*s, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wRear*s, 42*s, 2*s, 0, Math.PI*2);
    ctx.fill();
    // Rim spokes
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 0.8*s;
    for (let a = 0; a < 5; a++) {
        const angle = a * Math.PI * 2 / 5;
        ctx.beginPath();
        ctx.moveTo(wFront*s + Math.cos(angle)*2*s, 42*s + Math.sin(angle)*2*s);
        ctx.lineTo(wFront*s + Math.cos(angle)*(wRadius-3)*s, 42*s + Math.sin(angle)*(wRadius-3)*s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(wRear*s + Math.cos(angle)*2*s, 42*s + Math.sin(angle)*2*s);
        ctx.lineTo(wRear*s + Math.cos(angle)*(wRadius-3)*s, 42*s + Math.sin(angle)*(wRadius-3)*s);
        ctx.stroke();
    }

    ctx.restore();
}

function darken(hex, amount) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    let r = Math.max(0, parseInt(c.substring(0, 2), 16) - amount);
    let g = Math.max(0, parseInt(c.substring(2, 4), 16) - amount);
    let b = Math.max(0, parseInt(c.substring(4, 6), 16) - amount);
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

function lighten(hex, amount) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    let r = Math.min(255, parseInt(c.substring(0, 2), 16) + amount);
    let g = Math.min(255, parseInt(c.substring(2, 4), 16) + amount);
    let b = Math.min(255, parseInt(c.substring(4, 6), 16) + amount);
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

    const canvas = document.getElementById('garage-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCarSide(ctx, 180, 50, carData, 3);

    const btnSell = document.getElementById('btn-sell');
    if (gameState.ownedCars.length <= 1) {
        btnSell.style.display = 'none';
    } else {
        btnSell.style.display = 'block';
        btnSell.textContent = 'ПРОДАТЬ за $' + carData.sellPrice.toLocaleString();
    }
}

function sellCar() {
    if (gameState.ownedCars.length <= 1) return;
    const ownedCar = gameState.ownedCars[garageSelectedIndex];
    const carData = CARS_DB.find(c => c.id === ownedCar.carId);
    gameState.money += carData.sellPrice;
    gameState.ownedCars.splice(garageSelectedIndex, 1);
    if (gameState.selectedCarIndex >= gameState.ownedCars.length) gameState.selectedCarIndex = 0;
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
        canvas.width = 280; canvas.height = 90;
        card.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        drawCarSide(ctx, 60, 15, car, 1.4);
        const h4 = document.createElement('h4');
        h4.textContent = car.name;
        card.appendChild(h4);
        const price = document.createElement('div');
        price.className = 'shop-price';
        price.textContent = owned ? 'КУПЛЕНО' : '$' + car.price.toLocaleString();
        card.appendChild(price);
        const statsDiv = document.createElement('div');
        statsDiv.className = 'shop-stats';
        statsDiv.textContent = 'Engine:' + car.baseStats.engine + ' Turbo:' + car.baseStats.turbo + ' Tires:' + car.baseStats.tires;
        card.appendChild(statsDiv);
        const btn = document.createElement('button');
        btn.textContent = owned ? 'В ГАРАЖЕ' : 'КУПИТЬ';
        btn.disabled = !canBuy;
        if (!owned) btn.onclick = () => buyCar(car.id);
        card.appendChild(btn);
        container.appendChild(card);
    });
}

function buyCar(carId) {
    const car = CARS_DB.find(c => c.id === carId);
    if (gameState.money < car.price) return;
    if (gameState.ownedCars.some(c => c.carId === carId)) return;
    gameState.money -= car.price;
    gameState.ownedCars.push({ carId, upgrades: { engine: 0, turbo: 0, tires: 0, weight: 0, nos: 0 } });
    saveGame(); renderShop(); updateMoneyDisplays();
}

// ============ UPGRADE ============

function renderUpgrade() {
    const select = document.getElementById('upgrade-car-select');
    select.innerHTML = '';
    gameState.ownedCars.forEach((car, i) => {
        const carData = CARS_DB.find(c => c.id === car.carId);
        const opt = document.createElement('option');
        opt.value = i; opt.textContent = carData.name;
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
        info.innerHTML = '<h4>' + upg.name + '</h4><p>' + upg.desc + '</p>';
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
        if (!maxed && canAfford) btn.onclick = () => upgradeCarPart(carIndex, upg.id, cost);
        item.appendChild(btn);
        list.appendChild(item);
    });
}

function upgradeCarPart(carIndex, partId, cost) {
    if (gameState.money < cost) return;
    gameState.money -= cost;
    gameState.ownedCars[carIndex].upgrades[partId]++;
    saveGame(); renderUpgrade(); updateMoneyDisplays();
}

// ============ RACE SELECT ============

function renderRaceSelect() {
    const select = document.getElementById('race-car-select');
    select.innerHTML = '';
    gameState.ownedCars.forEach((car, i) => {
        const carData = CARS_DB.find(c => c.id === car.carId);
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = carData.name + ' (' + Math.floor(getCarPower(car)) + ' HP)';
        if (i === gameState.selectedCarIndex) opt.selected = true;
        select.appendChild(opt);
    });
    const levelsDiv = document.getElementById('race-levels');
    levelsDiv.innerHTML = '';
    RACE_LEVELS.forEach(level => {
        const card = document.createElement('div');
        card.className = 'race-level-card';
        card.innerHTML = '<h4>' + level.name + '</h4><p>' + level.desc + '</p><p>Дистанция: ' + level.distance + 'm</p><p>Сила противника: ' + level.opponentPower + '</p><div class="reward">Награда: $' + level.reward.toLocaleString() + '</div>';
        card.onclick = () => startRace(level);
        levelsDiv.appendChild(card);
    });
}



// ============ RACE ENGINE (REWORKED) ============
// Realistic drag race physics: launch control, wheelspin, gear ratios, turbo spool

let raceState = null;
let raceAnimFrame = null;
let gasPressed = false;

function startRace(level) {
    const carIndex = parseInt(document.getElementById('race-car-select').value);
    const ownedCar = gameState.ownedCars[carIndex];
    const carData = CARS_DB.find(c => c.id === ownedCar.carId);
    const stats = getCarStats(ownedCar);

    // Opponent setup
    const opColors = ['#e74c3c','#3498db','#f39c12','#9b59b6','#1abc9c','#7f8c8d'];
    const opIds = ['civic','mustang','supra','skyline','lambo','bugatti'];
    const opIdx = Math.min(Math.floor(level.opponentPower / 18), 5);
    const opCarData = CARS_DB.find(c => c.id === opIds[opIdx]);
    const opponentCar = { ...opCarData, color: opColors[Math.floor(Math.random()*opColors.length)], accentColor: darken(opColors[Math.floor(Math.random()*opColors.length)], 20) };

    raceState = {
        phase: 'countdown',
        distance: level.distance,
        countdownVal: 4,
        lastTime: 0,
        elapsedTime: 0,

        // PLAYER physics
        playerCar: carData,
        playerStats: stats,
        playerPos: 0,          // meters
        playerSpeed: 0,        // m/s
        playerRPM: 0,          // 0-8000
        playerGear: 0,         // 0=neutral, 1-6
        playerMaxGear: 6,
        playerWheelspin: 0,    // 0-1 how much grip is lost
        playerTurboBoost: 0,   // 0-1 turbo spool
        playerNOS: stats.nos * 3, // seconds of NOS
        playerNOSActive: false,
        playerTime: 0,
        playerLaunchRPM: 0,    // RPM held before launch
        playerLaunched: false,

        // OPPONENT physics
        opponentCar: opponentCar,
        opponentPower: level.opponentPower,
        opponentPos: 0,
        opponentSpeed: 0,
        opponentRPM: 2000,
        opponentGear: 1,
        opponentTime: 0,
        opponentReactionDelay: 0.2 + Math.random() * 0.4, // AI reaction
        opponentStarted: false,

        // Meta
        level: level,
        carIndex: carIndex,
        wheelAngle: 0,
        smokeParticles: []
    };

    showScreen('race');
    document.getElementById('race-player-name').textContent = carData.name;
    document.getElementById('race-opponent-name').textContent = opponentCar.name;
    document.getElementById('race-countdown').textContent = '';
    document.getElementById('race-distance').textContent = '0m / ' + level.distance + 'm';
    document.getElementById('race-gear').textContent = 'N';
    document.getElementById('rpm-fill').style.width = '0%';
    document.getElementById('btn-nos').disabled = (stats.nos <= 0);
    document.getElementById('btn-nos').textContent = 'NOS (' + raceState.playerNOS.toFixed(1) + 's)';
    gasPressed = false;

    setTimeout(doCountdown, 600);
}

function doCountdown() {
    if (!raceState) return;
    raceState.countdownVal--;
    const el = document.getElementById('race-countdown');
    if (raceState.countdownVal > 0) {
        el.textContent = raceState.countdownVal;
        el.style.color = '#e94560';
        setTimeout(doCountdown, 1000);
    } else {
        el.textContent = 'GO!';
        el.style.color = '#4caf50';
        raceState.phase = 'racing';
        raceState.lastTime = performance.now();
        // Player can now launch if they were holding gas (launch control)
        if (gasPressed && raceState.playerGear >= 1) {
            raceState.playerLaunched = true;
            raceState.playerLaunchRPM = raceState.playerRPM;
        }
        raceAnimFrame = requestAnimationFrame(raceLoop);
        setTimeout(() => { if (raceState) document.getElementById('race-countdown').textContent = ''; }, 800);
    }
}

function raceLoop(timestamp) {
    if (!raceState || raceState.phase !== 'racing') return;

    const dt = Math.min((timestamp - raceState.lastTime) / 1000, 0.05); // cap at 50ms
    raceState.lastTime = timestamp;
    raceState.elapsedTime += dt;

    updatePlayerPhysics(dt);
    updateOpponentPhysics(dt);
    checkRaceFinish();
    drawRaceScene();
    updateRaceHUD();

    if (raceState.phase === 'racing') {
        raceAnimFrame = requestAnimationFrame(raceLoop);
    }
}

// ---- PLAYER PHYSICS ----

function updatePlayerPhysics(dt) {
    const stats = raceState.playerStats;
    const gear = raceState.playerGear;

    // Gear ratios (realistic-ish): determines how RPM translates to speed
    const gearRatios = [0, 3.8, 2.5, 1.8, 1.4, 1.1, 0.9];
    const finalDrive = 3.5;

    // Engine torque curve (peaks mid-range)
    const maxRPM = 8000;
    const rpmNorm = raceState.playerRPM / maxRPM;
    const torqueCurve = Math.sin(rpmNorm * Math.PI * 0.9) * (0.7 + rpmNorm * 0.3);

    // Engine power
    const basePower = stats.engine * 40 + 80; // HP equivalent
    const turboMultiplier = 1 + raceState.playerTurboBoost * stats.turbo * 0.12;
    const nosMultiplier = raceState.playerNOSActive ? 1.6 : 1;
    const engineForce = basePower * torqueCurve * turboMultiplier * nosMultiplier;

    // Weight affects acceleration
    const mass = 900 + (10 - stats.weight) * 150; // kg

    if (gear === 0) {
        // Neutral - just rev
        if (gasPressed) {
            raceState.playerRPM = Math.min(maxRPM, raceState.playerRPM + dt * 12000);
            // Turbo spools up in neutral too
            raceState.playerTurboBoost = Math.min(1, raceState.playerTurboBoost + dt * 0.8);
        } else {
            raceState.playerRPM = Math.max(800, raceState.playerRPM - dt * 5000);
            raceState.playerTurboBoost = Math.max(0, raceState.playerTurboBoost - dt * 1.5);
        }
        return;
    }

    if (gasPressed) {
        // Turbo spool
        const spoolRate = 0.5 + stats.turbo * 0.15;
        raceState.playerTurboBoost = Math.min(1, raceState.playerTurboBoost + dt * spoolRate);

        // RPM gain based on gear (higher gear = slower RPM rise)
        const rpmGain = (8000 + stats.turbo * 1000) / (gear * 0.8 + 0.5);
        raceState.playerRPM = Math.min(maxRPM, raceState.playerRPM + dt * rpmGain);

        // Calculate wheel force
        const wheelForce = (engineForce * gearRatios[gear] * finalDrive) / 0.33; // 0.33m wheel radius
        const acceleration = wheelForce / mass;

        // Traction / wheelspin
        const maxTraction = 4 + stats.tires * 1.5; // max acceleration before wheelspin
        let effectiveAccel = acceleration * 0.02; // scale down to m/s^2

        if (effectiveAccel > maxTraction && raceState.playerPos < 60) {
            // Wheelspin!
            const grip = maxTraction / effectiveAccel;
            raceState.playerWheelspin = Math.min(1, (1 - grip) * 2);
            effectiveAccel *= grip * 0.8 + 0.2;
            // Add smoke particles
            if (Math.random() < raceState.playerWheelspin) {
                raceState.smokeParticles.push({
                    x: raceState.playerPos, y: 0, life: 1, vx: -2 - Math.random()*3
                });
            }
        } else {
            raceState.playerWheelspin = Math.max(0, raceState.playerWheelspin - dt * 3);
        }

        // NOS
        if (raceState.playerNOSActive && raceState.playerNOS > 0) {
            raceState.playerNOS -= dt;
            if (raceState.playerNOS <= 0) {
                raceState.playerNOS = 0;
                raceState.playerNOSActive = false;
            }
        }

        // Apply acceleration
        raceState.playerSpeed += effectiveAccel * dt * 60;

        // Speed limiter per gear
        const maxSpeedForGear = (gearRatios[gear] * finalDrive * maxRPM * 0.33 * Math.PI) / (30 * gearRatios[gear] * finalDrive) * 2.5;
        const absoluteMax = basePower * 0.8 * turboMultiplier;
        raceState.playerSpeed = Math.min(raceState.playerSpeed, absoluteMax * 0.5);

    } else {
        // Off gas
        raceState.playerRPM = Math.max(800, raceState.playerRPM - dt * 4000);
        raceState.playerTurboBoost = Math.max(0, raceState.playerTurboBoost - dt * 2);
        raceState.playerSpeed *= (1 - dt * 0.3); // drag
        raceState.playerWheelspin = Math.max(0, raceState.playerWheelspin - dt * 4);
    }

    // Overrev penalty
    if (raceState.playerRPM >= maxRPM) {
        raceState.playerSpeed *= (1 - dt * 2);
        raceState.playerRPM = maxRPM;
    }

    // Update position
    raceState.playerPos += raceState.playerSpeed * dt;
    raceState.playerPos = Math.min(raceState.distance, raceState.playerPos);

    // Wheel rotation
    raceState.wheelAngle += raceState.playerSpeed * dt * 8;

    // Smoke decay
    raceState.smokeParticles.forEach(p => { p.life -= dt * 2; p.x += p.vx * dt; });
    raceState.smokeParticles = raceState.smokeParticles.filter(p => p.life > 0);
}

// ---- GEAR SHIFTING ----

function shiftGear() {
    if (!raceState || raceState.phase !== 'racing') return;
    if (raceState.playerGear >= raceState.playerMaxGear) return;

    const rpm = raceState.playerRPM;
    const prevGear = raceState.playerGear;
    raceState.playerGear++;

    // Shift quality affects outcome
    if (rpm >= 6500 && rpm <= 7500) {
        // Perfect shift — minimal RPM drop
        raceState.playerRPM = rpm * 0.6;
        raceState.playerSpeed *= 1.02; // tiny boost
    } else if (rpm >= 7500) {
        // Over-rev shift — speed penalty
        raceState.playerRPM = rpm * 0.45;
        raceState.playerSpeed *= 0.92;
    } else if (rpm < 4000) {
        // Too early — big RPM drop, sluggish
        raceState.playerRPM = rpm * 0.5;
        raceState.playerSpeed *= 0.88;
    } else {
        // OK shift
        raceState.playerRPM = rpm * 0.55;
    }

    // Brief turbo flutter
    raceState.playerTurboBoost *= 0.7;
}

function shiftToFirst() {
    if (!raceState) return;
    if (raceState.playerGear === 0) {
        raceState.playerGear = 1;
        raceState.playerRPM = Math.max(raceState.playerRPM * 0.4, 800);
    }
}

// ---- OPPONENT AI ----

function updateOpponentPhysics(dt) {
    if (raceState.opponentPos >= raceState.distance) return;

    const power = raceState.opponentPower;

    // Reaction delay at start
    if (!raceState.opponentStarted) {
        raceState.opponentReactionDelay -= dt;
        if (raceState.opponentReactionDelay <= 0) {
            raceState.opponentStarted = true;
        } else {
            return;
        }
    }

    // AI rev and shift
    const maxRPM = 7500 + power * 10;
    const rpmGain = 4000 + power * 80;
    raceState.opponentRPM += dt * rpmGain;

    // AI shifts at good RPM (not perfect)
    const shiftPoint = 6800 + Math.random() * 800;
    if (raceState.opponentRPM >= shiftPoint && raceState.opponentGear < 6) {
        raceState.opponentGear++;
        raceState.opponentRPM *= 0.55;
    }

    // Speed calculation
    const gearRatios = [0, 3.8, 2.5, 1.8, 1.4, 1.1, 0.9];
    const torque = Math.sin((raceState.opponentRPM / maxRPM) * Math.PI * 0.9);
    const force = power * 3.5 * torque / (raceState.opponentGear * 0.7 + 0.5);
    const mass = 1200 - power * 2;
    let accel = (force / Math.max(mass, 600)) * 0.4;

    // Wheelspin for AI too at start
    if (raceState.opponentPos < 30 && accel > 3) {
        accel *= 0.7 + Math.random() * 0.2;
    }

    raceState.opponentSpeed += accel * dt * 60;
    raceState.opponentSpeed = Math.min(raceState.opponentSpeed, power * 2.2);

    // Some randomness
    raceState.opponentSpeed *= (0.999 + Math.random() * 0.002);

    raceState.opponentPos += raceState.opponentSpeed * dt;
    raceState.opponentPos = Math.min(raceState.distance, raceState.opponentPos);
}

// ---- FINISH ----

function checkRaceFinish() {
    if (raceState.playerPos >= raceState.distance && raceState.playerTime === 0) {
        raceState.playerTime = raceState.elapsedTime;
    }
    if (raceState.opponentPos >= raceState.distance && raceState.opponentTime === 0) {
        raceState.opponentTime = raceState.elapsedTime;
    }
    if (raceState.playerTime > 0 && raceState.opponentTime > 0) {
        raceState.phase = 'finished';
        setTimeout(showRaceResult, 600);
    }
    // Timeout
    if (raceState.elapsedTime > 40) {
        if (!raceState.playerTime) raceState.playerTime = 40;
        if (!raceState.opponentTime) raceState.opponentTime = 40;
        raceState.phase = 'finished';
        setTimeout(showRaceResult, 600);
    }
}

function showRaceResult() {
    if (!raceState) return;
    const won = raceState.playerTime <= raceState.opponentTime;
    const title = document.getElementById('result-title');
    title.textContent = won ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ';
    title.className = won ? 'win' : 'lose';
    document.getElementById('result-time').textContent = 'Твоё время: ' + raceState.playerTime.toFixed(3) + 's';
    document.getElementById('result-opponent-time').textContent = 'Противник: ' + raceState.opponentTime.toFixed(3) + 's';
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



// ============ RACE DRAWING ============

function drawRaceScene() {
    const canvas = document.getElementById('race-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 900;
    canvas.height = canvas.offsetHeight || 400;
    const W = canvas.width, H = canvas.height;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.38);
    sky.addColorStop(0, '#0d1b2a');
    sky.addColorStop(1, '#1b2838');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.38);

    // Cityscape (parallax)
    const scroll = raceState.playerPos * 2;
    ctx.fillStyle = '#0a0f18';
    for (let i = 0; i < 20; i++) {
        const bx = ((i * 70) - scroll * 0.05) % (W + 300) - 150;
        const bh = 30 + ((i * 37) % 50);
        ctx.fillRect(bx, H * 0.38 - bh, 45, bh);
        ctx.fillStyle = '#ffeb3b11';
        for (let wy = 5; wy < bh - 5; wy += 10) {
            for (let wx = 5; wx < 38; wx += 10) {
                if ((i + wy + wx) % 3 !== 0) ctx.fillRect(bx + wx, H * 0.38 - bh + wy, 5, 5);
            }
        }
        ctx.fillStyle = '#0a0f18';
    }

    // Road surface
    const roadTop = H * 0.38;
    const roadH = H * 0.38;
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, roadTop, W, roadH);

    // Road texture lines
    ctx.fillStyle = '#3333';
    for (let i = 0; i < 40; i++) {
        const lx = ((i * 50) - scroll * 0.8) % (W + 100) - 50;
        ctx.fillRect(lx, roadTop + roadH - 3, 30, 1);
    }

    // Lane divider (dashed)
    ctx.strokeStyle = '#ffeb3b44';
    ctx.lineWidth = 2;
    ctx.setLineDash([25, 25]);
    const dashOffset = -(scroll * 0.8) % 50;
    ctx.lineDashOffset = dashOffset;
    ctx.beginPath();
    ctx.moveTo(0, roadTop + roadH * 0.5);
    ctx.lineTo(W, roadTop + roadH * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance markers on road
    ctx.fillStyle = '#fff3';
    ctx.font = '11px monospace';
    for (let m = 0; m <= raceState.distance; m += 50) {
        const xPos = (m - raceState.playerPos) * (W / 200) + W * 0.15;
        if (xPos > -30 && xPos < W + 30) {
            ctx.fillRect(xPos, roadTop + roadH - 2, 1, 4);
            if (m % 100 === 0) ctx.fillText(m + 'm', xPos - 12, roadTop + roadH + 14);
        }
    }

    // Finish line
    const finishX = (raceState.distance - raceState.playerPos) * (W / 200) + W * 0.15;
    if (finishX > -30 && finishX < W + 50) {
        for (let fy = 0; fy < roadH; fy += 10) {
            for (let fx = 0; fx < 16; fx += 8) {
                ctx.fillStyle = ((fy/10 + fx/8) % 2 === 0) ? '#fff' : '#000';
                ctx.fillRect(finishX + fx, roadTop + fy, 8, 10);
            }
        }
    }

    // Ground below road
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, roadTop + roadH, W, H - roadTop - roadH);

    // --- CARS ---
    const carScale = 2.2;
    const playerDrawX = W * 0.12;
    const playerDrawY = roadTop + roadH * 0.55 - 20;

    // Opponent (top lane)
    const opRelativeX = (raceState.opponentPos - raceState.playerPos) * (W / 200);
    const opDrawX = playerDrawX + opRelativeX;
    const opDrawY = roadTop + roadH * 0.08;
    if (opDrawX > -300 && opDrawX < W + 300) {
        drawCarSide(ctx, opDrawX, opDrawY, raceState.opponentCar, carScale * 0.9);
    }

    // Smoke particles (behind player)
    if (raceState.playerWheelspin > 0.2) {
        ctx.fillStyle = 'rgba(200,200,200,' + (raceState.playerWheelspin * 0.4) + ')';
        for (let i = 0; i < 4; i++) {
            const sx = playerDrawX + 185*carScale/2.2 + Math.random() * 20;
            const sy = playerDrawY + 42*carScale + Math.random() * 10 - 5;
            ctx.beginPath();
            ctx.arc(sx, sy, 6 + Math.random() * 12, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Player car (bottom lane)
    drawCarSide(ctx, playerDrawX, playerDrawY, raceState.playerCar, carScale);

    // NOS flame effect
    if (raceState.playerNOSActive && raceState.playerNOS > 0) {
        const flameX = playerDrawX - 5;
        const flameY = playerDrawY + 30 * carScale / 2;
        ctx.fillStyle = '#2196f3';
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(flameX - Math.random() * 20, flameY + Math.random() * 10 - 5, 3 + Math.random() * 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // Exhaust fire when high RPM
    if (gasPressed && raceState.playerRPM > 6000) {
        const exX = playerDrawX - 2;
        const exY = playerDrawY + 32 * carScale / 2;
        ctx.fillStyle = '#ff6600';
        ctx.globalAlpha = 0.4 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.moveTo(exX, exY);
        ctx.lineTo(exX - 8 - Math.random() * 10, exY - 2);
        ctx.lineTo(exX - 8 - Math.random() * 10, exY + 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Wheelspin tire marks
    if (raceState.playerWheelspin > 0.3 && raceState.playerPos < 60) {
        ctx.fillStyle = 'rgba(30,30,30,0.6)';
        const markX = playerDrawX + 90 * carScale / 2.2;
        ctx.fillRect(markX, playerDrawY + 44*carScale/2.2, 60, 3);
    }

    // Speed lines at high speed
    if (raceState.playerSpeed > 30) {
        const intensity = Math.min(0.3, (raceState.playerSpeed - 30) * 0.005);
        ctx.strokeStyle = 'rgba(255,255,255,' + intensity + ')';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const ly = roadTop + Math.random() * roadH;
            const lx = Math.random() * W;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx + 40 + raceState.playerSpeed * 1.5, ly);
            ctx.stroke();
        }
    }
}

// ============ HUD UPDATE ============

function updateRaceHUD() {
    const rpm = raceState.playerRPM;
    const maxRPM = 8000;
    const pct = (rpm / maxRPM) * 100;
    const fill = document.getElementById('rpm-fill');
    fill.style.width = pct + '%';
    // Color changes in danger zone
    if (pct > 90) fill.style.background = 'linear-gradient(90deg, #4caf50, #ffeb3b, #f44336, #f44336)';
    else if (pct > 75) fill.style.background = 'linear-gradient(90deg, #4caf50, #ffeb3b, #f44336)';
    else fill.style.background = 'linear-gradient(90deg, #4caf50, #ffeb3b, #e94560)';

    document.getElementById('race-gear').textContent = raceState.playerGear === 0 ? 'N' : raceState.playerGear;
    document.getElementById('race-distance').textContent = Math.floor(raceState.playerPos) + 'm / ' + raceState.distance + 'm';

    const nosBtn = document.getElementById('btn-nos');
    if (raceState.playerNOS <= 0) {
        nosBtn.disabled = true;
        nosBtn.textContent = 'NOS (0)';
    } else {
        nosBtn.disabled = false;
        nosBtn.textContent = 'NOS (' + raceState.playerNOS.toFixed(1) + 's)';
    }
}

// ============ CONTROLS ============

function gasOn() { gasPressed = true; }
function gasOff() { gasPressed = false; }
function activateNOS() {
    if (raceState && raceState.phase === 'racing' && raceState.playerNOS > 0 && raceState.playerGear >= 1) {
        raceState.playerNOSActive = true;
    }
}
function deactivateNOS() {
    if (raceState) raceState.playerNOSActive = false;
}

// Keyboard
document.addEventListener('keydown', (e) => {
    if (!raceState) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        gasPressed = true;
        e.preventDefault();
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'ArrowRight' || e.code === 'KeyE') {
        if (raceState.playerGear === 0) shiftToFirst();
        else shiftGear();
        e.preventDefault();
    }
    if (e.code === 'KeyN' || e.code === 'ArrowDown' || e.code === 'KeyQ') {
        activateNOS();
        e.preventDefault();
    }
    // Put into first gear with Enter during countdown
    if (e.code === 'Enter' || e.code === 'KeyD') {
        if (raceState.playerGear === 0) shiftToFirst();
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        gasPressed = false;
    }
    if (e.code === 'KeyN' || e.code === 'ArrowDown' || e.code === 'KeyQ') {
        deactivateNOS();
    }
});

// Button handlers (referenced from HTML)
// gasOn/gasOff, activateNOS/deactivateNOS, shiftGear already defined

// ============ INIT ============
updateMoneyDisplays();
