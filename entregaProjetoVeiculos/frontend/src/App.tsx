import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ErrorState, Loading } from "./components/UI";
import { AppLayout } from "./layouts/AppLayout";
const AuthPage = lazy(() =>
  import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const Vehicles = lazy(() =>
  import("./pages/Vehicles").then((module) => ({ default: module.Vehicles })),
);
const VehicleDetails = lazy(() =>
  import("./pages/VehicleDetails").then((module) => ({
    default: module.VehicleDetails,
  })),
);
const VehicleForm = lazy(() =>
  import("./pages/VehicleForm").then((module) => ({
    default: module.VehicleForm,
  })),
);
const NewRental = lazy(() =>
  import("./pages/NewRental").then((module) => ({ default: module.NewRental })),
);
const Rentals = lazy(() =>
  import("./pages/Rentals").then((module) => ({ default: module.Rentals })),
);

function Protected({ role }: { role?: "ADMIN" | "CLIENTE" }) {
  const { user, loading, error, retry } = useAuth();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={retry} />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
function NotFound() {
  return (
    <div className="not-found">
      <span className="eyebrow">CAMINHO NÃO ENCONTRADO</span>
      <h1>404</h1>
      <h2>Parece que saímos da rota.</h2>
      <p className="muted">Esta página não existe ou foi movida.</p>
      <Link className="btn primary" to="/">
        Voltar ao início
      </Link>
    </div>
  );
}
export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<AuthPage key="login" />} />
            <Route
              path="/cadastro"
              element={<AuthPage key="register" registerMode />}
            />
            <Route element={<Protected />}>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="veiculos" element={<Vehicles />} />
                <Route path="veiculos/:id" element={<VehicleDetails />} />
                <Route path="locacoes" element={<Rentals />} />
                <Route element={<Protected role="ADMIN" />}>
                  <Route path="veiculos/novo" element={<VehicleForm />} />
                  <Route path="veiculos/:id/editar" element={<VehicleForm />} />
                </Route>
                <Route element={<Protected role="CLIENTE" />}>
                  <Route path="nova-locacao" element={<NewRental />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </BrowserRouter>
  );
}
