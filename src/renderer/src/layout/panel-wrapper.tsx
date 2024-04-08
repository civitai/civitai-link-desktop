import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import React from 'react';

export function PanelWrapper({ children }: { children: React.ReactNode }) {
  const size = 80 / React.Children.count(children);

  return React.Children.map(children, (child) => (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={size} minSize={size}>
        {child}
      </ResizablePanel>
    </>
  ));
}
