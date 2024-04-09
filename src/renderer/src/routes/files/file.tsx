import { FileActions } from '@/components/files/file-actions';
import { Separator } from '@/components/ui/separator';
import { useFile } from '@/providers/files';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { DownloadCloud, Copy, Check } from 'lucide-react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

export function File() {
  const { hash } = useParams();
  const { fileList } = useFile();
  const file = fileList[hash || ''];
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsCopied(false);
    }, 4000);
  }, [isCopied]);

  if (!file) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <FileActions file={file} />
      <Separator />
      <ScrollArea className="h-full">
        <div className="p-4 gap-2 flex flex-col pb-16">
          <img
            src={file.previewImageUrl}
            alt={file.modelName}
            className="aspect-square object-cover object-center rounded-lg"
          />
          <h1>{file?.modelName}</h1>
          <p className="text-[10px] dark:text-[#909296]">{file.name}</p>
          {file.downloadDate ? (
            <p className="text-[10px] font-normal text-[#909296] flex items-center">
              <DownloadCloud className="mr-1" size={12} color="#909296" />
              {dayjs(file.downloadDate).fromNow()}
            </p>
          ) : null}
          <div className="flex items-center space-x-2">
            <Badge variant="modelTag">{file.type}</Badge>
            <Badge variant="outline">{file.modelVersionName}</Badge>
          </div>
          {file.trainedWords ? (
            <div className="mt-4">
              <h2 className="text-xs font-semibold text-[#909296]">
                Trained Words
              </h2>
              <div className="relative">
                <pre className="p-2 mb-4 max-h-[650px] overflow-x-auto rounded-lg border bg-muted py-4 over">
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm text-wrap">
                    <span>{file.trainedWords.join(', ')}</span>
                  </code>
                </pre>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50 absolute right-2 top-2"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            file.trainedWords?.join(', ') || '',
                          );
                          setIsCopied(true);
                        }}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4" color="green" />
                        ) : (
                          <Copy className="w-4 h-4 cursor-pointer" />
                        )}
                        <span className="sr-only">Copy</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}
