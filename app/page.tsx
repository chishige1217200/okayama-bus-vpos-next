import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col justify-center min-h-screen py-2 space-y-4">
      <div className="flex justify-center">新システムは準備中です。</div>
      <div className="flex justify-center">
        <p>旧システムは</p>
        <Link
          href="/old"
          className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
        >
          こちら
        </Link>
      </div>
    </div>
  );
}
