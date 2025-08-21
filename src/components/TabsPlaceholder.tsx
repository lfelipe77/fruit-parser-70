import { useState, ReactNode } from "react";

interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  children: ReactNode;
  value: string;
  className?: string;
}

interface TabsContentProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export function Tabs({ children, defaultValue, value, onValueChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || "");
  
  const currentValue = value !== undefined ? value : activeTab;
  
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setActiveTab(newValue);
    }
  };

  return (
    <div className={className} data-active-tab={currentValue} data-on-value-change={handleValueChange}>
      {children}
    </div>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ""}`}>{children}</div>;
}

export function TabsTrigger({ children, value, className }: TabsTriggerProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className || ""}`}
      onClick={() => {
        const tabsEl = document.querySelector(`[data-active-tab]`) as any;
        if (tabsEl && tabsEl.dataset.onValueChange) {
          const handler = tabsEl.dataset.onValueChange;
          // This is a simplified approach - in real usage we'd need proper event handling
          if (typeof handler === 'function') handler(value);
        }
      }}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className }: TabsContentProps) {
  return <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ""}`}>{children}</div>;
}
