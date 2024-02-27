import { DownloadCloud, Trash2 } from 'lucide-react';

enum ActivityType {
  Downloaded = 'downloaded',
  Deleted = 'deleted',
}

type ActivitiesItemProps = {
  name: string;
  date: string;
  type: 'downloaded' | 'deleted';
  // TODO: Link to model
};

export function ActivitiesItem() {
  const name = 'SDXL Dragon Style';
  const type = ActivityType.Downloaded;

  return (
    <div>
      <p className="text-xs text-[#909296]">2024-02-23</p>
      <div className="flex space-x-2 items-center mt-2">
        {type === ActivityType.Downloaded ? (
          <DownloadCloud size={20} />
        ) : (
          <Trash2 size={20} />
        )}
        <p className="text-sm capitalize">
          {type} <b>{name}</b>
        </p>
      </div>
    </div>
  );
}
