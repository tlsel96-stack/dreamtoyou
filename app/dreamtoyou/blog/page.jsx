"use client";

import { useState } from "react";

export default function BlogGenerator() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("맛집");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // ✅ 붙여넣기 감지 (Ctrl+V)
  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        setImage(file);
        alert("📸 이미지가 붙여넣기 되었습니다!");
      }
    }
  };

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

      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (err) {
      console.error("❌ 오류:", err);
      setResult("⚠️ 오류가 발생했습니다. 콘솔을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-white"
      onPaste={handlePaste}
    >
      <h1 className="text-2xl font-semibold mb-6 text-purple-700">
        💭 드림투유 블로그 글 생성기
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-4"
      >
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />

        <textarea
          placeholder="참고사항 (텍스트 입력)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full border rounded-md px-3 py-2 h-28"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="맛집">맛집</option>
          <option value="여행">여행</option>
          <option value="패션">패션</option>
          <option value="기타">기타</option>
        </select>

        <div className="text-sm text-gray-500">
          ⭐ 캡처 후 <b>Ctrl+V</b>로 바로 붙여넣기 가능
        </div>

        {/* ✅ 이미지 미리보기 */}
        {image && (
          <div className="mt-3">
            <img
              src={URL.createObjectURL(image)}
              alt="붙여넣은 이미지"
              className="rounded-lg shadow-md max-h-60 mx-auto"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded-md font-semibold hover:bg-purple-700"
        >
          {loading ? "생성 중..." : "글 생성하기"}
        </button>
      </form>

      {/* 결과 표시 */}
      {result && (
        <div className="mt-8 max-w-2xl bg-gray-50 p-6 rounded-lg shadow-md whitespace-pre-line">
          <h2 className="text-lg font-bold mb-2">📝 생성된 글</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
