// UI RENDERING & INTERACTIVE TABS FOR LIFE SIMULATOR EX

let activeTab = "chronicle";
let currentUniCountryFilter = "all";

function switchTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab-btn').forEach(el => el.classList.remove('active'));

  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) targetTab.classList.add('active');

  const targetBtn = document.getElementById(`btn-nav-${tabName}`);
  if (targetBtn) targetBtn.classList.add('active');

  render();
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

function showModal(title, contentHtml) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!overlay || !titleEl || !bodyEl) return;

  titleEl.innerText = title;
  bodyEl.innerHTML = contentHtml;
  overlay.classList.add('open');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

function showDilemmaModal(dilemma) {
  let choicesHtml = dilemma.choices.map((c, idx) => {
    const reqText = c.req ? `🧠 Требуется: ${c.req.stat} ${c.req.value}` : "Доступно всем";
    const chanceText = c.successChance ? `Успех: ${Math.round(c.successChance * 100)}%` : "";
    return `
      <button class="btn-choice" onclick="resolveDilemmaChoice(${idx})">
        <strong>${c.label}</strong>
        <div class="choice-meta">
          <span>${reqText}</span>
          <span>${chanceText}</span>
        </div>
      </button>
    `;
  }).join('');

  const bodyHtml = `
    <p style="margin-bottom: 14px;">${dilemma.description}</p>
    <div class="dilemma-choices">
      ${choicesHtml}
    </div>
  `;
  showModal(`⚖️ ${dilemma.title}`, bodyHtml);
}

// ── TOP-LEVEL RENDER DISPATCHER ──
function render() {
  renderCharHero();
  renderStats();

  if (activeTab === "chronicle") renderChronicleTab();
  else if (activeTab === "education") renderEducationTab();
  else if (activeTab === "career") renderCareerTab();
  else if (activeTab === "assets") renderAssetsTab();
  else if (activeTab === "family") renderFamilyTab();
  else if (activeTab === "world") renderWorldTab();
}

// ── CHARACTER HERO CARD ──
function renderCharHero() {
  const avatarBox = document.getElementById('char-avatar-container');
  if (avatarBox) {
    avatarBox.innerHTML = renderCharacter(gameState, 150);
  }

  const nameEl = document.getElementById('char-name-display');
  if (nameEl) nameEl.innerText = gameState.name;

  const ageBadge = document.getElementById('char-age-badge');
  if (ageBadge) ageBadge.innerText = `${gameState.age} лет`;

  const metaEl = document.getElementById('char-meta-display');
  const country = getCountryData();
  if (metaEl) {
    metaEl.innerHTML = `
      <span>📅 ${gameState.currentYear} г. (${gameState.season})</span>
      <span>${country.flag} ${gameState.city}, ${gameState.country}</span>
      <span>📖 ${gameState.storyArc}</span>
    `;
  }

  const moneyEl = document.getElementById('char-money-display');
  if (moneyEl) {
    moneyEl.innerText = formatMoney(gameState.money);
  }

  // Focus options by age
  const focusSelect = document.getElementById('char-focus-select');
  if (focusSelect) {
    let options = [];
    if (gameState.age <= 5) {
      options = ["Раннее развитие", "Игры и мультики", "Активный малыш"];
    } else if (gameState.age <= 13) {
      options = ["Отличник в школе", "Спортивная секция", "Кружки и творчество", "Игры и мультики"];
    } else if (gameState.age <= 17) {
      options = ["Подготовка к экзаменам", "Подработка и накопления", "Тусовки и друзья", "Спортивная секция"];
    } else {
      options = ["Карьерный рост", "Бизнес и инвестиции", "Семья и личная жизнь", "Здоровье и биохакинг", "Тусовки и друзья"];
    }

    if (!options.includes(gameState.focus)) {
      gameState.focus = options[0];
    }

    focusSelect.innerHTML = options.map(opt => `
      <option value="${opt}" ${gameState.focus === opt ? 'selected' : ''}>${opt}</option>
    `).join('');
  }
}

function onFocusChanged(val) {
  gameState.focus = val;
  showToast(`Фокус года изменён: ${val}`);
  saveGame();
}

// ── CORE STATS & SKILLS BARS ──
function renderStats() {
  // Core stats
  setStatBar('health', gameState.health, 'bar-health');
  setStatBar('happy', gameState.happiness, 'bar-happy');
  setStatBar('knowledge', gameState.knowledge, 'bar-knowledge');
  setStatBar('relations', gameState.relations, 'bar-relations');

  // Skill stats
  setSkillVal('strength', gameState.strength);
  setSkillVal('muscle', gameState.muscleMass);
  setSkillVal('charisma', gameState.charisma);
  setSkillVal('intellect', gameState.intellect);
  setSkillVal('finance', gameState.finance);
  setSkillVal('creativity', gameState.creativity);
}

function setStatBar(id, val, barClass) {
  const valEl = document.getElementById(`val-${id}`);
  const barEl = document.getElementById(`bar-${id}`);
  if (valEl) valEl.innerText = `${Math.round(val)}%`;
  if (barEl) barEl.style.width = `${Math.max(0, Math.min(100, val))}%`;
}

function setSkillVal(id, val) {
  const el = document.getElementById(`val-skill-${id}`);
  if (el) el.innerText = Math.round(val);
}

