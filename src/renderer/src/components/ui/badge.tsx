import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ResourceType } from '@/types';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground dark:bg-[#1971c2]/20 dark:text-[#A5D8FF]',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-[#909296]',
        modelTag:
          'border-transparent bg-primary text-primary-foreground dark:bg-[#2E2049] dark:text-[#C89DFF]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

function TypeBadge({ type, ...props }: { type?: string } & BadgeProps) {
  const typeKey = type?.toUpperCase() as keyof typeof ResourceType;
  if (!typeKey) return null;
  const displayType = ResourceType[typeKey];
  if (!displayType) return null;
  return <Badge variant="modelTag" {...props}>{ResourceType[typeKey]}</Badge>;
}

export { Badge, TypeBadge, badgeVariants };
