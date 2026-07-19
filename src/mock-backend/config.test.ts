import {
  accountConfig,
  configuredMarkets,
  marketExtrasConfig,
  productConfig,
  validateConfigReferences,
} from './config';

function cloneConfig() {
  return {
    markets: structuredClone(configuredMarkets),
    products: structuredClone(productConfig),
    account: structuredClone(accountConfig),
    extras: structuredClone(marketExtrasConfig),
  };
}

describe('mock configuration references', () => {
  it('accepts the checked-in configuration', () => {
    expect(() =>
      validateConfigReferences(configuredMarkets, productConfig, accountConfig, marketExtrasConfig),
    ).not.toThrow();
  });

  it('rejects duplicate identifiers and invalid references', () => {
    const duplicate = cloneConfig();
    duplicate.markets[1]!.id = duplicate.markets[0]!.id;
    expect(() =>
      validateConfigReferences(
        duplicate.markets,
        duplicate.products,
        duplicate.account,
        duplicate.extras,
      ),
    ).toThrow('Market ids must be unique');

    const invalidPosition = cloneConfig();
    invalidPosition.account.positions[0]!.outcomeId = 'missing';
    expect(() =>
      validateConfigReferences(
        invalidPosition.markets,
        invalidPosition.products,
        invalidPosition.account,
        invalidPosition.extras,
      ),
    ).toThrow('Unknown position outcome');

    const invalidCombo = cloneConfig();
    invalidCombo.products.combos[0]!.eventId = 'missing-event';
    expect(() =>
      validateConfigReferences(
        invalidCombo.markets,
        invalidCombo.products,
        invalidCombo.account,
        invalidCombo.extras,
      ),
    ).toThrow('Unknown combo event');
  });
});
