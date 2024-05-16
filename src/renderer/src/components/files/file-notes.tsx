import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenBoxIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';

export function FileNotes({ file }: { file: Resource }) {
  const { fetchFileNotes, saveFileNotes } = useApi();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [updatedNote, setUpdatedNote] = useState('');

  useEffect(() => {
    const handleFetchFileNotes = async () => {
      setLoading(true);
      const data = await fetchFileNotes(file.hash);

      setNote(data);
      setUpdatedNote(data);
      setLoading(false);
    };

    handleFetchFileNotes();
  }, [file.hash]);

  const handleSaveFileNotes = async () => {
    setNote(updatedNote);
    await saveFileNotes(file.hash, updatedNote);
  };

  return (
    <Dialog>
      <div className="bg-[#25262b] w-full px-3 py-2 mt-4 rounded-sm relative">
        <div className="flex justify-between items-center">
          <p className="text-[#909296] text-sm">Notes</p>
          {loading ? null : (
            <DialogTrigger>
              <PenBoxIcon size={18} />
            </DialogTrigger>
          )}
        </div>
        {loading ? 'Loading...' : note ? <p className="text-sm mt-2">{note}</p> : null}
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Notes</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Textarea
            className="min-h-48 resize-none max-h-48 bg-black/20 border border-[#25262b] rounded-lg p-2 w-full"
            value={updatedNote}
            onChange={(event) => setUpdatedNote(event.target.value)}
          />
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="p-2"
              onClick={handleSaveFileNotes}
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
