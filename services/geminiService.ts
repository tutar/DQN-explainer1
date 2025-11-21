import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL } from '../constants';

// Singleton instance management could be done here, but for simplicity we recreate or pass instance
let chatSession: Chat | null = null;

export const initializeChat = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    return null;
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = ai.chats.create({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: `你是一位精通深度强化学习 (Deep Reinforcement Learning) 的专家讲师。
      你的任务是用通俗易懂的中文向用户解释 Deep Q-Network (DQN) 的原理。
      你可以解释相关的数学公式（如贝尔曼方程），神经网络架构，以及经验回放和目标网络等核心概念。
      请保持语气鼓励和专业，回答要简洁明了。如果用户问代码相关问题，可以提供简短的 Python/PyTorch 伪代码示例。`,
    },
  });
  return chatSession;
};

export const resetChat = () => {
  chatSession = null;
  return initializeChat();
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
      return "错误：无法连接到 AI 服务，请检查 API Key。";
  }

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "抱歉，我现在无法回答，请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "发生错误，请稍后再试。";
  }
};

export async function* sendMessageStreamToGemini(message: string) {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
      yield "错误：无法连接到 AI 服务，请检查 API Key。";
      return;
  }

  try {
    const resultStream = await chatSession.sendMessageStream({ message });
    for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            yield c.text;
        }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "发生错误，请稍后再试。";
  }
}