import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../services/useApi";
import type { Paginated, Vehicle } from "../types";
import { categories } from "../utils/format";
import {
  Empty,
  ErrorState,
  Loading,
  PageTitle,
  Pagination,
  VehicleCard,
} from "../components/UI";

export function Vehicles() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const query = new URLSearchParams(params);
  query.set("limit", "9");
  const { data, loading, error, reload } = useApi<Paginated<Vehicle>>(
    `/vehicles?${query}`,
  );
  function filter(key: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("page");
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }
  return (
    <>
      <PageTitle
        eyebrow="ENCONTRE SEU PRÓXIMO CAMINHO"
        title={
          user?.role === "ADMIN" ? "Gerenciar frota" : "Explore nossa frota"
        }
        description="Diferentes estilos. A mesma liberdade de ir mais longe."
        action={
          user?.role === "ADMIN" && (
            <Link className="btn primary" to="/veiculos/novo">
              <Plus size={18} />
              Cadastrar veículo
            </Link>
          )
        }
      />
      <div className="filters panel">
        <div className="search-input">
          <Search size={19} />
          <input
            aria-label="Pesquisar por marca ou modelo"
            placeholder="Buscar marca ou modelo…"
            value={params.get("search") || ""}
            onChange={(e) => filter("search", e.target.value)}
          />
        </div>
        <SlidersHorizontal size={18} className="filter-icon" />
        <select
          aria-label="Categoria"
          value={params.get("category") || ""}
          onChange={(e) => filter("category", e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {Object.entries(categories).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
        <select
          aria-label="Disponibilidade"
          value={params.get("status") || ""}
          onChange={(e) => filter("status", e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="AVAILABLE">Disponíveis</option>
          <option value="RENTED">Alugados</option>
          <option value="MAINTENANCE">Em manutenção</option>
        </select>
      </div>
      {loading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState message={error} retry={reload} />
      ) : data.data.length ? (
        <>
          <div className="results-caption">
            <span>{data.meta.total} veículos encontrados</span>
            <span>Escolha o que combina com você</span>
          </div>
          <div className="vehicle-grid">
            {data.data.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          <Pagination
            {...data.meta}
            setPage={(next) =>
              setParams((previous) => {
                const result = new URLSearchParams(previous);
                result.set("page", String(next));
                return result;
              })
            }
          />
        </>
      ) : (
        <Empty
          title="Nenhum veículo encontrado"
          description="Experimente outros filtros ou volte mais tarde."
          action={
            <button className="btn secondary" onClick={() => setParams({})}>
              Limpar filtros
            </button>
          }
        />
      )}
      {page < 1 && <p role="alert">Página inválida.</p>}
    </>
  );
}
