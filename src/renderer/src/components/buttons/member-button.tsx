import { Button } from '../ui/button';

export function MemberButton() {
  return (
    <Button variant="secondary" className="p-4">
      <a href="https://civitai.com/pricing" target="_blank">
        Become a Member
      </a>
    </Button>
  );
}
