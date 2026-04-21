import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/Toaster";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
