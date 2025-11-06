"use client";
import { useState, useRef, useEffect } from "react";

export default function BlogGenerator() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("맛집");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 이미지 붙여넣기 이벤트 추가
  useEffect(() => {
    const handlePaste = (e) => {
      const item = Array.from(e.clipboardData.items).find((x) =>
        x.type.startsWith("image/")
      );
      if (item) {
        const file = item.getAsFile();
        setImage(file);
        alert("📸 이미지가 붙여넣기 되었습니다!");
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
      setResult(data.result || "오류 발생");
    } catch (err) {
      setResult("❌ 요청 실패: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6 text-purple-600">
        💬 드림투유 블로그 글 생성기
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-lg bg-white shadow-lg rounded-2xl p-6"
      >
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mb-3 rounded"
        />

        <textarea
          placeholder="참고사항 (텍스트 입력)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="border p-2 mb-3 rounded h-32"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 mb-3 rounded"
        >
          <option value="맛집">맛집</option>
          <option value="여행">여행</option>
          <option value="리뷰">리뷰</option>
          <option value="기타">기타</option>
        </select>

        <div className="text-sm text-gray-500 mb-4">
          ✨ 캡처 후 <b>Ctrl + V</b> 로 바로 붙여넣기 가능
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? "생성 중..." : "글 생성하기"}
        </button>
      </form>

      {result && (
        <div className="mt-6 w-full max-w-3xl bg-gray-100 p-4 rounded-lg whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
