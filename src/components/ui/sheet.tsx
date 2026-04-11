import * as React from "react";
import { Drawer } from "vaul";

import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

function Sheet({ ...props }: React.ComponentProps<typeof Drawer.Root>) {
  return <Drawer.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof Drawer.Trigger>) {
  return <Drawer.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof Drawer.Close>) {
  return <Drawer.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof Drawer.Portal>) {
  return <Drawer.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof Drawer.Overlay>) {
  return (
    <Drawer.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 mx-auto max-w-[480px] z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "bottom",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Drawer.Content> & {
  side?: "bottom"; 
  showCloseButton?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <Drawer.Content
        data-slot="sheet-content"
        className={cn(
          "fixed bottom-0 inset-x-0 z-50 flex h-auto max-w-[480px] mx-auto flex-col rounded-t-[24px] bg-background border-t shadow-2xl outline-none w-full",
          className,
        )}
        {...props}
      >
        {/* Handle for swipe-to-close hint */}
        <div className="mx-auto mt-3 h-1.5 w-12 flex-shrink-0 rounded-full bg-surface2" />
        
        <div className="flex flex-col">
          {children}
        </div>

        {showCloseButton && (
          <Drawer.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-surface flex items-center justify-center text-text-muted active:scale-90 transition-transform z-50 hover:bg-surface2"
            >
              <XIcon size={18} />
              <span className="sr-only">Close</span>
            </button>
          </Drawer.Close>
        )}
      </Drawer.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-5 text-center", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-3 p-5", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof Drawer.Title>) {
  return (
    <Drawer.Title
      data-slot="sheet-title"
      className={cn("text-[17px] font-semibold text-foreground tracking-tight", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof Drawer.Description>) {
  return (
    <Drawer.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};


