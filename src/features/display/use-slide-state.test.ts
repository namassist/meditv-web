import { describe, expect, it } from "vitest";
import { getNextSlideIndex, getTargetSlideIndex } from "./use-slide-state";

describe("slide helpers", () => {
  it("keeps the current slide when TTS is speaking", () => {
    expect(
      getNextSlideIndex({ currentIndex: 1, totalSlides: 3, isSpeaking: true }),
    ).toBe(1);
  });

  it("moves to the doctor slide based on two cards per page", () => {
    expect(getTargetSlideIndex(["11", "12", "13", "14"], "13")).toBe(1);
  });
});
