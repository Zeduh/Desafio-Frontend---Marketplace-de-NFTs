import { ArrowRight } from "lucide-react";
import goldenBeatArtwork from "../../assets/products/golden-beat.png";
import neonVesselArtwork from "../../assets/products/neon-vessel.png";
import sageNomadArtwork from "../../assets/products/sage-nomad.png";
import heroArtwork from "../../assets/home-hero.png";

interface BlogPost {
  id: string;
  date: string;
  readingTime: number;
  title: string;
  excerpt: string;
  artwork: string;
  artworkAlt: string;
}

const posts: BlogPost[] = [
  {
    id: "nft-ownership",
    date: "12 de setembro",
    readingTime: 6,
    title: "Como funciona a propriedade de NFTs",
    excerpt: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    artwork: neonVesselArtwork,
    artworkAlt: "NFT de um macaco de pelo escuro usando blazer claro",
  },
  {
    id: "digital-artists",
    date: "13 de setembro",
    readingTime: 2,
    title: "10 artistas digitais para acompanhar",
    excerpt: "Conheça criadores que moldam a cultura digital.",
    artwork: heroArtwork,
    artworkAlt: "NFT de um macaco usando óculos escuros e jaqueta verde",
  },
  {
    id: "rarity-and-provenance",
    date: "15 de setembro",
    readingTime: 3,
    title: "Raridade, atributos e procedência",
    excerpt: "Entenda raridade, procedência, direitos autorais e utilidade.",
    artwork: sageNomadArtwork,
    artworkAlt: "NFT de um macaco usando chapéu e moletom roxo",
  },
  {
    id: "wallet-security",
    date: "15 de setembro",
    readingTime: 2,
    title: "Como proteger sua carteira",
    excerpt: "Proteja sua carteira, seus ativos e sua identidade.",
    artwork: goldenBeatArtwork,
    artworkAlt: "NFT de um macaco usando fones de ouvido",
  },
];

export function HomeBlog() {
  return (
    <section aria-labelledby="home-blog-title" className="home-blog" id="blog">
      <header className="home-blog__header">
        <h2 className="home-blog__title" id="home-blog-title">
          Diário da Cunhagem
        </h2>
        <p className="home-blog__subtitle">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </header>

      <div className="home-blog__cards">
        {posts.map((post) => {
          const titleId = `home-blog-post-${post.id}-title`;
          const excerptId = `home-blog-post-${post.id}-excerpt`;

          return (
            <article
              aria-describedby={excerptId}
              aria-labelledby={titleId}
              className="home-blog-card"
              key={post.id}
            >
              <img
                alt={post.artworkAlt}
                className="home-blog-card__artwork"
                loading="lazy"
                src={post.artwork}
              />
              <div className="home-blog-card__content">
                <p className="home-blog-card__meta">
                  {post.date} | Leitura de {post.readingTime} min
                </p>
                <h3 className="home-blog-card__title" id={titleId}>
                  {post.title}
                </h3>
                <p className="home-blog-card__excerpt" id={excerptId}>
                  {post.excerpt}
                </p>
                <span className="home-blog-card__read-more">
                  Ler mais <ArrowRight size={12} />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
