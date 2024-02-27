import { DownloadCloud } from 'lucide-react';

type ActivitiesItemProps = {
  name: string;
  date: string;
  type: 'downloaded' | 'deleted';
};

export function ActivitiesItem() {
  const name = 'SDXL Dragon Style';

  // TODO: Toggle between Downloaded and deleted
  return (
    <div>
      <h1>2024-02-23</h1>
      <div className="flex space-x-2 items-center">
        <DownloadCloud size={20} />
        <p>
          Downloaded <b>{name}</b>
        </p>
      </div>
    </div>
  );
}
