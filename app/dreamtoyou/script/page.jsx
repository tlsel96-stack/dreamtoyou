import GeneratorTemplate from "../_common/GeneratorTemplate";

export default function ScriptPage() {
  const prompts = {
    "원고작성": `당신은 블로그 포스팅 작가입니다.
SEO기법을 사용해 후기성 블로그 포스팅 원고를 작성합니다.

블로그 포스팅 작가로써 활발하면서 친근하고 자연스러운 20대 여성의 말투의 한국어로 글을 씁니다.  
자연스럽게 이어지는 글로 강조하는 부분 없이 블로그 후기성 글 1000자 작성해주세요.  
전체적인 가게 소개와 음식소개 마무리로 해주세요.  
순서는 스토리텔링을 넣고 외부 → 내부 → 음식 순서대로,  
소제목 없이 자연스럽게 이어지는 글로 작성해야 하고 글자수는 700자 아래로 적지 말아주세요.`,
  };

   return (
    <GeneratorTemplate
      titleText="원고작성"
      categoryPrompts={prompts}
    />
  );
}
