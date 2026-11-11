"use client";

import Link from "next/link";
import useCountdownRedirect from "@/hooks/useCountdownRedirect";

function NotFound() {
  const remainingSeconds = useCountdownRedirect(5, "/");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FFFDFC] px-5 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-[#EEE6E4] bg-white px-6 py-12 text-center shadow-[0_20px_60px_rgba(70,40,40,0.06)] sm:px-12 sm:py-16">
        <p className="text-sm font-semibold tracking-wide text-[#A05260]">
          맛집 랭킹
        </p>
        <p
          aria-hidden="true"
          className="mt-4 text-[100px] leading-none font-bold tracking-tight text-[#B5616E] sm:text-[140px]"
        >
          404
        </p>
        <h1 className="mt-6 text-2xl font-bold text-[#30292B] sm:text-3xl">
          페이지를 찾을 수 없습니다.
        </h1>
        <p
          role="status"
          aria-live="polite"
          className="mt-5 text-sm text-[#776C6F] sm:text-base"
        >
          <span className="font-bold text-[#B5616E] tabular-nums">
            {remainingSeconds}
          </span>
          초 뒤에 메인페이지로 이동합니다...
        </p>
        <Link
          href="/"
          replace
          className="mt-9 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#B5616E] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9D5360] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5616E]"
        >
          메인페이지로 이동하기
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
