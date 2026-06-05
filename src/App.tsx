import { MainLayout } from "./components/layout/MainLayout";
import { StatusBar } from "./components/layout/StatusBar";
import { MenuBar } from "./components/layout/MenuBar";
import { useTimingMode } from "./hooks/useTimingMode";

export default function App() {
  // Activate global keyboard bindings for the timing engine.
  useTimingMode();

  return (
    <div className="flex flex-col h-full bg-surface-0 text-gray-200">
      <MenuBar />
      <MainLayout />
      <StatusBar />
    </div>
  );
}
