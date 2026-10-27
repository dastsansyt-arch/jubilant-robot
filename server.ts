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

  // Endpoint 1: Real-time AI NPC & Family Dialogue & Reaction Generator
  app.post('/api/ai/npc-chat', async (req, res) => {
    const {
      npcName,
      npcRole,
      npcTrait,
      relationship,
      playerMessage,
      playerAction,
      playerAge,
      city,
      country,
      weather,
      season,
      careerTitle,
      factionName,
      storyArc,
      equippedBrands,
    } = req.body || {};

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(200).json({
        source: 'offline-engine',
        fallback: true,
      });
    }

    try {
      const prompt = `Ты — персонаж ${npcName} (${npcRole}, характер: ${npcTrait}) в реалистичном симуляторе жизни Life Simulator EX.
Текущий уровень отношений с игроком: ${relationship}/100.
Контекст игрока: Возраст ${playerAge} лет, город ${city} (${country}), время года: ${season}, погода: ${weather}.
Профессия игрока: ${careerTitle || 'В поиске призвания'}. Тусовка/сообщество: ${factionName || 'Нет'}.
Текущая сюжетная линия жизни игрока: "${storyArc || 'Становление личности'}".
Одежда игрока: ${(equippedBrands && equippedBrands.length > 0) ? equippedBrands.join(', ') : 'повседневный стиль'}.
Действие/реплика игрока: "${playerMessage || playerAction || 'Привет! Как жизнь?'}"

Ответь реалистично от первого лица на русском языке (1-3 предложения), учитывая профессию, семью или сюжетную линию игрока, и укажи изменение отношений (-10 до +15) и счастья (-5 до +10).`;

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
                description: 'Ответ персонажа от первого лица на русском языке',
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

  // Endpoint 2: Dynamic AI Storyline & Branching Life Event Generator
  app.post('/api/ai/generate-event', async (req, res) => {
    const {
      playerAge,
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
      familySummary,
      vehicleName,
      houseName,
    } = req.body || {};

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(200).json({
        source: 'offline-engine',
        fallback: true,
      });
    }

    try {
      const prompt = `Ты — сюжетный режиссёр игры Life Simulator EX.
Сгенерируй глубокое сюжетное событие с развилкой для персонажа ${playerName} (${playerAge} лет) в городе ${city}, ${country}.
Погода: ${weather} (${season}). Фокус жизни: ${focus}.
Профессия: ${careerTitle || 'Без постоянной работы'}. Тусовка: ${factionName || 'Сам по себе'}.
Семья: ${familySummary || 'Родители рядом'}. Жильё: ${houseName || 'базовое'}. Транспорт: ${vehicleName || 'общественный транспорт'}.
Текущая глава сюжета: "${storyArc || 'Начало самостоятельного пути'}".
Предыдущие решения игрока: ${(storyHistory || []).slice(0, 3).join(' -> ') || 'только начинает путь'}.

Создай реалистичную жизненную дилемму, которая не просто меняет очки, но и меняет дальнейшую сюжетную арку (nextStoryArc) персонажа!`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Заголовок сюжетной развилки' },
              description: { type: Type.STRING, description: 'Описание ситуации с участием семьи, коллег или города (2-3 предложения)' },
              choiceA: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  outcomeText: { type: Type.STRING },
                  nextStoryArc: { type: Type.STRING, description: 'Новое название главы сюжета после выбора А' },
                  healthDelta: { type: Type.INTEGER },
                  happinessDelta: { type: Type.INTEGER },
                  knowledgeDelta: { type: Type.INTEGER },
                  relationsDelta: { type: Type.INTEGER },
                  moneyDelta: { type: Type.INTEGER },
                },
                required: ['label', 'outcomeText', 'nextStoryArc', 'healthDelta', 'happinessDelta', 'knowledgeDelta', 'relationsDelta', 'moneyDelta'],
              },
              choiceB: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  outcomeText: { type: Type.STRING },
                  nextStoryArc: { type: Type.STRING, description: 'Новое название главы сюжета после выбора Б' },
                  healthDelta: { type: Type.INTEGER },
                  happinessDelta: { type: Type.INTEGER },
                  knowledgeDelta: { type: Type.INTEGER },
                  relationsDelta: { type: Type.INTEGER },
                  moneyDelta: { type: Type.INTEGER },
                },
                required: ['label', 'outcomeText', 'nextStoryArc', 'healthDelta', 'happinessDelta', 'knowledgeDelta', 'relationsDelta', 'moneyDelta'],
              },
            },
            required: ['title', 'description', 'choiceA', 'choiceB'],
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
