import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bestiary from "./pages/Bestiary";
import SpeciesDetail from "./pages/SpeciesDetail";
import SpeciesIdentification from "./pages/SpeciesIdentification";
import Resources from "./pages/Resources";
import ExplorationMap from "./pages/ExplorationMap";
import Exploration from "./pages/Exploration";
import LogResource from "./pages/LogResource";
import Logbook from "./pages/Logbook";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bestiary" element={<Bestiary />} />
          <Route path="/species/:id" element={<SpeciesDetail />} />
          <Route path="/identify" element={<SpeciesIdentification />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/map" element={<ExplorationMap />} />
          <Route path="/exploration" element={<Exploration />} />
          <Route path="/log-resource" element={<LogResource />} />
          <Route path="/logbook" element={<Logbook />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
