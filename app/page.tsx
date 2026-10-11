import Header from "@/components/Header";
import SearchBox from "@/components/SearchBox";
import CategoryFilter from "@/components/CategoryFilter";
import MapSection from "@/components/MapSection";
import RankingList from "@/components/RankingList";

function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Header />
      <SearchBox />
      <CategoryFilter />
      <MapSection />
      <RankingList />
    </main>
  );
}

export default Home;
