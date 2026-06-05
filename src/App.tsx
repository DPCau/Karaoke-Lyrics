import { MainLayout } from "./components/layout/MainLayout";
import { StatusBar } from "./components/layout/StatusBar";
import { MenuBar } from "./components/layout/MenuBar";

export default function App() {
  return (
    <div className="flex flex-col h-full bg-surface-0 text-gray-200">
      <MenuBar />
      <MainLayout />
      <StatusBar />
    </div>
  );
}
