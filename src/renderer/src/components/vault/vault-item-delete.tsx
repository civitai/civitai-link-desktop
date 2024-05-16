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
  onDelete?: () => void;
};

export function VaultItemDelete({
  modelVersionId,
  hash,
  align = 'left',
  hidden,
  className,
  onDelete,
}: VaultItemDeleteProps) {
  const { toggleVaultItem, fetchVaultModels } = useApi();

  const removeFromVault = async () => {
    await toggleVaultItem({ modelVersionId, hash });
    onDelete?.();
    setTimeout(() => fetchVaultModels(), 1000);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
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
        </div>
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
