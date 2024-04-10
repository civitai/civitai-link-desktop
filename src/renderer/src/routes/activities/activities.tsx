import { useElectron } from '@/providers/electron';
import { ActivitiesItem } from '@/components/activities/activities-item';
import { Activity } from 'lucide-react';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PanelWrapper } from '@/layout/panel-wrapper';

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
      const today = dayjs();
      const dateFormatted = dayjsDate.format('YYYY-MM-DD');
      let groupTitle;

      if (dateFormatted === today.format('YYYY-MM-DD')) {
        groupTitle = 'Today';
      } else if (
        dateFormatted === today.subtract(1, 'day').format('YYYY-MM-DD')
      ) {
        groupTitle = 'Yesterday';
      } else if (
        today.isSameOrBefore(
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
      <PanelWrapper>
        <div className="p-4 flex flex-1 h-full justify-center items-center">
          <Activity />
          <p className="ml-2 text-center text-sm">No Activity</p>
        </div>
      </PanelWrapper>
    );
  }

  return (
    <PanelWrapper>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-y-4 mb-4 bg-background">
          <div className="absolute top-0 border-b w-full min-h-14 z-10" />
          {Object.keys(activities).map((date, key) => {
            return (
              <div key={key}>
                <div className="sticky top-0 bg-background min-h-14 items-center flex px-4">
                  <p className="text-md font-bold text-[#909296]">{date}</p>
                </div>
                <div className="flex flex-col gap-y-2 px-4">
                  {activities[date].map((activity, key) => (
                    <ActivitiesItem {...activity} key={`${date}-${key}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </PanelWrapper>
  );
}
