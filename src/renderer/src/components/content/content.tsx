import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Files } from '@/components/files';
import { Activities } from '@/components/activities';

export function Content() {
  return (
    <Tabs defaultValue="files">
      <TabsList className="grid w-full grid-cols-2 sticky top-0 bg-background z-10 rounded-none p-4">
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="activities">Activities</TabsTrigger>
      </TabsList>
      <div className="overflow-y-auto h-dvh px-4">
        <TabsContent value="files">
          <Files />
        </TabsContent>
        <TabsContent value="activities">
          <Activities />
        </TabsContent>
      </div>
    </Tabs>
  );
}
