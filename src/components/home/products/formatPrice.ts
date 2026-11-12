export function formatPrice(price: number | null) {
  if (price === null) {
    return "—";
  }

  return price.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
