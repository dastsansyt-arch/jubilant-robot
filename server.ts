import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Endpoint 1: Real-time AI NPC & Family Dialogue & Reaction Generator (with Persistent Memory BEFORE/AFTER)
  app.post('/api/ai/npc-chat', async (req, res) => {
    const {
      playerName,
      npcName,
      npcRole,
      npcTrait,
      relationship,
      playerMessage,
      userActionOrMessage,
      playerAction,
      playerAge,
      age,
      city,
      country,
      weather,
      season,
      careerTitle,
      factionName,
      storyArc,
      equippedBrands,
      coreBiographySummary,
      aiMemoryEntries,
      dialogueHistory,
    } = req.body || {};

    const effectiveAge = playerAge ?? age ?? 18;
    const effectiveMessage = userActionOrMessage || playerMessage || playerAction || 'Привет! Как жизнь?';

    const memoryBlock = Array.isArray(aiMemoryEntries) && aiMemoryEntries.length > 0
      ? aiMemoryEntries
          .slice(0, 6)
          .map(
            (m: { age?: number; year?: number; actionTaken?: string; consequenceSummary?: string }) =>
              `- [${m.age ?? effectiveAge} лет, ${m.year ?? ''} г.] ДО/ВЫБОР: ${m.actionTaken || ''} -> ПОСЛЕ: ${m.consequenceSummary || ''}`
          )
          .join('\n')
      : 'Начало биографии.';

    const chatHistoryBlock = Array.isArray(dialogueHistory) && dialogueHistory.length > 0
      ? dialogueHistory
          .slice(-6)
          .map(
            (turn: { sender?: string; text?: string; age?: number }) =>
              `${turn.sender === 'player' ? playerName || 'Игрок' : npcName || 'NPC'} (${turn.age ?? effectiveAge} лет): "${turn.text || ''}"`
          )
          .join('\n')
      : 'Первая реплика в диалоге.';

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(200).json({
        source: 'offline-engine',
        fallback: true,
      });
    }

    try {
      const prompt = `Ты — персонаж ${npcName} (${npcRole}, характер: ${npcTrait}) в реалистичном симуляторе жизни Life Simulator EX.
Никакой мистики и фантастики — строгий жизненный реализм!
Текущий уровень отношений с игроком (${playerName || 'Друг'}): ${relationship}/100.
Контекст игрока: Возраст ${effectiveAge} лет, город ${city} (${country}), время года: ${season}, погода: ${weather}.
Профессия игрока: ${careerTitle || 'В поиске призвания'}. Тусовка/сообщество: ${factionName || 'Нет'}.
Текущая сюжетная линия жизни игрока: "${storyArc || 'Становление личности'}".
Краткая биография (ДО): "${coreBiographySummary || ''}".
Одежда игрока: ${(equippedBrands && equippedBrands.length > 0) ? equippedBrands.join(', ') : 'повседневный стиль'}.

ВАЖНО — ЦЕПОЧКА ПАМЯТИ ИИ (Что происходило с игроком ДО этого момента и какие решения он принимал):
${memoryBlock}

ИСТОРИЯ ПРОШЛЫХ ДИАЛОГОВ С ТОБОЙ:
${chatHistoryBlock}

Новое действие/реплика игрока: "${effectiveMessage}"

Ответь реалистично от первого лица на русском языке (2-3 предложения), ОБЯЗАТЕЛЬНО упомянув или учтя прошлые события из памяти (что было ДО) или ваши прошлые диалоги, возраст (${effectiveAge} лет) и город (${city}), и укажи изменение отношений (-10 до +15) и счастья (-5 до +10).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Ответ персонажа от первого лица на русском языке с учётом памяти ДО/ПОСЛЕ',
              },
              moodReaction: {
                type: Type.STRING,
                description: 'Краткое описание эмоции персонажа',
              },
              relationDelta: {
                type: Type.INTEGER,
                description: 'Изменение уровня отношений от -10 до 15',
              },
              happinessDelta: {
                type: Type.INTEGER,
                description: 'Изменение счастья игрока от -5 до 10',
              },
            },
            required: ['reply', 'moodReaction', 'relationDelta', 'happinessDelta'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(200).json({ source: 'offline-engine', fallback: true });
      }
      const parsed = JSON.parse(text.trim());
      return res.json({
        source: 'gemini-ai',
        ...parsed,
      });
    } catch (error) {
      return res.status(200).json({
        source: 'offline-engine',
        fallback: true,
        errorHint: error instanceof Error ? error.message : 'AI unavailable',
      });
    }
  });

  // Endpoint 2: Dynamic AI Storyline & Branching Life Event Generator (with BEFORE/AFTER Memory Ledger)
  app.post('/api/ai/generate-event', async (req, res) => {
    const {
      playerAge,
      age,
      playerName,
      city,
      country,
      weather,
      season,
      focus,
      careerTitle,
      factionName,
      storyArc,
      storyHistory,
      coreBiographySummary,
      aiMemoryEntries,
      familySummary,
      vehicleName,
      houseName,
    } = req.body || {};

    const effectiveAge = playerAge ?? age ?? 18;

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(200).json({
        source: 'offline-engine',
        fallback: true,
      });
    }

    const memoryLedgerText = Array.isArray(aiMemoryEntries) && aiMemoryEntries.length > 0
      ? aiMemoryEntries
          .slice(0, 6)
          .map(
            (m: { age?: number; year?: number; actionTaken?: string; consequenceSummary?: string }) =>
              `• [${m.age ?? effectiveAge} лет, ${m.year ?? ''} г.] ДО: ${m.actionTaken || ''} => ПОСЛЕ: ${m.consequenceSummary || ''}`
          )
          .join('\n')
      : (storyHistory || []).slice(0, 4).join(' -> ') || 'Начало пути';

    try {
      const prompt = `Ты — сюжетный режиссёр реалистичной игры Life Simulator EX. Никакой мистики и фантастики!
Сгенерируй глубокое жизненное событие с 3 вариантами выбора для персонажа ${playerName} (возраст строго ${effectiveAge} лет) в городе ${city}, ${country}.
Погода: ${weather} (${season}). Фокус жизни: ${focus}.
Профессия: ${careerTitle || 'По возрасту'}. Тусовка: ${factionName || 'Сам по себе'}.
Семья: ${familySummary || 'Родители рядом'}. Жильё: ${houseName || 'базовое'}. Транспорт: ${vehicleName || 'общественный транспорт'}.
Текущая глава сюжета: "${storyArc || 'Начало самостоятельного пути'}".
Краткая биография: "${coreBiographySummary || ''}".

ЦЕПОЧКА ПАМЯТИ ИИ (Что происходило ДО этого момента — обязательно сошлись на прошлый контекст в начале description в формате "[Память ИИ: ...]"):
${memoryLedgerText}

Создай реалистичную жизненную дилемму строго соответствующую возрасту ${effectiveAge} лет с 3 вариантами выбора (choiceA, choiceB, choiceC), которая меняет дальнейшую сюжетную арку (nextStoryArc) персонажа!`;

      const choiceSchema = {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          outcomeText: { type: Type.STRING },
          nextStoryArc: { type: Type.STRING, description: 'Новое название главы сюжета после выбора' },
          healthDelta: { type: Type.INTEGER },
          happinessDelta: { type: Type.INTEGER },
          knowledgeDelta: { type: Type.INTEGER },
          relationsDelta: { type: Type.INTEGER },
          moneyDelta: { type: Type.INTEGER },
        },
        required: ['label', 'outcomeText', 'nextStoryArc', 'healthDelta', 'happinessDelta', 'knowledgeDelta', 'relationsDelta', 'moneyDelta'],
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Заголовок сюжетной развилки' },
              description: { type: Type.STRING, description: 'Описание ситуации, начинающееся с [Память ИИ: ...] с отсылкой к контексту ДО' },
              choiceA: choiceSchema,
              choiceB: choiceSchema,
              choiceC: choiceSchema,
            },
            required: ['title', 'description', 'choiceA', 'choiceB', 'choiceC'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(200).json({ source: 'offline-engine', fallback: true });
      }
      const parsed = JSON.parse(text.trim());
      const choices = [parsed.choiceA, parsed.choiceB, parsed.choiceC].filter(Boolean);
      return res.json({
        source: 'gemini-ai',
        ...parsed,
        choices,
      });
    } catch (error) {
      return res.status(200).json({
        source: 'offline-engine',
        fallback: true,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
