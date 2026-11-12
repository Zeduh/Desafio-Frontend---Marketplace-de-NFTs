import { useState } from "react";
import { HomeSection } from "../components/home/HomeSection";
import { HomeHero } from "../components/home/HomeHero";
import { HomeSearchBar } from "../components/home/HomeSearchBar";
import { HomeMobileNavigation } from "../components/home/HomeMobileNavigation";
import { HomePromos } from "../components/home/HomePromos";
import { ProductsSection } from "../components/home/ProductsSection";

function PlaceholderGrid({ count, itemClassName }: { count: number; itemClassName: string }) {
  return (
    <div aria-hidden="true" className="home-placeholder-grid">
      {Array.from({ length: count }, (_, index) => (
        <div className={`home-placeholder ${itemClassName}`} key={index} />
      ))}
    </div>
  );
}

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

      <HomeSection id="blog" title="Blog">
        <PlaceholderGrid count={3} itemClassName="home-placeholder--article" />
      </HomeSection>
      <HomeMobileNavigation />
    </div>
  );
}
