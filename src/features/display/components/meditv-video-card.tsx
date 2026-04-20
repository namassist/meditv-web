export function MeditvVideoCard({
  videoUrl,
  isMuted,
}: {
  videoUrl: string;
  isMuted: boolean;
}) {
  return (
    <video
      className="h-full w-full rounded-2xl bg-black object-cover"
      src={videoUrl}
      autoPlay
      muted={isMuted}
      loop
      playsInline
    />
  );
}
