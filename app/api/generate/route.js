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
                "너는 OCR 보조자야. 이미지 안의 모든 글자를 있는 그대로 추출해. 줄바꿈도 그대로. 설명하지 말고 순수 텍스트만 반환해.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "이미지 안의 텍스트를 정확히 추출해줘." },
                { type: "input_image", image: buffer },
              ],
            },
          ],
        });

        extractedText = ocrResponse.choices?.[0]?.message?.content?.trim() || "";
        console.log("🧾 OCR 인식 결과:", extractedText || "(없음)");

        if (!extractedText) {
          return NextResponse.json(
            { error: "⚠️ 이미지에서 텍스트를 인식하지 못했습니다. (OCR 결과 없음)" },
            { status: 400 }
          );
        }
      } catch (ocrErr) {
        console.error("❌ OCR 실패:", ocrErr);
        return NextResponse.json(
          { error: "🚨 OCR 처리 중 오류 발생 (이미지 인식 실패)" },
          { status: 500 }
        );
      }
    } else {
      console.warn("⚠️ 이미지가 전달되지 않았습니다.");
    }

    // ✅ 카테고리별 systemPrompt
    let systemPrompt = "";

    switch (category) {
      case "맛집":
        systemPrompt = `
당신은 블로그 포스팅 작가입니다.
seo기법을 사용해 사람들이 많이 유입 될 수 있는 글을 씁니다

블로그 포스팅 작가로써 활발하면서 친근하고 자연스러운 20대 여성의 말투의 한국어로 글을 씁니다, 
말투는 자연스럽지만 생동감 있게 다양한 표현을 섞어서 직접 경험한 듯한 사용합니다. 
구구절절 AI처럼 느껴지는 진부한 표현말고 MZ세대 느낌의 말투로 포스팅을 작성합니다. 
인사말은 여러분이 아닌 이웃님들로 사용합니다. 맛 평가도 해주세요.

최적화된 SEO 작성 기법을 사용하여 블로그 포스팅 후기를 작성합니다.
본문은 독창적인 내용으로 직접 다녀온 것 처럼 이 곳을 추천한다는 느낌으로 왜 이곳을 방문해야 하는지 어필하고
 자연스러운 스토리텔링으로 다양한 정보와 장점들을 자연스럽게 녹여서 작성하여 독자가 이 글을 읽고 방문해보고 
싶다는 느낌이 들도록 작성하고, 적재적소에 이모티콘도 가끔 넣어줘.
유사문서에 걸리지않게 작성해줘.

외부-내부-음식 순서대로 자연스럽게 이어지는 후기성글 800자 작성해줘
반말은 말고 말투는 ~했어용!, ~답니다!, 밝고 에너지 넘치게 적어줘

참고사항 외에 내용은 마음대로 추가하면 안되니깐 자연스럽게 이어지는 글로 참고사항보고 작성해줘
        `;
        break;

      case "정보성":
        systemPrompt = `
너는 정보성 블로그를 작성하는 블로거야
seo기법을 사용해 누락되지 않는 블로그 글 작성해줘

-자연스럽게 이어지는 정보성 포스팅 600자 작성해줘. 
-사람들이 보고 이해하기 쉽도록 본문은 상세하게 설명해줘. 
-전문가느낌이 나는 자연스러운 말투로 작성해줘. 
-문단을 나누지 않고 자연스럽게 이어지는 글로 작성해줘.
-네이버 블로그 유사문서, 중복문서에 걸리지 않도록, 사실을 바탕으로 작성해줘.
-SEO기법으로 상위노출이 가능하게끔 키워드를 적절하게 사용해서 작성해줘.
-사람들이 읽고 흥미를 가질만하게 적어줘.
-참고사항 외에 다른 내용은 절대로 들어가면 안되니깐 그 부분 참고해서 자연스럽게 이어지는 글 작성해줘
        `;
        break;

      case "1000자이상":
        systemPrompt = `
[조건:블로그전문가로써,한글로블로그글작성부탁해!
유사문서중복문서에걸리지않도록!사실을바탕으로!
글자수2000자!
사람이쓴것처럼자연어로작성!(~좋아요! , ~했어요!)
소제목없이 자연스럽게 이어지는 글로 작성!

참고사항에 없는 내용은 들어가면 안돼.

정보성 포스팅 작성해줘. 
사람들이 보고 이해하기 쉽도록 
본문은 상세하게 설명해주고 전문가느낌이 나는 자연스러운 말투로 작성해줘.
SEO기법을 사용해 상위노출이 가능하게끔 키워드를 적절하게 사용해서 작성해줘.
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

  // ✅ GPT 호출
     const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!result) {
      return NextResponse.json(
        { error: "⚠️ GPT 결과가 비어 있습니다." },
        { status: 500 }
      );
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
