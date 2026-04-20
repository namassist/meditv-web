export function getNextSlideIndex({
  currentIndex,
  totalSlides,
  isSpeaking,
}: {
  currentIndex: number;
  totalSlides: number;
  isSpeaking: boolean;
}) {
  if (isSpeaking || totalSlides === 0) return currentIndex;
  return (currentIndex + 1) % totalSlides;
}

export function getTargetSlideIndex(
  doctorIds: string[],
  activeDoctorId?: string,
) {
  if (!activeDoctorId) return 0;
  const index = doctorIds.indexOf(activeDoctorId);
  return index === -1 ? 0 : Math.floor(index / 2);
}
