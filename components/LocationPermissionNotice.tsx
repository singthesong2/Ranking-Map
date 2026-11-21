import { IconMapPinOff } from "@tabler/icons-react";

function LocationPermissionNotice() {
  return (
    <div
      role="status"
      className="mx-4 mb-4 flex items-start gap-3 rounded-2xl border border-[#EAD2D6] bg-[#FFF7F8] p-4 lg:mx-5"
    >
      <IconMapPinOff
        size={22}
        className="shrink-0 text-[#B5616E]"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#783E50]">
          현재 위치를 사용할 수 없어요
        </p>
        <p className="mt-1 text-sm leading-6 text-[#685D60]">
          위치 권한이 허용되지 않았어요. 위의 &apos;지역 검색&apos;에서 원하는
          지역을 선택하면 맛집 검색을 계속 이용할 수 있어요.
        </p>
        <p className="mt-2 text-xs leading-5 text-[#93878A]">
          현재 위치를 사용하려면 위치 권한을 허용한 뒤 새로고침해 주세요.
        </p>
      </div>
    </div>
  );
}

export default LocationPermissionNotice;
