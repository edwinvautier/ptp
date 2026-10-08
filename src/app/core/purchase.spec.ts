import { resolvePurchase } from './purchase';

const base = {
  prettyId: 'pretty-1',
  prettyPrice: 40,
  uglyPrice: 8,
  availableUglyIds: ['ugly-1', 'ugly-2', 'ugly-3'],
};

describe('resolvePurchase', () => {
  it('buys the shown pretty photo when credits cover its price', () => {
    expect(
      resolvePurchase({
        ...base,
        credits: 40,
        randomIndex: 0,
      }),
    ).toEqual({ status: 'pretty', photoId: 'pretty-1', price: 40 });
  });

  it('buys a chosen ugly photo when the pretty one is too expensive', () => {
    expect(
      resolvePurchase({
        ...base,
        credits: 20,
        randomIndex: 1,
      }),
    ).toEqual({ status: 'ugly', photoId: 'ugly-2', price: 8 });
  });

  it('wraps the random index onto the remaining ugly photos', () => {
    expect(
      resolvePurchase({
        ...base,
        credits: 8,
        randomIndex: 5,
      }),
    ).toEqual({ status: 'ugly', photoId: 'ugly-3', price: 8 });
  });

  it('rejects the purchase when credits cannot cover an ugly photo', () => {
    expect(
      resolvePurchase({
        ...base,
        credits: 7,
        randomIndex: 0,
      }),
    ).toEqual({ status: 'rejected' });
  });

  it('rejects the purchase when no ugly photo remains and the pretty one is unaffordable', () => {
    expect(
      resolvePurchase({
        ...base,
        credits: 20,
        availableUglyIds: [],
        randomIndex: 0,
      }),
    ).toEqual({ status: 'rejected' });
  });
});
