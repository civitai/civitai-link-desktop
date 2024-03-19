import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { VaultItemDelete } from './vault-item-delete';

// import { CiVault } from "react-icons/ci";

dayjs.extend(duration);
dayjs.extend(relativeTime);

type VaultItemProps = {
  modelName: string;
  versionName: string;
  type: string;
  modelId: number;
  modelVersionId: number;
};

export function VaultItem({
  modelName,
  versionName,
  type,
  modelId,
  modelVersionId,
}: VaultItemProps) {
  return (
    <TooltipProvider>
      <Card className="mb-2 bg-transparent group">
        <CardContent>
          <div className="flex relative">
            <div className="w-full whitespace-nowrap overflow-hidden pr-8 justify-between flex flex-col flex-1 gap-2">
              <div>
                <a
                  href={`https://civitai.com/models/${modelId}?modelVersionId=${modelVersionId}`}
                  target="_blank"
                >
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
                <VaultItemDelete />
              </TooltipTrigger>
              <TooltipContent className="max-w-[360px] bg-background/90 rounded mr-2 p-1 border z-50">
                <p className="text-xs">Remove from Vault</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
