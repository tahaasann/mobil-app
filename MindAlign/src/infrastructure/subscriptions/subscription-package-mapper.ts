export type IntroPriceLike = {
  price: number;
} | null;

export function packageHasFreeTrial(introPrice: IntroPriceLike): boolean {
  if (!introPrice) {
    return false;
  }

  return introPrice.price === 0;
}

export function mapIntroPriceToTrialFlag(introPrice: IntroPriceLike): boolean {
  return packageHasFreeTrial(introPrice);
}
