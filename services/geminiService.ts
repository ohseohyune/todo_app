
import { GoogleGenAI, Type } from "@google/genai";
import { MicroTask, TaskStatus } from "../types.ts";

export const decomposeTask = async (title: string, category: string): Promise<Partial<MicroTask>[]> => {
  // vite.config.ts의 define을 통해 주입된 값을 읽어옵니다.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.error("API_KEY가 감지되지 않았습니다. Vercel Project Settings -> Environment Variables에서 'API_KEY'가 등록되어 있는지 확인하세요.");
    alert("AI 설정(API 키)이 앱에 적용되지 않았습니다.\n\n[해결 방법]\n1. Vercel에서 'API_KEY' 등록 확인\n2. 등록 후 반드시 'Deployments' 탭에서 'Redeploy' 클릭!");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `당신은 ADHD 성향이 있거나 집중이 어려운 사람들을 돕는 생산성 전문가입니다.
  다음의 큰 목표를 5~15분 내에 완료할 수 있는 아주 구체적이고 작은 '마이크로 퀘스트' 3~6개로 분해해주세요.
  
  큰 목표: "${title}"
  카테고리: "${category}"

  **중요 규칙**:
  1. 모든 응답(title, successCriteria, nexthint)은 반드시 **한국어**로 작성하세요.
  2. 각 단계는 심리적 저항을 줄이기 위해 아주 작고 구체적인 행동이어야 합니다.
  3. 제공할 항목: 제목(title), 예상 소요 시간(durationEstMin), 난이도(1-5), 저항감(1-5), 보상 XP, 완료 기준(successCriteria), 다음 단계 힌트(nextHint).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    return "API 키가 설정되지 않아 조언을 생성할 수 없습니다.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `당신은 사용자의 하루 성찰을 듣고 더 나은 방향을 제시해주는 생산성 비서 로봇입니다. 
  사용자의 오늘 하루 회고: "${reflection}"
  오늘의 통계: 레벨 ${stats.level}, 스트릭 ${stats.streakCount}일, 전체 XP ${stats.totalXP}
  
  위 내용을 바탕으로 사용자에게 따뜻하고 구체적인 피드백을 한국어로 2~3문장 제공해주세요. 
  격려와 함께 내일의 시스템 가동을 위한 아주 작은 팁 하나를 포함하세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "시스템 분석 결과: 내일도 당신은 충분히 잘 해낼 수 있습니다. 계속 나아가세요.";
  } catch (error) {
    console.error("AI 조언 생성 실패:", error);
    return "외란 발생으로 분석이 지연되었습니다. 하지만 오늘 하루 고생 많으셨다는 건 분명합니다!";
  }
};
