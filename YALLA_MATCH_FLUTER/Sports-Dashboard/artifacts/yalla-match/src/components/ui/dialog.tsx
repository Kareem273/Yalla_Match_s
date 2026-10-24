import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"

export const lastDialogTrigger = {
  rect: null as DOMRect | null,
};

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (event) => {
      const target = (event.target as HTMLElement | null)?.closest(
        "[data-dialog-trigger], [data-state], button, .cursor-pointer, [role='button']"
      );
      if (target) {
        lastDialogTrigger.rect = target.getBoundingClientRect();
      }
    },
    { capture: true, passive: true }
  );
}

const Dialog = DialogPrimitive.Root

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ onClick, onPointerDown, ...props }, ref) => (
  <DialogPrimitive.Trigger
    ref={ref}
    onPointerDown={(e) => {
      lastDialogTrigger.rect = e.currentTarget.getBoundingClientRect();
      onPointerDown?.(e);
    }}
    onClick={(e) => {
      lastDialogTrigger.rect = e.currentTarget.getBoundingClientRect();
      onClick?.(e);
    }}
    {...props}
  />
));
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/75 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, style, ...props }, ref) => {
  const [coords, setCoords] = React.useState<{ deltaX: number; deltaY: number }>(() => {
    if (typeof window !== "undefined" && lastDialogTrigger.rect) {
      const r = lastDialogTrigger.rect;
      return {
        deltaX: Math.round(r.left + r.width / 2 - window.innerWidth / 2),
        deltaY: Math.round(r.top + r.height / 2 - window.innerHeight / 2),
      };
    }
    return { deltaX: 0, deltaY: 0 };
  });

  React.useEffect(() => {
    if (lastDialogTrigger.rect) {
      const r = lastDialogTrigger.rect;
      setCoords({
        deltaX: Math.round(r.left + r.width / 2 - window.innerWidth / 2),
        deltaY: Math.round(r.top + r.height / 2 - window.innerHeight / 2),
      });
    }
  }, []);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          ["--card-origin-x" as any]: `${coords.deltaX}px`,
          ["--card-origin-y" as any]: `${coords.deltaY}px`,
          ...style,
        }}
        className={cn(
          "dialog-card-popup fixed z-50 grid w-full max-w-lg gap-4 p-6 sm:rounded-2xl",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
