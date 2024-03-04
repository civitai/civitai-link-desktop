import {
  DownloadCloud,
  Trash2,
  CircleSlash,
  HardDriveDownload,
  FileQuestion,
} from 'lucide-react';
import { ActivityType } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type ActivitiesItemProps = {
  name: string;
  type: ActivityType;
  date: string;
  civitaiUrl?: string;
};

function ActivityItemIcon({ type }: { type: ActivityType }) {
  switch (type) {
    case ActivityType.Downloaded:
      return <HardDriveDownload size={20} />;
    case ActivityType.Deleted:
      return <Trash2 size={20} />;
    case ActivityType.Cancelled:
      return <CircleSlash size={20} />;
    case ActivityType.Downloading:
      return <DownloadCloud size={20} />;
    default:
      return <FileQuestion size={20} />;
  }
}

export function ActivitiesItem({
  name,
  type,
  date,
  civitaiUrl,
}: ActivitiesItemProps) {
  return (
    <div>
      <div className="flex space-x-2 items-center mt-2">
        {ActivityItemIcon({ type })}
        <div>
          <a href={civitaiUrl} target="_blank">
            <p className="text-sm capitalize">
              {type} <b>{name}</b>
            </p>
          </a>
          <p className="text-xs text-[#909296]">{dayjs(date).fromNow()}</p>
        </div>
      </div>
    </div>
  );
}
