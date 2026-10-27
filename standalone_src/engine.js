// GAME ENGINE & LOGIC FOR LIFE SIMULATOR EX

const INITIAL_STATE = {
  name: "Алексей",
  age: 0,
  birthYear: 2008,
  city: "Киев",
  country: "Украина",
  money: 500,
  health: 95,
  happiness: 90,
  knowledge: 20,
  relations: 80,
  strength: 10,
  muscleMass: 10,
  charisma: 20,
  intellect: 15,
  finance: 10,
  creativity: 15,
  schoolGPA: 8.5,
  focus: "Раннее развитие",
  career: null,
  careerLevel: 0,
  education: [],
  languages: { "uk": 5, "ru": 4, "en": 0 },
  hasPet: false,
  petName: null,
  vehicle: null,
  house: "parents",
  stress: 0,
  shadowIncome: 0,
  wantedLevel: 0,
  taxScrutiny: 0,
  blogSubscribers: 0,
  businesses: [],
  investments: {},
  activePetId: null,
  ownedVehicles: [],
  installedTuning: [],
  equippedBrands: [],
  politicalPosition: null,
  currentYear: 2008,
  monthOfYear: 1,
  season: "Зима",
  storyArc: "Глава I: Рождение",
  chronicle: [],
  aiMemory: [],
  quests: [],
  gymCooldown: 0,
  cardioCooldown: 0,
  outfitStyle: "casual",
  hairstyle: "short",
  facialHair: "none",
  pocketMoney: 0,
  petRequestCooldown: 0,
  pendingDilemma: null,
  lastSaved: null,
  turnsPlayed: 0,
  // Extra social state
  parentsRelations: 90,
  partner: null, // { name, gender, relations, yearsTogether, isMarried }
  friends: [
    { id: "friend_1", name: "Дмитрий", relations: 75, status: "Школьный друг" },
    { id: "friend_2", name: "Елена", relations: 70, status: "Подруга детства" }
  ],
  sportSupplementsActive: false,
  currentUniversity: null, // { id, name, year, program, gpa, accomm }
  uniYear: 0
};

let gameState = JSON.parse(JSON.stringify(INITIAL_STATE));

function getCountryData(countryName) {
  const c = countryName || gameState.country;
  return COUNTRIES.find(item => item.name === c) || COUNTRIES[0];
}

function formatMoney(amount, countryName) {
  const c = getCountryData(countryName);
  const rounded = Math.round(amount);
  return `${c.currency} ${rounded.toLocaleString('ru-RU')}`;
}

function ageGate(action) {
  const gates = {
    school: 6,
    romance: 12,
    parttime: 14,
    college: 14,
    urbex: 16,
    crime: 16,
    adultCareer: 18,
    university: 18,
    casino: 18,
    alcohol: 18,
    steroids: 18,
    politics: 21
  };
  return { allowed: gameState.age >= (gates[action] || 0), minAge: gates[action] || 0 };
}

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

function addChronicle(title, text, tags = []) {
  const entry = {
    year: gameState.currentYear,
    age: gameState.age,
    season: gameState.season,
    title,
    text,
    tags
  };
  gameState.chronicle.unshift(entry);
  if (gameState.chronicle.length > 40) {
    gameState.chronicle.pop();
  }
}

