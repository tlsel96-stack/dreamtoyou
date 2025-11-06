"use client";
import { useState } from "react";

export default function BlogGenerator() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("맛집");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 이미지 붙여넣기 지원 (Ctrl+V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        const file = item.getAsFile();
        setImage(file);
        setPreview(URL.createObjectURL(file));
        alert("📸 이미지가 붙여넣기 되었습니다!");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
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
      if (data.result) {
        setResult(data.result);
      } else {
        setResult("❌ 오류 발생. 콘솔을 확인하세요.");
      }
    } catch (err) {
      setResult("⚠️ 요청 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-white"
      onPaste={handlePaste}
    >
      <h1 className="text-2xl font-bold mb-6 text-purple-700">
        💭 드림투유 블로그 글 생성기
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md"
      >
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        />

        <textarea
          placeholder="참고사항 (텍스트 입력)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="border p-2 rounded w-full mb-3 h-28"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        >
          <option>맛집</option>
          <option>여행</option>
          <option>뷰티</option>
          <option>일상</option>
          <option>기타</option>
        </select>

        {/* ✅ 파일 업로드 */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-2"
        />
        <p className="text-sm text-gray-500 mb-3">
          ⭐ 이미지를 붙여넣기(Ctrl+V)로도 추가할 수 있습니다
        </p>

        {/* ✅ 미리보기 */}
        {preview && (
          <img
            src={preview}
            alt="미리보기"
            className="rounded-lg shadow mb-4"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white font-bold py-2 px-4 rounded w-full"
        >
          {loading ? "생성 중..." : "글 생성하기"}
        </button>
      </form>

      {/* ✅ 결과 표시 */}
      {result && (
        <div className="bg-gray-50 border mt-6 rounded-xl p-4 w-full max-w-md">
          <h2 className="font-semibold mb-2">📝 생성된 글</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
