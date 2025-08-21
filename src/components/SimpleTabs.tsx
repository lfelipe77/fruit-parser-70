import { useState, ReactNode } from "react";

interface Tab {
  value: string;
  label: string;
  content: ReactNode;
}

interface SimpleTabsProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
}

export default function SimpleTabs({ tabs, defaultValue, className = "" }: SimpleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value || "");

  return (
    <div className={className}>
      <div role="tablist" className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            onClick={() => setActiveTab(tab.value)}
            aria-selected={activeTab === tab.value}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === tab.value 
                ? "bg-background text-foreground shadow-sm" 
                : "hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {tabs.find(tab => tab.value === activeTab)?.content}
      </div>
    </div>
  );
}

// Legacy version for specific use cases like /resultados
type TabValue = "quase" | "completas" | "premiados";

export function SimpleTabsLegacy({
  initial = "quase",
  renderQuase,
  renderCompletas,
  renderPremiados,
}: {
  initial?: TabValue;
  renderQuase: React.ReactNode;
  renderCompletas: React.ReactNode;
  renderPremiados: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabValue>(initial);
  const Btn = (v: TabValue, label: string) => (
    <button
      type="button"
      onClick={() => setTab(v)}
      aria-selected={tab === v}
      className={
        "px-3 py-1 rounded-full text-sm border " +
        (tab === v ? "bg-black text-white border-black" : "bg-white text-black border-gray-300")
      }
    >
      {label}
    </button>
  );

  return (
    <div className="mt-6">
      <div role="tablist" className="flex gap-2 flex-wrap">
        {Btn("quase", "Quase Completas")}
        {Btn("completas", "Rifas Completas")}
        {Btn("premiados", "Ganháveis Premiados")}
      </div>
      <div className="mt-4">
        {tab === "quase" && <div>{renderQuase}</div>}
        {tab === "completas" && <div>{renderCompletas}</div>}
        {tab === "premiados" && <div>{renderPremiados}</div>}
      </div>
    </div>
  );
}