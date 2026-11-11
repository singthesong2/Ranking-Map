function FavoriteDetailsSkeleton() {
  return (
    <div
      role="status"
      className="animate-pulse space-y-3 motion-reduce:animate-none"
    >
      <span className="sr-only">찜한 음식점 정보를 불러오고 있습니다.</span>
      <div aria-hidden="true" className="h-4 w-3/5 rounded bg-[#EAE1E3]" />
      <div aria-hidden="true" className="h-3 w-4/5 rounded bg-[#F1EAEB]" />
      <div aria-hidden="true" className="h-3 w-2/5 rounded bg-[#F1EAEB]" />
    </div>
  );
}

export default FavoriteDetailsSkeleton;
