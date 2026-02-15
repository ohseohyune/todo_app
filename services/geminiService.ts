
import { GoogleGenAI, Type } from "@google/genai";
import { MicroTask, TaskStatus, User } from "../types.ts";

const SYSTEM_INSTRUCTION = `당신은 생산성 극대화 전문가입니다. 
사용자가 입력한 큰 목표를 '몰입(Deep Work)'이 가능한 적정 크기로 분해하는 것이 당신의 역할입니다.

분해 규칙:
1. 기본 단위: 각 단계는 보통 **30분에서 1시간(60분)** 사이의 시간이 소요되도록 설계하세요. 
2. 에너지 상태 반영:
   - 사용자의 '에너지 상태'가 'Low'인 경우, 집중력이 낮으므로 단위를 조금 더 줄여 **15~30분** 내외로 분해하세요.
   - 'Normal' 상태인 경우, 묵직하게 **30~60분** 단위로 구성하여 성취감을 극대화하세요.
3. 시간 정확도(Accuracy Ratio) 반영:
   - Ratio가 1보다 크면(예: 1.2), 사용자가 느린 편이므로 배정 시간을 더 넉넉하게 잡으세요.
   - Ratio가 1보다 작으면(예: 0.8), 사용자가 빠른 편이므로 시간을 타이트하게 잡으세요.
4. 구성:
   - 첫 번째 단계는 진입 장벽을 낮추기 위해 해당 모드(Low/Normal)의 최소 시간대에 맞추세요.
   - 각 작업은 명확한 '완료 기준(Success Criteria)'을 포함해야 합니다.
5. 언어: 반드시 한국어로 응답하세요.`;

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
사용자 현재 에너지: ${userStats.energyMode}
시간 정확도 지표: ${userStats.accuracyRatio || 1}
사용자 레벨: ${userStats.level}`;

  if (refinementPrompt && existingTasks) {
    prompt += `\n\n현재 설계된 리스트: ${JSON.stringify(existingTasks)}\n사용자 피드백: "${refinementPrompt}"\n이 피드백을 반영하여 30~60분(Low 모드 시 15~30분) 단위로 다시 설계하세요.`;
  } else {
    prompt += `\n\n위 데이터를 바탕으로 사용자가 몰입할 수 있는 퀘스트 리스트를 생성하세요.`;
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
  `;

  const prompt = `
사용자의 오늘의 성찰: "${reflection}"
통계 지표: ${statsSummary}

사용자의 성찰에 공감하고, 내일 더 깊은 '몰입(30-60분 단위)'을 유지하기 위한 짧은 조언을 한국어로 해주세요. 2문장 내외.`;

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
    return "당신의 노력은 이미 가치 있습니다.";
  }
};
