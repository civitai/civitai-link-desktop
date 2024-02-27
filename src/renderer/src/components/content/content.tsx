import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Files } from '@/components/files';
import { Activities } from '@/components/activities';

export function Content() {
  return (
    <div className="container mx-auto p-4 mb-2 overflow-y-scroll h-full">
      <Tabs defaultValue="files">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="files">
          <Files />
        </TabsContent>
        <TabsContent value="activities">
          <Activities />
        </TabsContent>
      </Tabs>
    </div>
  );
}
