import {
  CarFront,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ReceiptText,
  ShieldCheck,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Brand } from "../components/UI";

export function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const admin = user?.role === "ADMIN";
  return (
    <div className="app-shell">
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <NavLink to="/" className="brand-link" onClick={() => setOpen(false)}>
          <Brand />
        </NavLink>
        <button
          className="mobile-close icon-button"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <p className="nav-label">
          ESPAÇO {admin ? "ADMINISTRATIVO" : "DO CLIENTE"}
        </p>
        <nav aria-label="Navegação principal">
          <NavLink end to="/" onClick={() => setOpen(false)}>
            <LayoutDashboard size={20} /> Visão geral
          </NavLink>
          <NavLink to="/veiculos" onClick={() => setOpen(false)}>
            <CarFront size={20} />{" "}
            {admin ? "Gerenciar frota" : "Explorar veículos"}
          </NavLink>
          <NavLink to="/locacoes" onClick={() => setOpen(false)}>
            <ReceiptText size={20} />{" "}
            {admin ? "Todas as locações" : "Minhas locações"}
          </NavLink>
          {!admin && (
            <NavLink to="/nova-locacao" onClick={() => setOpen(false)}>
              <Plus size={20} /> Nova locação
            </NavLink>
          )}
        </nav>
        <div className="sidebar-tip">
          <span className="tip-icon">
            <ShieldCheck size={22} />
          </span>
          <h3>
            {admin ? "Sua operação conectada." : "O próximo caminho é seu."}
          </h3>
          <p>
            {admin
              ? "Frota, contratos e devoluções em um só lugar."
              : "Escolha seu veículo e viaje com tranquilidade."}
          </p>
        </div>
        <div className="sidebar-footer">
          <span className="avatar">{user?.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user?.name}</strong>
            <small>{admin ? "Administrador" : "Cliente"}</small>
          </div>
          <button
            className="logout"
            onClick={logout}
            title="Sair da conta"
            aria-label="Sair da conta"
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <span className="breadcrumb">
            DriveFlow <span>/</span>{" "}
            <strong>{admin ? "Gestão da locadora" : "Área do cliente"}</strong>
          </span>
          <span className="workspace-label">
            <span />
            {admin ? "Painel administrativo" : "Minha conta"}
          </span>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
        <footer className="page-footer">
          <span>DriveFlow · Cada caminho, uma nova possibilidade.</span>
          <span>Projeto acadêmico</span>
        </footer>
      </div>
    </div>
  );
}
