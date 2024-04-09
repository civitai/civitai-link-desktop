import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import React from 'react';

export function PanelWrapper({ children }: { children: React.ReactNode }) {
  const size = 80 / React.Children.count(children);

  // Temp removing collapsable navigation
  return React.Children.map(children, (child, i) => (
    <>
      <ResizableHandle withHandle={i % 2 !== 0} />
      <ResizablePanel defaultSize={size} minSize={size}>
        {child}
      </ResizablePanel>
    </>
  ));
}
