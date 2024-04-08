import { FileActions } from '@/components/files/file-actions';
import { Separator } from '@/components/ui/separator';
import { useFile } from '@/providers/files';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function File() {
  const { hash } = useParams();
  const { fileList } = useFile();
  const file = fileList[hash || ''];

  if (!file) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <FileActions />
      <Separator />
      <div className="p-4">
        <h1>{file?.modelName}</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="modelTag">{file.type}</Badge>
          <Badge variant="outline">{file.modelVersionName}</Badge>
        </div>
        <img
          src={file.previewImageUrl}
          alt={file.modelName}
          className="h-20 w-20 object-cover object-center"
        />
        <p>Keywords</p>
      </div>
    </div>
  );
}
