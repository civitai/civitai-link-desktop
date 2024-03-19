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
import { useApi } from '@/hooks/use-api';
import { CloudOff } from 'lucide-react';

type VaultItemDeleteProps = {
  modelVersionId: number;
};

export function VaultItemDelete({ modelVersionId }: VaultItemDeleteProps) {
  const { toggleVaultItem } = useApi();

  const removeFromVault = () => {
    toggleVaultItem(modelVersionId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <CloudOff
          color="#F15252"
          className="cursor-pointer absolute group-hover:flex hidden top-1/2 right-0 transform -translate-y-1/2"
          size={20}
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete the model from your vault and may not be
            available later from Civitai.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="py-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={removeFromVault}
            className="py-2 destructive"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}