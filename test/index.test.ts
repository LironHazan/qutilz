import { lowerFirst } from '../src';

describe('index', () => {
  it('test lowerFirst', () => {
    expect(lowerFirst('ConstructFoo')).toEqual('constructFoo');
  });
});
