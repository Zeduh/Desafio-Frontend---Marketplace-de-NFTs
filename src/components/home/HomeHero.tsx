import { Button } from "../ui/button";
import heroArtwork from "../../assets/home-hero.png";
import featuredArtwork from "../../assets/products/sage-nomad.png";

export function HomeHero() {
  return (
    <section aria-labelledby="home-hero-title" className="home-top" id="top">
      <div className="home-hero">
        <div className="home-hero__content">
          <div className="home-hero__main">
            <div className="home-hero__intro">
              <p className="home-hero__eyebrow">Bem-vindo à Kurio</p>
              <h1 className="home-hero__title" id="home-hero-title">
                <span className="home-hero__title-desktop">SEJA DONO DO FUTURO</span>
                <span className="home-hero__title-desktop">DA ARTE DIGITAL</span>
                <span className="home-hero__title-mobile">SEJA DONO DA</span>
                <span className="home-hero__title-mobile">CULTURA DIGITAL</span>
              </h1>
            </div>
            <p className="home-hero__description home-hero__description--desktop">
              Discover curated NFTs from emerging and established creators. Collect
              rare digital art.
            </p>
            <p className="home-hero__description home-hero__description--mobile">
              Descubra NFTs selecionados de criadores do mundo todo.
            </p>
            <Button
              className="home-hero__cta"
              nativeButton={false}
              render={<a href="#products" />}
              role="link"
            >
              EXPLORAR
              <span aria-hidden="true" className="home-hero__cta-arrow">
                →
              </span>
            </Button>
          </div>
          <div aria-hidden="true" className="home-hero__indicators">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="home-hero__art">
          <img alt="Macaco com óculos escuros e jaqueta verde" src={heroArtwork} />
          <img
            alt=""
            aria-hidden="true"
            className="home-hero__art-featured"
            src={featuredArtwork}
          />
        </div>
      </div>
    </section>
  );
}
