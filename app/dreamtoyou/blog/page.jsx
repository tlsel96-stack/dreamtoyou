"use client";
import { useState, useEffect } from "react";

export default function DreamToYouBlogPage() {
  const [title, setTitle] = useState(""); // ✅ 제목 추가
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("맛집");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 붙여넣기로 이미지 업로드
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          setImage(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("prompt", prompt);
    formData.append("category", category);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data.result || "⚠️ 오류 발생");
    } catch (err) {
      setResult("서버 오류: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
        🧠 드림투유 블로그 글 생성기
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-md"
      >
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-300"
        />

        <textarea
          placeholder="참고사항 (텍스트 입력)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-indigo-300"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg p-2"
        >
          <option value="맛집">맛집</option>
          <option value="정보성">정보성</option>
          <option value="1000자이상">1000자이상</option>
          <option value="병원글">병원글</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="border border-gray-300 rounded-lg p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-white font-semibold rounded-lg transition ${
            loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "생성 중..." : "글 생성하기"}
        </button>
      </form>

      {result && (
        <div className="mt-8 bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-indigo-600">
            ✅ 생성 결과
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed">{result}</p>
        </div>
      )}
    </main>
  );
}
