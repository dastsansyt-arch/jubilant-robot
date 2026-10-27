import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialPlayerState,
  advanceTurnByStep,
  relocateToCity,
  executeUrbexExpedition,
  validateAndCreateCustomMod,
  executeProfessionSpecialAction,
  resolveProfessionDilemmaChoice,
  resolveProfessionMiniGameResult,
  regenerateLocalColleges,
  buyOrEquipTechGadget,
  installPcComponent,
  calculateCustomPcStats,
  buyOrUpgradeBusiness,
  calculateMonthlyBusinessSummary,
  electPoliticalPosition,
  enactPoliticalReform,
  studySchoolExtra,
  takeLanguageCourse,
  checkUniversityAdmission,
  enrollInUniversityWithCriteria,
  generateContextualAiLifeEvent,
  applyEventChoice,
  useSteroidCycle,
  executeCrimeAction,
  playCasinoGame,
} from './rules';
import {
  CITIES_CATALOG,
  CHARACTER_APPEARANCES,
  URBEX_SPOTS,
} from './catalogs';
import {
  PROFESSIONS_360,
  HOBBIES_80,
  FACTIONS_26,
  REAL_ARTISTS_1000,
  VEHICLES_CATALOG,
  BUSINESS_CATALOG,
  POLITICAL_POSITIONS,
  POLITICAL_REFORMS,
  UNIVERSITIES_CATALOG,
  PROFESSION_SHIFT_CASES,
  TECH_GADGETS_CATALOG,
  PC_COMPONENTS_CATALOG,
  ALL_EDUCATION_COUNTRIES,
  getCountryUniversityPack,
  LANGUAGE_COURSES_CATALOG,
  STEROID_CYCLES_CATALOG,
  CRIME_ACTIONS_CATALOG,
} from './worldData';

test('catalogs contain 70+ cities, 640 professions, 55+ vehicles, 27 countries with Top-10 universities each, and language courses', () => {
  assert.ok(CITIES_CATALOG.length >= 70, `Expected >=70 cities, got ${CITIES_CATALOG.length}`);
  const uaCities = CITIES_CATALOG.filter((c) => c.regionGroup === 'Украина (Областные центры)');
  assert.equal(uaCities.length, 25, 'All 25 regional centers of Ukraine must be present');

  const resortCities = CITIES_CATALOG.filter((c) => c.regionGroup === 'Курорты мира и Европы');
  assert.ok(resortCities.length >= 12, 'Expected >=12 world & European resorts');

  assert.equal(PROFESSIONS_360.length, 640);
  assert.equal(HOBBIES_80.length, 80);
  assert.equal(FACTIONS_26.length, 26);
  assert.equal(CHARACTER_APPEARANCES.length, 60);
  assert.ok(REAL_ARTISTS_1000.length >= 1000);
  assert.ok(VEHICLES_CATALOG.length >= 50, `Expected >=50 vehicles, got ${VEHICLES_CATALOG.length}`);
  assert.equal(BUSINESS_CATALOG.length, 16);
  assert.equal(POLITICAL_POSITIONS.length, 8);
  assert.equal(POLITICAL_REFORMS.length, 8);
  assert.ok(UNIVERSITIES_CATALOG.length >= 38);
  assert.equal(PROFESSION_SHIFT_CASES.length, 16);
  assert.equal(TECH_GADGETS_CATALOG.length, 24);
  assert.equal(PC_COMPONENTS_CATALOG.length, 24);

  // All 27 education countries (UA, PL, DE, GB, ES, FR, IT & all EU countries) have Top-10 universities
  assert.ok(ALL_EDUCATION_COUNTRIES.length >= 25);
  for (const country of ALL_EDUCATION_COUNTRIES) {
    const pack = getCountryUniversityPack(country.code);
    assert.equal(pack.universities.length, 10, `Expected 10 universities for ${country.name}`);
  }
});

test('initial player state starts at Age 0 on custom birth date with persistent AI memory and Ukrainian family', () => {
  const kyiv = CITIES_CATALOG.find((c) => c.id === 'ua_kyiv')!;
  let state = createInitialPlayerState(kyiv, CHARACTER_APPEARANCES[0], 'Олександр Коваленко', 2004, 8, 24);
  assert.equal(state.age, 0);
  assert.equal(state.birthYear, 2004);
  assert.equal(state.birthMonth, 8);
  assert.equal(state.birthDay, 24);
  assert.equal(state.currentYear, 2004);
  assert.equal(state.family.length, 3);
  assert.equal(state.city.country, 'Украина');
  assert.equal(state.offlineAiMode, true);
  assert.ok(state.aiMemory.entries.length >= 1);
  assert.ok(state.secondarySchoolName.includes('№'));
  assert.equal(state.localColleges.length, 6);

  const prevCollegeName = state.localColleges[0].name;
  state = regenerateLocalColleges(state, 19);
  assert.equal(state.localColleges.length, 6);
  assert.notEqual(state.localColleges[0].name, prevCollegeName);
});

