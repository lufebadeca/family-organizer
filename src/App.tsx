import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Home } from "@/pages/Home";
import { Tasks } from "@/pages/Tasks";
import { Expenses } from "@/pages/Expenses";
import { Categories } from "@/pages/Categories";
import { CategoryDetail } from "@/pages/CategoryDetail";
import { SettingsPage } from "@/pages/Settings";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tareas" element={<Tasks />} />
        <Route path="/gastos" element={<Expenses />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/categorias/:id" element={<CategoryDetail />} />
        <Route path="/ajustes" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
