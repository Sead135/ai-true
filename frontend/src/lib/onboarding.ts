const PENDING_KEY = "onboardingPending";

export function markOnboardingPending() {
  try {
    sessionStorage.setItem(PENDING_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Consumes the one-shot flag. Returns true if onboarding should open. */
export function takeOnboardingPending(): boolean {
  try {
    if (sessionStorage.getItem(PENDING_KEY) !== "1") {
      return false;
    }
    sessionStorage.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}
