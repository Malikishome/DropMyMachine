function ListingCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden flex flex-col motion-safe:animate-pulse motion-reduce:opacity-70">
      <div className="h-[120px] bg-surface-raised" />

      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        <div className="h-2.5 w-2/5 bg-surface-raised rounded" />
        <div className="h-2.5 w-3/5 bg-surface-raised rounded" />
        <div className="h-2.5 w-11/12 bg-surface-raised rounded" />
        <div className="h-2.5 w-2/3 bg-surface-raised rounded" />
      </div>

      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border">
        <div className="h-2.5 w-14 bg-surface-raised rounded" />
        <div className="h-2.5 w-20 bg-surface-raised rounded" />
      </div>
    </div>
  );
}

export default ListingCardSkeleton;