// ── TAB 1: 📖 ЛЕТОПИСЬ (CHRONICLE) ──
function renderChronicleTab() {
  const logEl = document.getElementById('chronicle-feed');
  if (logEl) {
    if (!gameState.chronicle || gameState.chronicle.length === 0) {
      logEl.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Летопись пока пуста. Нажмите «Следующий год» для начала пути!</div>`;
    } else {
      logEl.innerHTML = gameState.chronicle.slice(0, 20).map(entry => {
        const tagsHtml = (entry.tags || []).map(t => `
          <span class="chronicle-tag ${t.type}">${t.label}</span>
        `).join('');

        return `
          <div class="chronicle-entry">
            <div class="chronicle-year-badge">${entry.year} г. (${entry.age} лет)</div>
            <div class="chronicle-text">
              <strong>${entry.title}</strong>
              <p style="margin-top: 2px;">${entry.text}</p>
              ${tagsHtml ? `<div>${tagsHtml}</div>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Quests list
  const questsEl = document.getElementById('chronicle-quests');
  if (questsEl) {
    questsEl.innerHTML = QUESTS.map(q => {
      const isDone = gameState.quests && gameState.quests.includes(q.id);
      return `
        <div class="quest-item">
          <div class="quest-info">
            <span class="quest-title">${q.title}</span>
            <span class="quest-desc">${q.desc}</span>
          </div>
          <span class="quest-badge ${isDone ? 'badge-done' : 'badge-active'}">
            ${isDone ? '✓ Выполнен' : 'В процессе'}
          </span>
        </div>
      `;
    }).join('');
  }
}

// ── TAB 2: 🎓 УЧЁБА (EDUCATION) ──
function renderEducationTab() {
  const container = document.getElementById('tab-education');
  if (!container) return;

  const age = gameState.age;

  if (age < 6) {
    // Baby activities
    container.innerHTML = `
      <div class="panel-card">
        <div class="panel-title-row">
          <div class="panel-title">🧸 Раннее развитие (Возраст: ${age} лет)</div>
          <div class="panel-subtitle">Игры и познание окружающего мира</div>
        </div>
        <div class="items-grid">
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">🧱 Деревянные кубики и конструктор</span>
              <span class="card-item-badge">+Интеллект, +Креатив</span>
            </div>
            <div class="card-item-body">Строить башни, складывать цветные фигурки и развивать моторику.</div>
            <div class="card-item-footer">
              <button class="btn btn-edu btn-sm" onclick="doBabyActivity('cubes')">Складывать кубики</button>
            </div>
          </div>
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">📺 Обучающие мультфильмы</span>
              <span class="card-item-badge">+Знания, +Счастье</span>
            </div>
            <div class="card-item-body">Веселые песенки про буквы, цифры и добрых животных.</div>
            <div class="card-item-footer">
              <button class="btn btn-edu btn-sm" onclick="doBabyActivity('cartoons')">Смотреть мультики</button>
            </div>
          </div>
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">🗣️ Первые слова и звуки</span>
              <span class="card-item-badge">+Харизма, +Отношения</span>
            </div>
            <div class="card-item-body">Повторять слова за родителями и учиться выговаривать сложные звуки.</div>
            <div class="card-item-footer">
              <button class="btn btn-edu btn-sm" onclick="doBabyActivity('words')">Учить слова</button>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  let html = '';

  // 1. School Section (Age 6-17)
  if (age >= 6 && age <= 17) {
    html += `
      <div class="panel-card">
        <div class="panel-title-row">
          <div class="panel-title">🏫 Средняя школа (Текущий балл GPA: ${gameState.schoolGPA.toFixed(1)} / 12)</div>
          <div class="panel-subtitle">Основы знаний и школьная жизнь</div>
        </div>
        <div class="items-grid">
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">📚 Сделать домашнее задание</span>
              <span class="card-item-badge">+GPA, +Знания</span>
            </div>
            <div class="card-item-body">Усердное решение задач и чтение учебников перед уроками.</div>
            <div class="card-item-footer">
              <button class="btn btn-edu btn-sm" onclick="doSchoolAction('homework')">Делать уроки</button>
            </div>
          </div>
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">🧑‍🏫 Нанять репетитора</span>
              <span class="card-item-badge">Стоимость: ${formatMoney(1500 * getCountryData().costIndex)}</span>
            </div>
            <div class="card-item-body">Индивидуальные занятия с преподавателем для взлёта оценок.</div>
            <div class="card-item-footer">
              <button class="btn btn-edu btn-sm" onclick="doSchoolAction('tutor')">Заниматься с репетитором</button>
            </div>
          </div>
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">🏆 Школьная олимпиада</span>
              <span class="card-item-badge">Требуется: Интеллект 35</span>
            </div>
            <div class="card-item-body">Продемонстрировать эрудицию и защитить честь школы.</div>
            <div class="card-item-footer">
              <button class="btn btn-edu btn-sm" onclick="doSchoolAction('olympiad')">Участвовать</button>
            </div>
          </div>
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">🎒 Прогулять уроки</span>
              <span class="card-item-badge">+Счастье, -GPA</span>
            </div>
            <div class="card-item-body">Сбежать с последних уроков с друзьями в парк или торговый центр.</div>
            <div class="card-item-footer">
              <button class="btn btn-outline btn-sm" onclick="doSchoolAction('skip')">Прогулять</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Higher Education & Universities (Age >= 18)
  if (age >= 18) {
    if (gameState.currentUniversity) {
      const u = gameState.currentUniversity;
      html += `
        <div class="panel-card" style="border: 2px solid var(--accent-edu);">
          <div class="panel-title-row">
            <div class="panel-title">🎓 Обучение: ${u.name}</div>
            <div class="panel-subtitle">Курс: ${gameState.uniYear} из 4 • Специальность: ${u.program}</div>
          </div>
          <div style="font-size: 13px; color: var(--text-secondary);">
            Вы учитесь в престижном вузе. Проживание: ${u.accomm === 'dorm' ? 'Общежитие (экономно)' : 'Съёмная квартира (комфортно)'}.
          </div>
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button class="btn btn-edu btn-sm" onclick="studyUniversityHard()">📚 Учиться на отлично (+Знания, +Интеллект)</button>
            <button class="btn btn-outline btn-sm" onclick="dropOutUniversity()">🚪 Бросить учёбу</button>
          </div>
        </div>
      `;
    } else {
      // University catalog
      const countriesList = ["all", "Украина", "Польша", "Германия", "Великобритания", "Испания", "Франция", "Чехия", "Канада", "США"];
      const filteredUnis = currentUniCountryFilter === "all"
        ? UNIVERSITIES
        : UNIVERSITIES.filter(u => u.country === currentUniCountryFilter);

      html += `
        <div class="panel-card">
          <div class="panel-title-row">
            <div class="panel-title">🏛️ Университеты и Высшее образование</div>
            <div class="panel-subtitle">32 ведущих вуза мира</div>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <label style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Фильтр по стране:</label>
            <select class="char-focus-select" style="max-width: 200px;" onchange="onUniCountryFilterChanged(this.value)">
              ${countriesList.map(c => `
                <option value="${c}" ${currentUniCountryFilter === c ? 'selected' : ''}>
                  ${c === 'all' ? '🌍 Все страны' : c}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="items-grid" style="margin-top: 10px;">
            ${filteredUnis.map(u => {
              const uCountry = COUNTRIES.find(c => c.name === u.country) || COUNTRIES[0];
              const tuitionFormatted = `${uCountry.currency} ${u.tuition.toLocaleString('ru-RU')}/год`;
              const isEligibleGPA = gameState.schoolGPA >= u.minGPA;
              const hasScholarship = gameState.schoolGPA >= u.scholarshipThreshold;
              const langLevel = (gameState.languages && gameState.languages[u.requiredLanguage]) || 0;
              const hasLang = langLevel >= 2; // at least A2/B1

              return `
                <div class="card-item">
                  <div class="card-item-head">
                    <span class="card-item-title">${uCountry.flag} ${u.name}</span>
                    <span class="card-item-badge">${u.rank}</span>
                  </div>
                  <div class="card-item-body">
                    <div><strong>Город:</strong> ${u.city}, ${u.country}</div>
                    <div><strong>Программа:</strong> ${u.program}</div>
                    <div><strong>Мин. GPA:</strong> ${u.minGPA} (У вас: ${gameState.schoolGPA.toFixed(1)}) ${isEligibleGPA ? '✓' : '✕'}</div>
                    <div><strong>Язык:</strong> ${u.requiredLanguage.toUpperCase()} (У вас: ур. ${langLevel}) ${hasLang ? '✓' : '✕'}</div>
                    <div><strong>Обучение:</strong> ${hasScholarship ? '🎉 Бюджет (Стипендия)!' : tuitionFormatted}</div>
                  </div>
                  <div class="card-item-footer">
                    <button class="btn btn-edu btn-sm" onclick="enrollUniversity('${u.id}', 'dorm')">
                      Поступить (Общежитие)
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="enrollUniversity('${u.id}', 'apt')">
                      Квартира
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  }

  // 3. Language Courses Section (Available for all ages >= 8)
  html += `
    <div class="panel-card" style="margin-top: 14px;">
      <div class="panel-title-row">
        <div class="panel-title">🌐 Языковые курсы и сертификация CEFR</div>
        <div class="panel-subtitle">Изучение иностранных языков расширяет границы карьеры</div>
      </div>
      <div class="items-grid">
        ${LANGUAGES_DATA.map(lang => {
          const lvl = (gameState.languages && gameState.languages[lang.code]) || 0;
          const cefrNames = ["Нет (0)", "A1 (Базовый)", "A2 (Элементарный)", "B1 (Средний)", "B2 (Выше среднего)", "C1/C2 (Свободно)"];
          const courseCost = Math.round(2500 * getCountryData().costIndex);

          return `
            <div class="card-item">
              <div class="card-item-head">
                <span class="card-item-title">${lang.flag} ${lang.name}</span>
                <span class="card-item-badge">${cefrNames[lvl]}</span>
              </div>
              <div class="card-item-body">
                <div>Текущий уровень: <strong>${cefrNames[lvl]}</strong></div>
                <div>Стоимость курса: ${formatMoney(courseCost)}</div>
              </div>
              <div class="card-item-footer">
                ${lvl < 5 ? `
                  <button class="btn btn-edu btn-sm" onclick="learnLanguage('${lang.code}')">
                    Учить курс (+Уровень)
                  </button>
                ` : `
                  <span style="font-size: 11px; font-weight: 700; color: #2E6F5E;">✓ Свободный уровень</span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function doBabyActivity(type) {
  if (type === 'cubes') {
    gameState.intellect = clamp(gameState.intellect + 2);
    gameState.creativity = clamp(gameState.creativity + 2);
    showToast("🧱 Вы построили красивую башню из кубиков!");
  } else if (type === 'cartoons') {
    gameState.knowledge = clamp(gameState.knowledge + 2);
    gameState.happiness = clamp(gameState.happiness + 3);
    showToast("📺 Мультфильм про буквы поднял настроение!");
  } else if (type === 'words') {
    gameState.charisma = clamp(gameState.charisma + 2);
    gameState.relations = clamp(gameState.relations + 2);
    showToast("🗣️ Вы чётко произнесли новое длинное слово!");
  }
  render();
}

function doSchoolAction(action) {
  if (action === 'homework') {
    gameState.schoolGPA = Math.min(12.0, gameState.schoolGPA + 0.15);
    gameState.knowledge = clamp(gameState.knowledge + 2);
    gameState.stress = clamp(gameState.stress + 3);
    showToast("📚 Домашнее задание сделано на отлично! GPA повышен.");
  } else if (action === 'tutor') {
    const cost = Math.round(1500 * getCountryData().costIndex);
    if (gameState.money < cost) {
      showToast(`Недостаточно денег на репетитора! Требуется ${formatMoney(cost)}`);
      return;
    }
    gameState.money -= cost;
    gameState.schoolGPA = Math.min(12.0, gameState.schoolGPA + 0.35);
    gameState.intellect = clamp(gameState.intellect + 3);
    gameState.knowledge = clamp(gameState.knowledge + 3);
    showToast("🧑‍🏫 Занятие с репетитором прошло блестяще! Оценки растут.");
  } else if (action === 'olympiad') {
    if (gameState.intellect < 30) {
      showToast("Вам пока не хватает интеллекта (нужно 30+), чтобы пройти отбор на олимпиаду.");
      return;
    }
    gameState.schoolGPA = Math.min(12.0, gameState.schoolGPA + 0.4);
    gameState.happiness = clamp(gameState.happiness + 8);
    gameState.charisma = clamp(gameState.charisma + 4);
    showToast("🏆 Вы заняли призовое место на олимпиаде! Учителя аплодируют.");
  } else if (action === 'skip') {
    gameState.schoolGPA = Math.max(2.0, gameState.schoolGPA - 0.25);
    gameState.happiness = clamp(gameState.happiness + 6);
    gameState.relations = clamp(gameState.relations - 3);
    showToast("🎒 Вы весело провели время в парке вместо уроков.");
  }
  render();
}

function onUniCountryFilterChanged(val) {
  currentUniCountryFilter = val;
  renderEducationTab();
}

function enrollUniversity(uniId, accomm) {
  const uni = UNIVERSITIES.find(u => u.id === uniId);
  if (!uni) return;

  if (gameState.schoolGPA < uni.minGPA) {
    showToast(`Ваш GPA (${gameState.schoolGPA.toFixed(1)}) ниже минимального для поступления (${uni.minGPA})!`);
    return;
  }

  const langLvl = (gameState.languages && gameState.languages[uni.requiredLanguage]) || 0;
  if (langLvl < 2) {
    showToast(`Недостаточный уровень языка ${uni.requiredLanguage.toUpperCase()}! Выучите хотя бы до уровня A2/B1.`);
    return;
  }

  const uCountry = COUNTRIES.find(c => c.name === uni.country) || COUNTRIES[0];
  const hasScholarship = gameState.schoolGPA >= uni.scholarshipThreshold;

  if (!hasScholarship) {
    if (gameState.money < uni.tuition) {
      showToast(`Недостаточно средств для оплаты обучения! Требуется ${formatMoney(uni.tuition, uni.country)}.`);
      return;
    }
    gameState.money -= uni.tuition;
  }

  gameState.currentUniversity = {
    id: uni.id,
    name: uni.name,
    program: uni.program,
    country: uni.country,
    accomm: accomm
  };
  gameState.uniYear = 1;
  gameState.happiness = clamp(gameState.happiness + 20);

  addChronicle(`🎉 Зачисление в «${uni.name}»!`, `Вы успешно поступили на программу «${uni.program}». ${hasScholarship ? 'Благодаря высокому GPA вы получили стипендию!' : 'Первый год обучения оплачен.'}`, [{ label: 'Студент', type: 'tag-promo' }]);
  showToast(`🎉 Поздравляем! Вы студент «${uni.name}»!`);
  render();
}

function studyUniversityHard() {
  gameState.knowledge = clamp(gameState.knowledge + 4);
  gameState.intellect = clamp(gameState.intellect + 3);
  gameState.stress = clamp(gameState.stress + 5);
  showToast("📚 Сессия сдана на «отлично»! Преподаватели хвалят ваши успехи.");
  render();
}

function dropOutUniversity() {
  if (confirm("Вы точно хотите отчислиться из университета?")) {
    gameState.currentUniversity = null;
    gameState.uniYear = 0;
    addChronicle("🚪 Отчисление из университета", "Вы забрали документы из вуза, решив пойти своим путём.", [{ label: 'Отчисление', type: 'tag-expense' }]);
    showToast("Вы отчислились из университета.");
    render();
  }
}

function learnLanguage(langCode) {
  const cost = Math.round(2500 * getCountryData().costIndex);
  if (gameState.money < cost) {
    showToast(`Недостаточно денег на курс! Требуется ${formatMoney(cost)}`);
    return;
  }
  gameState.money -= cost;
  if (!gameState.languages) gameState.languages = {};
  const cur = gameState.languages[langCode] || 0;
  gameState.languages[langCode] = Math.min(5, cur + 1);
  gameState.intellect = clamp(gameState.intellect + 2);

  const langObj = LANGUAGES_DATA.find(l => l.code === langCode);
  const name = langObj ? langObj.name : langCode;
  showToast(`🌐 Уровень языка «${name}» повышен до ${gameState.languages[langCode]}!`);
  render();
}

// ── TAB 3: 💼 КАРЬЕРА (CAREER) ──
function renderCareerTab() {
  const container = document.getElementById('tab-career');
  if (!container) return;

  const age = gameState.age;

  if (age < 14) {
    container.innerHTML = `
      <div class="lock-banner">
        <div class="lock-icon">🔒</div>
        <div class="lock-title">Вам ещё рано работать (Возраст: ${age} лет)</div>
        <div class="lock-desc">Детство — прекрасное время для беззаботных игр, чтения книг и школы. Первые подработки откроются с 14 лет.</div>
      </div>
    `;
    return;
  }

  let html = '';

  // 1. Part-time jobs (Age 14-17)
  if (age >= 14 && age <= 17) {
    html += `
      <div class="panel-card">
        <div class="panel-title-row">
          <div class="panel-title">🚴 Подростковые подработки (Возраст 14-17)</div>
          <div class="panel-subtitle">Первый честный заработок и карманные деньги</div>
        </div>
        <div class="items-grid">
          ${PART_TIME_JOBS.map(job => {
            const wageFormatted = formatMoney(job.wage * getCountryData().costIndex);
            return `
              <div class="card-item">
                <div class="card-item-head">
                  <span class="card-item-title">${job.icon} ${job.title}</span>
                  <span class="card-item-badge">${wageFormatted}/смена</span>
                </div>
                <div class="card-item-body">
                  <div>Требования: базовые навыки</div>
                </div>
                <div class="card-item-footer">
                  <button class="btn btn-finance btn-sm" onclick="workPartTime('${job.id}')">
                    Отработать смену
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 2. Adult Careers (Age >= 18)
  if (age >= 18) {
    if (gameState.career) {
      const carObj = CAREERS.find(c => c.id === gameState.career);
      const lvl = carObj ? (carObj.levels[gameState.careerLevel] || carObj.levels[0]) : null;
      const salaryAnnual = carObj && lvl ? Math.round(carObj.baseSalary * lvl.salaryMult * getCountryData().costIndex * 12) : 0;
      const nextLvl = carObj && carObj.levels[gameState.careerLevel + 1];

      html += `
        <div class="panel-card" style="border: 2px solid var(--accent-finance);">
          <div class="panel-title-row">
            <div class="panel-title">${carObj ? carObj.icon : '💼'} Ваша профессия: ${lvl ? lvl.title : 'Специалист'}</div>
            <div class="panel-subtitle">Отрасль: ${carObj ? carObj.category : 'Карьера'} • Уровень: ${gameState.careerLevel + 1} из 5</div>
          </div>
          <div style="font-size: 14px; color: var(--text-primary); display: flex; flex-direction: column; gap: 4px;">
            <div>Годовой оклад: <strong style="color: var(--accent-finance);">${formatMoney(salaryAnnual)}</strong></div>
            ${nextLvl ? `<div>Следующая ступень: <strong>${nextLvl.title}</strong> (Зарплата x${nextLvl.salaryMult})</div>` : '<div>Вы достигли вершины карьеры!</div>'}
          </div>
          <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
            <button class="btn btn-finance btn-sm" onclick="workCareerShift()">💼 Отработать сверхурочную смену (+Бонус)</button>
            ${nextLvl ? `<button class="btn btn-primary btn-sm" onclick="askCareerPromotion()">⭐ Попросить повышение</button>` : ''}
            <button class="btn btn-outline btn-sm" onclick="quitCareer()">🚪 Уволиться</button>
          </div>
        </div>
      `;
    } else {
      // Careers catalog (25 careers)
      html += `
        <div class="panel-card">
          <div class="panel-title-row">
            <div class="panel-title">💼 Каталог профессий (25+ карьерных направлений)</div>
            <div class="panel-subtitle">Выберите своё призвание и начните путь к успеху</div>
          </div>
          <div class="items-grid">
            ${CAREERS.map(c => {
              const startLvl = c.levels[0];
              const salaryFormatted = formatMoney(c.baseSalary * startLvl.salaryMult * getCountryData().costIndex * 12);
              const reqText = Object.keys(startLvl.req).map(k => `${k} ${startLvl.req[k]}`).join(', ');
              const hasEdu = c.requiredEdu === 'none' || (gameState.education && gameState.education.length > 0);

              return `
                <div class="card-item">
                  <div class="card-item-head">
                    <span class="card-item-title">${c.icon} ${c.title}</span>
                    <span class="card-item-badge">${c.category}</span>
                  </div>
                  <div class="card-item-body">
                    <div><strong>Старт:</strong> ${startLvl.title}</div>
                    <div><strong>Начальный оклад:</strong> ${salaryFormatted}/год</div>
                    <div><strong>Требования:</strong> ${reqText}</div>
                    <div><strong>Образование:</strong> ${c.requiredEdu === 'higher' ? 'Высшее' : 'Любое'} ${hasEdu ? '✓' : '✕'}</div>
                  </div>
                  <div class="card-item-footer">
                    <button class="btn btn-finance btn-sm" onclick="applyCareer('${c.id}')">
                      Устроиться
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 3. Business Franchises
    html += `
      <div class="panel-card" style="margin-top: 14px;">
        <div class="panel-title-row">
          <div class="panel-title">🏢 Франшизы и Собственный бизнес</div>
          <div class="panel-subtitle">Инвестируйте в бизнес и получайте пассивный годовой доход</div>
        </div>
        <div class="items-grid">
          ${BUSINESS_TYPES.map(b => {
            const owned = (gameState.businesses || []).find(item => item.id === b.id);
            const costFormatted = formatMoney(b.cost * getCountryData().costIndex);
            const profitFormatted = formatMoney(b.annualProfit * getCountryData().costIndex);

            return `
              <div class="card-item">
                <div class="card-item-head">
                  <span class="card-item-title">${b.icon} ${b.name}</span>
                  <span class="card-item-badge">${owned ? `Ур. ${owned.level}` : 'Не открыт'}</span>
                </div>
                <div class="card-item-body">
                  <div>Стоимость франшизы: <strong>${costFormatted}</strong></div>
                  <div>Годовая прибыль: <strong style="color: #2E6F5E;">+${profitFormatted}/год</strong></div>
                </div>
                <div class="card-item-footer">
                  ${!owned ? `
                    <button class="btn btn-primary btn-sm" onclick="foundBusiness('${b.id}')">
                      Открыть бизнес
                    </button>
                  ` : `
                    <button class="btn btn-edu btn-sm" onclick="upgradeBusiness('${b.id}')">
                      Расширить филиал
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // 4. Investment Market
    html += `
      <div class="panel-card" style="margin-top: 14px;">
        <div class="panel-title-row">
          <div class="panel-title">📈 Фондовый и криптовалютный рынок</div>
          <div class="panel-subtitle">Управление инвестиционным портфелем</div>
        </div>
        <div class="items-grid">
          ${INVESTMENT_MARKET.map(asset => {
            const holding = (gameState.investments && gameState.investments[asset.id]) || { shares: 0, currentPrice: asset.basePrice };
            const curPrice = holding.currentPrice || asset.basePrice;
            const priceFormatted = formatMoney(curPrice * getCountryData().costIndex);
            const portfolioVal = Math.round(holding.shares * curPrice * getCountryData().costIndex);

            return `
              <div class="card-item">
                <div class="card-item-head">
                  <span class="card-item-title">${asset.icon} ${asset.name}</span>
                  <span class="card-item-badge">Риск: ${asset.risk}</span>
                </div>
                <div class="card-item-body">
                  <div>Цена за единицу: <strong>${priceFormatted}</strong></div>
                  <div>В вашем портфеле: <strong>${holding.shares} шт. (${formatMoney(portfolioVal)})</strong></div>
                </div>
                <div class="card-item-footer">
                  <button class="btn btn-finance btn-sm" onclick="buyInvestment('${asset.id}', 1)">
                    Купить 1 шт.
                  </button>
                  ${holding.shares > 0 ? `
                    <button class="btn btn-outline btn-sm" onclick="sellInvestment('${asset.id}', 1)">
                      Продать 1 шт.
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function workPartTime(jobId) {
  const job = PART_TIME_JOBS.find(j => j.id === jobId);
  if (!job) return;
  const pay = Math.round(job.wage * getCountryData().costIndex);
  gameState.money += pay;
  gameState.stress = clamp(gameState.stress + 4);
  gameState.happiness = clamp(gameState.happiness + 2);
  showToast(`🚴 Смена отработана! Получено ${formatMoney(pay)}.`);
  render();
}

function applyCareer(careerId) {
  const c = CAREERS.find(item => item.id === careerId);
  if (!c) return;
  const startLvl = c.levels[0];

  // Requirements check
  for (let key in startLvl.req) {
    if ((gameState[key] || 0) < startLvl.req[key]) {
      showToast(`Вам не хватает навыка ${key} (нужно ${startLvl.req[key]})!`);
      return;
    }
  }

  if (c.requiredEdu === 'higher' && (!gameState.education || gameState.education.length === 0)) {
    showToast("Для этой профессии требуется оконченное высшее образование!");
    return;
  }

  gameState.career = careerId;
  gameState.careerLevel = 0;
  gameState.outfitStyle = 'business';
  addChronicle(`💼 Новая работа: ${c.title}`, `Вы успешно прошли собеседование на должность «${startLvl.title}»!`, [{ label: 'Трудоустройство', type: 'tag-promo' }]);
  showToast(`🎉 Вы приняты на должность: ${startLvl.title}!`);
  render();
}

function workCareerShift() {
  if (!gameState.career) return;
  const c = CAREERS.find(item => item.id === gameState.career);
  if (!c) return;
  const lvl = c.levels[gameState.careerLevel] || c.levels[0];
  const bonus = Math.round(c.baseSalary * 0.15 * lvl.salaryMult * getCountryData().costIndex);

  gameState.money += bonus;
  gameState.stress = clamp(gameState.stress + 8);
  gameState.intellect = clamp(gameState.intellect + 1);
  showToast(`💼 Сверхурочная смена завершена! Премия: ${formatMoney(bonus)}.`);
  render();
}

function askCareerPromotion() {
  if (!gameState.career) return;
  const c = CAREERS.find(item => item.id === gameState.career);
  if (!c) return;
  const nextLvl = c.levels[gameState.careerLevel + 1];
  if (!nextLvl) {
    showToast("Вы уже на максимальной ступени этой профессии!");
    return;
  }

  for (let key in nextLvl.req) {
    if ((gameState[key] || 0) < nextLvl.req[key]) {
      showToast(`Для повышения требуется ${key} не менее ${nextLvl.req[key]}!`);
      return;
    }
  }

  gameState.careerLevel += 1;
  gameState.happiness = clamp(gameState.happiness + 15);
  addChronicle(`⭐ Повышение: ${nextLvl.title}!`, `Руководство отметило ваш вклад и повысило в должности до «${nextLvl.title}»! Оклад существенно увеличен.`, [{ label: 'Повышение', type: 'tag-promo' }]);
  showToast(`⭐ Поздравляем с повышением: ${nextLvl.title}!`);
  render();
}

function quitCareer() {
  if (confirm("Вы уверены, что хотите уволиться с текущей работы?")) {
    gameState.career = null;
    gameState.careerLevel = 0;
    addChronicle("🚪 Увольнение по собственному желанию", "Вы оставили свою прежнюю работу в поисках новых горизонтов.", [{ label: 'Увольнение', type: 'tag-expense' }]);
    showToast("Вы уволились с работы.");
    render();
  }
}

function foundBusiness(bizId) {
  const b = BUSINESS_TYPES.find(item => item.id === bizId);
  if (!b) return;
  const cost = Math.round(b.cost * getCountryData().costIndex);

  if (gameState.money < cost) {
    showToast(`Недостаточно средств для запуска бизнеса! Требуется ${formatMoney(cost)}`);
    return;
  }

  gameState.money -= cost;
  if (!gameState.businesses) gameState.businesses = [];
  gameState.businesses.push({ id: b.id, name: b.name, level: 1 });
  gameState.happiness = clamp(gameState.happiness + 15);
  addChronicle(`🏢 Открытие бизнеса: «${b.name}»!`, `Вы успешно запустили собственное предприятие. Первый филиал начал приносить стабильную прибыль.`, [{ label: 'Бизнес запущен', type: 'tag-promo' }]);
  showToast(`🏢 Поздравляем! Бизнес «${b.name}» открыт!`);
  render();
}

function upgradeBusiness(bizId) {
  const b = BUSINESS_TYPES.find(item => item.id === bizId);
  const owned = (gameState.businesses || []).find(item => item.id === bizId);
  if (!b || !owned) return;
  const cost = Math.round(b.cost * 0.6 * (owned.level || 1) * getCountryData().costIndex);

  if (gameState.money < cost) {
    showToast(`Недостаточно средств для расширения! Требуется ${formatMoney(cost)}`);
    return;
  }

  gameState.money -= cost;
  owned.level = (owned.level || 1) + 1;
  showToast(`🏢 Филиал «${b.name}» расширен до уровня ${owned.level}! Прибыль выросла.`);
  render();
}

function buyInvestment(assetId, amount) {
  const asset = INVESTMENT_MARKET.find(a => a.id === assetId);
  if (!asset) return;
  if (!gameState.investments) gameState.investments = {};
  if (!gameState.investments[assetId]) {
    gameState.investments[assetId] = { shares: 0, currentPrice: asset.basePrice };
  }
  const curPrice = gameState.investments[assetId].currentPrice || asset.basePrice;
  const totalCost = Math.round(curPrice * amount * getCountryData().costIndex);

  if (gameState.money < totalCost) {
    showToast(`Недостаточно средств для покупки! Требуется ${formatMoney(totalCost)}`);
    return;
  }

  gameState.money -= totalCost;
  gameState.investments[assetId].shares += amount;
  showToast(`📈 Куплено ${amount} шт. «${asset.name}»!`);
  render();
}

function sellInvestment(assetId, amount) {
  if (!gameState.investments || !gameState.investments[assetId]) return;
  const inv = gameState.investments[assetId];
  if (inv.shares < amount) {
    showToast("У вас нет такого количества активов для продажи!");
    return;
  }
  const curPrice = inv.currentPrice || INVESTMENT_MARKET.find(a => a.id === assetId).basePrice;
  const revenue = Math.round(curPrice * amount * getCountryData().costIndex);

  inv.shares -= amount;
  gameState.money += revenue;
  showToast(`📉 Продано ${amount} шт. Выручено: ${formatMoney(revenue)}.`);
  render();
}

// ── TAB 4: 🏠 АКТИВЫ (ASSETS) ──
function renderAssetsTab() {
  const container = document.getElementById('tab-assets');
  if (!container) return;

  const country = getCountryData();
  let html = '';

  // 1. Housing Section
  html += `
    <div class="panel-card">
      <div class="panel-title-row">
        <div class="panel-title">🏠 Недвижимость и Жильё</div>
        <div class="panel-subtitle">Текущий дом: ${HOUSING_CATALOG.find(h => h.id === gameState.house)?.name || 'Дом родителей'}</div>
      </div>
      <div class="items-grid">
        ${HOUSING_CATALOG.map(h => {
          const isCurrent = gameState.house === h.id;
          const rentFormatted = h.rent > 0 ? `${formatMoney(h.rent * country.costIndex)}/мес` : 'Бесплатно';
          const buyFormatted = h.buyPrice > 0 ? formatMoney(h.buyPrice * country.costIndex) : 'Не продается';

          return `
            <div class="card-item" style="${isCurrent ? 'border-color: var(--btn-green); background: #EFE8DC;' : ''}">
              <div class="card-item-head">
                <span class="card-item-title">${h.icon} ${h.name}</span>
                <span class="card-item-badge">${isCurrent ? 'Текущий дом' : `Комфорт: ${h.comfort}%`}</span>
              </div>
              <div class="card-item-body">
                <div>Аренда: <strong>${rentFormatted}</strong></div>
                <div>Покупка: <strong>${buyFormatted}</strong></div>
              </div>
              <div class="card-item-footer">
                ${!isCurrent ? `
                  ${h.rent > 0 ? `<button class="btn btn-outline btn-sm" onclick="changeHousing('${h.id}', false)">Снять</button>` : ''}
                  ${h.buyPrice > 0 ? `<button class="btn btn-primary btn-sm" onclick="changeHousing('${h.id}', true)">Купить</button>` : ''}
                  ${h.id === 'parents' ? `<button class="btn btn-outline btn-sm" onclick="changeHousing('parents', false)">Вернуться к родителям</button>` : ''}
                ` : `
                  <span style="font-size: 11px; font-weight: 700; color: #2E6F5E;">✓ Вы здесь живёте</span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // 2. Vehicles Section
  html += `
    <div class="panel-card" style="margin-top: 14px;">
      <div class="panel-title-row">
        <div class="panel-title">🚗 Транспорт и Автопарк</div>
        <div class="panel-subtitle">Скорость, комфорт и социальный статус</div>
      </div>
      <div class="items-grid">
        ${VEHICLES_CATALOG.map(v => {
          const isOwned = gameState.ownedVehicles && gameState.ownedVehicles.includes(v.id);
          const priceFormatted = formatMoney(v.price * country.costIndex);

          return `
            <div class="card-item">
              <div class="card-item-head">
                <span class="card-item-title">${v.icon} ${v.name}</span>
                <span class="card-item-badge">+${v.statusBonus} Статус</span>
              </div>
              <div class="card-item-body">
                <div>Стоимость: <strong>${priceFormatted}</strong></div>
              </div>
              <div class="card-item-footer">
                ${!isOwned ? `
                  <button class="btn btn-finance btn-sm" onclick="buyVehicle('${v.id}')">Купить</button>
                ` : `
                  <button class="btn btn-edu btn-sm" onclick="driveVehicle('${v.id}')">Прокатиться</button>
                  <button class="btn btn-outline btn-sm" onclick="sellVehicle('${v.id}')">Продать</button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // 3. Pets Section
  html += `
    <div class="panel-card" style="margin-top: 14px;">
      <div class="panel-title-row">
        <div class="panel-title">🐾 Домашние питомцы</div>
        <div class="panel-subtitle">Четвероногие друзья дарят радость и тепло</div>
      </div>
      <div class="items-grid">
        ${PETS_CATALOG.map(p => {
          const isAdopted = gameState.hasPet && gameState.activePetId === p.id;
          const priceFormatted = formatMoney(p.price * country.costIndex);
          const upkeepFormatted = formatMoney(p.upkeep * country.costIndex);

          return `
            <div class="card-item">
              <div class="card-item-head">
                <span class="card-item-title">${p.icon} ${p.name}</span>
                <span class="card-item-badge">${isAdopted ? 'Ваш питомец' : 'В приюте'}</span>
              </div>
              <div class="card-item-body">
                <div>Цена: <strong>${priceFormatted}</strong></div>
                <div>Уход: ${upkeepFormatted}/мес</div>
              </div>
              <div class="card-item-footer">
                ${!isAdopted ? `
                  <button class="btn btn-primary btn-sm" onclick="adoptPet('${p.id}')">Завести питомца</button>
                ` : `
                  <button class="btn btn-health btn-sm" onclick="interactPet('feed')">🍖 Покормить</button>
                  <button class="btn btn-edu btn-sm" onclick="interactPet('play')">🎾 Поиграть</button>
                  <button class="btn btn-outline btn-sm" onclick="interactPet('walk')">🦮 Выгулять</button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // 4. Tech & Brands
  html += `
    <div class="panel-card" style="margin-top: 14px;">
      <div class="panel-title-row">
        <div class="panel-title">💎 Технологии и Гардероб</div>
        <div class="panel-subtitle">Гаджеты ускоряют интеллект, бренды поднимают харизму</div>
      </div>
      <div class="items-grid">
        ${TECH_GADGETS.map(g => {
          const costFormatted = formatMoney(g.price * country.costIndex);
          return `
            <div class="card-item">
              <div class="card-item-head">
                <span class="card-item-title">${g.icon} ${g.name}</span>
                <span class="card-item-badge">+${g.intellectBonus} Интеллект</span>
              </div>
              <div class="card-item-body">
                <div>Цена: <strong>${costFormatted}</strong></div>
              </div>
              <div class="card-item-footer">
                <button class="btn btn-edu btn-sm" onclick="buyGadget('${g.id}')">Купить</button>
              </div>
            </div>
          `;
        }).join('')}
        ${BRANDS_CATALOG.map(b => {
          const costFormatted = formatMoney(b.price * country.costIndex);
          return `
            <div class="card-item">
              <div class="card-item-head">
                <span class="card-item-title">${b.icon} ${b.name}</span>
                <span class="card-item-badge">+${b.charismaBonus} Харизма</span>
              </div>
              <div class="card-item-body">
                <div>Цена: <strong>${costFormatted}</strong></div>
              </div>
              <div class="card-item-footer">
                <button class="btn btn-finance btn-sm" onclick="buyBrand('${b.id}')">Приобрести</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function changeHousing(houseId, isBuy) {
  const h = HOUSING_CATALOG.find(item => item.id === houseId);
  if (!h) return;
  const country = getCountryData();

  if (isBuy) {
    const buyPrice = Math.round(h.buyPrice * country.costIndex);
    if (gameState.money < buyPrice) {
      showToast(`Недостаточно средств для покупки жилья! Требуется ${formatMoney(buyPrice)}`);
      return;
    }
    gameState.money -= buyPrice;
    gameState.house = houseId;
    gameState.happiness = clamp(gameState.happiness + 20);
    addChronicle(`🏰 Покупка жилья: «${h.name}»!`, `Вы стали полноправным собственником прекрасной недвижимости. Счастье +20%.`, [{ label: 'Собственное жилье', type: 'tag-promo' }]);
    showToast(`🏰 Поздравляем! Вы купили: ${h.name}!`);
  } else {
    gameState.house = houseId;
    gameState.happiness = clamp(gameState.happiness + 5);
    showToast(`🏠 Вы переехали в: ${h.name}.`);
  }
  render();
}

function buyVehicle(vehId) {
  const v = VEHICLES_CATALOG.find(item => item.id === vehId);
  if (!v) return;
  const cost = Math.round(v.price * getCountryData().costIndex);

  if (gameState.money < cost) {
    showToast(`Недостаточно средств на покупку авто! Требуется ${formatMoney(cost)}`);
    return;
  }

  gameState.money -= cost;
  if (!gameState.ownedVehicles) gameState.ownedVehicles = [];
  gameState.ownedVehicles.push(v.id);
  gameState.charisma = clamp(gameState.charisma + v.statusBonus);
  gameState.happiness = clamp(gameState.happiness + 12);
  addChronicle(`🚗 Приобретение авто: «${v.name}»!`, `Вы сели за руль новенького транспорта. Харизма +${v.statusBonus}, счастье +12.`, [{ label: 'Новый транспорт', type: 'tag-promo' }]);
  showToast(`🚗 Поздравляем с покупкой: ${v.name}!`);
  render();
}

function sellVehicle(vehId) {
  const v = VEHICLES_CATALOG.find(item => item.id === vehId);
  if (!v) return;
  const refund = Math.round(v.price * 0.7 * getCountryData().costIndex);

  gameState.ownedVehicles = gameState.ownedVehicles.filter(id => id !== vehId);
  gameState.money += refund;
  showToast(`🚗 Вы продали ${v.name} за ${formatMoney(refund)}.`);
  render();
}

function driveVehicle(vehId) {
  const v = VEHICLES_CATALOG.find(item => item.id === vehId);
  if (!v) return;
  gameState.happiness = clamp(gameState.happiness + 6);
  gameState.stress = clamp(gameState.stress - 8);
  showToast(`🏎️ Вы с ветерком прокатились на «${v.name}»! Настроение на высоте.`);
  render();
}

function adoptPet(petId) {
  const p = PETS_CATALOG.find(item => item.id === petId);
  if (!p) return;
  const cost = Math.round(p.price * getCountryData().costIndex);

  if (gameState.money < cost) {
    showToast(`Недостаточно средств! Требуется ${formatMoney(cost)}`);
    return;
  }

  gameState.money -= cost;
  gameState.hasPet = true;
  gameState.activePetId = p.id;
  gameState.petName = p.name;
  gameState.happiness = clamp(gameState.happiness + 18);
  addChronicle(`🐾 Новый питомец: «${p.name}»!`, `В вашем доме появился верный друг. Счастье +18%.`, [{ label: 'Питомец', type: 'tag-promo' }]);
  showToast(`🐾 Вы завели питомца: ${p.name}!`);
  render();
}

function interactPet(action) {
  if (action === 'feed') {
    gameState.happiness = clamp(gameState.happiness + 4);
    showToast("🍖 Питомец с удовольствием поел и радостно потёрся о ваши ноги!");
  } else if (action === 'play') {
    gameState.happiness = clamp(gameState.happiness + 6);
    gameState.stress = clamp(gameState.stress - 6);
    showToast("🎾 Весёлая игра с питомцем подняла настроение!");
  } else if (action === 'walk') {
    gameState.health = clamp(gameState.health + 3);
    gameState.stress = clamp(gameState.stress - 8);
    showToast("🦮 Прогулка в парке на свежем воздухе прошла замечательно.");
  }
  render();
}

function buyGadget(gadgetId) {
  const g = TECH_GADGETS.find(item => item.id === gadgetId);
  if (!g) return;
  const cost = Math.round(g.price * getCountryData().costIndex);

  if (gameState.money < cost) {
    showToast(`Недостаточно средств на гаджет! Требуется ${formatMoney(cost)}`);
    return;
  }

  gameState.money -= cost;
  gameState.intellect = clamp(gameState.intellect + g.intellectBonus);
  gameState.happiness = clamp(gameState.happiness + 6);
  showToast(`📱 Вы приобрели «${g.name}»! Интеллект +${g.intellectBonus}.`);
  render();
}

function buyBrand(brandId) {
  const b = BRANDS_CATALOG.find(item => item.id === brandId);
  if (!b) return;
  const cost = Math.round(b.price * getCountryData().costIndex);

  if (gameState.money < cost) {
    showToast(`Недостаточно средств на гардероб! Требуется ${formatMoney(cost)}`);
    return;
  }

  gameState.money -= cost;
  gameState.charisma = clamp(gameState.charisma + b.charismaBonus);
  gameState.happiness = clamp(gameState.happiness + 8);
  gameState.outfitStyle = brandId === 'business_suit' ? 'business' : 'casual';
  showToast(`✨ Новый гардероб: «${b.name}»! Харизма +${b.charismaBonus}.`);
  render();
}

// ── TAB 5: 👥 СЕМЬЯ (FAMILY) ──
function renderFamilyTab() {
  const container = document.getElementById('tab-family');
  if (!container) return;

  let html = '';

  // 1. Parents Section
  html += `
    <div class="panel-card">
      <div class="panel-title-row">
        <div class="panel-title">👨‍👩‍👦 Родители</div>
        <div class="panel-subtitle">Отношения с семьёй: ${gameState.parentsRelations || 90}%</div>
      </div>
      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
        Отец и мать всегда готовы выслушать, поддержать мудрым советом или помочь в трудную минуту.
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-primary btn-sm" onclick="talkToParents()">💬 Поговорить по душам</button>
        ${gameState.age < 18 ? `<button class="btn btn-finance btn-sm" onclick="askParentsMoney()">💰 Попросить денег</button>` : ''}
        ${gameState.age >= 4 && gameState.age <= 17 ? `<button class="btn btn-edu btn-sm" onclick="askParentsPet()">🐾 Попросить питомца</button>` : ''}
        <button class="btn btn-outline btn-sm" onclick="giftParents()">🎁 Сделать подарок (2,000 ${getCountryData().currency})</button>
      </div>
    </div>
  `;

  // 2. Romance & Partner
  if (gameState.age >= 12) {
    html += `
      <div class="panel-card" style="margin-top: 14px;">
        <div class="panel-title-row">
          <div class="panel-title">❤️ Личная жизнь и Любовь</div>
          <div class="panel-subtitle">${gameState.partner ? (gameState.partner.isMarried ? 'В браке' : 'В отношениях') : 'В поиске'}</div>
        </div>
        ${!gameState.partner ? `
          <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">
            Вы пока свободны. Можно познакомиться в университете, приложении для знакомств или в кафе.
          </div>
          <button class="btn btn-health btn-sm" onclick="findDatingPartner()">
            💘 Познакомиться с кем-нибудь
          </button>
        ` : `
          <div style="font-size: 14px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px;">
            <div>Партнёр: <strong>${gameState.partner.name}</strong></div>
            <div>Отношения: <strong>${gameState.partner.relations}%</strong></div>
            <div>Вместе: <strong>${gameState.partner.yearsTogether || 1} лет</strong></div>
            <div>Статус: <strong>${gameState.partner.isMarried ? '💒 Счастливый законный брак' : 'Встречаетесь'}</strong></div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-health btn-sm" onclick="datePartner()">🌹 Сходить на свидание</button>
            ${!gameState.partner.isMarried && gameState.age >= 18 ? `
              <button class="btn btn-finance btn-sm" onclick="proposePartner()">💍 Сделать предложение</button>
            ` : ''}
            <button class="btn btn-outline btn-sm" onclick="breakupPartner()">💔 Расстаться</button>
          </div>
        `}
      </div>
    `;
  }

  // 3. Friends List
  html += `
    <div class="panel-card" style="margin-top: 14px;">
      <div class="panel-title-row">
        <div class="panel-title">🤝 Друзья и Знакомые</div>
        <div class="panel-subtitle">Ваш ближний круг общения</div>
      </div>
      <div class="items-grid">
        ${(gameState.friends || []).map(f => `
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">👤 ${f.name}</span>
              <span class="card-item-badge">${f.relations}% дружбы</span>
            </div>
            <div class="card-item-body">
              <div>Статус: ${f.status}</div>
            </div>
            <div class="card-item-footer">
              <button class="btn btn-primary btn-sm" onclick="hangoutFriend('${f.id}')">
                🍻 Потусоваться
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function talkToParents() {
  gameState.parentsRelations = Math.min(100, (gameState.parentsRelations || 90) + 8);
  gameState.happiness = clamp(gameState.happiness + 5);
  gameState.stress = clamp(gameState.stress - 6);
  showToast("💬 Тёплый душевный разговор с родителями подарил спокойствие.");
  render();
}

function askParentsMoney() {
  const roll = Math.random() * 100;
  if (roll <= (gameState.parentsRelations || 90)) {
    const cash = Math.round(800 * getCountryData().costIndex);
    gameState.money += cash;
    gameState.happiness = clamp(gameState.happiness + 6);
    showToast(`💰 Родители дали вам ${formatMoney(cash)} на карманные расходы!`);
  } else {
    showToast("Родители сказали: «Деньги на деревьях не растут, учись ценить труд!»");
  }
  render();
}

function askParentsPet() {
  if (gameState.hasPet) {
    showToast("У вас уже есть питомец в доме!");
    return;
  }
  if ((gameState.parentsRelations || 90) >= 80) {
    gameState.hasPet = true;
    gameState.activePetId = 'cat';
    gameState.petName = 'Кот Барсик';
    gameState.happiness = clamp(gameState.happiness + 25);
    addChronicle("🎁 Подарок от родителей: котёнок!", "Родители растрогались и разрешили завести котёнка! Счастье +25%.", [{ label: 'Питомец дома', type: 'tag-promo' }]);
    showToast("🎉 Родители согласились и подарили вам котёнка!");
  } else {
    showToast("Родители отказали: «Сначала подтяни учёбу и покажи ответственность!»");
  }
  render();
}

function giftParents() {
  const cost = Math.round(2000 * getCountryData().costIndex);
  if (gameState.money < cost) {
    showToast(`Недостаточно средств на подарок! Требуется ${formatMoney(cost)}`);
    return;
  }
  gameState.money -= cost;
  gameState.parentsRelations = 100;
  gameState.happiness = clamp(gameState.happiness + 10);
  showToast("🎁 Родители невероятно тронуты вашим вниманием и заботой!");
  render();
}

function findDatingPartner() {
  const namesPool = ["София", "Анна", "Максим", "Дарья", "Артём", "Екатерина", "Виктория", "Денис"];
  const partnerName = namesPool[Math.floor(Math.random() * namesPool.length)];

  gameState.partner = {
    name: partnerName,
    relations: 80,
    yearsTogether: 1,
    isMarried: false
  };
  gameState.happiness = clamp(gameState.happiness + 20);
  addChronicle(`💘 Новые отношения с ${partnerName}!`, `Между вами пробежала искра, вы начали встречаться. Счастье +20%.`, [{ label: 'Любовь', type: 'tag-promo' }]);
  showToast(`💘 Вы начали встречаться с: ${partnerName}!`);
  render();
}

function datePartner() {
  if (!gameState.partner) return;
  const cost = Math.round(1200 * getCountryData().costIndex);
  if (gameState.money >= cost) gameState.money -= cost;
  gameState.partner.relations = Math.min(100, gameState.partner.relations + 10);
  gameState.happiness = clamp(gameState.happiness + 8);
  gameState.stress = clamp(gameState.stress - 10);
  showToast(`🌹 Чудесный романтический вечер в ресторане с ${gameState.partner.name}!`);
  render();
}

function proposePartner() {
  if (!gameState.partner) return;
  if (gameState.partner.relations < 75) {
    showToast("Отношения ещё недостаточно крепкие для свадьбы (нужно 75%+).");
    return;
  }
  gameState.partner.isMarried = true;
  gameState.happiness = clamp(gameState.happiness + 35);
  addChronicle(`💒 Свадьба с ${gameState.partner.name}!`, `Вы сыграли пышную и красивую свадьбу в кругу самых близких людей! Счастье +35%.`, [{ label: 'Законный брак', type: 'tag-promo' }]);
  showToast(`💒 Горько! Вы официально связали себя узами брака с ${gameState.partner.name}!`);
  render();
}

function breakupPartner() {
  if (!gameState.partner) return;
  if (confirm(`Вы уверены, что хотите расстаться с ${gameState.partner.name}?`)) {
    addChronicle(`💔 Расставание с ${gameState.partner.name}`, "Ваши пути разошлись, но жизнь продолжается.", [{ label: 'Расставание', type: 'tag-expense' }]);
    gameState.partner = null;
    gameState.happiness = clamp(gameState.happiness - 15);
    showToast("Вы расстались с партнёром.");
    render();
  }
}

function hangoutFriend(friendId) {
  const f = (gameState.friends || []).find(item => item.id === friendId);
  if (!f) return;
  f.relations = Math.min(100, f.relations + 8);
  gameState.happiness = clamp(gameState.happiness + 6);
  gameState.stress = clamp(gameState.stress - 8);
  showToast(`🍻 Отличная тусовка с ${f.name}! Посмеялись и вспомнили былые времена.`);
  render();
}

// ── TAB 6: ⚔️ МИР (WORLD) ──
function renderWorldTab() {
  const container = document.getElementById('tab-world');
  if (!container) return;

  let html = '';

  // 1. Travel & Relocation
  html += `
    <div class="panel-card">
      <div class="panel-title-row">
        <div class="panel-title">✈️ Путешествия и Эмиграция на ПМЖ</div>
        <div class="panel-subtitle">Переезд в любую из 9 стран мира с изменением валюты и уровня жизни</div>
      </div>
      <div class="items-grid">
        ${COUNTRIES.map(c => {
          const isCurrent = gameState.country === c.name;
          const relocCost = Math.round(c.costIndex * 18000);

          return `
            <div class="card-item" style="${isCurrent ? 'border-color: var(--btn-green); background: #EFE8DC;' : ''}">
              <div class="card-item-head">
                <span class="card-item-title">${c.flag} ${c.name}</span>
                <span class="card-item-badge">Валюта: ${c.currency}</span>
              </div>
              <div class="card-item-body">
                <div>Средняя зарплата: <strong>${c.currency} ${c.avgSalary.toLocaleString('ru-RU')}</strong></div>
                <div>Индекс стоимости жизни: <strong>x${c.costIndex}</strong></div>
                <div>Крупные города: ${c.cities.join(', ')}</div>
                ${!isCurrent ? `<div>Стоимость переезда: <strong>${formatMoney(relocCost)}</strong></div>` : ''}
              </div>
              <div class="card-item-footer">
                ${!isCurrent ? `
                  <button class="btn btn-edu btn-sm" onclick="relocateToCountry('${c.name}', '${c.cities[0]}')">
                    Переехать на ПМЖ
                  </button>
                ` : `
                  <span style="font-size: 11px; font-weight: 700; color: #2E6F5E;">✓ Вы живёте здесь</span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // 2. Casino & Gambling (Age >= 18)
  if (gameState.age >= 18) {
    html += `
      <div class="panel-card" style="margin-top: 14px;">
        <div class="panel-title-row">
          <div class="panel-title">🎰 Казино и Азартные игры</div>
          <div class="panel-subtitle">Испытайте свою удачу и сорвите куш</div>
        </div>
        <div class="items-grid">
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">🔴 Рулетка (Красное / Чёрное)</span>
              <span class="card-item-badge">Выигрыш x2</span>
            </div>
            <div class="card-item-body">Классическое европейское колесо рулетки. Ставка: 1,000 ${getCountryData().currency}.</div>
            <div class="card-item-footer">
              <button class="btn btn-health btn-sm" onclick="playCasino('roulette', 1000, 'red')">Ставить на Красное</button>
              <button class="btn btn-outline btn-sm" onclick="playCasino('roulette', 1000, 'black')">Ставить на Чёрное</button>
            </div>
          </div>
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">🪙 Бросок монетки (Орёл / Решка)</span>
              <span class="card-item-badge">Выигрыш x2</span>
            </div>
            <div class="card-item-body">Быстрая игра 50 на 50. Ставка: 500 ${getCountryData().currency}.</div>
            <div class="card-item-footer">
              <button class="btn btn-finance btn-sm" onclick="playCasino('coin', 500, 'heads')">Орёл</button>
              <button class="btn btn-outline btn-sm" onclick="playCasino('coin', 500, 'tails')">Решка</button>
            </div>
          </div>
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">7️⃣7️⃣7️⃣ Слот-машина «Джекпот»</span>
              <span class="card-item-badge">Выигрыш x10</span>
            </div>
            <div class="card-item-body">Крутите барабаны за 300 ${getCountryData().currency} ради суперприза.</div>
            <div class="card-item-footer">
              <button class="btn btn-primary btn-sm" onclick="playCasino('slots', 300)">Крутить барабаны</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 3. Crime & Shadow Economy (Age >= 16)
  if (gameState.age >= 16) {
    html += `
      <div class="panel-card" style="margin-top: 14px;">
        <div class="panel-title-row">
          <div class="panel-title">🕶️ Теневая экономика и Криминал</div>
          <div class="panel-subtitle">Уровень розыска: ${'⭐'.repeat(gameState.wantedLevel || 0)}${'☆'.repeat(5 - (gameState.wantedLevel || 0))}</div>
        </div>
        <div class="items-grid">
          ${CRIMES.map(cr => {
            const rewardFormatted = formatMoney(cr.reward * getCountryData().costIndex);
            return `
              <div class="card-item">
                <div class="card-item-head">
                  <span class="card-item-title">${cr.icon} ${cr.name}</span>
                  <span class="card-item-badge" style="background: #F8D7DA; color: #842029;">Риск: ${cr.risk}%</span>
                </div>
                <div class="card-item-body">
                  <div>Куш: <strong style="color: #2E6F5E;">${rewardFormatted}</strong></div>
                  <div>Прирост розыска: +${cr.wantedGain} ⭐</div>
                </div>
                <div class="card-item-footer">
                  <button class="btn btn-health btn-sm" onclick="commitCrime('${cr.id}')">Пойти на дело</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${gameState.wantedLevel > 0 ? `
          <div style="margin-top: 10px;">
            <button class="btn btn-outline btn-sm" onclick="bribePolice()">
              👮 Дать взятку и очистить розыск (${formatMoney(gameState.wantedLevel * 10000 * getCountryData().costIndex)})
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 4. Political Career (Age >= 21)
  if (gameState.age >= 21) {
    const curRank = gameState.politicalPosition || 0;
    const nextTier = POLITICAL_TIERS[curRank];

    html += `
      <div class="panel-card" style="margin-top: 14px;">
        <div class="panel-title-row">
          <div class="panel-title">🏛️ Государственная и Политическая арена</div>
          <div class="panel-subtitle">Текущий пост: ${curRank > 0 ? POLITICAL_TIERS[curRank - 1].title : 'Обычный гражданин'}</div>
        </div>
        ${nextTier ? `
          <div style="font-size: 14px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px;">
            <div>Цель кампании: <strong>${nextTier.title}</strong></div>
            <div>Требуется харизмы: <strong>${nextTier.minCharisma}</strong> (У вас: ${gameState.charisma})</div>
            <div>Бюджет кампании: <strong>${formatMoney(nextTier.campaignCost * getCountryData().costIndex)}</strong></div>
          </div>
          <button class="btn btn-edu btn-sm" onclick="campaignPolitics()">
            🗳️ Начать предвыборную гонку
          </button>
        ` : `
          <div style="font-size: 14px; color: #2E6F5E; font-weight: 700;">
            👑 Вы возглавляете страну как Президент!
          </div>
        `}
      </div>
    `;
  }

  // 5. Social Factions
  html += `
    <div class="panel-card" style="margin-top: 14px;">
      <div class="panel-title-row">
        <div class="panel-title">🤝 Общественные клубы и Фракции</div>
        <div class="panel-subtitle">Связи, репутация и полезные привилегии</div>
      </div>
      <div class="items-grid">
        ${FACTIONS.map(f => `
          <div class="card-item">
            <div class="card-item-head">
              <span class="card-item-title">${f.icon} ${f.name}</span>
            </div>
            <div class="card-item-body">
              <div>${f.desc}</div>
            </div>
            <div class="card-item-footer">
              <button class="btn btn-primary btn-sm" onclick="joinFaction('${f.id}')">Вступить в клуб</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function relocateToCountry(countryName, cityName) {
  const target = COUNTRIES.find(c => c.name === countryName);
  if (!target) return;
  const cost = Math.round(target.costIndex * 18000);

  if (gameState.money < cost) {
    showToast(`Недостаточно средств для переезда! Требуется ${formatMoney(cost)}`);
    return;
  }

  gameState.money -= cost;
  gameState.country = target.name;
  gameState.city = cityName || target.cities[0];
  gameState.house = "studio"; // rented studio in new country
  gameState.happiness = clamp(gameState.happiness + 15);
  addChronicle(`✈️ Переезд в страну: ${target.name} (${gameState.city})!`, `Вы собрали чемоданы и начали новую главу жизни за границей! Новая валюта: ${target.currency}.`, [{ label: 'Эмиграция', type: 'tag-promo' }]);
  showToast(`✈️ Поздравляем с переездом в ${target.name} (${gameState.city})!`);
  render();
}

function playCasino(game, bet, choice) {
  if (gameState.money < bet) {
    showToast(`Недостаточно фишек для ставки! Требуется ${formatMoney(bet)}`);
    return;
  }
  gameState.money -= bet;

  if (game === 'roulette') {
    const isRed = Math.random() < 0.48; // slight house edge
    const won = (choice === 'red' && isRed) || (choice === 'black' && !isRed);
    if (won) {
      const payout = bet * 2;
      gameState.money += payout;
      gameState.happiness = clamp(gameState.happiness + 10);
      showToast(`🔴 Выпало: ${isRed ? 'КРАСНОЕ' : 'ЧЁРНОЕ'}! Вы выиграли ${formatMoney(payout)}!`);
    } else {
      gameState.happiness = clamp(gameState.happiness - 5);
      showToast(`⚫ Выпало: ${isRed ? 'КРАСНОЕ' : 'ЧЁРНОЕ'}. Ставка проиграла.`);
    }
  } else if (game === 'coin') {
    const isHeads = Math.random() < 0.5;
    const won = (choice === 'heads' && isHeads) || (choice === 'tails' && !isHeads);
    if (won) {
      const payout = bet * 2;
      gameState.money += payout;
      showToast(`🪙 Монетка: ${isHeads ? 'ОРЁЛ' : 'РЕШКА'}! Выигрыш: ${formatMoney(payout)}!`);
    } else {
      showToast(`🪙 Монетка: ${isHeads ? 'ОРЁЛ' : 'РЕШКА'}. Ставка проиграна.`);
    }
  } else if (game === 'slots') {
    const roll = Math.random();
    if (roll < 0.12) {
      // Jackpot!
      const payout = bet * 10;
      gameState.money += payout;
      gameState.happiness = clamp(gameState.happiness + 30);
      showToast(`🎉 7️⃣7️⃣7️⃣ ДЖЕКПОТ! Вы выиграли ${formatMoney(payout)}!`);
    } else {
      showToast("🎰 Барабаны прокрутились: увы, комбинация не совпала.");
    }
  }
  render();
}

function commitCrime(crimeId) {
  const cr = CRIMES.find(c => c.id === crimeId);
  if (!cr) return;

  const roll = Math.random() * 100;
  if (roll > cr.risk) {
    // Success
    const reward = Math.round(cr.reward * getCountryData().costIndex);
    gameState.money += reward;
    gameState.wantedLevel = Math.min(5, (gameState.wantedLevel || 0) + cr.wantedGain);
    gameState.happiness = clamp(gameState.happiness + 8);
    showToast(`🕶️ Дело выгорело! Куш: ${formatMoney(reward)}. Розыск +${cr.wantedGain} ⭐.`);
  } else {
    // Caught!
    const fine = Math.round(cr.reward * 1.5 * getCountryData().costIndex);
    gameState.money -= fine;
    gameState.wantedLevel = Math.min(5, (gameState.wantedLevel || 0) + 2);
    gameState.health = clamp(gameState.health - 12);
    gameState.happiness = clamp(gameState.happiness - 20);
    showToast(`🚨 Облава полиции! Вас поймали, выписали штраф ${formatMoney(fine)} и поставили на учёт.`);
  }
  render();
}

function bribePolice() {
  const cost = Math.round((gameState.wantedLevel || 1) * 10000 * getCountryData().costIndex);
  if (gameState.money < cost) {
    showToast(`Недостаточно средств для взятки! Требуется ${formatMoney(cost)}`);
    return;
  }
  gameState.money -= cost;
  gameState.wantedLevel = 0;
  showToast("👮 Досье очищено, претензии полиции сняты.");
  render();
}

function campaignPolitics() {
  const curRank = gameState.politicalPosition || 0;
  const tier = POLITICAL_TIERS[curRank];
  if (!tier) return;
  const cost = Math.round(tier.campaignCost * getCountryData().costIndex);

  if (gameState.money < cost) {
    showToast(`Недостаточно средств для избирательной кампании! Требуется ${formatMoney(cost)}`);
    return;
  }
  if (gameState.charisma < tier.minCharisma) {
    showToast(`Недостаточно харизмы для этого поста! Требуется ${tier.minCharisma}.`);
    return;
  }

  gameState.money -= cost;
  gameState.politicalPosition = curRank + 1;
  gameState.happiness = clamp(gameState.happiness + 25);
  addChronicle(`🏛️ Избрание на пост: «${tier.title}»!`, `Вы победили на выборах и вступили в должность «${tier.title}»! Влияние и уважение в обществе на пике.`, [{ label: 'Победа на выборах', type: 'tag-promo' }]);
  showToast(`🏛️ Ура! Вы избраны на пост: ${tier.title}!`);
  render();
}

function joinFaction(factionId) {
  const f = FACTIONS.find(item => item.id === factionId);
  if (!f) return;
  gameState.happiness = clamp(gameState.happiness + 10);
  gameState.relations = clamp(gameState.relations + 8);
  showToast(`🤝 Вы приняты в ряды клуба «${f.name}»!`);
  render();
}
