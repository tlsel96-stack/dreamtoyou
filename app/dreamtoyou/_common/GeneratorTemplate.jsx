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

  // ✅ 이미지와 참고사항을 함께 보내는 FormData 방식
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("referenceText", referenceText);
  formData.append("title", title);
  formData.append("category", selectedCategory || "정보성"); // ✅ 빠졌다면 추가

  if (images.length > 0) {
    // ✅ 이미지 1장만 OCR용으로 전송
    const img = images[0];
    const byteString = atob(img.split(",")[1]);
    const mimeString = img.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let j = 0; j < byteString.length; j++) {
      ia[j] = byteString.charCodeAt(j);
    }
    const blob = new Blob([ab], { type: mimeString });
    formData.append("image", blob, "reference.png");
  }

  // ✅ API 요청
  const res = await fetch("/api/generate", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  // ✅ OCR 실패 시 메시지 표시
  if (data.error) {
    alert(data.error); // ⚠️ 서버에서 "OCR 인식 실패"나 "글 생성 오류" 등 메시지 표시
    setLoading(false);
    return;
  }

  // ✅ GPT 결과 없음
  if (!data.result) {
    alert("⚠️ 글 생성 실패 또는 오류 발생");
    setLoading(false);
    return;
  }

  // ✅ 결과 처리
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
