export function MeditvVideoCard({
  videoUrl,
  isMuted,
}: {
  videoUrl: string;
  isMuted: boolean;
}) {
  return (
    <div className="flex h-full w-full items-center">
      <video
        className="h-full w-full rounded-[min(1.5vh,12px)] object-fill"
        src={videoUrl}
        autoPlay
        muted={isMuted}
        loop
        playsInline
      />
    </div>
  );
}
