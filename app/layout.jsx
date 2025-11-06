import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "드림투유 단이 멘티전용 블로그 생성기",
  description: "GPT 기반 블로그 자동 포스팅 툴",
};

export default function RootLayout({ children }) {
  const menu = [
    { name: "💎 광플루언서", href: "/influencer" },
    { name: "💰 CPA", href: "/cpa" },
    { name: "🧾 원고작성", href: "/script" },
    { name: "🌿 일상글", href: "/daily" },
    { name: "✨ 드림투유 블로그", href: "/blog" },
  ];

  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white shadow sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="font-bold text-lg text-indigo-600">
              드림투유 단이 멘티전용 블로그 생성기
            </h1>
            <div className="flex gap-4 text-sm">
              {menu.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="hover:text-indigo-500 font-medium"
                >
                  {m.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
