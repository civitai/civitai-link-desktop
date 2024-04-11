import { PrimaryLayout } from '@/layout/primary-layout';

export default function Root() {
  return (
    <div className="flex flex-col h-screen">
      <div className="titlebar border-b border-border" />
      <PrimaryLayout />
    </div>
  );
}
