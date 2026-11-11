import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../services/api";
import { useApi } from "../services/useApi";
import { categories } from "../utils/format";
import type { Vehicle } from "../types";
import { ErrorState, Loading, PageTitle } from "../components/UI";

const schema = z.object({
  brand: z.string().trim().min(2, "Informe a marca.").max(60),
  model: z.string().trim().min(1, "Informe o modelo.").max(80),
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  plate: z
    .string()
    .regex(
      /^[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}$/,
      "Use ABC1234 ou ABC1D23.",
    ),
  color: z.string().trim().min(2).max(40),
  category: z.enum(["ECONOMY", "SEDAN", "SUV", "HATCH", "PICKUP", "LUXURY"]),
  dailyRate: z
    .string()
    .regex(/^\d{1,6}(\.\d{1,2})?$/, "Use um valor como 149.90.")
    .refine((v) => Number(v) > 0, "A diária deve ser positiva."),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "RENTED"]),
  imageUrl: z.union([
    z.literal(""),
    z
      .string()
      .url()
      .max(2048)
      .regex(/^https?:\/\//, "Use HTTP ou HTTPS."),
  ]),
});
type Values = z.infer<typeof schema>;

export function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useApi<{ data: Vehicle }>(id ? `/vehicles/${id}` : "/health");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: new Date().getFullYear(),
      category: "ECONOMY",
      status: "AVAILABLE",
      imageUrl: "",
    },
  });
  useEffect(() => {
    if (id && query.data)
      reset({ ...query.data.data, imageUrl: query.data.data.imageUrl || "" });
  }, [id, query.data, reset]);
  if (id && query.loading) return <Loading />;
  if (id && (query.error || !query.data))
    return <ErrorState message={query.error} retry={query.reload} />;
  async function submit(values: Values) {
    try {
      const payload = {
        ...values,
        imageUrl: values.imageUrl || null,
        status: values.status === "RENTED" ? undefined : values.status,
      };
      const response = id
        ? await api.put(`/vehicles/${id}`, payload)
        : await api.post("/vehicles", payload);
      toast.success(id ? "Veículo atualizado." : "Veículo cadastrado.");
      navigate(`/veiculos/${response.data.data.id}`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }
  return (
    <>
      <Link className="back-link" to="/veiculos">
        <ArrowLeft size={17} />
        Voltar para a frota
      </Link>
      <PageTitle
        eyebrow="GESTÃO DE FROTA"
        title={id ? "Editar veículo" : "Novo veículo"}
        description="Mantenha cada detalhe da sua frota em dia."
      />
      <form
        className="panel vehicle-form"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        <h2>Informações do veículo</h2>
        <p className="muted small">
          Todos os campos são obrigatórios, exceto a imagem.
        </p>
        <div className="form-grid">
          <label>
            Marca
            <input placeholder="Ex.: Toyota" {...register("brand")} />
            <span className="field-error">{errors.brand?.message}</span>
          </label>
          <label>
            Modelo
            <input placeholder="Ex.: Corolla" {...register("model")} />
            <span className="field-error">{errors.model?.message}</span>
          </label>
          <label>
            Ano
            <input
              type="number"
              {...register("year", { valueAsNumber: true })}
            />
            <span className="field-error">{errors.year?.message}</span>
          </label>
          <label>
            Placa
            <input placeholder="ABC1D23" {...register("plate")} />
            <span className="field-error">{errors.plate?.message}</span>
          </label>
          <label>
            Cor
            <input placeholder="Ex.: Prata" {...register("color")} />
            <span className="field-error">{errors.color?.message}</span>
          </label>
          <label>
            Categoria
            <select {...register("category")}>
              {Object.entries(categories).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
            <span className="field-error">{errors.category?.message}</span>
          </label>
          <label>
            Diária (R$)
            <input
              inputMode="decimal"
              placeholder="149.90"
              {...register("dailyRate")}
            />
            <span className="field-error">{errors.dailyRate?.message}</span>
          </label>
          <label>
            Status
            <select
              {...register("status")}
              disabled={query.data?.data.status === "RENTED"}
            >
              <option value="AVAILABLE">Disponível</option>
              <option value="MAINTENANCE">Em manutenção</option>
              {query.data?.data.status === "RENTED" && (
                <option value="RENTED">Alugado — aguarda devolução</option>
              )}
            </select>
            <span className="field-error">{errors.status?.message}</span>
          </label>
          <label className="span-two">
            URL da imagem (opcional)
            <input
              type="url"
              placeholder="https://…"
              {...register("imageUrl")}
            />
            <span className="field-error">{errors.imageUrl?.message}</span>
          </label>
        </div>
        <div className="form-actions">
          <Link className="btn secondary" to="/veiculos">
            Cancelar
          </Link>
          <button className="btn primary" disabled={isSubmitting}>
            <Save size={17} />
            {isSubmitting ? "Salvando…" : "Salvar veículo"}
          </button>
        </div>
      </form>
    </>
  );
}