// ── ADVANCE YEAR ENGINE ──
function advanceYear() {
  gameState.age += 1;
  gameState.currentYear += 1;
  gameState.turnsPlayed += 1;

  // Season rotation
  const seasons = ["Зима", "Весна", "Лето", "Осень"];
  const sIdx = gameState.age % 4;
  gameState.season = seasons[sIdx];
  gameState.monthOfYear = (sIdx * 3) + 1;

  // Story Arc progression
  if (gameState.age <= 5) {
    gameState.storyArc = "Глава I: Раннее детство";
  } else if (gameState.age <= 13) {
    gameState.storyArc = "Глава II: Школьные годы";
  } else if (gameState.age <= 17) {
    gameState.storyArc = "Глава III: Юность и выбор пути";
  } else if (gameState.age <= 25) {
    gameState.storyArc = "Глава IV: Взрослая жизнь и карьера";
  } else if (gameState.age <= 40) {
    gameState.storyArc = "Глава V: Расцвет сил и амбиции";
  } else if (gameState.age <= 60) {
    gameState.storyArc = "Глава VI: Зрелость и влияние";
  } else {
    gameState.storyArc = "Глава VII: Мудрость и наследие";
  }

  const country = getCountryData();
  let yearlyIncome = 0;
  let yearlyExpenses = 0;
  const chronicleTags = [];

  // 1. Focus effects
  applyFocusEffects();

  // 2. Career Income
  if (gameState.career && gameState.age >= 18) {
    const carObj = CAREERS.find(c => c.id === gameState.career);
    if (carObj) {
      const lvl = carObj.levels[gameState.careerLevel] || carObj.levels[0];
      const annualSalary = Math.round(carObj.baseSalary * lvl.salaryMult * country.costIndex * 12);
      yearlyIncome += annualSalary;
      gameState.money += annualSalary;
      gameState.intellect = clamp(gameState.intellect + 2);
      gameState.knowledge = clamp(gameState.knowledge + 2);
      gameState.stress = clamp(gameState.stress + 5);
      chronicleTags.push({ label: `+${formatMoney(annualSalary)} зарплата`, type: 'tag-income' });
    }
  }

  // 3. Business Profits
  if (gameState.businesses && gameState.businesses.length > 0) {
    let bizTotal = 0;
    gameState.businesses.forEach(b => {
      const bDef = BUSINESS_TYPES.find(item => item.id === b.id);
      if (bDef) {
        const profit = Math.round(bDef.annualProfit * (b.level || 1) * country.costIndex);
        bizTotal += profit;
      }
    });
    if (bizTotal > 0) {
      yearlyIncome += bizTotal;
      gameState.money += bizTotal;
      chronicleTags.push({ label: `+${formatMoney(bizTotal)} бизнес`, type: 'tag-income' });
    }
  }

  // 4. Investments Market Fluctuation
  if (gameState.investments && Object.keys(gameState.investments).length > 0) {
    let portfolioReturn = 0;
    Object.keys(gameState.investments).forEach(assetId => {
      const inv = gameState.investments[assetId];
      if (inv && inv.shares > 0) {
        const assetDef = INVESTMENT_MARKET.find(a => a.id === assetId);
        const vol = assetDef ? assetDef.volatility : 0.15;
        // Random fluctuation between -vol and +vol*1.3
        const changePercent = (Math.random() * (vol * 2.3)) - vol;
        const currentVal = inv.shares * (inv.currentPrice || assetDef.basePrice);
        const profitLoss = Math.round(currentVal * changePercent);
        inv.currentPrice = Math.max(10, Math.round((inv.currentPrice || assetDef.basePrice) * (1 + changePercent)));
        portfolioReturn += profitLoss;
      }
    });
    if (portfolioReturn !== 0) {
      const sign = portfolioReturn > 0 ? '+' : '';
      chronicleTags.push({ label: `${sign}${formatMoney(portfolioReturn)} инвест. доход`, type: portfolioReturn > 0 ? 'tag-income' : 'tag-expense' });
    }
  }

  // 5. Living Expenses (Housing & Essentials)
  const houseObj = HOUSING_CATALOG.find(h => h.id === gameState.house) || HOUSING_CATALOG[0];
  const rentAnnual = houseObj.rent * 12 * country.costIndex;
  const foodAndLifeAnnual = (country.avgSalary * 0.35) * 12; // base food and utilities
  yearlyExpenses = Math.round(rentAnnual + (gameState.age >= 18 ? foodAndLifeAnnual : 0));

  // Pet upkeep
  if (gameState.hasPet && gameState.activePetId) {
    const petObj = PETS_CATALOG.find(p => p.id === gameState.activePetId);
    if (petObj) yearlyExpenses += (petObj.upkeep * 12);
  }

  gameState.money -= yearlyExpenses;
  if (yearlyExpenses > 0) {
    chronicleTags.push({ label: `-${formatMoney(yearlyExpenses)} расходы`, type: 'tag-expense' });
  }

  // 6. Pocket money from parents (ages 7-17)
  if (gameState.age >= 7 && gameState.age <= 17) {
    const allowance = Math.round((country.avgSalary * 0.05 * (gameState.parentsRelations / 100)) * 12);
    gameState.money += allowance;
    gameState.pocketMoney = allowance;
    chronicleTags.push({ label: `+${formatMoney(allowance)} карманные`, type: 'tag-income' });
  }

  // 7. University Progression
  if (gameState.currentUniversity) {
    gameState.uniYear += 1;
    gameState.knowledge = clamp(gameState.knowledge + 6);
    gameState.intellect = clamp(gameState.intellect + 5);
    gameState.stress = clamp(gameState.stress + 6);

    if (gameState.uniYear >= 4) {
      // Graduation!
      const uniName = gameState.currentUniversity.name;
      gameState.education.push(uniName);
      addChronicle("🎓 Окончание университета!", `Вы успешно завершили 4-летний курс в «${uniName}» и получили диплом о высшем образовании! Знания и авторитет возросли.`, [{ label: "Диплом получен", type: "tag-promo" }]);
      gameState.currentUniversity = null;
      gameState.uniYear = 0;
      gameState.happiness = clamp(gameState.happiness + 20);
      gameState.relations = clamp(gameState.relations + 10);
    }
  }

  // 8. School milestones
  if (gameState.age === 6) {
    addChronicle("🔔 Первый раз в первый класс!", "Вы пошли в школу! Первый звонок, белый воротничок, ранец за плечами и первые друзья за партой.", [{ label: "Начало учёбы", type: "tag-event" }]);
  } else if (gameState.age === 17) {
    addChronicle("🎉 Выпускной бал в школе!", `Школьные годы позади! Ваш средний балл GPA составил ${gameState.schoolGPA.toFixed(1)}. Впереди открывается взрослый мир и выбор жизненного пути.`, [{ label: `GPA ${gameState.schoolGPA.toFixed(1)}`, type: "tag-promo" }]);
  }

  // 9. Reset cooldowns
  gameState.gymCooldown = 0;
  gameState.cardioCooldown = 0;
  gameState.petRequestCooldown = 0;
  gameState.sportSupplementsActive = false;

  // 10. Partner & Marriage aging
  if (gameState.partner) {
    gameState.partner.yearsTogether = (gameState.partner.yearsTogether || 0) + 1;
    gameState.happiness = clamp(gameState.happiness + 3);
  }

  // 11. Stress and health penalties
  if (gameState.stress > 75) {
    gameState.health = clamp(gameState.health - 6);
    chronicleTags.push({ label: "Стресс бьёт по здоровью", type: "tag-expense" });
  } else {
    gameState.stress = clamp(gameState.stress - 8);
  }

  // 12. Check Quests
  checkQuests();

  // 13. Auto-generate Chronicle entry
  const flavor = getYearFlavorText(gameState.age, gameState.focus);
  addChronicle(`Год ${gameState.currentYear} (Возраст: ${gameState.age})`, flavor, chronicleTags);

  // 14. 35-40% chance of Life Dilemma
  const dilemmaRoll = Math.random();
  if (dilemmaRoll <= 0.40) {
    triggerRandomDilemma();
  }

  // 15. Autosave
  saveGame();

  // Mobile haptic vibration
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(15);
  }

  // Render UI
  if (typeof render === 'function') {
    render();
  }
}

