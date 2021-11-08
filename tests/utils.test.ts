import {
  fromPascalToKebabCase,
  lowerFirst,
  removeClassGeneric,
} from '../src/test-gen/utils';

describe('index', () => {
  it('test lowerFirst', () => {
    expect(lowerFirst('ConstructFoo')).toEqual('constructFoo');
  });

  it('test removeClassGeneric', () => {
    expect(removeClassGeneric('Tree<T>')).toEqual('Tree');
  });

  it('test fromPascalToKebabCase', () => {
    expect(fromPascalToKebabCase('FromPascalToKebabCase')).toEqual(
      'from-pascal-to-kebab-case'
    );
  });
});
