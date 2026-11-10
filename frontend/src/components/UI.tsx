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
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="vehicle-card">
      <div className="vehicle-visual">
        <VehicleImage vehicle={vehicle} />
        <div className="vehicle-badge">
          <Status status={vehicle.status} />
        </div>
      </div>
      <div className="vehicle-body">
        <span className="eyebrow">
          {categories[vehicle.category]}{" "}
          <span className="dot-separator">•</span> {vehicle.year}
        </span>
        <h3>
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="muted small">
          {vehicle.color} <span className="dot-separator">•</span>{" "}
          {vehicle.plate}
        </p>
        <div className="vehicle-bottom">
          <p>
            <strong>{money(vehicle.dailyRate)}</strong>
            <span className="muted small"> / diária</span>
          </p>
          <Link
            className="icon-button"
            to={`/veiculos/${vehicle.id}`}
            aria-label={`Ver detalhes de ${vehicle.brand} ${vehicle.model}`}
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}
