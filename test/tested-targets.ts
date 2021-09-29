class Foo {
  static bar(sum: number) {
    console.log(sum);
  }

  bazz() {}
}

const foo = new Foo();
foo.bazz();
Foo.bar(9);

export function freestyle(foo: string) {
  console.log(foo);
}

freestyle('foo');

function privateFn() {}
privateFn();
