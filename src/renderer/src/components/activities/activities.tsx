import { useElectron } from '@/providers/electron';
import { ActivitiesItem } from './activities-item';
import { Activity } from 'lucide-react';
import { useMemo } from 'react';
import dayjs from 'dayjs';

type Grouped = {
  [date: string]: ActivityItem[];
};

export function Activities() {
  const { activityList } = useElectron();

  const activities = useMemo(() => {
    const groupedObjects = activityList.reduce((grouped: Grouped, object) => {
      const { date } = object;
      const dateFormatted = dayjs(date).format('YYYY-MM-DD');
      let groupTitle;

      switch (dateFormatted) {
        case dayjs().format('YYYY-MM-DD'):
          groupTitle = 'Today';
          break;
        case dayjs().subtract(1, 'day').format('YYYY-MM-DD'):
          groupTitle = 'Yesterday';
          break;
        case dayjs().subtract(7, 'day').format('YYYY-MM-DD'):
          groupTitle = 'Last 7 Days';
          break;
        default:
          groupTitle = 'Last 30 Days';
          break;
      }

      if (!grouped[groupTitle]) {
        grouped[groupTitle] = [];
      }

      grouped[groupTitle].push(object);

      return grouped;
    }, {});

    return groupedObjects;
  }, [activityList]);

  if (activityList.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <Activity />
        <p className="ml-2 text-center text-sm">No Activity</p>
      </div>
    );
  }

  // TODO: Fix sticky top
  return (
    <div className="flex flex-col gap-y-4 mb-4 bg-background">
      {Object.keys(activities).map((date, key) => {
        return (
          <div key={key}>
            <div className="sticky top-[130px] py-2 bg-background">
              <p className="test-md font-bold text-[#909296]">{date}</p>
            </div>
            <div className="flex flex-col gap-y-2 mt-2">
              {activities[date].map((activity, key) => (
                <ActivitiesItem {...activity} key={`${date}-${key}`} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
