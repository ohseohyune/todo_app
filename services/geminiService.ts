
import { GoogleGenAI, Type } from "@google/genai";
import { MicroTask, TaskStatus } from "../types.ts";

export const decomposeTask = async (
  title: string, 
  category: string, 
  userStats: { level: number, streak: number }
): Promise<Partial<MicroTask>[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.error("API_KEY가 감지되지 않았습니다.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 사용자의 숙련도에 따른 지침 추가
  const expertiseLevel = userStats.level > 10 ? "숙련된" : "초보";
  const streakStatus = userStats.streak > 5 ? "가속도가 붙은" : "조심스러운 시작 단계인";

  const prompt = `당신은 ADHD 성향이 있거나 집중이 어려운 사람들을 돕는 생산성 전문가입니다.
  현재 사용자는 레벨 ${userStats.level}(${expertiseLevel})이며, ${userStats.streak}일째(${streakStatus}) 퀘스트를 이어가고 있습니다.

  다음 목표를 사용자의 숙련도에 맞춰 3~15분 내에 완료할 수 있는 '마이크로 퀘스트' 3~6개로 분해해주세요.
  
  목표: "${title}"
  카테고리: "${category}"

  **시간 계산 지침**:
  1. 사용자가 초보라면 단계를 더 잘게 쪼개고 시간을 5분 내외로 배치하세요.
  2. 사용자가 숙련자라면 조금 더 덩어리가 큰(10~15분) 단계를 포함해도 좋습니다.
  3. 모든 응답은 반드시 **한국어**로 작성하세요.
  4. 제공할 항목: 제목(title), 예상 소요 시간(durationEstMin), 난이도(1-5), 저항감(1-5), 보상 XP, 완료 기준(successCriteria), 다음 단계 힌트(nextHint).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
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

    const data = JSON.parse(response.text || '[]');
    return data.map((item: any, index: number) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      orderIndex: index,
      status: TaskStatus.TODO
    }));
  } catch (error) {
    console.error("분해 실패:", error);
    return [];
  }
};

export const getAIAdvice = async (reflection: string, stats: any): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') return "API 키 설정 필요";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `사용자 성찰: "${reflection}"\n레벨 ${stats.level}, 스트릭 ${stats.streakCount}일\n따뜻하고 구체적인 피드백 2~3문장 제공 (한국어).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "오늘도 수고하셨습니다.";
  } catch (error) {
    return "분석 중 오류가 발생했지만 당신의 노력은 기록되었습니다.";
  }
};
