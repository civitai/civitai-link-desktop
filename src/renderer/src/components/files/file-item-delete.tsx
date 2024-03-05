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

type FileItemDeleteProps = { resource: Resource };

export function FileItemDelete({ resource }: FileItemDeleteProps) {
  const { resourceRemove } = useApi();

  const removeResource = () => {
    resourceRemove(resource);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Trash2
          color="#F15252"
          className="cursor-pointer absolute group-hover:flex hidden top-1/2 right-0 transform -translate-y-1/2"
          size={20}
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete the model from your file system and will
            require re-download.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="py-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={removeResource}
            className="py-2 destructive"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
