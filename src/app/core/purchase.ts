export interface PurchaseInput {
  credits: number;
  prettyId: string;
  prettyPrice: number;
  uglyPrice: number;
  availableUglyIds: readonly string[];
  randomIndex: number;
}

export type PurchaseDecision =
  | { status: 'pretty'; photoId: string; price: number }
  | { status: 'ugly'; photoId: string; price: number }
  | { status: 'rejected' };

export function resolvePurchase(input: PurchaseInput): PurchaseDecision {
  if (input.credits >= input.prettyPrice) {
    return { status: 'pretty', photoId: input.prettyId, price: input.prettyPrice };
  }

  if (input.credits >= input.uglyPrice && input.availableUglyIds.length > 0) {
    const index = positiveModulo(input.randomIndex, input.availableUglyIds.length);
    const photoId = input.availableUglyIds[index];
    if (photoId === undefined) {
      return { status: 'rejected' };
    }
    return { status: 'ugly', photoId, price: input.uglyPrice };
  }

  return { status: 'rejected' };
}

function positiveModulo(value: number, length: number): number {
  return ((value % length) + length) % length;
}
