import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt") || "";
    const category = formData.get("category") || "";
    const image = formData.get("image");

    let extractedText = "";

    // ✅ OCR (이미지 인식)
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(`🖼️ 이미지 수신됨: ${image.name || "no-name"} (${image.type}), ${image.size} bytes`);

      try {
        const ocrResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "너는 OCR 보조자야. 이미지 안의 모든 글자를 그대로 추출해. 줄바꿈 포함. 설명하지 말고 순수 텍스트만 반환해.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "이미지 안의 텍스트를 정확히 추출해줘." },
                { type: "image_url", image_url: `data:${image.type};base64,${buffer.toString("base64")}` },
              ],
            },
          ],
        });

        extractedText = ocrResponse.choices?.[0]?.message?.content?.trim() || "";
        console.log("🧾 OCR 인식 결과:", extractedText || "(없음)");
      } catch (ocrErr) {
        console.error("❌ OCR 실패:", ocrErr);
        return NextResponse.json({ error: "🚨 OCR 처리 중 오류 발생" }, { status: 500 });
      }
    } else {
      console.warn("⚠️ 이미지가 전달되지 않았습니다.");
    }

    // ✅ 최종 프롬프트 구성
    const userPrompt = `
${prompt}
${extractedText ? `\n\n[이미지에서 추출된 참고 텍스트]\n${extractedText}` : ""}
    `;

    // ✅ GPT 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "너는 블로그 전문 작가야. 자연스럽고 SEO 최적화된 글을 작성해." },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!result) {
      return NextResponse.json({ error: "⚠️ GPT 결과가 비어 있습니다." }, { status: 500 });
    }

    return NextResponse.json({
      result,
      ocrStatus: extractedText ? "✅ 텍스트 인식 완료" : "⚠️ 이미지 인식 안 됨",
    });
  } catch (error) {
    console.error("🔥 서버 전체 오류:", error);
    return NextResponse.json(
      { error: "🚨 글 생성 중 오류 발생", details: error.message },
      { status: 500 }
    );
  }
}
