function RankingListSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4 lg:space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-gray-200 bg-white motion-reduce:animate-none lg:rounded-2xl lg:border-[#EEE6E4]"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-[#F8EFF0] lg:h-10 lg:w-10 lg:rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-3/5 rounded bg-[#EAE1E3]" />
              <div className="mt-2 hidden h-3 w-4/5 rounded bg-[#F1EAEB] lg:block" />
              <div className="mt-3 flex gap-3">
                <div className="h-3 w-12 rounded bg-[#F1EAEB]" />
                <div className="h-3 w-16 rounded bg-[#F1EAEB]" />
                <div className="h-3 w-14 rounded bg-[#F1EAEB]" />
              </div>
            </div>
            <div className="h-9 w-9 shrink-0 rounded-full bg-[#F8EFF0]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default RankingListSkeleton;