function applyFocusEffects() {
  const f = gameState.focus;
  if (!f) return;

  if (f === "Раннее развитие") {
    gameState.intellect = clamp(gameState.intellect + 4);
    gameState.knowledge = clamp(gameState.knowledge + 3);
  } else if (f === "Игры и мультики") {
    gameState.happiness = clamp(gameState.happiness + 6);
    gameState.creativity = clamp(gameState.creativity + 3);
  } else if (f === "Отличник в школе") {
    gameState.schoolGPA = Math.min(12.0, gameState.schoolGPA + 0.3);
    gameState.knowledge = clamp(gameState.knowledge + 5);
    gameState.stress = clamp(gameState.stress + 4);
  } else if (f === "Спортивная секция") {
    gameState.strength = clamp(gameState.strength + 4);
    gameState.muscleMass = clamp(gameState.muscleMass + 3);
    gameState.health = clamp(gameState.health + 4);
  } else if (f === "Кружки и творчество") {
    gameState.creativity = clamp(gameState.creativity + 5);
    gameState.happiness = clamp(gameState.happiness + 3);
  } else if (f === "Подготовка к экзаменам") {
    gameState.schoolGPA = Math.min(12.0, gameState.schoolGPA + 0.5);
    gameState.intellect = clamp(gameState.intellect + 4);
    gameState.stress = clamp(gameState.stress + 5);
  } else if (f === "Подработка и накопления") {
    gameState.finance = clamp(gameState.finance + 4);
    gameState.money += 3500;
  } else if (f === "Тусовки и друзья") {
    gameState.charisma = clamp(gameState.charisma + 4);
    gameState.relations = clamp(gameState.relations + 6);
    gameState.happiness = clamp(gameState.happiness + 5);
  } else if (f === "Карьерный рост") {
    gameState.finance = clamp(gameState.finance + 4);
    gameState.intellect = clamp(gameState.intellect + 3);
    gameState.stress = clamp(gameState.stress + 6);
  } else if (f === "Бизнес и инвестиции") {
    gameState.finance = clamp(gameState.finance + 6);
    gameState.intellect = clamp(gameState.intellect + 3);
  } else if (f === "Семья и личная жизнь") {
    gameState.relations = clamp(gameState.relations + 8);
    gameState.happiness = clamp(gameState.happiness + 6);
    gameState.stress = clamp(gameState.stress - 10);
  } else if (f === "Здоровье и биохакинг") {
    gameState.health = clamp(gameState.health + 8);
    gameState.stress = clamp(gameState.stress - 15);
  }
}

