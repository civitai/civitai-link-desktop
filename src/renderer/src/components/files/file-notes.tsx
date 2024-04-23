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

      if (data) {
        setNote(data);
        setUpdatedNote(data);
      }

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
      <div className="bg-[#25262b] w-full p-2 mt-4 rounded-lg relative">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[#909296] text-lg">Notes</p>
          {loading ? null : (
            <DialogTrigger>
              <PenBoxIcon size={18} />
            </DialogTrigger>
          )}
        </div>
        {loading ? 'Loading...' : <p className="text-sm">{note}</p>}
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Notes</DialogTitle>
          <DialogDescription>
            <Textarea
              className="min-h-48"
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
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
