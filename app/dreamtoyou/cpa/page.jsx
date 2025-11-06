"use client";
import { useState } from "react";

export default function CpaPage() {
  const [title, setTitle] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [category, setCategory] = useState("후기성");
  const [result, setResult] = useState({ title: "", body: "", tags: "" });
  const [loading, setLoading] = useState(false);

  // 복사 기능
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ 복사 완료!");
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert("업체명(제품명)을 입력해주세요!");
      return;
    }

    setLoading(true);
    setResult({ title: "", body: "", tags: "" });

    const prompt = `
당신은 블로그 상위노출에 특화된 글쓰기 전문가입니다.  
아래 조건을 기반으로 블로그 원고를 작성하세요.  

[공통 지시사항]  
1. 주제에 맞는 SEO 최적화 제목을 3개 제안하세요.  
2. 본문은 최소 1,200자 이상으로 작성하세요.  
3. 주요 키워드는 3~5회 자연스럽게 반복 사용하세요.  
4. 문단마다 소제목을 넣어 가독성을 높이세요.  
5. 문체는 자연스럽고 매끄럽게, 사람처럼 작성하세요.  
6. 금지어(무료, 24시간, 최고 수준의 등)는 사용하지 말고  
   “실시간”, “맞춤형”, “최적의” 등으로 대체하세요.  
7. 마무리에는 상위노출용 해시태그 15~20개를 추천하세요.  
8. 입력된 참고사항이 있다면 반드시 본문 내용에 반영하세요.  

---

[분류: ${category}]  
${category === "후기성"
  ? `후기성이라면:  
  직접 경험한 후기처럼 시작하고, 사용 전 불편함 → 선택 이유 → 사용 후 변화 → 주변 반응 → 총평 흐름으로 작성하세요.  
  문체는 1인칭(“제가”, “직접 써봤어요”)으로 감정이 담기게.  
  실제 후기처럼 자연스러운 문장과 공감 포인트를 넣고, 참고사항의 디테일을 포함하세요.`
  : `정보성이라면:  
  독자가 궁금해할 핵심 정보를 정리하듯 작성하세요.  
  “문제 인식 → 정보 제공 → 팁 및 차별점 → 신뢰 구축 → 행동 유도” 구조로 구성하세요.  
  전문적이지만 부담스럽지 않게, 참고사항은 사실 근거처럼 녹이세요.`}

---

[입력 정보]  
업체명(제품명): ${title}
참고사항: ${referenceText || "없음"}
사용자 지정 해시태그: ${hashtags || "없음"}

출력 형식:
[제목]
(SEO 추천 제목 3개)

[본문]
(블로그 본문 내용)

[해시태그]
(SEO용 해시태그 목록)
`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const text = data.result || data.content || "";

      // GPT 출력 파싱
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
          💼 CPA 원고 생성기
        </h1>

        {/* 원고 유형 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">원고 유형</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-400"
          >
            <option value="후기성">후기성 원고</option>
            <option value="정보성">정보성 원고</option>
          </select>
        </div>

        {/* 업체명 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">업체(제품)명</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 키올리 성장 영양제"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        {/* 참고사항 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">참고사항</label>
          <textarea
            value={referenceText}
            onChange={(e) => setReferenceText(e.target.value)}
            placeholder="Ctrl+V로 이미지 붙여넣기 가능"
            className="border border-gray-300 rounded-lg p-3 w-full h-24 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
          />
        </div>

        {/* 해시태그 입력 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">
            해시태그 (선택 입력)
          </label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#키올리 #키성장 #영양제"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        {/* 버튼 */}
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
