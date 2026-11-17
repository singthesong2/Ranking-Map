import { ImageResponse } from "next/og";

export const alt = "Ranking Map - 맛집 랭킹 공유 이미지";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFDFC",
        color: "#30292B",
        border: "20px solid #F8EFF0",
      }}
    >
      <div
        style={{
          width: 118,
          height: 118,
          borderRadius: 34,
          backgroundColor: "#B5616E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 16px 32px rgba(181, 97, 110, 0.18)",
        }}
      >
        <svg width="80" height="80" viewBox="0 0 100 100">
          <path
            d="M50 8 C30 8 18 23 18 42 C18 65 50 94 50 94 S82 65 82 42 C82 23 70 8 50 8 Z"
            fill="white"
          />
          <circle cx="50" cy="42" r="12" fill="#B5616E" />
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 34,
          fontSize: 78,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        RANKING MAP
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 20,
          fontSize: 32,
          fontWeight: 600,
          color: "#685D60",
        }}
      >
        내 주변 맛집을 지도에서 한눈에 확인하세요.
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 34,
        }}
      >
        <div
          style={{
            padding: "14px 28px",
            borderRadius: 999,
            backgroundColor: "#F8EFF0",
            color: "#9D5360",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          검색
        </div>
        <div
          style={{
            padding: "14px 28px",
            borderRadius: 999,
            backgroundColor: "#F8EFF0",
            color: "#9D5360",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          랭킹
        </div>
        <div
          style={{
            padding: "14px 28px",
            borderRadius: 999,
            backgroundColor: "#F8EFF0",
            color: "#9D5360",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          찜
        </div>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 24,
          fontSize: 22,
          color: "#9A8E91",
        }}
      >
        지역 검색 / 카테고리 필터 / 리뷰 / 거리 비교
      </div>
    </div>,
    size,
  );
}

export default OpenGraphImage;
