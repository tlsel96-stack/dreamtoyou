"use client";
import { useState } from "react";

export default function DailyPage() {
  const [topic, setTopic] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState("");
  const [body, setBody] = useState("");
  const [hashtags, setHashtags] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("주제를 입력해주세요!");
      return;
    }

    setLoading(true);
    setTitles("");
    setBody("");
    setHashtags("");

    const prompt = `
당신은 블로그 상위노출에 최적화된 콘텐츠 전문가입니다.
아래 조건을 충실히 반영해 주세요.

[조건]
1️⃣ 주제에 맞는 SEO 최적화 제목 3개를 제시하되, 번호나 불릿(*, -, #) 없이 줄바꿈으로 구분하세요.
2️⃣ 본문은 스토리텔링 기반으로 ‘공감 → 정보 제공 → 신뢰 유도 → 행동 유도’ 흐름으로 작성하세요.
3️⃣ 주요 키워드는 자연스럽게 3~5회 이상 포함하세요.
4️⃣ 문단마다 소제목을 넣어 가독성을 높이세요.
5️⃣ 글자 수는 최소 1,200자 이상으로 작성하세요.
6️⃣ 참고사항이 있으면 본문에 자연스럽게 반영하세요.
7️⃣ 마지막에는 SEO 해시태그 15~20개를 생성하되, 각 단어 앞에 #을 붙이고 쉼표로 구분하세요.
8️⃣ 출력 시 제목, 본문, 해시태그를 아래 형식에 맞게 구분해서 출력하세요.

[입력 정보]
주제: ${topic}
참고사항: ${reference || "없음"}

[출력 형식]
[제목]
(SEO 제목 3개)
[본문]
(스토리텔링 기반 본문)
[해시태그]
(#단어,#단어,#단어,...)
`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const result = data.result;

      // 결과를 섹션별로 나눔
      const titleMatch = result.match(/\[제목\]([\s\S]*?)\[본문\]/);
      const bodyMatch = result.match(/\[본문\]([\s\S]*?)\[해시태그\]/);
      const hashtagsMatch = result.match(/\[해시태그\]([\s\S]*)/);

      setTitles(titleMatch ? titleMatch[1].trim() : "제목이 감지되지 않았습니다.");
      setBody(bodyMatch ? bodyMatch[1].trim() : "본문이 감지되지 않았습니다.");
      setHashtags(hashtagsMatch ? hashtagsMatch[1].trim() : "해시태그가 감지되지 않았습니다.");
    } catch (error) {
      console.error("🔥 오류 발생:", error);
      alert("글 생성 중 문제가 발생했습니다.");
    }

    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("복사되었습니다!");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-indigo-50 flex flex-col items-center justify-start py-16 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 border border-indigo-100">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
          🪄 블로그 세팅 첫단계
        </h1>

        {/* 입력폼 */}
        <div className="space-y-4">
          <label className="block text-gray-700 font-medium">주제</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 여름철 피부관리 꿀팁"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />

          <div>
            <label className="block text-gray-700 font-medium mb-1">참고사항</label>
            <textarea
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ctrl+V로 이미지 붙여넣기 가능"
              className="border border-gray-300 rounded-lg p-3 w-full h-28 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-3 rounded-xl w-full font-semibold shadow-md text-lg"
          >
            {loading ? "✨ 원고 생성 중..." : "✍️ 글 생성하기"}
          </button>
        </div>

        {/* 결과 출력 */}
        {(titles || body || hashtags) && (
          <div className="mt-10 p-4 border rounded-lg bg-gray-50 shadow-inner leading-relaxed space-y-6">
            <section>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-indigo-600">📌 제목</h2>
                <button
                  onClick={() => handleCopy(titles)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-600"
                >
                  복사하기
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-800">{titles}</pre>
            </section>

            <section>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-indigo-600">📝 본문</h2>
                <button
                  onClick={() => handleCopy(body)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-600"
                >
                  복사하기
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-800">{body}</pre>
            </section>

            <section>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-indigo-600">🏷 해시태그</h2>
                <button
                  onClick={() => handleCopy(hashtags)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-600"
                >
                  복사하기
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-800">{hashtags}</pre>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
