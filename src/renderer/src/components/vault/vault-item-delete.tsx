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
import classNames from 'classnames';
import { CloudOff } from 'lucide-react';

type VaultItemDeleteProps = {
  modelVersionId: number;
  hash?: string;
  align?: 'left' | 'right';
  hidden?: boolean;
  className?: string;
};

export function VaultItemDelete({
  modelVersionId,
  hash,
  align = 'left',
  hidden,
  className,
}: VaultItemDeleteProps) {
  const { toggleVaultItem } = useApi();

  const removeFromVault = () => {
    toggleVaultItem({ modelVersionId, hash });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <CloudOff
          color="#F15252"
          className={
            className
              ? className
              : classNames('absolute w-6 h-6 cursor-pointer', {
                  'top-3 left-3': align === 'left',
                  'top-1/2 right-3 transform -translate-y-1/2':
                    align === 'right',
                  'hidden group-hover:flex': hidden,
                })
          }
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
            className="p-2 destructive"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
