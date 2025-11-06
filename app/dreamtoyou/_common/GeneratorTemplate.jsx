"use client";
import { useState } from "react";

export default function GeneratorTemplate({ selectedCategory, promptHandler, referenceText, title, images, countChars }) {
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const [result, setResult] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [charCount, setCharCount] = useState(0);

  // ✅ 글 생성
  const handleGenerate = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }

    setLoading(true);
    setResult("");
    setGeneratedTitle("");
    setOcrStatus("준비 중...");

    const dynamicTitlePrompt = title.includes("*****")
      ? "제목의 ***** 부분을 문맥에 맞는 자연스러운 문장으로 완성해줘."
      : "";

    const prompt = `
${promptHandler}

제목: ${title}
참고사항: ${referenceText}
${dynamicTitlePrompt}
`;

    // ✅ FormData 생성
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("referenceText", referenceText);
    formData.append("title", title);
    formData.append("category", selectedCategory || "정보성");

    if (images.length > 0) {
      const file = images[0].file || images[0];
      formData.append("image", file, "reference.png");
      console.log("🖼️ 이미지 전송 준비 완료:", file.name, file.type, file.size, "bytes");
      setOcrStatus("🧠 이미지 텍스트 인식 중...");
    } else {
      console.log("⚠️ 이미지 없음");
      setOcrStatus("이미지 없음");
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setOcrStatus("❌ 텍스트 인식 실패");
        setLoading(false);
        return;
      }

      setOcrStatus("✅ 텍스트 인식 완료! 글 생성 중...");

      if (!data.result) {
        alert("⚠️ 글 생성 실패 또는 오류 발생");
        setOcrStatus("❌ 글 생성 실패");
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
      setOcrStatus("✨ 완료!");
      setLoading(false);
    } catch (err) {
      console.error("🚨 Fetch 에러:", err);
      alert("서버 연결 오류! 콘솔을 확인하세요.");
      setOcrStatus("❌ 서버 오류");
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        {loading ? "생성 중..." : "글 생성하기"}
      </button>

      {ocrStatus && (
        <div className="mt-3 text-sm text-gray-700">{ocrStatus}</div>
      )}

      {generatedTitle && (
        <h2 className="mt-6 text-xl font-semibold text-indigo-700">
          {generatedTitle}
        </h2>
      )}

      {result && (
        <pre className="mt-4 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800">
          {result}
        </pre>
      )}

      {charCount > 0 && (
        <p className="text-right text-sm text-gray-500 mt-2">
          글자 수: {charCount}자
        </p>
      )}
    </div>
  );
}
