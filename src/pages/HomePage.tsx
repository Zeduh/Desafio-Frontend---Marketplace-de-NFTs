import { HomeSection } from "../components/home/HomeSection";

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
  return (
    <div className="home-page">
      <section
        aria-labelledby="home-top-title"
        className="home-section home-section--top"
        id="top"
      >
        <h1 id="home-top-title">Destaques</h1>
        <div aria-hidden="true" className="home-placeholder home-placeholder--feature" />
      </section>

      <HomeSection id="products" title="Produtos">
        <PlaceholderGrid count={4} itemClassName="home-placeholder-card" />
      </HomeSection>

      <HomeSection id="promos" title="Promoções">
        <div aria-hidden="true" className="home-placeholder home-placeholder--promo" />
      </HomeSection>

      <HomeSection id="blog" title="Blog">
        <PlaceholderGrid count={3} itemClassName="home-placeholder--article" />
      </HomeSection>
    </div>
  );
}
