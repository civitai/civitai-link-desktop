import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type FileItemDeleteProps = { resource: Resource };

export function FileItemDelete({ resource }: FileItemDeleteProps) {
  const { resourceRemove } = useApi();

  const removeResource = () => {
    resourceRemove(resource);
  };

  return (
    <AlertDialog>
      <Tooltip>
        <AlertDialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <TooltipTrigger asChild>
            <Trash2 className="h-4 w-4" color="#F15252" />
          </TooltipTrigger>
        </AlertDialogTrigger>
        <TooltipContent side="bottom">Delete Model</TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete the model from your file system and will
            require re-download.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="p-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={removeResource}
            className="p-2 destructive"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
