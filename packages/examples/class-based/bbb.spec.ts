import { instance, mock, when } from "ts-mockito";
import { BBB } from "./example-b";

describe("BBB", () => {
  const bBB = new BBB();
  it("instance is truthy", () => {
    expect(bBB).toBeTruthy();
  });

  it("should test greet", () => {
    expect(bBB.greet).toBeTruthy();
  });

  it("should test help", () => {
    expect(BBB.help).toBeTruthy();
  });
});
