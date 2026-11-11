function FullPageLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FFFDFC] px-5">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center text-center"
      >
        <p className="text-sm font-semibold tracking-wide text-[#A05260]">
          맛집 랭킹
        </p>
        <span
          aria-hidden="true"
          className="mt-6 h-12 w-12 animate-spin rounded-full border-4 border-[#EAD2D6] border-t-[#B5616E] motion-reduce:animate-none"
        />
        <h1 className="mt-7 text-xl font-bold text-[#30292B] sm:text-2xl">
          맛집 정보를 불러오고 있어요
        </h1>
        <p className="mt-3 text-sm text-[#8E8084]">
          주변의 맛집을 찾고 있습니다.
        </p>
      </div>
    </main>
  );
}

export default FullPageLoading;
