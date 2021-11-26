import { instance, mock, when } from 'ts-mockito';
import { BBB } from './example-b';
import { AAA } from '/Users/lironh/dev-liron/@qutils/examples/class-based/example-a';

describe('AAA', () => {
  // Mocked dependencies:
  const bbbMock = mock(BBB);
  const bbbInstance = instance(bbbMock);

  // Tested target:
  const aAA = new AAA(bbbInstance);

  it('instance is truthy', () => {
    expect(aAA).toBeTruthy();
  });

  it('should test applyGreat', () => {
    expect(aAA.applyGreat).toBeTruthy();
  });
});
