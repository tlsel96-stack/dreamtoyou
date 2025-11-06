"use client";
import { useState } from "react";

export default function GeneratorTemplate({ titleText, promptHandler }) {
  const [title, setTitle] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [images, setImages] = useState([]);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [result, setResult] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const countChars = (text) => text.replace(/\s+/g, "").length;

  // ✅ 붙여넣기 이미지 처리
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = () => setImages((prev) => [...prev, reader.result]);
        reader.readAsDataURL(file);
      }
    }
  };

  // ✅ 복사 버튼 기능
  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1500);
  };

  // ✅ 글 생성
  const handleGenerate = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }

    setLoading(true);
    setResult("");
    setGeneratedTitle("");

    const dynamicTitlePrompt = title.includes("*****")
      ? "제목의 ***** 부분을 문맥에 맞는 자연스러운 문장으로 완성해줘. 예: '송파 피부관리 미코스피부관리실 최상의 관리'처럼."
      : "";

    const prompt = `
${promptHandler}

제목: ${title}
참고사항: ${referenceText}
${images.length ? "이미지 있음 (시각 참고용)" : ""}
${dynamicTitlePrompt}
`;

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (!data.result) {
      setResult("⚠️ 글 생성 실패 또는 오류 발생");
      setLoading(false);
      return;
    }

    const content = data.result.trim();
    const [maybeTitle, ...rest] = content.split("\n");
    const cleanTitle =
      maybeTitle.length < 80 ? maybeTitle : title.replace("*****", "");
    const body = rest.join("\n").trim();

    setGeneratedTitle(cleanTitle);
    setResult(body);
    setCharCount(countChars(body));
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-indigo-50 flex flex-col items-center justify-start py-16 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 border border-indigo-100">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
          ✨ {titleText}
        </h1>

        <div className="space-y-4">
          <label className="block text-gray-700 font-medium">제목 입력</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 송파 피부관리 미코스피부관리실 *********"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />

          <div>
            <label className="block text-gray-700 font-medium mb-1">참고사항</label>
            <textarea
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              onPaste={handlePaste}
              placeholder="Ctrl+V로 이미지 붙여넣기 가능"
              className="border border-gray-300 rounded-lg p-3 w-full h-28 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
            />
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {images.map((src, i) => (
                <div key={i} className="relative inline-block">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() =>
                      setImages((prev) => prev.filter((_, index) => index !== i))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                    title="이미지 삭제"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-3 rounded-xl w-full font-semibold shadow-md text-lg"
          >
            {loading ? "✨ 글 생성 중..." : "✍️ 글 생성하기"}
          </button>
        </div>

        {generatedTitle && (
          <div className="mt-8 p-4 border rounded-lg bg-gray-50 shadow-inner">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">📌 제목</h2>
              <button
                onClick={() => handleCopy(generatedTitle, "title")}
                className="text-sm bg-gray-200 px-2 py-1 rounded"
              >
                {copiedField === "title" ? "✅ 복사됨" : "복사하기"}
              </button>
            </div>
            <p className="mt-2 font-medium">{generatedTitle}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-inner whitespace-pre-wrap leading-relaxed">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">📝 본문</h2>
              <button
                onClick={() => handleCopy(result, "body")}
                className="text-sm bg-gray-200 px-2 py-1 rounded"
              >
                {copiedField === "body" ? "✅ 복사됨" : "복사하기"}
              </button>
            </div>
            <p className="mt-2">{result}</p>
            <p className="text-sm text-gray-600 mt-3">
              공백 제외 글자 수: {charCount}자
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
