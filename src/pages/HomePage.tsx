import { useState } from "react";
import { HomeHero } from "../components/home/HomeHero";
import { HomeBlog } from "../components/home/HomeBlog";
import { HomeSearchBar } from "../components/home/HomeSearchBar";
import { HomeMobileNavigation } from "../components/home/HomeMobileNavigation";
import { HomePromos } from "../components/home/HomePromos";
import { ProductsSection } from "../components/home/ProductsSection";

export function HomePage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="home-page">
      <HomeSearchBar onOpenFilters={() => setMobileFiltersOpen(true)} />
      <HomeHero />

      <ProductsSection
        mobileFiltersOpen={mobileFiltersOpen}
        onMobileFiltersOpenChange={setMobileFiltersOpen}
      />

      <HomePromos />
      <HomeBlog />
      <HomeMobileNavigation />
    </div>
  );
}
