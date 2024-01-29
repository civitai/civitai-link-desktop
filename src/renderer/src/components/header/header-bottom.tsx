export function HeaderBottom() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium transition-colors hover:text-primary">Sync History</div>
          <div className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Activity</div>
        </div>
      </div>
    </div>
  );
}
