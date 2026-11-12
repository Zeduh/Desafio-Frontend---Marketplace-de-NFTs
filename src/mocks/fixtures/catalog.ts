import goldenBeatArtwork from "../../assets/products/golden-beat.png";
import neonVesselArtwork from "../../assets/products/neon-vessel.png";
import sageNomadArtwork from "../../assets/products/sage-nomad.png";
import heroArtwork from "../../assets/home-hero.png";
import type { NetworkName, Product } from "../../features/catalog/types";

export const collectionNames = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
];

export const networkNames: NetworkName[] = ["Ethereum", "Polygon", "Solana"];

const suppliedProductFixtures: Product[] = [
  {
    id: "emerald-ape-042",
    name: "Emerald Ape #042",
    price: "1.19",
    artwork: heroArtwork,
    collection: "Arte digital",
    network: "Ethereum",
    isNew: true,
    isTrending: true,
  },
  {
    id: "sage-nomad-009",
    name: "Sage Nomad #009",
    price: "1.69",
    artwork: sageNomadArtwork,
    collection: "Fotografia",
    network: "Polygon",
    isNew: true,
    isTrending: false,
  },
  {
    id: "neon-vessel-552",
    name: "Neon Vessel #552",
    price: "1.99",
    previousPrice: "2.29",
    artwork: neonVesselArtwork,
    collection: "Arte 3D",
    network: "Solana",
    isNew: false,
    isTrending: true,
  },
  {
    id: "cosmic-bloom-118",
    name: "Cosmic Bloom #118",
    price: "1.29",
    artwork: sageNomadArtwork,
    collection: "Generativa",
    network: "Ethereum",
    isNew: true,
    isTrending: false,
  },
  {
    id: "violet-nomad-314",
    name: "Violet Nomad #314",
    price: "1.39",
    artwork: sageNomadArtwork,
    collection: "Fotografia",
    network: "Polygon",
    isNew: false,
    isTrending: true,
  },
  {
    id: "ivory-baron-088",
    name: "Ivory Baron #088",
    price: "1.79",
    artwork: neonVesselArtwork,
    collection: "Colecionáveis",
    network: "Ethereum",
    isNew: false,
    isTrending: true,
  },
  {
    id: "golden-beat-207",
    name: "Golden Beat #207",
    price: "0.99",
    artwork: goldenBeatArtwork,
    collection: "Música",
    network: "Solana",
    isNew: true,
    isTrending: false,
  },
  {
    id: "artwork-10",
    name: null,
    price: null,
    artwork: goldenBeatArtwork,
    collection: "Utilidade",
    network: "Polygon",
    isNew: false,
    isTrending: false,
  },
  {
    id: "golden-signal-160",
    name: "Golden Signal #160",
    price: "0.39",
    artwork: goldenBeatArtwork,
    collection: "Generativa",
    network: "Ethereum",
    isNew: false,
    isTrending: true,
  },
];

const sampleArtwork = [heroArtwork, sageNomadArtwork, neonVesselArtwork, goldenBeatArtwork];
const products = [...suppliedProductFixtures];
let sampleProductNumber = 201;
const collectionTargets: Record<string, number> = {
  "Arte digital": 7,
  Fotografia: 6,
  Música: 4,
  "Arte 3D": 5,
  Colecionáveis: 3,
  Generativa: 5,
  Jogos: 3,
  Assinaturas: 0,
  Utilidade: 3,
};

const addSampleProduct = (collection: string, network: NetworkName) => {
  const artwork = sampleArtwork[sampleProductNumber % sampleArtwork.length];
  if (!artwork) {
    throw new Error("Não foi possível selecionar uma arte para o NFT de exemplo.");
  }

  const sampleIndex = sampleProductNumber - 201;
  const price = sampleIndex % 7 === 3
    ? 8.5 + ((sampleProductNumber * 17) % 370) / 100
    : 2.5 + ((sampleProductNumber * 17) % 380) / 100;

  products.push({
    id: `local-sample-${sampleProductNumber}`,
    name: `${collection} #${sampleProductNumber}`,
    price: price.toFixed(2),
    artwork,
    collection,
    network,
    isNew: sampleProductNumber % 2 === 0,
    isTrending: sampleProductNumber % 3 === 0,
  });
  sampleProductNumber += 1;
};

for (const collection of collectionNames) {
  const targetCount = collectionTargets[collection];
  if (targetCount === undefined) {
    throw new Error(`A coleção "${collection}" não possui uma quantidade de exemplo definida.`);
  }

  let collectionProductCount = products.filter(
    (product) => product.collection === collection,
  ).length;

  if (collectionProductCount > targetCount) {
    throw new Error(`A coleção "${collection}" excede sua quantidade de exemplo definida.`);
  }

  while (collectionProductCount < targetCount) {
    const network = networkNames[sampleProductNumber % networkNames.length];
    if (!network) {
      throw new Error("Não foi possível selecionar uma rede para o NFT de exemplo.");
    }

    addSampleProduct(collection, network);
    collectionProductCount += 1;
  }
}

export const catalogProducts: Product[] = products;
const featuredProductCandidate = catalogProducts.find((product) => product.id === "sage-nomad-009");

if (!featuredProductCandidate) {
  throw new Error("O NFT em destaque não está disponível na fixture do catálogo.");
}

export const featuredProduct: Product = featuredProductCandidate;
