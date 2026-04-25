import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/Toaster";
import { ToastProvider } from "@/contexts/ToastContext";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </ToastProvider>
  );
}

export default App;
