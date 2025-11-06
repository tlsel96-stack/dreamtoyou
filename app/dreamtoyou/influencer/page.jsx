"use client";
import { useState } from "react";

export default function InfluencerPage() {
  const [topic, setTopic] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [result, setResult] = useState({ title: "", body: "", tags: "" });
  const [loading, setLoading] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ 복사 완료!");
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("주제를 입력해주세요!");
      return;
    }

    setLoading(true);
    setResult({ title: "", body: "", tags: "" });

    const prompt = `
당신은 블로그 상위노출에 특화된 콘텐츠 카피라이터입니다.
다음 조건을 반영해 ‘광플루언서형 블로그 글’을 작성해주세요.

[목표]
1️⃣ 주제에 맞는 SEO 최적화 제목 3개를 제안하되,
   번호(1. 2. 3.)나 불릿(*, -, #) 없이 한 줄씩 줄바꿈 형태로 제시하세요.  
   예:  
   첫 번째 제목  
   두 번째 제목  
   세 번째 제목  

2️⃣ 본문은 스토리텔링 기반으로 작성하고,  
   ‘공감 → 정보제공 → 신뢰유도 → 행동유도’ 구조를 따르세요.  
   자연스럽고 사람처럼 말하듯이 작성하세요.  

3️⃣ 주요 키워드는 자연스럽게 3~5회 이상 포함하세요.  
4️⃣ 문단마다 소제목을 넣어 가독성을 높이세요.  
5️⃣ 글자 수는 최소 1,200자 이상으로 하세요.  
6️⃣ 문체는 자연스럽고 1인칭 시점 사용 가능하며, 공감이 느껴지게 표현하세요.  
7️⃣ 입력된 참고사항이 있다면 반드시 본문 내용에 녹여서 활용하세요.  

8️⃣ 마지막에는 SEO 상위노출용 해시태그 15~20개를 생성하되,  
   각 단어 앞에 반드시 ‘#’을 붙이고, 쉼표(,)로 구분하여 나열하세요.  
   예시: #여행,#국내여행,#힐링,#플루언서,#감성카페,#주말코스  

[입력 정보]  
주제: ${topic}
참고사항: ${referenceText || "없음"}

출력 형식:
[제목]
(SEO 추천 제목 3개, 줄바꿈으로 구분)

[본문]
(블로그 본문)

[해시태그]
(#이 붙은 해시태그들을 쉼표로 구분)
`;


    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const text = data.result || data.content || "";

      const titlePart = text.match(/\[제목\]([\s\S]*?)\[본문\]/)?.[1]?.trim() || "";
      const bodyPart = text.match(/\[본문\]([\s\S]*?)\[해시태그\]/)?.[1]?.trim() || "";
      const tagPart = text.match(/\[해시태그\]([\s\S]*)/)?.[1]?.trim() || "";

      setResult({
        title: titlePart,
        body: bodyPart,
        tags: tagPart,
      });
    } catch (err) {
      console.error("❌ 오류 발생:", err);
      setResult({
        title: "",
        body: "",
        tags: "⚠️ 글 생성 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-indigo-50 flex flex-col items-center justify-start py-16 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 border border-indigo-100">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
          💫 광플루언서 만들기
        </h1>

        {/* 주제 입력 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">주제</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 요즘 핫한 MZ세대 여행지 추천"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        {/* 참고사항 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">참고사항</label>
          <textarea
            value={referenceText}
            onChange={(e) => setReferenceText(e.target.value)}
            placeholder="Ctrl+V로 이미지 붙여넣기 가능"
            className="border border-gray-300 rounded-lg p-3 w-full h-24 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
          />
        </div>

        {/* 글 생성 버튼 */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-2 bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-3 rounded-xl w-full font-semibold shadow-md text-lg"
        >
          {loading ? "✨ 글 생성 중..." : "✍️ 글 생성하기"}
        </button>

        {/* 결과 */}
        {result.title && (
          <div className="mt-8 space-y-6">
            {/* 제목 */}
            <div className="p-4 border rounded-lg bg-gray-50 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-indigo-600">⭐ 제목</h2>
                <button
                  onClick={() => copyToClipboard(result.title)}
                  className="text-sm text-indigo-600 border px-2 py-1 rounded hover:bg-indigo-100"
                >
                  복사하기
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-gray-800">
                {result.title}
              </pre>
            </div>

            {/* 본문 */}
            <div className="p-4 border rounded-lg bg-gray-50 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-indigo-600">📝 본문</h2>
                <button
                  onClick={() => copyToClipboard(result.body)}
                  className="text-sm text-indigo-600 border px-2 py-1 rounded hover:bg-indigo-100"
                >
                  복사하기
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-gray-800">
                {result.body}
              </pre>
            </div>

            {/* 해시태그 */}
            <div className="p-4 border rounded-lg bg-gray-50 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-indigo-600">🏷 해시태그</h2>
                <button
                  onClick={() => copyToClipboard(result.tags)}
                  className="text-sm text-indigo-600 border px-2 py-1 rounded hover:bg-indigo-100"
                >
                  복사하기
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-gray-800">
                {result.tags}
              </pre>
            </div>

            {/* 전체 복사 */}
            <button
              onClick={() =>
                copyToClipboard(
                  `${result.title}\n\n${result.body}\n\n${result.tags}`
                )
              }
              className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-lg shadow hover:bg-indigo-600 transition"
            >
              📋 전체 복사하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
