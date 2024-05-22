import { FileActions } from '@/components/files/file-actions';
import { FileNotes } from '@/components/files/file-notes';
import { Badge, TypeBadge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useApi } from '@/hooks/use-api';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { Check, Copy, DownloadCloud, Image } from 'lucide-react';
import prettyBytes from 'pretty-bytes';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function File() {
  const { hash } = useParams();
  const { getFileByHash } = useApi();
  const [isCopied, setIsCopied] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [file, setFile] = useState<Resource | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (hash) {
        const fileByHash = await getFileByHash(hash);
        setFile(fileByHash);
      }
    };

    fetchFile();
  }, [hash]);

  useEffect(() => {
    setTimeout(() => {
      setIsCopied(null);
    }, 4000);
  }, [isCopied]);

  // This is due to react-router not resetting state
  useEffect(() => {
    setImageFailed(false);
    setIsCopied(null);
  }, [hash]);

  if (!file) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <FileActions file={file} />
      <Separator />
      <ScrollArea className="h-full">
        <div className="p-4 gap-2 flex flex-col pb-16">
          {file.previewImageUrl && !imageFailed ? (
            <img
              src={file.previewImageUrl}
              alt={file.modelName}
              className="aspect-square object-cover object-center rounded-lg max-w-80"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="bg-card w-12 h-12 rounded flex items-center justify-center">
              <Image size={24} />
            </div>
          )}
          <h1>{file?.modelName}</h1>
          <p className="text-[10px] dark:text-[#909296]">{file.name}</p>
          <table>
            <tbody>
              <tr>
                <td>Type</td>
                <td>
                  <TypeBadge type={file?.type} />
                </td>
              </tr>
              <tr>
                <td>Version</td>
                <td>
                  <Badge variant="outline">{file.modelVersionName}</Badge>
                </td>
              </tr>
              {file.downloadDate ? (
                <tr>
                  <td>Downloaded</td>
                  <td>
                    <p className="flex items-center">
                      <DownloadCloud
                        className="mr-1"
                        size={12}
                        color="#909296"
                      />
                      {dayjs(file.downloadDate).fromNow()}
                    </p>
                  </td>
                </tr>
              ) : null}
              {file.fileSize ? (
                <tr>
                  <td>File Size</td>
                  <td>{prettyBytes(file.fileSize)}</td>
                </tr>
              ) : null}
              {file.baseModel ? (
                <tr>
                  <td>Base Model</td>
                  <td>{file.baseModel}</td>
                </tr>
              ) : null}
              {file.trainedWords && file.trainedWords.length > 0 ? (
                <tr>
                  <td>Trigger Words</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {file.trainedWords.map((word, i) => (
                        <Badge
                          variant="modelTag"
                          className={classnames('cursor-pointer', {
                            '!dark:bg-[#2f9e44]/20 !bg-[#2f9e44]/20 !text-[#B2F2BB] !dark:text-[#B2F2BB]':
                              isCopied === i,
                          })}
                          onClick={() => {
                            navigator.clipboard.writeText(word);
                            setIsCopied(i);
                          }}
                          key={`${word}-${i}`}
                        >
                          {word}{' '}
                          <span className="ml-1">
                            {isCopied === i ? (
                              <Check size={10} color="green" />
                            ) : (
                              <Copy size={10} className="cursor-pointer" />
                            )}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <FileNotes file={file} />
        </div>
      </ScrollArea>
    </div>
  );
}
