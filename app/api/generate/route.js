import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // 🔥 Vercel Edge 에러 방지용

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") || "제목 없음"; // ✅ 제목 받기
    const prompt = formData.get("prompt") || "";
    const category = formData.get("category") || "기타";
    const image = formData.get("image");

    let referenceText = prompt;

    // ✅ 이미지 OCR (이미지 → 텍스트)
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");

      const ocrResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "이 이미지의 텍스트를 한국어로 정확히 인식해줘." },
              {
                type: "image_url",
                image_url: `data:image/png;base64,${base64Image}`,
              },
            ],
          },
        ],
      });

      const ocrText = ocrResponse.choices?.[0]?.message?.content?.trim() || "";
      referenceText += `\n\n🖼️ [이미지 인식 결과]\n${ocrText}`;
    }

    // ✅ 블로그 본문 생성
    const blogResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `너는 ${category} 분야 블로그 글을 잘 쓰는 카피라이터야. SEO를 고려하고 자연스럽게 써.`,
        },
        {
          role: "user",
          content: `제목: ${title}\n\n참고 내용:\n${referenceText}\n\n이걸 기반으로 자연스럽고 완성도 높은 블로그 글을 작성해줘.`,
        },
      ],
    });

    const result = blogResponse.choices?.[0]?.message?.content || "결과 없음";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("🚨 API Error:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류 발생" },
      { status: 500 }
    );
  }
}
