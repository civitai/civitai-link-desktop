import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export function Item() {
  return (
    <div className="flex flex-row">
      <Avatar className="mr-2">
        {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div>
        <h1>Model Im downloading</h1>
        <Progress value={33} />
        <p>100MB / 300MB - 33%</p>
      </div>
    </div>
  );
}
