import { describe, expect, it } from "vitest";
import {
  generateChallengePositions,
  nextOnboardingStep,
  validateVaultProfile,
} from "../onboarding";
import { verifyChallengeWords } from "../recovery";

describe("onboarding", () => {
  it("moves from Welcome to Profile rather than skipping to Lock choice", () => {
    expect(nextOnboardingStep("welcome")).toBe("profile");
  });

  it("validates the name and bio limits", () => {
    expect(validateVaultProfile({ name: "A", bio: "x".repeat(160) })).toBeNull();
    expect(validateVaultProfile({ name: "", bio: "" })).not.toBeNull();
    expect(validateVaultProfile({ name: "x".repeat(41), bio: "" })).not.toBeNull();
    expect(validateVaultProfile({ name: "A", bio: "x".repeat(161) })).not.toBeNull();
  });

  it("chooses three distinct recovery word positions", () => {
    const positions = generateChallengePositions();
    expect(new Set(positions).size).toBe(3);
    expect(positions.every((position) => position >= 1 && position <= 24)).toBe(true);
  });

  it("rejects a wrong recovery word and accepts all three correct words", () => {
    const phrase = "one two three four five six";
    const positions = [1, 3, 5];
    expect(verifyChallengeWords(phrase, positions, ["one", "wrong", "five"])).toBe(false);
    expect(verifyChallengeWords(phrase, positions, ["one", "three", "five"])).toBe(true);
  });
});
