import { createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils.js';

const DialogContext = createContext(null);

function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ asChild, children, ...props }) {
  const ctx = useContext(DialogContext);
  if (asChild) {
    return <span onClick={() => ctx?.onOpenChange(true)} {...props}>{children}</span>;
  }
  return <button onClick={() => ctx?.onOpenChange(true)} {...props}>{children}</button>;
}

function DialogPortal({ children }) {
  const ctx = useContext(DialogContext);
  if (!ctx?.open) return null;
  return children;
}

function DialogOverlay({ className, ...props }) {
  const ctx = useContext(DialogContext);
  return (
    <div
      className={cn('fixed inset-0 z-50 bg-black/80', className)}
      onClick={() => ctx?.onOpenChange(false)}
      {...props}
    />
  );
}

function DialogContent({ className, children, ...props }) {
  const ctx = useContext(DialogContext);
  if (!ctx?.open) return null;
  return (
    <>
      <DialogOverlay />
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
          className
        )}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => ctx?.onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
}

function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />;
}
function DialogFooter({ className, ...props }) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />;
}
function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}
function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export {
  Dialog, DialogTrigger, DialogPortal, DialogOverlay,
  DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
};
