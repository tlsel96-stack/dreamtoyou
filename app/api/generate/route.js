import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt");
    const category = formData.get("category");
    const image = formData.get("image");

    let extractedText = "";

    // ✅ 이미지 OCR (있을 경우)
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");

      const ocrResponse = await openai.chat.completions.create({
        model: "gpt-4o", // ✅ vision 지원 모델
        messages: [
          {
            role: "system",
            content: `
너는 OCR 전용 보조자야.
이미지를 분석할 때 설명이나 요약을 하지 말고,
보이는 글자만 정확하게 추출해.
줄바꿈과 띄어쓰기도 그대로 유지해줘.
출력은 순수한 텍스트만 포함해야 하며, 다른 말은 절대 하지 마.
            `,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: `data:image/png;base64,${base64Image}`,
              },
            ],
          },
        ],
      });

      extractedText = ocrResponse.choices[0].message.content || "";
      console.log("🧾 OCR 인식 결과:", extractedText);
    }

    // ✅ 카테고리별 systemPrompt
    let systemPrompt = "";

    switch (category) {
      case "맛집":
        systemPrompt = `
당신은 블로그 포스팅 작가입니다.
seo기법을 사용해 사람들이 많이 유입 될 수 있는 글을 씁니다.
밝고 친근한 20대 여성의 말투로 작성하며, 자연스럽고 생동감 있게 표현하세요.
반말은 금지, 말투는 "~했어용", "~답니다!"로 마무리하세요.
외부→내부→음식 순서로 자연스럽게 이어지는 후기성 글을 800자 내외로 작성하세요.
참고사항 외의 정보는 절대 추가하지 마세요.
        `;
        break;

      case "정보성":
        systemPrompt = `
너는 정보성 블로그를 작성하는 블로거야.
SEO 기법을 활용해 누락되지 않도록 작성하되,
참고사항 내용만 사용해야 해.
참고사항 외의 병원명, 지역명, 브랜드명, 키워드는 절대 추가하지 마.
사실 기반으로 자연스럽게 이어지는 글 600자 내외로 작성해.
        `;
        break;

      case "1000자이상":
        systemPrompt = `
너는 블로그 전문가야.
참고사항 내용만 바탕으로 2000자 내외의 자연스러운 글을 작성해.
참고사항 외 단어나 지역명, 병원명, 제목 키워드는 절대 사용하지 마.
자연스럽게 이어지는 정보성 글로 써줘.
        `;
        break;

      case "병원글":
        systemPrompt = `
너는 병원 블로그 전문 작가야.
금지어 필터링을 지키되, 참고사항 외의 정보는 절대 추가하지 마.
제목의 병원명이나 지역명이 포함되어 있어도 무시해.
참고사항 내용만 본문에 사용해야 해.
병원 소개글, 시술 설명, 지역 언급은 절대 쓰지 마.

금지어 → 대체어:
다녀→내원, 방문→내원, 방문객→고객, 이용객,
추천→권장, 전문→특화, 전문가→의료인,
최신→혁신, 최고→우수한, 확실→명확, 안전→검증된,
만족→믿음직한, 효과→도움, 무료→비용 없음,
혜택→이점, 맞춤→개인화된, 완치→회복
        `;
        break;

      default:
        systemPrompt = `
너는 블로그 작가야.
참고사항 내용만 사용해서 자연스럽게 글을 써.
참고사항 외 단어나 지역, 브랜드, 병원명은 절대 언급하지 마.
        `;
    }

    // ✅ userPrompt (참고사항)
    const userPrompt = `
📌 아래 참고사항 내용만 사용해서 글을 작성하세요.
📌 참고사항 외의 정보, 병원명, 지역명, 시술명, 키워드는 절대 추가하지 마세요.
📌 제목이 있더라도 그 안의 단어를 본문에 엮지 마세요.

[참고사항 시작]
${prompt}
${extractedText ? `\n\n[이미지에서 추출된 참고 텍스트]\n${extractedText}` : ""}
[참고사항 끝]
`;

    // ✅ GPT 호출 (최종 글 생성)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // ✅ 여기도 통일
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature:
        category === "병원글" ? 0.2 : category === "정보성" ? 0.5 : 0.8,
      max_tokens: 2000,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error) {
    console.error("🔥 오류 발생:", error.response?.data || error);
    return NextResponse.json(
      {
        error: "글 생성 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
