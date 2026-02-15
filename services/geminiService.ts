
import { GoogleGenAI, Type } from "@google/genai";
import { MicroTask, TaskStatus, User } from "../types.ts";

const SYSTEM_INSTRUCTION = `당신은 생산성 극대화 전문가입니다. 
사용자가 입력한 큰 목표를 '몰입(Deep Work)'이 가능한 적정 크기로 분해하세요.

분해 규칙:
1. 기본 단위: 각 단계는 보통 **30분에서 1시간(60분)** 사이의 시간이 소요되도록 설계하세요. 
2. 에너지 상태 반영:
   - 사용자의 '에너지 상태'가 'Low'인 경우, 집중력이 낮으므로 단위를 조금 더 줄여 **15~30분** 내외로 분해하세요.
   - 'Normal' 상태인 경우, 묵직하게 **30~60분** 단위로 구성하여 성취감을 극대화하세요.
3. 시간 정확도 지표(Accuracy Ratio) 반영:
   - 이 지표는 (실제 걸린 시간 / 예상 시간)의 평균입니다.
   - Ratio가 1보다 크면 사용자가 느린 편이므로 배정 시간을 더 넉넉하게 잡고 단위를 작게 나누세요.
   - Ratio가 1보다 작으면 사용자가 빠른 편이므로 시간을 타이트하게 잡고 단위를 묵직하게 가져가세요.
4. 언어: 반드시 한국어로 응답하세요.`;

export const decomposeTask = async (
  title: string, 
  category: string, 
  userStats: { level: number, energyMode: 'Low' | 'Normal', accuracyRatio: number },
  refinementPrompt?: string,
  existingTasks?: Partial<MicroTask>[]
): Promise<Partial<MicroTask>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let prompt = `목표: "${title}" (카테고리: ${category})
에너지: ${userStats.energyMode}, 정확도 지표: ${userStats.accuracyRatio}`;

  if (refinementPrompt && existingTasks) {
    prompt += `\n현재 설계: ${JSON.stringify(existingTasks)}\n피드백: "${refinementPrompt}"\n위 내용을 반영하여 30~60분 단위로 재생성하세요.`;
  }

  try {
    const response = await ai.models.generateContent({
      // Upgraded to gemini-3-pro-preview for complex task planning/reasoning
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              durationEstMin: { type: Type.NUMBER },
              difficulty: { type: Type.NUMBER },
              frictionScore: { type: Type.NUMBER },
              xpReward: { type: Type.NUMBER },
              successCriteria: { type: Type.STRING },
              nextHint: { type: Type.STRING },
            },
            required: ["title", "durationEstMin", "difficulty", "frictionScore", "xpReward", "successCriteria", "nextHint"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    return data.map((item: any, index: number) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      orderIndex: index,
      status: TaskStatus.TODO
    }));
  } catch (error) {
    console.error("AI 분해 실패:", error);
    return [];
  }
};

export const getAIAdvice = async (reflection: string, user: User): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `사용자의 오늘 성찰: "${reflection}"\n최근 효율 지표: ${user.recentAccuracyRatio}\n데이터에 기반한 짧고 따뜻한 생산성 조언을 한국어로 2문장 내외로 해주세요.`;

  try {
    const response = await ai.models.generateContent({ 
      // Using gemini-3-flash-preview for general text tasks like advice
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: { systemInstruction: "당신은 따뜻한 AI 생산성 멘토입니다." }
    });
    return response.text || "오늘도 수고 많으셨습니다!";
  } catch (error) {
    return "당신의 노력은 이미 충분히 가치 있습니다.";
  }
};
