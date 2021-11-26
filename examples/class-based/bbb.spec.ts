import { instance, mock, when } from 'ts-mockito';
import { BBB } from '/Users/lironh/dev-liron/@qutils/examples/class-based/example-b';

describe('BBB', () => {
  const bBB = new BBB();
  it('instance is truthy', () => {
    expect(bBB).toBeTruthy();
  });

  it('should test greet', () => {
    expect(bBB.greet).toBeTruthy();
  });

  it('should test help', () => {
    expect(BBB.help).toBeTruthy();
  });
});
