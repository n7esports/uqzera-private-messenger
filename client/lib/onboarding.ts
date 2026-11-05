export type OnboardingStep =
  | "welcome"
  | "profile"
  | "generate"
  | "recovery"
  | "lock"
  | "identity";

export interface VaultProfile {
  name: string;
  bio: string;
}

const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  "welcome",
  "profile",
  "generate",
  "recovery",
  "lock",
  "identity",
];

export function validateVaultProfile(profile: VaultProfile): string | null {
  const name = profile.name.trim();
  if (name.length < 1 || name.length > 40) return "Name must be 1–40 characters.";
  if (profile.bio.length > 160) return "Bio must be 160 characters or fewer.";
  return null;
}

export function nextOnboardingStep(
  current: OnboardingStep,
  profile?: VaultProfile,
): OnboardingStep | null {
  if (current === "profile" && (!profile || validateVaultProfile(profile))) {
    return null;
  }
  const index = ONBOARDING_STEPS.indexOf(current);
  return ONBOARDING_STEPS[index + 1] ?? null;
}

export function generateChallengePositions(): [number, number, number] {
  const positions = new Set<number>();
  while (positions.size < 3) {
    const bytes = crypto.getRandomValues(new Uint8Array(1));
    positions.add((bytes[0] % 24) + 1);
  }
  return [...positions] as [number, number, number];
}
