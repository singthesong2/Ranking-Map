function RestaurantSearchSkeleton() {
  return (
    <div role="status" className="mt-3 space-y-3">
      <span className="sr-only">음식점 검색 결과를 불러오고 있습니다.</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="animate-pulse overflow-hidden rounded-lg border border-[#EEE6E4] bg-white motion-reduce:animate-none lg:rounded-2xl"
        >
          <div className="flex items-center gap-3 p-3 lg:p-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-4 w-2/3 rounded bg-[#EAE1E3]" />
              <div className="h-3 w-4/5 rounded bg-[#F1EAEB]" />
              <div className="h-3 w-20 rounded bg-[#F1EAEB]" />
              <div className="h-3 w-28 rounded bg-[#F1EAEB]" />
            </div>
            <div className="h-9 w-9 shrink-0 rounded-full bg-[#F8EFF0]" />
          </div>
          <div className="flex justify-center border-t border-[#F0E8E6] px-3 py-3">
            <div className="h-3 w-24 rounded bg-[#F1EAEB]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default RestaurantSearchSkeleton;
