import { ArrowRight } from "lucide-react";
import genesisArt from "../../assets/home-hero.png";
import curatedArt from "../../assets/products/neon-vessel.png";
import { Button } from "../ui/button";

interface Promo {
  id: string;
  title: string;
  description: string;
  artwork: string;
  artworkAlt: string;
}

const promos: Promo[] = [
  {
    id: "genesis",
    title: "Lançamentos gênesis de edição limitada",
    description:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    artwork: genesisArt,
    artworkAlt: "NFT de um macaco usando óculos escuros e jaqueta verde",
  },
  {
    id: "curated-art",
    title: "Arte digital selecionada e muito mais",
    description:
      "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
    artwork: curatedArt,
    artworkAlt: "NFT de um macaco de pelo escuro usando blazer claro e gola alta",
  },
];

function PromoCard({ promo }: { promo: Promo }) {
  return (
    <article className={`home-promo-card home-promo-card--${promo.id}`}>
      <img
        alt={promo.artworkAlt}
        className="home-promo-card__artwork"
        loading="lazy"
        src={promo.artwork}
      />
      <div className="home-promo-card__content">
        <h3 className="home-promo-card__title">{promo.title}</h3>
        <p className="home-promo-card__description">{promo.description}</p>
        <Button
          className="home-promo-card__cta"
          nativeButton={false}
          render={<a href="#products" />}
          role="link"
        >
          Explorar
          <ArrowRight aria-hidden="true" size={18} />
        </Button>
      </div>
    </article>
  );
}

export function HomePromos() {
  return (
    <section aria-labelledby="home-promos-title" className="home-promos" id="promos">
      <h2 className="sr-only" id="home-promos-title">
        Promoções
      </h2>
      {promos.map((promo) => (
        <PromoCard key={promo.id} promo={promo} />
      ))}
    </section>
  );
}
