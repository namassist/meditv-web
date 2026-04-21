export function MeditvVideoCard({
  videoUrl,
  isMuted,
}: {
  videoUrl: string;
  isMuted: boolean;
}) {
  return (
    <video
      className="h-full w-full rounded-[min(1.5vh,12px)] bg-black object-cover"
      src={videoUrl}
      autoPlay
      muted={isMuted}
      loop
      playsInline
    />
  );
}
