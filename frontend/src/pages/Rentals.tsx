import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../services/useApi";
import { api, errorMessage } from "../services/api";
import type { Paginated, Rental } from "../types";
import {
  ConfirmDialog,
  ErrorState,
  Loading,
  PageTitle,
  Pagination,
} from "../components/UI";
import { RentalList } from "../components/RentalList";

export function Rentals() {
  const { user } = useAuth();
  const admin = user?.role === "ADMIN";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Rental | null>(null);
  const [pending, setPending] = useState(false);
  const { data, loading, error, reload } = useApi<Paginated<Rental>>(
    `/rentals?page=${page}&limit=10${status ? `&status=${status}` : ""}`,
  );
  async function returnVehicle() {
    if (!selected) return;
    setPending(true);
    try {
      await api.patch(`/rentals/${selected.id}/return`);
      toast.success("Devolução registrada. Veículo disponível novamente.");
      setSelected(null);
      reload();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="CADA JORNADA, UM REGISTRO"
        title={admin ? "Todas as locações" : "Minhas locações"}
        description={
          admin
            ? "Acompanhe os contratos e registre as devoluções da frota."
            : "Acompanhe suas viagens em andamento e seu histórico."
        }
        action={
          !admin && (
            <Link className="btn primary" to="/nova-locacao">
              <Plus size={18} />
              Nova locação
            </Link>
          )
        }
      />
      <section className="panel">
        <div className="tabs" role="group" aria-label="Filtrar locações">
          {[
            ["", "Todas"],
            ["ACTIVE", "Em andamento"],
            ["COMPLETED", "Concluídas"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={status === value ? "active" : ""}
              aria-pressed={status === value}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {loading ? (
          <Loading />
        ) : error || !data ? (
          <ErrorState message={error} retry={reload} />
        ) : (
          <>
            <RentalList
              rentals={data.data}
              admin={admin}
              onReturn={setSelected}
            />
            <Pagination {...data.meta} setPage={setPage} />
          </>
        )}
      </section>
      {selected && (
        <ConfirmDialog
          title="Registrar devolução?"
          pending={pending}
          onCancel={() => setSelected(null)}
          onConfirm={returnVehicle}
        >
          <p>
            Confirme a devolução de{" "}
            <strong>
              {selected.vehicle.brand} {selected.vehicle.model}
            </strong>{" "}
            ({selected.vehicle.plate}).
          </p>
          <p className="muted">
            O valor final será calculado pelo tempo efetivo de uso, com mínimo
            de uma diária. Esta ação encerra a locação.
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
