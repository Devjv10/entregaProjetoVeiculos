import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../services/useApi";
import { api, errorMessage } from "../services/api";
import type { Paginated, Vehicle } from "../types";
import { estimatedPrice, localDateTime, money } from "../utils/format";
import {
  Empty,
  ErrorState,
  Loading,
  PageTitle,
  Pagination,
  VehicleImage,
} from "../components/UI";

const schema = z.object({
  vehicleId: z.string().uuid("Selecione um veículo."),
  expectedReturnDate: z
    .string()
    .min(1, "Informe a previsão de devolução.")
    .refine(
      (v) =>
        Number.isFinite(new Date(v).getTime()) &&
        new Date(v).getTime() > Date.now(),
      "Escolha uma data futura.",
    ),
});
type Values = z.infer<typeof schema>;

export function NewRental() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [startedAt, setStartedAt] = useState(() => new Date());
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: params.get("vehicleId") || "",
      expectedReturnDate: localDateTime(new Date(Date.now() + 86_400_000)),
    },
  });
  const vehicleId = watch("vehicleId");
  const expected = watch("expectedReturnDate");
  const list = useApi<Paginated<Vehicle>>(
    `/vehicles?status=AVAILABLE&limit=50&page=${page}&search=${encodeURIComponent(search)}`,
  );
  const selected = useApi<{ data: Vehicle }>(
    vehicleId ? `/vehicles/${vehicleId}` : "/health",
  );
  const vehicle = vehicleId ? selected.data?.data : undefined;
  const days = Math.max(
    1,
    Math.ceil(
      (new Date(expected).getTime() - startedAt.getTime()) / 86_400_000,
    ),
  );
  async function submit(values: Values) {
    try {
      const now = new Date();
      setStartedAt(now);
      await api.post("/rentals", {
        vehicleId: values.vehicleId,
        startDate: now.toISOString(),
        expectedReturnDate: new Date(values.expectedReturnDate).toISOString(),
      });
      toast.success("Locação confirmada. Boa viagem!");
      navigate("/locacoes");
    } catch (error) {
      toast.error(errorMessage(error));
      selected.reload();
      list.reload();
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="UMA NOVA JORNADA"
        title="Vamos pegar a estrada?"
        description="Escolha seu veículo, confira o período e confirme sua locação."
      />
      <div className="rental-grid">
        <form
          className="panel rental-form"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <div className="step-heading">
            <span>01</span>
            <div>
              <h2>Escolha seu veículo</h2>
              <p className="muted small">
                Somente veículos disponíveis podem ser alugados.
              </p>
            </div>
          </div>
          <label>
            Buscar veículo
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Marca ou modelo"
            />
          </label>
          {list.loading ? (
            <Loading />
          ) : list.error ? (
            <ErrorState message={list.error} retry={list.reload} />
          ) : (
            <>
              <label>
                Veículo
                <select {...register("vehicleId")}>
                  <option value="">Selecione um veículo</option>
                  {vehicle &&
                    !list.data?.data.some((v) => v.id === vehicle.id) && (
                      <option value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} · {vehicle.plate}
                      </option>
                    )}
                  {list.data?.data.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} · {v.plate} · {money(v.dailyRate)}/dia
                    </option>
                  ))}
                </select>
                <span className="field-error">{errors.vehicleId?.message}</span>
              </label>
              {list.data && (
                <Pagination {...list.data.meta} setPage={setPage} />
              )}
            </>
          )}
          <div className="step-heading">
            <span>02</span>
            <div>
              <h2>Defina seu período</h2>
              <p className="muted small">
                A retirada acontece ao confirmar a locação.
              </p>
            </div>
          </div>
          <label>
            Início da locação
            <input
              type="datetime-local"
              value={localDateTime(startedAt)}
              readOnly
            />
            <span className="muted small">
              Horário atualizado automaticamente na confirmação.
            </span>
          </label>
          <label>
            Previsão de devolução
            <input
              type="datetime-local"
              min={localDateTime(new Date())}
              {...register("expectedReturnDate")}
            />
            <span className="field-error">
              {errors.expectedReturnDate?.message}
            </span>
          </label>
          <div className="notice">
            <CalendarDays size={20} />
            <p>
              Cada diária corresponde a 24 horas. Frações contam como uma diária
              inteira. A cobrança final considera o tempo efetivo de uso, com
              mínimo de uma diária.
            </p>
          </div>
          <button
            className="btn primary full"
            disabled={
              isSubmitting || !vehicle || vehicle.status !== "AVAILABLE"
            }
          >
            {isSubmitting ? "Confirmando…" : "Confirmar locação"}
            <ArrowRight size={18} />
          </button>
        </form>
        <aside className="panel rental-summary">
          <p className="eyebrow">RESUMO DA SUA JORNADA</p>
          {vehicleId && selected.loading ? (
            <Loading />
          ) : vehicleId && selected.error ? (
            <ErrorState message={selected.error} retry={selected.reload} />
          ) : vehicle ? (
            <>
              <VehicleImage vehicle={vehicle} />
              <h2>
                {vehicle.brand} {vehicle.model}
              </h2>
              <p className="muted small">
                {vehicle.year} · {vehicle.plate}
              </p>
              {vehicle.status !== "AVAILABLE" && (
                <p className="field-error">
                  Este veículo não está mais disponível.
                </p>
              )}
              <div className="summary-row">
                <span>Valor da diária</span>
                <strong>{money(vehicle.dailyRate)}</strong>
              </div>
              <div className="summary-row">
                <span>Quantidade de diárias</span>
                <strong>{Number.isFinite(days) ? days : "—"}</strong>
              </div>
              <div className="summary-total">
                <span>Total previsto</span>
                <strong>
                  {Number.isFinite(days)
                    ? money(estimatedPrice(vehicle.dailyRate, days))
                    : "—"}
                </strong>
              </div>
              <small className="muted">
                O total é confirmado pelo servidor no momento da retirada.
              </small>
            </>
          ) : (
            <Empty
              title="Seu veículo aparece aqui"
              description="Selecione uma opção para visualizar os valores."
              action={
                <Link className="text-link" to="/veiculos">
                  Explorar a frota
                </Link>
              }
            />
          )}
          <div className="summary-security">
            <ShieldCheck size={19} />
            Diária preservada até a devolução
          </div>
        </aside>
      </div>
    </>
  );
}