function getYearFlavorText(age, focus) {
  if (age <= 2) return "Вы познаёте мир вокруг: первые шаги, яркие погремушки, тёплые объятия мамы.";
  if (age <= 5) return "Детский сад, рисование мелками на асфальте и любимые вечерние сказки перед сном.";
  if (age <= 10) return "Школьные уроки, звонки на перемену, игры во дворе и верные друзья за соседней партой.";
  if (age <= 14) return "Период взросления: музыка в наушниках, поиск своего стиля и первые тайные симпатии.";
  if (age <= 17) return "Юность бурлит: споры о будущем, подготовка к экзаменам и душевные разговоры до полуночи.";
  if (age <= 25) return "Годы становления: стремительный ритм, поиск баланса между работой, амбициями и личной жизнью.";
  if (age <= 40) return "Время зрелых решений, уверенности в своих силах, укрепления капитала и семейного очага.";
  if (age <= 60) return "Стабильность и вес в обществе: вы накопили богатый опыт и управляете своей судьбой.";
  return "Годы мудрости: уважение окружающих, воспоминания о пройденном пути и покой в кругу близких.";
}

function checkQuests() {
  QUESTS.forEach(q => {
    if (!gameState.quests.includes(q.id)) {
      if (q.check(gameState)) {
        gameState.quests.push(q.id);
        addChronicle(`🏆 Квест выполнен: «${q.title}»!`, q.desc, [{ label: "Квест завершён", type: "tag-promo" }]);
        showToast(`🏆 Квест завершён: ${q.title}!`);
      }
    }
  });
}

