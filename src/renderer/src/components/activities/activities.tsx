import { useElectron } from '@/providers/electron';
import { ActivitiesItem } from './activities-item';
import { Activity } from 'lucide-react';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

type Grouped = {
  [date: string]: ActivityItem[];
};

export function Activities() {
  const { activityList } = useElectron();

  const activities = useMemo(() => {
    const groupedObjects = activityList.reduce((grouped: Grouped, object) => {
      const { date } = object;
      const dayjsDate = dayjs(date);
      const dateFormatted = dayjsDate.format('YYYY-MM-DD');
      let groupTitle;

      if (dateFormatted === dayjs().format('YYYY-MM-DD')) {
        groupTitle = 'Today';
      } else if (
        dateFormatted === dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      ) {
        groupTitle = 'Yesterday';
      } else if (
        dayjs().isSameOrBefore(
          dayjs(dateFormatted).add(7, 'day').format('YYYY-MM-DD'),
          'day',
        )
      ) {
        groupTitle = 'Last 7 Days';
      } else {
        groupTitle = 'Last 30 Days';
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

  return (
    <div className="flex flex-col gap-y-4 mb-4 bg-background">
      {Object.keys(activities).map((date, key) => {
        return (
          <div key={key}>
            <div className="sticky top-[130px] py-2 bg-background">
              <p className="text-md font-bold text-[#909296]">{date}</p>
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
