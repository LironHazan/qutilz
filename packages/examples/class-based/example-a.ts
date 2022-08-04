import { BBB } from './example-b';

export class AAA {
  constructor(private bbb: BBB) {}

  applyGreet() {
    this.bbb.greet();
  }
}