// ── LIFE DILEMMAS SYSTEM ──
function triggerRandomDilemma() {
  const eligible = LIFE_DILEMMAS.filter(d => gameState.age >= d.minAge && gameState.age <= d.maxAge);
  if (eligible.length === 0) return;
  const picked = eligible[Math.floor(Math.random() * eligible.length)];
  gameState.pendingDilemma = picked;
  showDilemmaModal(picked);
}

function resolveDilemmaChoice(choiceIndex) {
  const dilemma = gameState.pendingDilemma;
  if (!dilemma || !dilemma.choices[choiceIndex]) return;

  const choice = dilemma.choices[choiceIndex];

  // Check stat requirement
  let passedRequirement = true;
  if (choice.req) {
    const currentVal = gameState[choice.req.stat] !== undefined ? gameState[choice.req.stat] : 0;
    if (currentVal < choice.req.value) {
      passedRequirement = false;
    }
  }

  let isSuccess = false;
  if (!passedRequirement) {
    isSuccess = false;
  } else {
    isSuccess = Math.random() <= choice.successChance;
  }

  const effects = isSuccess ? choice.effectsSuccess : choice.effectsFail;
  const message = isSuccess ? choice.successMsg : (passedRequirement ? choice.failMsg : `Вам не хватило навыка: требуется ${choice.req.stat} ${choice.req.value}! Вы потерпели неудачу.`);

  // Apply effects
  if (effects) {
    if (effects.health) gameState.health = clamp(gameState.health + effects.health);
    if (effects.happiness) gameState.happiness = clamp(gameState.happiness + effects.happiness);
    if (effects.knowledge) gameState.knowledge = clamp(gameState.knowledge + effects.knowledge);
    if (effects.relations) gameState.relations = clamp(gameState.relations + effects.relations);
    if (effects.strength) gameState.strength = clamp(gameState.strength + effects.strength);
    if (effects.muscleMass) gameState.muscleMass = clamp(gameState.muscleMass + effects.muscleMass);
    if (effects.charisma) gameState.charisma = clamp(gameState.charisma + effects.charisma);
    if (effects.intellect) gameState.intellect = clamp(gameState.intellect + effects.intellect);
    if (effects.finance) gameState.finance = clamp(gameState.finance + effects.finance);
    if (effects.creativity) gameState.creativity = clamp(gameState.creativity + effects.creativity);
    if (effects.money) gameState.money += effects.money;
    if (effects.gpa && gameState.age <= 17) gameState.schoolGPA = Math.max(2.0, Math.min(12.0, gameState.schoolGPA + effects.gpa));
    if (effects.careerLevel && gameState.career) gameState.careerLevel = Math.min(4, gameState.careerLevel + effects.careerLevel);
    if (effects.wantedLevel) gameState.wantedLevel = Math.min(5, gameState.wantedLevel + effects.wantedLevel);
  }

  addChronicle(`⚖️ Дилемма: ${dilemma.title}`, message, [{ label: isSuccess ? "Успех" : "Неудача", type: isSuccess ? "tag-promo" : "tag-expense" }]);
  gameState.pendingDilemma = null;
  closeModal();

  showToast(isSuccess ? `✓ ${message}` : `✕ ${message}`);
  saveGame();
  render();
}

// ── TRAINING / SPORT SYSTEM ──
function trainGym() {
  if (gameState.gymCooldown > 0) {
    showToast("Вы уже тренировались в этом году! Мышцам нужен отдых.");
    return;
  }
  const mult = gameState.sportSupplementsActive ? 1.5 : 1.0;
  const muscleGain = Math.round(3 * mult);
  const strengthGain = Math.round(2 * mult);

  gameState.muscleMass = clamp(gameState.muscleMass + muscleGain);
  gameState.strength = clamp(gameState.strength + strengthGain);
  gameState.health = clamp(gameState.health - 3);
  gameState.stress = clamp(gameState.stress - 5);
  gameState.gymCooldown = 1;

  addChronicle("🏋️ Силовая тренировка в зале", `Отличный памп! Мышечная масса +${muscleGain}%, сила +${strengthGain}.`, [{ label: `Мышцы +${muscleGain}%`, type: 'tag-promo' }]);
  showToast(`🏋️ Тренировка завершена: Мышцы +${muscleGain}%, Сила +${strengthGain}`);
  render();
}

