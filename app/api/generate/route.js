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

    let extractedText = ""; // ✅ 선언

    // ✅ OCR (이미지 텍스트 인식)
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const base64Image = buffer.toString("base64");

      const ocrResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini", // OCR 지원 모델
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "이 이미지에서 글자 내용을 한국어로 인식해줘.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`, // ✅ 문자열 → 객체로 감싸기
                },
              },
            ],
          },
        ],
      });

      const ocrText = ocrResponse.choices[0].message.content.trim();
      extractedText += `\n\n(이미지 인식 결과)\n${ocrText}`; // ✅ 올바른 변수명으로 변경
    }

    // ✅ GPT로 보낼 최종 프롬프트 구성
    const finalPrompt = `
[블로그 글 작성 요청]
카테고리: ${category}
제목: ${title}
참고사항: ${prompt}

아래는 이미지에서 추출된 텍스트입니다:
${extractedText}

위의 정보를 참고해 자연스럽고 흥미로운 블로그 글을 작성해주세요.
`;

    // ✅ GPT 호출 (정상 작동)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      temperature: 0.8,
    });

    const result = completion.choices[0]?.message?.content || "결과 없음";
    return NextResponse.json({ result });
  } catch (error) {
    console.error("❌ 서버 오류:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류 발생" },
      { status: 500 }
    );
  }
}
