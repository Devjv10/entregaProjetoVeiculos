import {
  AlertCircle,
  ArrowRight,
  CarFront,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Route,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Vehicle } from "../types";
import { categories, money } from "../utils/format";

export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <Route size={24} />
      </span>
      <span>
        Drive<span className="brand-light">Flow</span>
        <small>LOCAÇÃO DE VEÍCULOS</small>
      </span>
    </span>
  );
}
export function Loading() {
  return (
    <div className="state" role="status">
      <LoaderCircle className="spin" size={30} />
      <p>Carregando suas informações…</p>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="state" role="alert">
      <AlertCircle size={32} />
      <h3>Não foi possível carregar</h3>
      <p>{message}</p>
      <button className="btn secondary" onClick={retry}>
        Tentar novamente
      </button>
    </div>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="state">
      <span className="empty-icon">
        <CarFront size={30} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Status({ status }: { status: string }) {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponível",
    RENTED: "Alugado",
    MAINTENANCE: "Manutenção",
    ACTIVE: "Em andamento",
    COMPLETED: "Concluída",
  };
  return (
    <span className={`status ${status.toLowerCase()}`}>
      <span />
      {labels[status] || status}
    </span>
  );
}
export function VehicleImage({
  vehicle,
  large = false,
}: {
  vehicle: Vehicle;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`vehicle-image ${large ? "large" : ""}`}>
      {vehicle.imageUrl && !failed ? (
        <img
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          onError={() => setFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="car-placeholder">
          <CarFront size={large ? 140 : 88} strokeWidth={0.8} />
          <span>
            {vehicle.brand} <b>{vehicle.model}</b>
          </span>
        </div>
      )}
    </div>
  );
}
