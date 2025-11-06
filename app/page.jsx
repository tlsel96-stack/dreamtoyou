"use client";
import Link from "next/link";

export default function DreamToYouMain() {
  const categories = [
    { name: "드림투유 블로그", path: "/dreamtoyou/blog", desc: "드림투유 블로그 포스팅" },
    { name: "CPA", path: "/dreamtoyou/cpa", desc: "CPA 전환 최적화용 블로그 글 생성" },
    { name: "광플루언서", path: "/dreamtoyou/influencer", desc: "광플루언서 만들기" },
    { name: "원고작성", path: "/dreamtoyou/script", desc: "30초면 완성되는 원고작성" },
    { name: "일상글", path: "/dreamtoyou/daily", desc: "블로그 첫 세팅" },
  ];

  return (
    <main className="p-10 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">
        ✨ 드림투유 전용 블로그 생성기
      </h1>
      <p className="text-gray-600 mb-8">
        원하는 카테고리를 선택하면, 해당 타입의 블로그 글을 생성할 수 있습니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <Link key={cat.path} href={cat.path}>
            <div className="border-2 border-indigo-200 rounded-2xl p-6 bg-white hover:bg-indigo-50 cursor-pointer shadow-md hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-indigo-600 mb-2">
                {cat.name}
              </h2>
              <p className="text-gray-500 text-sm">{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-10 text-gray-400 text-sm">
        © 2025 DreamToYou | 블로그 콘텐츠 자동화 시스템
      </footer>
    </main>
  );
}
