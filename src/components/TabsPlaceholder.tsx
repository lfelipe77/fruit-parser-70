
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
  onClick?: () => void;
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
    try {
      if (onValueChange) {
        onValueChange(newValue);
      } else {
        setActiveTab(newValue);
      }
    } catch (e) {
      console.error("Tab value change error:", e);
    }
  };

  return (
    <div className={className} data-active-tab={currentValue}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            ...child.props, 
            onValueChange: handleValueChange,
            activeTab: currentValue 
          } as any);
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ""}`}>{children}</div>;
}

export function TabsTrigger({ children, value, className, onClick, ...props }: TabsTriggerProps & any) {
  const handleClick = () => {
    try {
      if (onClick) {
        onClick();
      }
      if (props.onValueChange) {
        props.onValueChange(value);
      }
    } catch (e) {
      console.error("Tab trigger error:", e);
    }
  };

  const isActive = props.activeTab === value;

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-muted/80"
      } ${className || ""}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className, ...props }: TabsContentProps & any) {
  const isActive = props.activeTab === value;
  
  if (!isActive) return null;
  
  return <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ""}`}>{children}</div>;
}
