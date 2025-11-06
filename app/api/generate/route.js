import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ 반드시 .env.local에 키 넣기
});

export async function POST(req) {
  try {
    // 프론트에서 전달된 프롬프트 받기
    const { prompt } = await req.json();

    // ✅ OpenAI 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18", // 최신 모델 사용
      messages: [
        {
          role: "system",
          content:
            "너는 블로그 전문 작가야. 아래 프롬프트 지시를 충실히 따르고 자연스럽게 SEO 최적화된 블로그 본문을 작성해줘.",
        },
        {
          role: "user",
          content: prompt, // 전체 프롬프트를 통째로 전달
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    // ✅ 결과 추출
    const result = completion.choices[0].message.content;

    // ✅ 프론트로 결과 반환
    return NextResponse.json({ result });
  } catch (error) {
    console.error("🔥 API 오류 발생:", error);
    return NextResponse.json(
      {
        error: "글 생성 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
