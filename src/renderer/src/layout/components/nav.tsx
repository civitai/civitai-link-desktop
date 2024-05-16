import { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { buttonVariants } from '@/components/ui/button';
import { useModelLoading } from '@/providers/model-loading';
import { Progress } from '@/components/ui/progress';

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: 'default' | 'ghost';
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const { isScanning, scanned, toScan } = useModelLoading();
  const collapsedNavClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      buttonVariants({
        variant: isActive ? 'default' : 'ghost',
        size: 'icon',
      }),
      'h-9 w-9',
      isActive &&
        'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white',
    );

  const nonCollapsedNavClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      buttonVariants({
        variant: isActive ? 'default' : 'ghost',
        size: 'sm',
      }),
      isActive &&
        'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
      'justify-start',
    );

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={link.href || '#'}
                  onClick={link.onClick}
                  className={collapsedNavClass}
                >
                  <link.icon className="h-5 w-5 mb-2" color="white" />
                  <span className="sr-only">{link.title}</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              key={index}
              to={link.href || '#'}
              className={nonCollapsedNavClass}
              onClick={link.onClick}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    'ml-auto',
                    link.variant === 'default' &&
                      'text-background dark:text-white',
                  )}
                >
                  {link.label}
                </span>
              )}
            </NavLink>
          ),
        )}
      </nav>
      {isScanning ? (
        <div className="px-4">
          <Progress value={(100 * scanned) / toScan} />
          <div className="flex-row flex justify-between w-full mt-2">
            <div>
              <p className="text-xs text-[#909296] leading-none">
                Loading Models
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
