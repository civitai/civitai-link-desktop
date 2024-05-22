import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApi } from '@/hooks/use-api';
import { Braces, Check, ClipboardCopy } from 'lucide-react';
import { useEffect, useState } from 'react';

type FileFetchMetadataProps = {
  localPath: string;
  metadata?: Record<string, any> | string;
  hash: string;
};

export function FileFetchMetadata({
  localPath,
  metadata,
  hash,
}: FileFetchMetadataProps) {
  const { fetchMetadata } = useApi();
  const [loadedMetadata, setLoadedMetadata] = useState<
    Record<string, any> | string | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsCopied(false);
    }, 4000);
  }, [isCopied]);

  const handleFetchMetadata = async () => {
    if (!metadata) {
      setLoading(true);
      const data = await fetchMetadata(localPath, hash);

      if (data) {
        setLoadedMetadata(data);
        setLoading(false);
      }
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
        <TooltipContent side="bottom">View Model Metadata</TooltipContent>
      </Tooltip>

      <DialogContent className="max-h-[500px] min-h-0 min-w-[800px] rounded p-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Model Metadata{' '}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(metadata || loadedMetadata) || '',
                );
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
              {JSON.stringify(metadata || loadedMetadata, null, 2)}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
