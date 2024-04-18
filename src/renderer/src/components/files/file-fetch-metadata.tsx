import { Braces, Check, ClipboardCopy } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function FileFetchMetadata({ localPath }: { localPath: string }) {
  const { fetchMetadata } = useApi();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsCopied(false);
    }, 4000);
  }, [isCopied]);

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
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleFetchMetadata}>
              <Braces className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>View Model Metadata</TooltipContent>
      </Tooltip>

      <DialogContent className="max-h-[500px] min-h-0 min-w-[800px] rounded p-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Model Metadata{' '}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(metadata) || '');
                setIsCopied(true);
              }}
            >
              {isCopied ? (
                <Check className="w-4 h-4" color="green" />
              ) : (
                <ClipboardCopy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy All Trigger Words</span>
            </Button>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <pre>Loading...</pre>
        ) : (
          <div className="flex max-h-[440px] overflow-auto bg-black/20 p-2 rounded">
            <pre className="text-sm text-primary">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
