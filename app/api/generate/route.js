import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // 🚨 핵심: 절대 prompt 변형 금지
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: `
너는 사용자가 제공한 프롬프트의 지시만을 따라야 하는 AI야.
사용자가 제공한 참고사항 외의 내용을 절대 추가하지 말고,
참고사항의 내용만 근거로 글을 작성해야 해.
'추가 설명', '자체 요약', '서론/결론 보강' 같은 것도 절대 하지 마.
참고사항의 문체와 논리 구조를 유지해서 결과를 출력해.
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // ✅ 창의성 최소화
      max_tokens: 1500,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error) {
    console.error("🔥 API 오류:", error);
    return NextResponse.json(
      { error: "글 생성 중 오류 발생", details: error.message },
      { status: 500 }
    );
  }
}
