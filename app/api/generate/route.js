import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 환경 변수는 그대로 사용
});

export async function POST(req) {
  try {
    // ✅ 프론트에서 전달된 프롬프트 받기
    const { prompt } = await req.json();

    // ✅ OpenAI 호출 (프롬프트 그대로 전달)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: "너는 사용자가 보낸 프롬프트를 그대로 충실히 따르는 AI야. 절대 변형하지 말고 그대로 반영해.",
        },
        {
          role: "user",
          content: prompt, // 프론트의 프롬프트 전체 그대로 전달
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error) {
    console.error("🔥 글 생성 중 오류:", error);
    return NextResponse.json(
      { error: "글 생성 중 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}