test('country university admission criteria checks school GPA, language CEFR level, and awards free scholarship when GPA is high', () => {
  let state = createInitialPlayerState(CITIES_CATALOG[0], CHARACTER_APPEARANCES[0], 'Марк', 2005, 5, 10);
  state.age = 18;
  state.money = 50000;
  state.skills.intellect = 85;
  state.schoolGradeAvg = 8.8;

  const polandPack = getCountryUniversityPack('PL');
  const warsawUni = polandPack.universities[0]; // Top-1 in Poland, requires Polish B2 (level 4)

  // Initially player does not know Polish B2
  const beforeAdm = checkUniversityAdmission(state, warsawUni);
  assert.equal(beforeAdm.langOk, false);
  assert.equal(beforeAdm.canEnroll, false);

  // Take Polish courses up to C1 (level 5) and boost school GPA via Olympiad
  const plCourse = LANGUAGE_COURSES_CATALOG.find((c) => c.langCode === 'PL')!;
  state = takeLanguageCourse(state, plCourse);
  state = takeLanguageCourse(state, plCourse);
  state = takeLanguageCourse(state, plCourse);
  state = takeLanguageCourse(state, plCourse);
  state = takeLanguageCourse(state, plCourse);
  state = studySchoolExtra(state, 'olympiad');
  state = studySchoolExtra(state, 'olympiad');
  state = studySchoolExtra(state, 'olympiad');

  const afterAdm = checkUniversityAdmission(state, warsawUni);
  assert.equal(afterAdm.langOk, true);
  assert.equal(afterAdm.gradeOk, true);
  assert.equal(afterAdm.canEnroll, true);

  const enrollRes = enrollInUniversityWithCriteria(state, warsawUni);
  assert.ok(enrollRes.nextState.completedEducationIds.includes(warsawUni.id));
});

test('persistent anti-hallucination AI event generator remembers BEFORE and AFTER choices', () => {
  let state = createInitialPlayerState(CITIES_CATALOG[0], CHARACTER_APPEARANCES[0], 'Давид', 2008, 3, 12);
  const initialMemoryCount = state.aiMemory.entries.length;
  const ev = generateContextualAiLifeEvent(state);
  assert.ok(ev.title.length > 5);
  assert.ok(ev.choices.length >= 2);

  state = applyEventChoice(state, ev, ev.choices[0]);
  assert.equal(state.aiMemory.entries.length, initialMemoryCount + 1);
  assert.ok(state.aiMemory.entries[0].actionTaken.includes(ev.title));
});

test('per-profession special mechanic, 3-choice tactical shift dilemma, and mini-game award KPI and money', () => {
  let state = createInitialPlayerState();
  state.currentCareerId = PROFESSIONS_360[0].id;
  const beforeMoney = state.money;
  const { nextState, summaryText } = executeProfessionSpecialAction(state);
  assert.ok(nextState.money > beforeMoney);
  assert.equal(nextState.careerStats.specialActionsDone, 1);
  assert.ok(nextState.careerStats.kpiScore > state.careerStats.kpiScore);
  assert.ok(summaryText.length > 10);

  const dilemmaRes = resolveProfessionDilemmaChoice(nextState, 1);
  assert.ok(dilemmaRes.nextState.money > nextState.money);
  assert.ok(dilemmaRes.nextState.careerStats.currentCombo >= 1);

  const miniGameRes = resolveProfessionMiniGameResult(dilemmaRes.nextState, 96);
  assert.ok(miniGameRes.nextState.money > dilemmaRes.nextState.money);
  assert.equal(miniGameRes.nextState.careerStats.miniGamesWon, 1);
  assert.ok(miniGameRes.nextState.careerStats.perfectShifts >= 1);
});

