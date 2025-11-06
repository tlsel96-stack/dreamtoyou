import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") || "제목 없음";
    const prompt = formData.get("prompt") || "";
    const category = formData.get("category") || "기타";
    const image = formData.get("image");

    let referenceText = prompt;

    // ✅ OCR: 이미지 → 텍스트
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const base64 = buffer.toString("base64");

      const ocr = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "이 이미지 속 글자를 한국어로 정확하게 읽어줘." },
              { type: "image_url", image_url: `data:image/png;base64,${base64}` },
            ],
          },
        ],
      });

      const ocrText = ocr.choices?.[0]?.message?.content?.trim() || "";
      if (ocrText) referenceText += `\n\n[이미지 인식 결과]\n${ocrText}`;
    }

    // ✅ 블로그 글 생성
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `너는 ${category} 관련 블로그 글을 잘 쓰는 작가야.`,
        },
        {
          role: "user",
          content: `제목: ${title}\n\n참고내용:\n${referenceText}\n\n이 내용을 기반으로 자연스럽고 완성도 높은 블로그 글을 작성해줘.`,
        },
      ],
    });

    const result = response.choices?.[0]?.message?.content || "결과 없음";
    return NextResponse.json({ result });
  } catch (err) {
    console.error("🚨 서버 오류:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
