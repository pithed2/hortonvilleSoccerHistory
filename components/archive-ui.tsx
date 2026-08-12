import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContentContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("site-container", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header-decoration" aria-hidden="true" />
      <ContentContainer className="relative">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        <div className="page-description">{description}</div>
        {children && <div className="page-header-meta">{children}</div>}
      </ContentContainer>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  aside,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("section-heading", className)}>
      <div>
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {aside}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: ReactNode }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-icon" aria-hidden="true"><Inbox /></span>
      <h3 className="text-lg font-black">{title}</h3>
      <div className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</div>
    </div>
  );
}
