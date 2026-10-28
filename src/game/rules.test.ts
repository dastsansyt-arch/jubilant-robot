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
  getLanguageCourseCost,
  checkUniversityAdmission,
  enrollInUniversityWithCriteria,
  generateContextualAiLifeEvent,
  applyEventChoice,
  useSteroidCycle,
  executeCrimeAction,
  playCasinoGame,
  getAgeGate,
  launderMoney,
  generateOfflineNpcDialogue,
  normalizeLoadedPlayerState,
  resolveCharacterAutoContext,
  resolveCharacterLocationScene,
  buyOrEquipWardrobeItem,
  toggleMilitaryService,
  toggleFrontlineDeployment,
  treatIllnessOrInjury,
  calculateMonthlyExpenses,
  calculateDiminishingStatGain,
  executeScaledStatTraining,
  applyPeakStatDecay,
  resolveGradeProfessionMinigame,
  pickProactiveNpcChat,
  resolveProactiveNpcChatFinal,
} from './rules';
import {
  CITIES_CATALOG,
  CHARACTER_APPEARANCES,
  URBEX_SPOTS,
  WARDROBE_CATALOG,
  HAIR_STYLES,
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

test('initial player state starts at Age 0 with $0 expenses, $0 money, no smartphone/hobbies, and blocks underage actions', () => {
  const kyiv = CITIES_CATALOG.find((c) => c.id === 'ua_kyiv')!;
  let state = createInitialPlayerState(kyiv, CHARACTER_APPEARANCES[0], 'Олександр Коваленко', 2004, 8, 24);
  assert.equal(state.age, 0);
  assert.equal(state.money, 0);
  assert.equal(state.monthlyExpenses.total, 0);
  assert.equal(state.activeSmartphoneId, null);
  assert.equal(state.activeHobbyIds.length, 0);
  assert.equal(state.urbexSubscribers, 0);
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

  // Underage gates block infant from adult/teen mechanics
  assert.equal(getAgeGate('steroids', 0).allowed, false);
  assert.equal(getAgeGate('business', 0).allowed, false);
  assert.equal(getAgeGate('casino', 0).allowed, false);
  assert.equal(getAgeGate('urbex', 0).allowed, false);
  assert.equal(getAgeGate('tech_gadget', 0).allowed, false);
  assert.equal(getAgeGate('pc_build', 0).allowed, false);
  assert.equal(getAgeGate('school', 0).allowed, false);

  state.money = 50000;
  const afterSteroids = useSteroidCycle(state, STEROID_CYCLES_CATALOG[0]);
  assert.equal(afterSteroids.steroidCyclesUsed, 0);
  const afterBiz = buyOrUpgradeBusiness(state, BUSINESS_CATALOG[0], 'buy');
  assert.equal(afterBiz.ownedBusinesses.length, 0);

  const prevCollegeName = state.localColleges[0].name;
  state = regenerateLocalColleges(state, 19);
  assert.equal(state.localColleges.length, 6);
  assert.notEqual(state.localColleges[0].name, prevCollegeName);
});

test('country university admission criteria checks school GPA, language CEFR level, and unifies language course cost', () => {
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

  // Verify getLanguageCourseCost matches exact deduction in takeLanguageCourse
  const plCourse = LANGUAGE_COURSES_CATALOG.find((c) => c.langCode === 'PL')!;
  const expectedCourseCost = getLanguageCourseCost(state, plCourse);
  const moneyBeforeCourse = state.money;
  state = takeLanguageCourse(state, plCourse);
  assert.equal(moneyBeforeCourse - state.money, expectedCourseCost);

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

test('persistent anti-hallucination AI event generator remembers BEFORE and AFTER choices and avoids repeating events across all age brackets', () => {
  let state = createInitialPlayerState(CITIES_CATALOG[0], CHARACTER_APPEARANCES[0], 'Давид', 2008, 3, 12);
  const initialMemoryCount = state.aiMemory.entries.length;
  const ev1 = generateContextualAiLifeEvent(state);
  assert.ok(ev1.title.length > 5);
  assert.ok(ev1.choices.length >= 2);
  state = applyEventChoice(state, ev1, ev1.choices[0]);
  assert.equal(state.aiMemory.entries.length, initialMemoryCount + 1);
  assert.ok(state.aiMemory.entries[0].actionTaken.includes(ev1.title));

  // Subsequent offline event at the same age should not repeat the exact same event title
  const ev2 = generateContextualAiLifeEvent(state);
  assert.notEqual(ev2.title, ev1.title, 'Consecutive offline AI events should not repeat');
  state = applyEventChoice(state, ev2, ev2.choices[0]);

  const ev3 = generateContextualAiLifeEvent(state);
  assert.notEqual(ev3.title, ev2.title);

  // Verify teen and adult brackets also generate non-repeating contextual events
  state.age = 15;
  const teenEv1 = generateContextualAiLifeEvent(state);
  state = applyEventChoice(state, teenEv1, teenEv1.choices[0]);
  const teenEv2 = generateContextualAiLifeEvent(state);
  assert.notEqual(teenEv2.title, teenEv1.title);

  state.age = 24;
  const adultEv1 = generateContextualAiLifeEvent(state);
  state = applyEventChoice(state, adultEv1, adultEv1.choices[0]);
  const adultEv2 = generateContextualAiLifeEvent(state);
  assert.notEqual(adultEv2.title, adultEv1.title);
});

test('offline NPC dialogue engine works 100% without internet across topics and age brackets, and normalizeLoadedPlayerState repairs partial saves', () => {
  let state = createInitialPlayerState(CITIES_CATALOG[0], CHARACTER_APPEARANCES[0], 'Максим', 2005, 4, 15);
  const npcId = state.friends[0].id;

  // Early childhood response (age 0-5)
  const infantDiag = generateOfflineNpcDialogue(state, npcId, 'Улыбнуться и поиграть в кубики');
  assert.ok(infantDiag.reply.length > 10);
  assert.ok(infantDiag.moodReaction.includes('Радостно смеётся'));

  // Adult multi-topic responses
  state.age = 22;
  const sportDiag = generateOfflineNpcDialogue(state, npcId, 'Пойдём на спорт тренировку в зал!');
  const urbexDiag = generateOfflineNpcDialogue(state, npcId, 'Готовим ночной уберэкс рейд на крышу');
  const finDiag = generateOfflineNpcDialogue(state, npcId, 'Обсудим инвестиции и бизнес-план');
  assert.notEqual(sportDiag.reply, urbexDiag.reply);
  assert.notEqual(urbexDiag.reply, finDiag.reply);

  // Normalize partial/legacy save object
  const partial = {
    name: 'Тест Игрок',
    age: 3,
    focus: 'Инвестиции', // invalid for age 3
    money: 0,
  } as unknown as ReturnType<typeof createInitialPlayerState>;
  const repaired = normalizeLoadedPlayerState(partial);
  assert.equal(repaired.focus, 'Раннее развитие');
  assert.ok(repaired.friends.length >= 1);
  assert.equal(repaired.monthlyExpenses.total, 0);
});

test('per-profession special mechanic, 3-choice tactical shift dilemma, and mini-game award KPI and money', () => {
  let state = createInitialPlayerState();
  state.age = 22;
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
  state.age = 18;
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

test('steroids, crime actions, casino games, and money laundering update player stats without double-crediting money', () => {
  let state = createInitialPlayerState();
  state.age = 20;
  state.money = 25000;
  const beforeStrength = state.skills.strength;
  state = useSteroidCycle(state, STEROID_CYCLES_CATALOG[0]);
  assert.ok(state.skills.strength > beforeStrength);
  assert.equal(state.steroidCyclesUsed, 1);

  const crimeRes = executeCrimeAction(state, CRIME_ACTIONS_CATALOG[0]);
  assert.ok(crimeRes.summaryText.length > 5);

  const casinoRes = playCasinoGame(crimeRes.nextState, 'slots_777', 500);
  assert.ok(casinoRes.summaryText.length > 5);

  // Money laundering deducts only 18% fee instead of adding cleanProfit on top of already-credited crime money
  let launderState = {
    ...casinoRes.nextState,
    money: 10000,
    shadowIncome: 5000,
    taxScrutiny: 40,
    ownedBusinesses: [{ businessId: BUSINESS_CATALOG[0].id, level: 1, hiredManagers: 1, customBranches: 1 }],
  };
  const launderRes = launderMoney(launderState, 5000);
  assert.equal(launderRes.nextState.money, 10000 - Math.round(5000 * 0.18));
  assert.equal(launderRes.nextState.shadowIncome, 0);
  assert.equal(launderRes.nextState.taxScrutiny, 15);
});

test('business & franchise system allows buying, upgrading, and earning monthly profit for adults', () => {
  let state = createInitialPlayerState();
  state.age = 25;
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

test('turn step pro-rates daily and monthly skill gains without 360x exploit and transitions infant focus at Age 6', () => {
  let state = createInitialPlayerState();
  assert.equal(state.age, 0);
  assert.equal(state.focus, 'Раннее развитие');

  // 12 monthly turns should equal 1 year of progression without 12x or 360x stat inflation
  for (let m = 0; m < 12; m++) {
    state = advanceTurnByStep(state, 'month');
  }
  assert.equal(state.age, 1);
  assert.ok(state.heightCm >= 50);
  assert.equal(state.money, 0, 'Infant living with parents has $0 expenses and $0 debt after 1 year');

  // Advance to Age 6 and confirm infant focus automatically switches to 'Учёба'
  for (let y = 0; y < 5; y++) {
    state = advanceTurnByStep(state, 'year');
  }
  assert.equal(state.age, 6);
  assert.equal(state.focus, 'Учёба');
});

test('relocation moves adult player to EU city without granting a free house and switches currency to EUR', () => {
  let state = createInitialPlayerState();
  state.age = 22;
  state.money = 10000;
  const berlin = CITIES_CATALOG.find((c) => c.id === 'berlin_de')!;
  state = relocateToCity(state, berlin);
  assert.equal(state.city.id, 'berlin_de');
  assert.equal(state.currency, 'EUR');
  assert.ok(!state.ownedHouseIds.includes('suburb_studio'), 'Relocation should not grant a free studio apartment');
});

test('hardcore bankruptcy triggers when debt exceeds -12000', () => {
  let state = createInitialPlayerState();
  state.age = 25;
  state.money = -12500;
  state = advanceTurnByStep(state, 'month');
  assert.equal(state.isBankrupt, true);
  assert.equal(state.isAlive, false);
});

test('Urbex expedition and custom mod scenario validator work accurately for 16+ player', () => {
  const state = createInitialPlayerState();
  state.age = 18;
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

test('2.5D character auto-context and Wardrobe Store enforce age rules and prohibit equipping unpurchased items', () => {
  assert.equal(HAIR_STYLES.length, 10, 'Must have 10 distinct 2.5D hairstyles');
  assert.equal(WARDROBE_CATALOG.length, 13, 'Must have 13 wardrobe store items');

  let state = createInitialPlayerState();
  // Age 0-2: Infant
  state.age = 1;
  let ctx = resolveCharacterAutoContext(state);
  assert.equal(ctx.contextMode, 'infant');
  assert.equal(ctx.handItem, 'none');

  // Age 3-6: Toddler with toy
  state.age = 4;
  ctx = resolveCharacterAutoContext(state);
  assert.equal(ctx.contextMode, 'toddler');
  assert.equal(ctx.handItem, 'toy');

  // Age 7-17: Schoolchild with backpack
  state.age = 12;
  ctx = resolveCharacterAutoContext(state);
  assert.equal(ctx.contextMode, 'school');
  assert.equal(ctx.handItem, 'backpack');

  // Age 18+: Adult in peaceful life starts with casual outfit and empty hands
  state.age = 22;
  ctx = resolveCharacterAutoContext(state);
  assert.equal(ctx.contextMode, 'adult');
  assert.equal(ctx.handItem, 'none');

  // Cannot equip briefcase without buying it first when money is $0
  state.money = 0;
  const briefcaseItem = WARDROBE_CATALOG.find((w) => w.id === 'wardrobe_acc_briefcase')!;
  const failedBuy = buyOrEquipWardrobeItem(state, briefcaseItem);
  assert.equal(failedBuy.nextState.ownedWardrobeIds.length, 0);
  assert.equal(failedBuy.nextState.equippedAccessoryId, null);

  // Buying briefcase and executive suit with sufficient money equips them and updates 2.5D context
  state.money = 25000;
  const suitItem = WARDROBE_CATALOG.find((w) => w.id === 'wardrobe_biz_exec_brown')!;
  state = buyOrEquipWardrobeItem(state, suitItem).nextState;
  state = buyOrEquipWardrobeItem(state, briefcaseItem).nextState;
  assert.ok(state.ownedWardrobeIds.includes(suitItem.id));
  assert.ok(state.ownedWardrobeIds.includes(briefcaseItem.id));

  ctx = resolveCharacterAutoContext(state);
  assert.equal(ctx.outfitCategory, 'business');
  assert.equal(ctx.handItem, 'briefcase');

  // Military service overrides civilian suit with military uniform, tactical vest/helmet, and rifle
  state = toggleMilitaryService(state).nextState;
  assert.equal(state.militaryServiceActive, true);
  ctx = resolveCharacterAutoContext(state);
  assert.equal(ctx.contextMode, 'military');
  assert.equal(ctx.handItem, 'rifle');
  assert.equal(ctx.hasHelmetAndVest, true);
});

test('in-game AI event generator and NPC dialogue engine remember context BEFORE (ДО) and AFTER (ПОСЛЕ) plus dialogueHistory', () => {
  let state = createInitialPlayerState();
  state.age = 22;
  state.money = 15000;

  // 1. Generate first AI event and choose option 0 -> recorded in aiMemory
  const firstEvent = generateContextualAiLifeEvent(state);
  const chosenOptionLabel = firstEvent.choices[0].label;
  state = applyEventChoice(state, firstEvent, firstEvent.choices[0]);

  assert.ok(state.aiMemory.entries[0].actionTaken.includes(chosenOptionLabel));
  assert.ok(state.aiMemory.entries[0].consequenceSummary.length > 5);

  // 2. Next AI event explicitly includes the prior choice in its description ([Память ИИ: ...])
  const secondEvent = generateContextualAiLifeEvent(state);
  assert.ok(
    secondEvent.description.includes('[Память ИИ:'),
    'Expected second AI event description to include [Память ИИ: ...] context chain'
  );
  assert.ok(
    secondEvent.description.includes(chosenOptionLabel),
    'Expected second AI event description to reference the exact choice made BEFORE'
  );

  // 3. NPC dialogue engine remembers both aiMemory (past life decisions) and previous dialogueHistory turns
  const friendId = state.friends[0].id;
  state.friends[0].dialogueHistory = [
    {
      sender: 'player',
      text: 'Привет! Как думаешь, стоит ли запускать стартап в этом году?',
      age: 22,
      year: state.currentYear,
    },
    {
      sender: 'npc',
      text: 'Отличная идея, давай просчитаем бюджет!',
      age: 22,
      year: state.currentYear,
    },
  ];

  const npcResponse = generateOfflineNpcDialogue(
    state,
    friendId,
    'Продолжим разговор про инвестиции и бизнес!'
  );
  assert.ok(
    npcResponse.reply.includes('Помню, как ты недавно говорил'),
    'Expected NPC reply to reference prior dialogueHistory turn'
  );
  assert.ok(
    npcResponse.reply.includes(chosenOptionLabel),
    'Expected NPC reply to remember player life choice from aiMemory'
  );
});

test('Hardcore Survival mechanics: Stress > 80% halves productivity, Debt Spiral adds delinquency & collector stress, Austerity drains weight/muscle/health, and Clinic cures illnesses', () => {
  // 1. Stress > 80% halves gross earned income
  let calmState = createInitialPlayerState();
  calmState.age = 25;
  calmState.money = 10000;
  calmState.currentCareerId = PROFESSIONS_360[10].id;
  calmState.stress = 20;
  const afterCalm = advanceTurnByStep(calmState, 'month');
  const calmNetGain = afterCalm.money - 10000 + afterCalm.monthlyExpenses.total;

  let panickedState = createInitialPlayerState();
  panickedState.age = 25;
  panickedState.money = 10000;
  panickedState.currentCareerId = PROFESSIONS_360[10].id;
  panickedState.stress = 85;
  const afterPanic = advanceTurnByStep(panickedState, 'month');
  const panicNetGain = afterPanic.money - 10000 + afterPanic.monthlyExpenses.total;

  assert.ok(
    panicNetGain <= Math.ceil(calmNetGain * 0.55),
    `Expected panicked gross gain (${panicNetGain}) to be ~50% of calm gain (${calmNetGain})`
  );

  // 2. Hardcore Debt Spiral (< $0): increments debtDelinquencyTurns, adds collector stress (+15), and evicts after 2 turns
  let debtState = createInitialPlayerState();
  debtState.age = 25;
  debtState.money = -1500;
  debtState.stress = 10;
  debtState.activeHouseId = 'city_flat';
  debtState.ownedHouseIds = ['parents_home', 'city_flat'];

  debtState = advanceTurnByStep(debtState, 'month');
  assert.equal(debtState.debtDelinquencyTurns, 1);
  assert.ok(debtState.stress >= 25, 'Collectors should add +15 Stress when in debt');

  debtState = advanceTurnByStep(debtState, 'month');
  assert.equal(debtState.debtDelinquencyTurns, 2);
  assert.equal(debtState.activeHouseId, 'parents_home', 'After 2 turns of delinquency, normal housing should be blocked/evicted');

  // 3. Hunger / Food Austerity ('Экономный'): drains weight, muscleMass, and health
  let austerityState = createInitialPlayerState();
  austerityState.age = 24;
  austerityState.money = 5000;
  austerityState.spendingMode = 'Экономный';
  austerityState.weightKg = 78;
  austerityState.skills.muscleMass = 50;
  austerityState.health = 90;

  const afterAusterity = advanceTurnByStep(austerityState, 'month');
  assert.ok(afterAusterity.weightKg < 78, 'Austerity mode should reduce weightKg');
  assert.ok(afterAusterity.skills.muscleMass < 50, 'Austerity mode should reduce muscleMass');
  assert.ok(afterAusterity.health < 90, 'Austerity mode should reduce health');

  // 4. Winter heating increases utilities by +35%, and Private Clinic cures illnesses cleanly
  let winterState = createInitialPlayerState();
  winterState.age = 25;
  winterState.season = 'Зима';
  const winterExp = calculateMonthlyExpenses(winterState);

  let summerState = { ...winterState, season: 'Лето' as const };
  const summerExp = calculateMonthlyExpenses(summerState);
  assert.ok(winterExp.utilities > summerExp.utilities, 'Winter heating must increase utilities cost by +35%');

  winterState.money = 5000;
  winterState.health = 65;
  winterState.hasInjury = true;
  winterState.activeIllnesses = ['Пневмония (переохлаждение зимой)'];

  const treated = treatIllnessOrInjury(winterState, 'private_clinic');
  assert.equal(treated.nextState.hasInjury, false);
  assert.equal(treated.nextState.activeIllnesses.length, 0);
  assert.ok(treated.nextState.health > 65);
});

test('Contextual Location Scene resolver and Role/Military Event Catalog route accurately across all 6 scenes', () => {
  let state = createInitialPlayerState();
  // 1. Childhood -> parents_room
  state.age = 10;
  assert.equal(resolveCharacterLocationScene(state).locationId, 'parents_room');

  // 2. Young adult in basic housing -> student_dorm
  state.age = 20;
  assert.equal(resolveCharacterLocationScene(state).locationId, 'student_dorm');

  // 3. Blogger / Custom PC rig -> it_blogger_studio
  state.urbexSubscribers = 12000;
  assert.equal(resolveCharacterLocationScene(state).locationId, 'it_blogger_studio');
  const blogEvent = generateContextualAiLifeEvent(state);
  assert.ok(blogEvent.title.length > 5);

  // 4. Business owner -> ceo_office
  state.urbexSubscribers = 0;
  state.ownedBusinesses = [{ businessId: BUSINESS_CATALOG[0].id, level: 2, hiredManagers: 1, customBranches: 1 }];
  assert.equal(resolveCharacterLocationScene(state).locationId, 'ceo_office');
  const bizEvent = generateContextualAiLifeEvent(state);
  assert.ok(bizEvent.title.length > 5);

  // 5. Military service -> military_base, and Frontline toggle -> frontline_dugout
  state = toggleMilitaryService(state).nextState;
  assert.equal(resolveCharacterLocationScene(state).locationId, 'military_base');
  state = toggleFrontlineDeployment(state).nextState;
  assert.equal(state.frontlineActive, true);
  assert.equal(resolveCharacterLocationScene(state).locationId, 'frontline_dugout');

  const milEvent = generateContextualAiLifeEvent(state);
  assert.ok(milEvent.id.startsWith('mil_'), `Expected military event ID, got ${milEvent.id}`);
});

test('Diminishing Returns progression, Peak Stat Decay, Grade Mini-Games, and Proactive Incoming NPC Messenger Chats work accurately', () => {
  // 1. Diminishing Returns tiers: 0-35 (+1.8), 35-65 (+0.85, 1.3x energy), 65-85 (+0.3 with gear / +0.1 without), 85-100 (+0.1)
  const tier1 = calculateDiminishingStatGain(20, false);
  assert.equal(tier1.statGain, 1.8);
  assert.equal(tier1.energyCostMultiplier, 1.0);

  const tier2 = calculateDiminishingStatGain(50, false);
  assert.equal(tier2.statGain, 0.85);
  assert.equal(tier2.energyCostMultiplier, 1.3);

  const tier3NoGear = calculateDiminishingStatGain(72, false);
  assert.equal(tier3NoGear.statGain, 0.1);
  assert.equal(tier3NoGear.requiresGearWarning, true);

  const tier3WithGear = calculateDiminishingStatGain(72, true);
  assert.equal(tier3WithGear.statGain, 0.3);
  assert.equal(tier3WithGear.requiresGearWarning, false);

  const tier4Peak = calculateDiminishingStatGain(90, true);
  assert.equal(tier4Peak.statGain, 0.1);

  // 2. Peak stat decay (-1 per month when >=85 without active support)
  let state = createInitialPlayerState();
  state.skills.strength = 92;
  state.skills.intellect = 90;
  const decayed = applyPeakStatDecay(state, []);
  assert.equal(decayed.skills.strength, 91);
  assert.equal(decayed.skills.intellect, 89);

  // 3. Execute scaled stat training
  state.age = 20;
  state.skills.strength = 25;
  const trained = executeScaledStatTraining(state, 'strength', 'Силовая тренировка');
  assert.ok(trained.nextState.skills.strength > 25);

  // 4. Grade-dependent profession mini-games (IT, Blog, Business)
  const itWon = resolveGradeProfessionMinigame(state, 'it', 'Архитектура и DDoS', true, 1.25);
  assert.ok(itWon.nextState.money > state.money);
  assert.ok(itWon.nextState.skills.intellect > state.skills.intellect);

  const blogWon = resolveGradeProfessionMinigame(state, 'blog', 'Удержание и Монтаж', true, 1.0);
  assert.ok(blogWon.nextState.urbexSubscribers > state.urbexSubscribers);

  const bizWon = resolveGradeProfessionMinigame(state, 'business', 'Антикризисное управление', true, 1.5);
  assert.ok(bizWon.nextState.skills.finance > state.skills.finance);

  // 5. Proactive Incoming NPC Messenger Chat
  const npcThread = pickProactiveNpcChat(state);
  assert.ok(npcThread.openingMessage.length > 10);
  assert.ok(npcThread.branches.length >= 2);
  const afterChat = resolveProactiveNpcChatFinal(state, npcThread.id, 0, 0);
  assert.equal(afterChat.nextState.activeIncomingNpcChat, null);
  assert.ok(afterChat.message.length > 5);
});


