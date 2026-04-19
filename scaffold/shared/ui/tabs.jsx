import { createContext, useContext, useState } from 'react';
import { cn } from '../lib/utils.js';

const TabsContext = createContext(null);

function Tabs({ defaultValue, value: controlledValue, onValueChange, className, children, ...props }) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const value = controlledValue ?? internalValue;
  const setValue = (v) => {
    if (controlledValue === undefined) setInternalValue(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn('', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, value, ...props }) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        active && 'bg-background text-foreground shadow-sm',
        className
      )}
      onClick={() => ctx?.setValue(value)}
      {...props}
    />
  );
}

function TabsContent({ className, value, ...props }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div
      role="tabpanel"
      className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
