[![npm version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=0.1.16&x2=0)](https://www.npmjs.com/package/qutilz)

CLI tool
for generating opinionated specs templates for a quick unit-tests setup.

Supports:

- Dependencies mocking with the [ts-mockito](https://github.com/NagRock/ts-mockito) mocking library.

Run 
``npx qutilz --specs`` from a local folder to generate a new spec template for local class-based components/services 
(Jest + ts-mockito) and for exported functions.

``npx qutilz --report`` from the local tests' folder to print a report of all existing suites/tests.

Resources: [background-blog-post](https://itnext.io/qutilz-for-a-quicker-unit-testing-development-55cc614c3964)

![image](https://miro.medium.com/max/1012/1*kEdF-SPVJ5DjjJVLQnoCng.png)

Examples:

- For class methods testing:
```ts
export class AAA {
    constructor(private bbb: BBB) {}

    applyGreet() {
        this.bbb.greet();
    }
}

export class BBB {
  constructor() {}
  greet() {
    return 'hello!';
  }

  static help() {
    return 'help!';
  }
}
```

Qutilz will produce the following:

```ts
import { instance, mock, when } from 'ts-mockito';import { BBB } from './example-b';
  
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

```

- For any file containing function declarations 

```ts
export function foo() {
  return 'foo';
}
```

Qutilz will produce the following:

```ts
describe('Testing', () => {
  it('should test foo', () => {
    expect(foo).toBeTruthy();
  });
});
```
