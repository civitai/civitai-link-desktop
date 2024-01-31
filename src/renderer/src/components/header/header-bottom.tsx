import { TABS } from '../../types';

export function HeaderBottom(props: { setTab: (tab: TABS) => void }) {
  return (
    <div className="border-b">
      <div className="flex py-2 px-4 items-center">
        <div className="flex items-center space-x-4">
          <div
            className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
            onClick={() => props.setTab(TABS.ACTIVITY)}
          >
            Activity
          </div>
          <div
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary cursor-pointer"
            onClick={() => props.setTab(TABS.FILES)}
          >
            Files
          </div>
        </div>
      </div>
    </div>
  );
}
