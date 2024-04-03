import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Files } from '@/components/files';
import { Activities } from '@/components/activities';
import { Vault } from '@/components/vault';

export function Content() {
  return (
    <Tabs defaultValue="files">
      <TabsList className="grid w-full grid-cols-3 sticky top-[90px] bg-background z-10 rounded-none p-4">
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="vault">Vault</TabsTrigger>
        <TabsTrigger value="activities">Activities</TabsTrigger>
      </TabsList>
      <div className="px-4">
        <TabsContent value="files">
          <Files />
        </TabsContent>
        <TabsContent value="vault">
          <Vault />
        </TabsContent>
        <TabsContent value="activities">
          <Activities />
        </TabsContent>
      </div>
    </Tabs>
  );
}
