import { foo } from "./example-c";

describe("Testing", () => {
  it("should test foo", () => {
    expect(foo).toBeTruthy();
  });
});