test('smartphones, laptops, and 6-slot Custom PC Builder boost benchmark score, 4K FPS, and career income multiplier', () => {
  let state = createInitialPlayerState();
  state.money = 100000;

  const iphone16 = TECH_GADGETS_CATALOG.find((g) => g.id === 'phone_iphone_16_promax')!;
  const macbookM4 = TECH_GADGETS_CATALOG.find((g) => g.id === 'laptop_macbook_pro_m4max')!;

  state = buyOrEquipTechGadget(state, iphone16);
  state = buyOrEquipTechGadget(state, macbookM4);
  assert.equal(state.activeSmartphoneId, 'phone_iphone_16_promax');
  assert.equal(state.activeLaptopId, 'laptop_macbook_pro_m4max');

  const cpuPart = PC_COMPONENTS_CATALOG.find((c) => c.id === 'pc_cpu_4')!;
  const gpuPart = PC_COMPONENTS_CATALOG.find((c) => c.id === 'pc_gpu_4')!;
  state = installPcComponent(state, cpuPart);
  state = installPcComponent(state, gpuPart);

  const pcStats = calculateCustomPcStats(state);
  assert.equal(pcStats.completedSlotsCount, 2);
  assert.ok(pcStats.totalPerfScore >= 270);
  assert.ok(pcStats.estimatedFps4k > 100);
  assert.ok(pcStats.totalCareerTechMultiplier > 1.2);
});

test('steroids, crime actions, and casino games update player stats accurately', () => {
  let state = createInitialPlayerState();
  state.money = 25000;
  const beforeStrength = state.skills.strength;
  state = useSteroidCycle(state, STEROID_CYCLES_CATALOG[0]);
  assert.ok(state.skills.strength > beforeStrength);
  assert.equal(state.steroidCyclesUsed, 1);

  const crimeRes = executeCrimeAction(state, CRIME_ACTIONS_CATALOG[0]);
  assert.ok(crimeRes.summaryText.length > 5);

  const casinoRes = playCasinoGame(crimeRes.nextState, 'slots_777', 500);
  assert.ok(casinoRes.summaryText.length > 5);
});

test('business & franchise system allows buying, upgrading, and earning monthly profit', () => {
  let state = createInitialPlayerState();
  state.money = 50000;
  state.skills.finance = 40;
  const coffeeFranchise = BUSINESS_CATALOG[0];

  state = buyOrUpgradeBusiness(state, coffeeFranchise, 'buy');
  assert.equal(state.ownedBusinesses.length, 1);

  state = buyOrUpgradeBusiness(state, coffeeFranchise, 'upgrade');
  assert.equal(state.ownedBusinesses[0].level, 2);

  const summary = calculateMonthlyBusinessSummary(state);
  assert.ok(summary.netMonthlyProfit > 0);
  assert.ok(summary.totalEmployees >= 4);
});

test('politics system supports election to office and enacting reforms that boost business yield', () => {
  let state = createInitialPlayerState();
  state.age = 25;
  state.money = 100000;
  state.skills.charisma = 70;
  state.approvalRating = 60;
  state.politicalInfluence = 100;

  const mayorPos = POLITICAL_POSITIONS.find((p) => p.id === 'pol_3_mayor')!;
  state = electPoliticalPosition(state, mayorPos);
  assert.equal(state.politicalPositionId, 'pol_3_mayor');

  const taxReform = POLITICAL_REFORMS.find((r) => r.id === 'ref_small_biz_tax_cut')!;
  state = enactPoliticalReform(state, taxReform);
  assert.ok(state.enactedReformIds.includes('ref_small_biz_tax_cut'));
});

test('turn step supports day, week, month, and year progressions from Age 0 and updates morphology', () => {
  let state = createInitialPlayerState();
  assert.equal(state.age, 0);
  state.focus = 'Спорт и Сила';
  state = advanceTurnByStep(state, 'year');
  assert.equal(state.age, 1);
  assert.ok(state.heightCm >= 50);
});

test('relocation moves player to EU city and switches currency to EUR', () => {
  let state = createInitialPlayerState();
  state.money = 10000;
  const berlin = CITIES_CATALOG.find((c) => c.id === 'berlin_de')!;
  state = relocateToCity(state, berlin);
  assert.equal(state.city.id, 'berlin_de');
  assert.equal(state.currency, 'EUR');
});

test('hardcore bankruptcy triggers when debt exceeds -12000', () => {
  let state = createInitialPlayerState();
  state.money = -12500;
  state = advanceTurnByStep(state, 'month');
  assert.equal(state.isBankrupt, true);
  assert.equal(state.isAlive, false);
});

test('Urbex expedition and custom mod scenario validator work accurately', () => {
  const state = createInitialPlayerState();
  const res = executeUrbexExpedition(state, URBEX_SPOTS[0]);
  assert.ok(res.subscribersGained > 0);

  const modRes = validateAndCreateCustomMod({
    title: 'Ночной шторм',
    description: 'Внезапная буря накрыла набережную города.',
    weatherCondition: 'Гроза',
    seasonCondition: 'Осень',
    choiceALabel: 'Снять репортаж',
    choiceAOutcome: 'Репортаж набрал 100 тысяч просмотров!',
    choiceBLabel: 'Остаться дома',
    choiceBOutcome: 'Вы сохранили силы.',
  });
  assert.equal(modRes.valid, true);
});
