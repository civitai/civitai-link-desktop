import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { VaultItemDelete } from './vault-item-delete';
import { Download, Image } from 'lucide-react';
import { type VaultItem } from '@/providers/vault';

dayjs.extend(duration);
dayjs.extend(relativeTime);

type VaultItemProps = VaultItem;

export function VaultItem({
  id,
  modelName,
  versionName,
  type,
  modelVersionId,
  coverImageUrl,
}: VaultItemProps) {
  return (
    <Card className="bg-transparent group">
      <CardContent>
        <div className="flex relative">
          {coverImageUrl ? (
            <div className="w-12 h-12 mr-2 items-center overflow-hidden rounded relative">
              <img
                src={coverImageUrl}
                alt={modelName}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ) : (
            <div className="bg-card w-12 h-12 mr-2 rounded flex items-center justify-center">
              <Image size={24} />
            </div>
          )}
          <div className="w-full whitespace-nowrap overflow-hidden pr-24 justify-between flex flex-col flex-1 gap-2">
            <div>
              <a href="https://civitai.com/user/vault" target="_blank">
                <p className="text-sm leading-none dark:text-white font-bold text-ellipsis overflow-hidden">
                  {modelName}
                </p>
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="modelTag">{type}</Badge>
              <Badge variant="outline">{versionName}</Badge>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <a
                href={`https://civitai.com/api/download/vault/${id}?type=model`}
                target="_blank"
              >
                <Download className="absolute w-6 h-6 cursor-pointer top-1/2 right-14 transform -translate-y-1/2" />
              </a>
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px] bg-background/90 rounded mr-2 p-1 border z-50">
              <p className="text-xs">Download to disk</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <VaultItemDelete modelVersionId={modelVersionId} align="right" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px] bg-background/90 rounded mr-2 p-1 border z-50">
              <p className="text-xs">Remove from Vault</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
