import { Braces } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

export function FileFetchMetadata({ localPath }: { localPath: string }) {
  const { fetchMetadata } = useApi();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchMetadata = async () => {
    setLoading(true);
    const data = await fetchMetadata(localPath);

    if (data) {
      setMetadata(data);
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleFetchMetadata}>
          <Braces className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[600px] min-w-[800px] rounded p-4 overflow-scroll">
        <DialogHeader>
          <DialogTitle>Model Metadata</DialogTitle>
        </DialogHeader>
        {loading ? (
          <pre>Loading...</pre>
        ) : (
          <pre className="text-sm bg-black/20">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  );
}