function trainCardio() {
  if (gameState.cardioCooldown > 0) {
    showToast("Вы уже совершали пробежку в этом году!");
    return;
  }
  gameState.health = clamp(gameState.health + 5);
  gameState.stress = clamp(gameState.stress - 12);
  gameState.happiness = clamp(gameState.happiness + 4);
  gameState.cardioCooldown = 1;

  addChronicle("🏃 Кардио и пробежка на свежем воздухе", "Пробежка очистила голову от мыслей и укрепила сердечно-сосудистую систему. Здоровье +5%, стресс -12.", [{ label: "Здоровье +5%", type: 'tag-promo' }]);
  showToast("🏃 Пробежка окончена: Здоровье +5%, Стресс -12%");
  render();
}

function buySupplements() {
  const cost = 200 * getCountryData().costIndex;
  if (gameState.money < cost) {
    showToast(`Недостаточно средств! Требуется ${formatMoney(cost)}`);
    return;
  }
  gameState.money -= cost;
  gameState.sportSupplementsActive = true;
  showToast("🥗 Спортпит куплен! Следующая тренировка даст +50% к эффекту.");
  render();
}

// ── QUICK ACTIONS ──
function writeBlogPost() {
  const newSubs = Math.round(15 + Math.random() * 40 * (1 + gameState.charisma / 30));
  gameState.blogSubscribers += newSubs;
  gameState.charisma = clamp(gameState.charisma + 1);
  gameState.happiness = clamp(gameState.happiness + 3);
  showToast(`📱 Пост опубликован! +${newSubs} подписчиков в блоге`);
  render();
}

function goVacation() {
  const cost = Math.round(600 * getCountryData().costIndex);
  if (gameState.money < cost) {
    showToast(`Недостаточно средств для отпуска! Требуется ${formatMoney(cost)}`);
    return;
  }
  gameState.money -= cost;
  gameState.happiness = clamp(gameState.happiness + 15);
  gameState.stress = clamp(gameState.stress - 25);
  gameState.health = clamp(gameState.health + 4);
  addChronicle("🏖️ Мини-отпуск на курорте", `Вы отлично отдохнули у моря, перезагрузились и набрались свежих сил! Счастье +15%, стресс -25.`, [{ label: `-${formatMoney(cost)}`, type: 'tag-expense' }]);
  showToast("🏖️ Отпуск удался на славу! Стресс снижен, счастье повышено.");
  render();
}

// ── SAVE & LOAD SYSTEM ──
function saveGame() {
  gameState.lastSaved = new Date().toISOString();
  try {
    localStorage.setItem('lifesimex_v4', JSON.stringify(gameState));
  } catch (e) {
    console.error("Save error", e);
  }
}

function loadGame() {
  try {
    const saved = localStorage.getItem('lifesimex_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      gameState = Object.assign({}, INITIAL_STATE, parsed);
      showToast("📂 Игра успешно загружена!");
      render();
      return true;
    }
  } catch (e) {
    console.error("Load error", e);
  }
  return false;
}

function exportSave() {
  const jsonStr = JSON.stringify(gameState, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lifesimex_save_${gameState.name}_${gameState.age}yo.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("💾 Файл сохранения скачан!");
}

function importSave(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      gameState = Object.assign({}, INITIAL_STATE, parsed);
      saveGame();
      showToast("📂 Сохранение успешно импортировано!");
      render();
    } catch (err) {
      showToast("✕ Ошибка чтения файла сохранения!");
    }
  };
  reader.readAsText(file);
}

function resetGame() {
  if (confirm("Вы уверены, что хотите начать новую жизнь? Текущий прогресс будет сброшен.")) {
    gameState = JSON.parse(JSON.stringify(INITIAL_STATE));
    saveGame();
    showToast("🔄 Начата новая жизнь!");
    render();
  }
}
