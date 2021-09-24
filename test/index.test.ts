import { fromPascalToKebabCase, lowerFirst } from '../src';

describe('index', () => {
  it('test lowerFirst', () => {
    expect(lowerFirst('ConstructFoo')).toEqual('constructFoo');
  });

  it('test fromPascalToKebabCase', () => {
    expect(fromPascalToKebabCase('FromPascalToKebabCase')).toEqual(
      'from-pascal-to-kebab-case'
    );
  });
});
