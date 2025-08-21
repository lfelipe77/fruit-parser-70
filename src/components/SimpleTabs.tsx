import { useState } from "react";

type TabValue = "quase" | "completas" | "premiados";

export default function SimpleTabs({
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
  const btn = (v: TabValue, label: string) => (
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
        {btn("quase", "Quase Completas")}
        {btn("completas", "Rifas Completas")}
        {btn("premiados", "Ganháveis Premiados")}
      </div>
      <div className="mt-4">
        {tab === "quase" && <div>{renderQuase}</div>}
        {tab === "completas" && <div>{renderCompletas}</div>}
        {tab === "premiados" && <div>{renderPremiados}</div>}
      </div>
    </div>
  );
}