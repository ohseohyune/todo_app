
import { GoogleGenAI, Type } from "@google/genai";
import { MicroTask, TaskStatus, User } from "../types.ts";

const SYSTEM_INSTRUCTION = `당신은 ADHD 성향이 있거나 심각한 미루기 습관이 있는 사람들을 위한 세계 최고의 생산성 코치입니다.
당신의 목표는 사용자가 느끼는 '심리적 저항감'을 0에 가깝게 만드는 것입니다.

분해 규칙:
1. 사용자의 '에너지 상태'가 'Low'인 경우, 모든 단계는 2~5분 내외로 끝낼 수 있는 '초미세' 단위여야 합니다.
2. 사용자의 '시간 정확도 지표(Accuracy Ratio)'가 제공되면 이를 반영하세요. 
   - Ratio가 1보다 크면(예: 1.2), 사용자가 평소 예상보다 더 오래 걸린다는 뜻이므로 시간을 더 보수적으로(넉넉하게) 배정하세요.
   - Ratio가 1보다 작으면(예: 0.8), 사용자가 일을 빨리 끝내는 편이므로 시간을 타이트하게 배정하세요.
3. 첫 번째 단계는 언제나 '압도적으로 쉬워야' 합니다.
4. 구체적인 동작(동사 위주)을 사용하세요.`;

export const decomposeTask = async (
  title: string, 
  category: string, 
  userStats: { level: number, streak: number, energyMode: 'Low' | 'Normal', accuracyRatio?: number },
  refinementPrompt?: string,
  existingTasks?: Partial<MicroTask>[]
): Promise<Partial<MicroTask>[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') return [];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let prompt = `사용자 목표: "${title}" (카테고리: ${category})
사용자 에너지: ${userStats.energyMode}
시간 정확도 지표: ${userStats.accuracyRatio || 1} (1.0 기준, 높을수록 실제 시간이 더 많이 걸림)
사용자 레벨: ${userStats.level}`;

  if (refinementPrompt && existingTasks) {
    prompt += `\n\n현재 설계: ${JSON.stringify(existingTasks)}\n요구사항: "${refinementPrompt}"\n사용자의 과거 속도를 고려해 시간을 재조정하여 생성하세요.`;
  } else {
    prompt += `\n\n위 데이터를 바탕으로 사용자 맞춤형 마이크로 퀘스트를 설계하세요.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

    const data = JSON.parse(response.text);
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
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') return "API 키 설정 필요";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const statsSummary = `
- 최근 시간 예측 정확도: ${user.recentAccuracyRatio ? Math.round(user.recentAccuracyRatio * 100) + '%' : '데이터 없음'}
- 현재 레벨: ${user.level}
- 현재 스트릭: ${user.streakCount}일
- 오늘까지 완료한 총 퀘스트: ${user.totalCompletedTasks}개
- 총 몰입 시간: ${user.totalFocusMinutes}분
  `;

  const prompt = `
사용자의 오늘의 성찰: "${reflection}"

사용자의 최근 활동 통계:
${statsSummary}

위 성찰 내용과 실제 활동 통계를 결합하여 분석해주세요.
1. 사용자의 심리적 상태를 공감하고 격려하세요.
2. 통계 지표(예: 시간 정확도가 낮다면 '계획을 더 여유있게 세워보자' 등)를 바탕으로 내일의 더 나은 몰입을 위한 구체적인 전략을 1가지 제안하세요.
3. 따뜻하고 전문적인 코치의 어조로 한국어로 작성하세요. 2~3문장 내외로 짧고 강렬하게.
  `;

  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        systemInstruction: "당신은 사용자의 성장을 돕는 다정한 AI 생산성 파트너입니다."
      }
    });
    return response.text || "오늘도 당신만의 속도로 한 걸음 나아갔군요. 내일도 응원합니다!";
  } catch (error) {
    return "당신의 노력은 이미 가치 있습니다. 통계보다 중요한 건 당신이 멈추지 않았다는 사실입니다.";
  }
};
