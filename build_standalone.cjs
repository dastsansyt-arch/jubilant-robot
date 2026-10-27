const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'standalone_src');
const outputFile = path.join(__dirname, 'lifesim_ex_standalone.html');

console.log('Reading standalone components...');
const css = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf-8');
const dataJs = fs.readFileSync(path.join(srcDir, 'data.js'), 'utf-8');
const charSvgJs = fs.readFileSync(path.join(srcDir, 'character_svg.js'), 'utf-8');
const engineJs = fs.readFileSync(path.join(srcDir, 'engine.js'), 'utf-8');
const uiRenderJs = fs.readFileSync(path.join(srcDir, 'ui_render.js'), 'utf-8');

const htmlBody = `
  <!-- Toast Notification Container -->
  <div id="toast-container"></div>

  <!-- Modal Overlay -->
  <div class="modal-overlay" id="modal-overlay" onclick="if(event.target === this) closeModal()">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title" id="modal-title">Заголовок</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body" id="modal-body"></div>
    </div>
  </div>

  <!-- Hidden File Input for Save Import -->
  <input type="file" id="import-file-input" style="display:none" onchange="importSave(event)" accept=".json">

  <!-- Main App Container -->
  <div id="app-container">
    <!-- Header -->
    <header class="app-header">
      <div class="logo-area">
        <span class="logo-icon">🧬</span>
        <span class="logo-title">LIFE SIMULATOR EX</span>
        <span class="logo-badge">PRO EDITION</span>
      </div>
      <div class="header-controls">
        <button class="btn btn-header btn-sm" onclick="saveGame()">💾 Сохранить</button>
        <button class="btn btn-header btn-sm" onclick="loadGame()">📂 Загрузить</button>
        <button class="btn btn-header btn-sm" onclick="exportSave()">📤 Экспорт</button>
        <button class="btn btn-header btn-sm" onclick="document.getElementById('import-file-input').click()">📥 Импорт</button>
        <button class="btn btn-header btn-sm" onclick="resetGame()">🔄 Новая жизнь</button>
      </div>
    </header>

    <!-- Character Hero Card & Core Stats -->
    <div class="char-hero-card">
      <div class="char-main-row">
        <div class="char-avatar-box" id="char-avatar-container"></div>
        <div class="char-info-col">
          <div class="char-name-line">
            <span class="char-fullname" id="char-name-display">Алексей</span>
            <span class="char-age-badge" id="char-age-badge">0 лет</span>
          </div>
          <div class="char-sub-info" id="char-meta-display">
            <span>📅 2008 г. (Зима)</span>
            <span>🇺🇦 Киев, Украина</span>
            <span>📖 Глава I: Рождение</span>
          </div>
          <div class="char-money-display" id="char-money-display">₴ 500</div>
          <div class="char-focus-box">
            <label>Фокус года:</label>
            <select class="char-focus-select" id="char-focus-select" onchange="onFocusChanged(this.value)"></select>
          </div>
        </div>
      </div>

      <!-- Advance Year Big Button -->
      <button class="btn btn-cta-next" onclick="advanceYear()">⏩ Следующий год</button>

      <!-- Stats Grid -->
      <div class="stats-container">
        <div class="core-stats-grid">
          <div class="stat-card">
            <div class="stat-head">
              <span>❤️ Здоровье</span>
              <span class="stat-val" id="val-health">95%</span>
            </div>
            <div class="stat-bar-outer">
              <div class="stat-bar-inner bar-health" id="bar-health" style="width: 95%;"></div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-head">
              <span>😊 Счастье</span>
              <span class="stat-val" id="val-happy">90%</span>
            </div>
            <div class="stat-bar-outer">
              <div class="stat-bar-inner bar-happy" id="bar-happy" style="width: 90%;"></div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-head">
              <span>🧠 Знания</span>
              <span class="stat-val" id="val-knowledge">20%</span>
            </div>
            <div class="stat-bar-outer">
              <div class="stat-bar-inner bar-knowledge" id="bar-knowledge" style="width: 20%;"></div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-head">
              <span>🤝 Отношения</span>
              <span class="stat-val" id="val-relations">80%</span>
            </div>
            <div class="stat-bar-outer">
              <div class="stat-bar-inner bar-relations" id="bar-relations" style="width: 80%;"></div>
            </div>
          </div>
        </div>

        <div class="skills-row">
          <div class="skill-pill">
            <span>💪 Сила</span>
            <span class="val" id="val-skill-strength">10</span>
          </div>
          <div class="skill-pill">
            <span>🏋️ Мышцы</span>
            <span class="val" id="val-skill-muscle">10</span>
          </div>
          <div class="skill-pill">
            <span>✨ Харизма</span>
            <span class="val" id="val-skill-charisma">20</span>
          </div>
          <div class="skill-pill">
            <span>💡 Интеллект</span>
            <span class="val" id="val-skill-intellect">15</span>
          </div>
          <div class="skill-pill">
            <span>📈 Финансы</span>
            <span class="val" id="val-skill-finance">10</span>
          </div>
          <div class="skill-pill">
            <span>🎨 Креатив</span>
            <span class="val" id="val-skill-creativity">15</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 1: 📖 ЛЕТОПИСЬ -->
    <div class="tab-content active" id="tab-chronicle">
      <!-- Quick Actions -->
      <div class="panel-card">
        <div class="panel-title-row">
          <div class="panel-title">⚡ Быстрые действия и Спорт</div>
          <div class="panel-subtitle">Тренировки, социальная активность и отдых</div>
        </div>
        <div class="quick-actions-bar">
          <button class="btn btn-quick" onclick="trainGym()">
            <span class="icon">🏋️</span>
            <span>Силовая тренировка</span>
            <small style="color: var(--text-secondary); font-size: 10px;">+Мышцы, +Сила</small>
          </button>
          <button class="btn btn-quick" onclick="trainCardio()">
            <span class="icon">🏃</span>
            <span>Кардио / Бег</span>
            <small style="color: var(--text-secondary); font-size: 10px;">+Здоровье, -Стресс</small>
          </button>
          <button class="btn btn-quick" onclick="buySupplements()">
            <span class="icon">🥗</span>
            <span>Спортпит</span>
            <small style="color: var(--text-secondary); font-size: 10px;">Буст к пампу</small>
          </button>
          <button class="btn btn-quick" onclick="writeBlogPost()">
            <span class="icon">📱</span>
            <span>Пост в блог</span>
            <small style="color: var(--text-secondary); font-size: 10px;">+Подписчики</small>
          </button>
          <button class="btn btn-quick" onclick="goVacation()">
            <span class="icon">🏖️</span>
            <span>Мини-отпуск</span>
            <small style="color: var(--text-secondary); font-size: 10px;">+Счастье, -Стресс</small>
          </button>
        </div>
      </div>

      <!-- Quests -->
      <div class="panel-card">
        <div class="panel-title-row">
          <div class="panel-title">🏆 Жизненные цели и Достижения</div>
          <div class="panel-subtitle">Выполняйте квесты на протяжении жизни</div>
        </div>
        <div class="quests-grid" id="chronicle-quests"></div>
      </div>

      <!-- Chronicle Feed -->
      <div class="panel-card">
        <div class="panel-title-row">
          <div class="panel-title">📖 Летопись жизни</div>
          <div class="panel-subtitle">Хроника важнейших событий и решений</div>
        </div>
        <div class="chronicle-log" id="chronicle-feed"></div>
      </div>
    </div>

    <!-- TAB 2: 🎓 УЧЁБА -->
    <div class="tab-content" id="tab-education"></div>

    <!-- TAB 3: 💼 КАРЬЕРА -->
    <div class="tab-content" id="tab-career"></div>

    <!-- TAB 4: 🏠 АКТИВЫ -->
    <div class="tab-content" id="tab-assets"></div>

    <!-- TAB 5: 👥 СЕМЬЯ -->
    <div class="tab-content" id="tab-family"></div>

    <!-- TAB 6: ⚔️ МИР -->
    <div class="tab-content" id="tab-world"></div>
  </div>

  <!-- Bottom Navigation -->
  <nav class="bottom-nav">
    <div class="nav-container">
      <button class="nav-tab-btn active" id="btn-nav-chronicle" onclick="switchTab('chronicle')">
        <span class="nav-emoji">📖</span>
        <span>Летопись</span>
      </button>
      <button class="nav-tab-btn" id="btn-nav-education" onclick="switchTab('education')">
        <span class="nav-emoji">🎓</span>
        <span>Учёба</span>
      </button>
      <button class="nav-tab-btn" id="btn-nav-career" onclick="switchTab('career')">
        <span class="nav-emoji">💼</span>
        <span>Карьера</span>
      </button>
      <button class="nav-tab-btn" id="btn-nav-assets" onclick="switchTab('assets')">
        <span class="nav-emoji">🏠</span>
        <span>Активы</span>
      </button>
      <button class="nav-tab-btn" id="btn-nav-family" onclick="switchTab('family')">
        <span class="nav-emoji">👥</span>
        <span>Семья</span>
      </button>
      <button class="nav-tab-btn" id="btn-nav-world" onclick="switchTab('world')">
        <span class="nav-emoji">⚔️</span>
        <span>Мир</span>
      </button>
    </div>
  </nav>
`;

const completeHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="theme-color" content="#F4EFE6">
  <meta name="mobile-web-app-capable" content="yes">
  <title>Life Simulator EX</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
${css}
  </style>
</head>
<body>
${htmlBody}
  <script>
${dataJs}

${charSvgJs}

${engineJs}

${uiRenderJs}

    // Startup Initialization
    window.addEventListener('DOMContentLoaded', () => {
      if (!loadGame()) {
        saveGame();
      }
      render();
    });
  </script>
</body>
</html>
`;

console.log('Writing to:', outputFile);
fs.writeFileSync(outputFile, completeHtml, 'utf-8');
console.log('Build completed successfully!');
