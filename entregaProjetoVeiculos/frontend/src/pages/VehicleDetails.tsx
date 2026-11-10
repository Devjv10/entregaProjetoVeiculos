import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Palette,
  Pencil,
  ShieldCheck,
  Tag,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../services/useApi";
import { api, errorMessage } from "../services/api";
import type { Vehicle } from "../types";
import { categories, money } from "../utils/format";
import {
  ConfirmDialog,
  ErrorState,
  Loading,
  Status,
  VehicleImage,
} from "../components/UI";

export function VehicleDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const { data, loading, error, reload } = useApi<{ data: Vehicle }>(
    `/vehicles/${id}`,
  );
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error} retry={reload} />;
  const vehicle = data.data;
  async function remove() {
    setPending(true);
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success("Veículo excluído.");
      navigate("/veiculos");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
      setConfirm(false);
    }
  }
  return (
    <>
      <Link className="back-link" to="/veiculos">
        <ArrowLeft size={17} />
        Voltar para veículos
      </Link>
      <div className="detail-grid">
        <div className="panel detail-visual">
          <VehicleImage vehicle={vehicle} large />
          <div className="detail-caption">
            <ShieldCheck size={20} />
            Informações atualizadas da nossa frota
          </div>
        </div>
        <section className="panel detail-info">
          <Status status={vehicle.status} />
          <p className="eyebrow">{categories[vehicle.category]}</p>
          <h1>
            {vehicle.brand}
            <br />
            {vehicle.model}
          </h1>
          <div className="spec-grid">
            <div>
              <CalendarDays size={19} />
              <span>
                Ano<strong>{vehicle.year}</strong>
              </span>
            </div>
            <div>
              <Palette size={19} />
              <span>
                Cor<strong>{vehicle.color}</strong>
              </span>
            </div>
            <div>
              <Tag size={19} />
              <span>
                Placa<strong>{vehicle.plate}</strong>
              </span>
            </div>
          </div>
          <div className="detail-price">
            <span className="muted">Valor da diária</span>
            <strong>
              {money(vehicle.dailyRate)}
              <small> / dia</small>
            </strong>
          </div>
          {user?.role === "ADMIN" ? (
            <div className="form-actions">
              <Link className="btn primary" to={`/veiculos/${id}/editar`}>
                <Pencil size={17} />
                Editar veículo
              </Link>
              <button className="btn danger" onClick={() => setConfirm(true)}>
                <Trash2 size={17} />
                Excluir
              </button>
            </div>
          ) : vehicle.status === "AVAILABLE" ? (
            <Link
              className="btn primary full"
              to={`/nova-locacao?vehicleId=${id}`}
            >
              Alugar este veículo
              <ArrowRight size={18} />
            </Link>
          ) : (
            <div className="notice">
              Este veículo está indisponível no momento.
            </div>
          )}
          <p className="muted small">
            A disponibilidade é confirmada ao concluir a locação.
          </p>
        </section>
      </div>
      {confirm && (
        <ConfirmDialog
          title="Excluir este veículo?"
          pending={pending}
          onCancel={() => setConfirm(false)}
          onConfirm={remove}
        >
          <p>
            Excluir {vehicle.brand} {vehicle.model} ({vehicle.plate})? Veículos
            com histórico de locações não podem ser excluídos.
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
