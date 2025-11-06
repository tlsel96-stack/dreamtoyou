import { NextResponse } from "next/server";
import OpenAI from "openai";
import Tesseract from "tesseract.js";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") || "";
    const prompt = formData.get("prompt") || "";
    const category = formData.get("category") || "";
    const image = formData.get("image");

    let extractedText = "";

    // ✅ 이미지가 있으면 OCR 수행
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const { data } = await Tesseract.recognize(buffer, "kor+eng");
      extractedText = data.text.trim();
    }

    // ✅ GPT 프롬프트 구성
    const finalPrompt = `
[블로그 글 작성 요청]
카테고리: ${category}
제목: ${title}
참고사항: ${prompt}

아래는 이미지에서 추출된 텍스트입니다:
${extractedText}

위의 정보를 모두 종합해 자연스럽고 흥미로운 블로그 원고를 작성해주세요.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: finalPrompt }],
        },
      ],
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error) {
    console.error("❌ 오류:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류" },
      { status: 500 }
    );
  }
}
