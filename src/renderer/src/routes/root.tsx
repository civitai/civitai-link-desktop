import { PrimaryLayout } from '@/layout/primary-layout';

export default function Root() {
  return (
    <div className="flex flex-col h-screen">
      <div className="titlebar border-b border-border" />
      <PrimaryLayout navCollapsedSize={4} defaultLayout={[265, 440, 655]} />
    </div>
  );
}
