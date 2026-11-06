import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { GrammarEditor } from './pages/GrammarEditor';
import { TransformationStudio } from './pages/TransformationStudio';
import { FirstFollow } from './pages/FirstFollow';
import { LL1Table } from './pages/LL1Table';
import { ParsingSimulator } from './pages/ParsingSimulator';
import { ParseTreeVisualizer } from './pages/ParseTreeVisualizer';
import { GrammarPlayground } from './pages/GrammarPlayground';
import { LearningMode } from './pages/LearningMode';
import { ComparisonAnalysis } from './pages/ComparisonAnalysis';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="grammar-editor" element={<GrammarEditor />} />
          <Route path="transformations" element={<TransformationStudio />} />
          <Route path="first-follow" element={<FirstFollow />} />
          <Route path="ll1-table" element={<LL1Table />} />
          <Route path="simulator" element={<ParsingSimulator />} />
          <Route path="parse-tree" element={<ParseTreeVisualizer />} />
          <Route path="playground" element={<GrammarPlayground />} />
          <Route path="learning-mode" element={<LearningMode />} />
          <Route path="comparison" element={<ComparisonAnalysis />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
