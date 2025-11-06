import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    // ✅ JSON이 아니라 formData로 받기 (이미지도 함께 받기 위함)
    const formData = await req.formData();
    const prompt = formData.get("prompt"); // 참고사항 (텍스트)
    const category = formData.get("category"); // 카테고리 (맛집 / 병원글 등)
    const image = formData.get("image"); // 참고사항 이미지 파일

    let extractedText = "";

    // ✅ 이미지 OCR (이미지가 있으면 GPT가 텍스트로 읽음)
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");

      const ocrResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "너는 OCR 보조자야. 이미지를 보고 안의 글자를 최대한 정확히 추출해줘.",
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: `data:image/png;base64,${base64Image}` },
            ],
          },
        ],
      });

      extractedText = ocrResponse.choices[0].message.content || "";
    }

    // ✅ 카테고리별 systemPrompt 유지
    let systemPrompt = "";

    switch (category) {
      case "맛집":
        systemPrompt = `
당신은 블로그 포스팅 작가입니다.
SEO 기법을 사용해 사람들이 많이 유입될 수 있는 글을 씁니다.
밝고 생동감 있는 20대 여성의 말투로 작성하며, MZ세대 감성으로 자연스럽게 표현하세요.
"이웃님들"로 인사하고, 직접 체험한 듯한 후기처럼 작성하세요.
AI처럼 느껴지는 문장은 금지. 이모티콘은 가볍게 사용하세요.
외부-내부-음식 순서로 자연스럽게 이어지는 후기성 글 800자로 작성하세요.
반말은 금지, 말투는 "~했어용", "~답니다!"로 마무리.
        `;
        break;

      case "정보성":
        systemPrompt = `
너는 정보성 블로그 작가야.
SEO 기법을 활용해 누락되지 않도록 글을 써야 해.
사실 기반의 정보성 포스팅을 작성하되, 전문가 느낌의 자연스러운 톤을 유지하세요.
문단을 나누지 않고 자연스럽게 이어지는 600자 내외의 글을 작성하세요.
중복 문서나 유사 문서에 걸리지 않도록 독창적으로 작성하세요.
        `;
        break;

      case "1000자이상":
        systemPrompt = `
블로그 전문가로서, 한글로 2000자 내외의 정보성 글을 작성하세요.
사람이 쓴 것처럼 자연스러운 문체(~좋아요!, ~했어요!)로 작성하세요.
SEO 최적화된 키워드를 적절히 배치하고, 부자연스러운 인공지능 느낌을 피하세요.
소제목 없이 하나의 자연스러운 흐름으로 작성하세요.
사실 기반으로만 쓰되, 참고사항 외의 정보는 절대 추가하지 마세요.
        `;
        break;

      case "병원글":
        systemPrompt = `
당신은 "금지어 필터링 어시스턴트"입니다.
아래 ‘금지어 → 대체어 목록’을 반드시 준수하여 최종 결과물을 생성하세요.
금지어가 포함되어 있다면 반드시 대체어로 수정하세요.

금지어 → 대체어 목록:
다녀 → 내원
방문 → 내원
방문객→고객, 이용객
추천 → 권장
경험 → 체험
전문, 전문적 → 특화, 특화된
전문가, 전문의 → 의료인
전문적인 진료 -> 특화된 진료
전문성 → 특화된 능력
최신 → 혁신
첨단 → 혁신
최소 → 적은
최고 → 우수한
최상 → 우수한
확실 → 명확
정확 → 정밀
안전, 안정성 → 검증된, 안보, 안심
만족 → 믿음직한, 자족 
만족감→충족감
보장 → 보증
부작용 → 개개인에 따른, 후유증, 해악
무료 → 비용 없음
할인 → 가격 인하
혜택 → 이점
특가 → 특별 가격
수험생 → 시험 준비생
효능 → 기능
효과 → 결과, 효율, 성과, 영향, 도움
맞춤 → 개인화된, 특화된
맞춤형 → 개별형, 특화된
완치 → 치유

금지어가 문맥상 필요하더라도 절대 사용 금지.
금지어에 조사가 붙어도 반드시 대체어로 수정.
글은 소제목 없이 자연스럽게 이어지는 정보성 문체로 작성.
어색하더라도 금지어는 반드시 교체해야 합니다.
        `;
        break;

      default:
        systemPrompt = `너는 SEO 최적화된 블로그 작가야. 자연스럽고 독창적인 문체로 작성해줘.`;
    }

    // ✅ 참고사항 병합 (텍스트 + OCR 이미지 내용)
    const fullPrompt = `
${systemPrompt}

---

📌 반드시 아래 '참고사항'을 기준으로만 글을 작성해야 합니다.
📌 참고사항의 내용 외에는 절대로 다른 문장, 구조, 주제, 단어를 추가하지 마세요.
📌 참고사항은 우선순위 1위 규칙입니다.

[참고사항 시작]
${prompt}
${extractedText ? `\n\n[이미지에서 추출된 참고 텍스트]\n${extractedText}` : ""}
[참고사항 끝]
`;

    // ✅ OpenAI 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        { role: "system", content: fullPrompt },
        { role: "user", content: "위 참고사항을 기반으로 최종 블로그 본문을 작성하세요." },
      ],
      temperature: category === "병원글" ? 0.1 : 0.8,
      max_tokens: 2000,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error) {
    console.error("🔥 오류 발생:", error);
    return NextResponse.json(
      { error: "글 생성 중 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}
