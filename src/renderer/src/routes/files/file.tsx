import {
  UploadCloud,
  ClipboardCopy,
  Trash2,
  FolderOpenDot,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function File() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <UploadCloud className="h-4 w-4" />
                <span className="sr-only">Add to Vault</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add to Vault</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <FolderOpenDot className="h-4 w-4" />
                <span className="sr-only">Open File in Folder</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open File in Folder</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Open Model on Civitai</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Model on Civitai</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <ClipboardCopy className="h-4 w-4" />
                <span className="sr-only">Copy Keywords</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Keywords</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              {/* <FileItemDelete resource={resource} /> */}
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" color="#F15252" />
                <span className="sr-only">Delete</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Separator />
      <div className="p-4">
        {/* TODO: Lookup by route hash */}
        <h1>Title</h1>
        <p>Tags</p>
        <p>Image</p>
        <p>Keywords</p>
      </div>
    </div>
  );
}

// Open File in Folder
// <p
// className="text-[10px] dark:text-[#909296] text-ellipsis overflow-hidden cursor-pointer"
// onClick={() =>
//   resource?.localPath
//     ? openModelFileFolder(resource.localPath)
//     : alert('Path to file cant be found.')
// }
// >
// {resource.name}
// </p>

// DONT FORGET DAYJS EXTENSIONS
// Download date
// {resource.downloadDate ? (
//   <p className="text-[10px] font-normal text-[#909296] flex items-center">
//     <DownloadCloud
//       className="mr-1"
//       size={12}
//       color="#909296"
//     />
//     {dayjs(resource.downloadDate).fromNow()}
//   </p>
// ) : null}

// Vault toggle
// {apiKey && resource.modelVersionId ? (
//   <Tooltip>
//     <TooltipTrigger>
//       {resource.vaultId ? (
//         <VaultItemDelete
//           hidden
//           hash={resource.hash}
//           modelVersionId={resource.modelVersionId}
//         />
//       ) : (
//         <UploadCloud
//           className="absolute top-3 left-3 w-6 h-6 cursor-pointer hidden group-hover:flex"
//           onClick={toggleInVault}
//         />
//       )}
//     </TooltipTrigger>
//     <TooltipContent className="max-w-[360px] bg-background/90 rounded p-1 ml-8 border">
//       <p className="text-xs">
//         {resource.vaultId
//           ? 'Remove from Vault'
//           : 'Store resource in your Vault'}
//       </p>
//     </TooltipContent>
//   </Tooltip>
// ) : null}

//   const { toggleVaultItem } = useApi();
// const toggleInVault = () => {
//   if (resource.modelVersionId) {
//     toggleVaultItem({
//       hash: resource.hash,
//       modelVersionId: resource.modelVersionId,
//     });
//   }
// };
