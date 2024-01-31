import { HeaderTop } from './header-top';
import { HeaderBottom } from './header-bottom';
import { TABS } from '../../types';

export function Header(props: { setTab: (tab: TABS) => void }) {
  return (
    <div className="">
      <HeaderTop />
      <HeaderBottom setTab={props.setTab} />
    </div>
  );
}
