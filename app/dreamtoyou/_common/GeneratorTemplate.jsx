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

  // ✅ 파일 직접 전송 (base64 변환 불필요)
  if (images.length > 0) {
    const file = images[0].file || images[0]; // 이미지가 File 객체면 그대로
    formData.append("image", file, "reference.png");
    console.log("🖼️ 이미지 전송 준비 완료:", file.name, file.type, file.size, "bytes");
  } else {
    console.log("⚠️ 이미지 없음");
  }

  const res = await fetch("/api/generate", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  // ✅ OCR 실패 시 서버 메시지 표시
  if (data.error) {
    alert(data.error);
    setLoading(false);
    return;
  }

  if (!data.result) {
    alert("⚠️ 글 생성 실패 또는 오류 발생");
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
