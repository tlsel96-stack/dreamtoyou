"use client";
import { useState } from "react";

export default function Generator({ categoryPrompts }) {
  const [category, setCategory] = useState(Object.keys(categoryPrompts)[0]);
  const [title, setTitle] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [images, setImages] = useState([]);
  const [result, setResult] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copiedField, setCopiedField] = useState("");

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

  const handleDeleteImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1500);
  };

  const countChars = (text) => text.replace(/\s+/g, "").length;

  const handleGenerate = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요!");

    setLoading(true);
    setResult("");
    setGeneratedTitle("");

    const prompt = `
${categoryPrompts[category]}

제목: ${title}
참고사항: ${referenceText}
${images.length ? "이미지 있음 (시각 참고용)" : ""}
`;

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, referenceText, prompt, images }),
    });

    const data = await res.json();
    const [maybeTitle, ...rest] = data.content.split("\n");
    const body = rest.join("\n").trim();

    setGeneratedTitle(maybeTitle);
    setResult(body);
    setCharCount(countChars(body));
    setLoading(false);
  };

  return (
    <div>
      <div className="space-y-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2 w-full"
        >
          {Object.keys(categoryPrompts).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 입력 (예: 송파 피부관리 미코스피부관리실 *********)"
          className="border rounded p-2 w-full"
        />

        <textarea
          value={referenceText}
          onChange={(e) => setReferenceText(e.target.value)}
          onPaste={handlePaste}
          placeholder="참고사항 입력 또는 이미지 붙여넣기 (Ctrl+V)"
          className="border rounded p-2 w-full h-24"
        />

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {images.map((src, i) => (
              <div key={i} className="relative inline-block">
                <img
                  src={src}
                  alt={`preview-${i}`}
                  className="w-20 h-20 object-cover rounded shadow"
                />
                <button
                  onClick={() => handleDeleteImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
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
          className="bg-indigo-600 text-white px-4 py-2 rounded w-full font-semibold"
        >
          {loading ? "✨ 글 생성 중..." : "✍️ 글 생성하기"}
        </button>
      </div>

      {generatedTitle && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">📌 제목</h2>
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
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">📝 본문</h2>
            <button
              onClick={() => handleCopy(result, "body")}
              className="text-sm bg-gray-200 px-2 py-1 rounded"
            >
              {copiedField === "body" ? "✅ 복사됨" : "복사하기"}
            </button>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed mt-2">{result}</p>
          <p className="text-sm text-gray-600 mt-3">
            공백 제외 글자 수: {charCount}자
          </p>
        </div>
      )}
    </div>
  );
}
