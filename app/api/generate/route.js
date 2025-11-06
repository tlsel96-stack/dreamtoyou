import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt");
    const category = formData.get("category");
    const image = formData.get("image");
    const title = formData.get("title");

    let referenceText = prompt;

    // ✅ OCR 처리 (이미지 → 텍스트 추출)
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const base64Image = buffer.toString("base64");

      const ocrResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini", // ✅ OCR 지원 모델
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "이 이미지에서 글자 내용을 한국어로 인식해줘." },
              {
                type: "image_url",
                image_url: `data:image/png;base64,${base64Image}`,
              },
            ],
          },
        ],
      });

      const ocrText = ocrResponse.choices[0].message.content.trim();
      referenceText += `\n\n(이미지 인식 결과)\n${ocrText}`;
    }

    // ✅ 블로그 글 생성
    const blogResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `너는 ${category} 블로그 글을 잘 쓰는 카피라이터야.`,
        },
        {
          role: "user",
          content: `제목: ${title}\n\n참고내용:\n${referenceText}\n\n이걸 바탕으로 자연스럽고 완성도 높은 블로그 글을 작성해줘.`,
        },
      ],
    });

    const result = blogResponse.choices[0].message.content;

    return NextResponse.json({ result });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
