export function MeditvVideoCard({
  videoUrl,
  isMuted,
  isEmpty,
}: {
  videoUrl: string;
  isMuted: boolean;
  isEmpty?: boolean;
}) {
  return (
    <>
      {isEmpty ? (
        <video
          className="h-full w-full rounded-[min(1.5vh,12px)] bg-black object-cover"
          src={videoUrl}
          autoPlay
          muted={isMuted}
          loop
          playsInline
        />
      ) : (
        <div className="flex h-full w-full items-center">
          <video
            className={`h-full w-full rounded-[min(1.5vh,12px)] object-fill `}
            src={videoUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
          />
        </div>
      )}
    </>
  );
}
