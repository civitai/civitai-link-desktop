import { Braces } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dialog, DialogTrigger } from '@radix-ui/react-dialog';
import { useState } from 'react';

export function FileFetchMetadata({ localPath }: { localPath: string }) {
  const { fetchMetadata } = useApi();
  const [metadata, setMetadata] = useState<any>(null);

  const handleFetchMetadata = async () => {
    const data = await fetchMetadata(localPath);

    if (data) {
      setMetadata(data);
    }
  };

  // TODO: Style pre
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleFetchMetadata}>
          <Braces className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[360px] rounded p-4">
        <DialogHeader>
          <DialogTitle>Model Metadata</DialogTitle>
        </DialogHeader>
        <div>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
