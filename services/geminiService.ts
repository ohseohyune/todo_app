
import { GoogleGenAI, Type } from "@google/genai";
import { MicroTask, TaskStatus } from "../types.ts";

const SYSTEM_INSTRUCTION = `당신은 ADHD 성향이 있거나 심각한 미루기 습관이 있는 사람들을 위한 세계 최고의 생산성 코치입니다.
당신의 목표는 사용자가 느끼는 '심리적 저항감'을 0에 가깝게 만드는 것입니다.

분해 규칙:
1. 첫 번째 단계는 '압도적으로 쉬워야' 합니다. (예: "책상에 앉기", "노트북 열기", "브라우저 켜기")
2. 각 단계는 5~15분 내외로 끝낼 수 있는 구체적인 '행동' 단위여야 합니다.
3. 추상적인 표현(예: "분석하기") 대신 구체적인 동작(예: "데이터에서 3개의 핵심 지표 골라내기")을 사용하세요.
4. 논리적인 흐름을 유지하되, 중간에 성취감을 느낄 수 있는 체크포인트를 배치하세요.
5. 복잡한 작업일수록 더 많은 단계로 나누어 '승리'의 빈도를 높이세요.`;

export const decomposeTask = async (
  title: string, 
  category: string, 
  userStats: { level: number, streak: number },
  refinementPrompt?: string,
  existingTasks?: Partial<MicroTask>[]
): Promise<Partial<MicroTask>[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') return [];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let prompt = `사용자 목표: "${title}" (카테고리: ${category})
사용자 상태: 레벨 ${userStats.level}, ${userStats.streak}일 연속 달성 중.`;

  if (refinementPrompt && existingTasks) {
    prompt += `\n\n현재 생성된 단계들: ${JSON.stringify(existingTasks)}
사용자 피드백: "${refinementPrompt}"
위 피드백을 반영하여 단계를 재구성하거나 더 구체적으로 나누어주세요.`;
  } else {
    prompt += `\n\n위 목표를 달성하기 위한 마이크로 퀘스트를 생성하세요.`;
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
              title: { type: Type.STRING, description: "구체적이고 매력적인 퀘스트 이름" },
              durationEstMin: { type: Type.NUMBER, description: "예상 시간 (분)" },
              difficulty: { type: Type.NUMBER, description: "1-5 난이도" },
              frictionScore: { type: Type.NUMBER, description: "예상 저항감 1-5" },
              xpReward: { type: Type.NUMBER, description: "보상 경험치 (시간*난이도 기반)" },
              successCriteria: { type: Type.STRING, description: "완료를 판단하는 명확한 기준" },
              nextHint: { type: Type.STRING, description: "다음 단계로 넘어가기 위한 작은 팁" },
            },
            required: ["title", "durationEstMin", "difficulty", "frictionScore", "xpReward", "successCriteria", "nextHint"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 응답이 비어있습니다.");

    const data = JSON.parse(text);
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
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "오늘도 수고하셨습니다.";
  } catch (error) {
    return "분석 중 오류가 발생했지만 당신의 노력은 기록되었습니다.";
  }
};
