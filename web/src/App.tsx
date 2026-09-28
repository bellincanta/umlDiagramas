import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DiagramEditorPage } from "./pages/DiagramEditorPage";
import { DiagramListPage } from "./pages/DiagramListPage";

export function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <Routes>
        <Route path="/" element={<DiagramListPage />} />
        <Route path="/diagrams/:diagramId" element={<DiagramEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
