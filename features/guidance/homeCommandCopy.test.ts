import { describe, expect, it } from "vitest";
import { getHomeCommandFooter } from "./homeCommandCopy";

describe("getHomeCommandFooter", () => {
  it("recover phase", () => {
    expect(
      getHomeCommandFooter({ phase: "recover", href: "/bazaar/black-market" }),
    ).toContain("Stabilize");
  });

  it("prep phase", () => {
    expect(getHomeCommandFooter({ phase: "prep", href: "/missions" })).toContain(
      "Queue",
    );
  });

  it("deploy to void field", () => {
    expect(
      getHomeCommandFooter({ phase: "deploy", href: "/void-field" }),
    ).toContain("field");
  });

  it("deploy enter void default", () => {
    expect(
      getHomeCommandFooter({ phase: "deploy", href: "/deploy-into-void" }),
    ).toContain("primed");
  });
});
