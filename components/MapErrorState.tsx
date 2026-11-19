import { IconMapOff, IconRefresh } from "@tabler/icons-react";

interface MapErrorStateProps {
  onRetry: () => void;
}

function MapErrorState({ onRetry }: MapErrorStateProps) {
  return (
    <div
      role="alert"
      aria-labelledby="map-error-title"
      aria-describedby="map-error-description"
      className="absolute inset-0 z-30 flex items-center justify-center bg-[#FFFDFC] p-4 sm:p-6"
    >
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-[#EEE6E4] bg-white px-5 py-5 text-center shadow-[0_12px_35px_rgba(58,34,38,0.06)] sm:px-8 sm:py-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8EFF0]">
          <IconMapOff
            size={28}
            stroke={1.7}
            className="text-[#B5616E]"
            aria-hidden="true"
          />
        </div>
        <h3
          id="map-error-title"
          className="mt-4 text-[17px] font-bold text-[#30292B] sm:text-lg"
        >
          지도를 불러오지 못했어요
        </h3>
        <p
          id="map-error-description"
          className="mt-2 text-[13px] leading-5 text-[#776C6F] sm:text-sm sm:leading-6"
        >
          인터넷 연결이나 지도 서비스 상태를
          <br className="hidden sm:block" />
          확인한 뒤 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="group mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#B5616E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9D5360] hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5616E] motion-reduce:transform-none motion-reduce:transition-none"
        >
          <IconRefresh size={18} stroke={2} aria-hidden="true" />
          다시 시도
        </button>
        <p className="mt-3 text-xs leading-5 text-[#93878A]">
          검색 조건과 찜 목록은 그대로 유지돼요.
        </p>
      </div>
    </div>
  );
}

export default MapErrorState;
