import {
  ArrowRight,
  CarFront,
  CircleCheck,
  Clock3,
  KeyRound,
  Plus,
  Route,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../services/useApi";
import type { Stats } from "../types";
import {
  Empty,
  ErrorState,
  Loading,
  PageTitle,
  VehicleCard,
} from "../components/UI";
import { RentalList } from "../components/RentalList";

export function Dashboard() {
  const { user } = useAuth();
  const admin = user?.role === "ADMIN";
  const { data, loading, error, reload } = useApi<{ data: Stats }>(
    "/dashboard/stats",
  );
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error} retry={reload} />;
  const stats = data.data;
  const cards = [
    {
      label: "Veículos na frota",
      value: stats.totalVehicles,
      icon: CarFront,
      color: "blue",
      note: "Frota total da locadora",
    },
    {
      label: "Disponíveis",
      value: stats.availableVehicles,
      icon: CircleCheck,
      color: "green",
      note: "Prontos para a próxima viagem",
    },
    {
      label: admin ? "Veículos alugados" : "Alugados por você",
      value: stats.rentedVehicles,
      icon: KeyRound,
      color: "purple",
      note: admin ? "Em uso neste momento" : "Seus veículos em uso",
    },
    {
      label: admin ? "Locações ativas" : "Suas locações ativas",
      value: stats.activeRentals,
      icon: Clock3,
      color: "orange",
      note: "Devoluções pendentes",
    },
    {
      label: admin ? "Concluídas" : "Suas concluídas",
      value: stats.completedRentals,
      icon: Route,
      color: "slate",
      note: "Jornadas finalizadas",
    },
  ];
  return (
    <>
      <PageTitle
        eyebrow="SEU PAINEL DE CONTROLE"
        title={`Olá, ${user?.name.split(" ")[0]}.`}
        description={
          admin
            ? "Uma visão completa da sua operação, em tempo real."
            : "Tudo pronto para o seu próximo caminho."
        }
        action={
          <Link
            className="btn primary"
            to={admin ? "/veiculos/novo" : "/nova-locacao"}
          >
            <Plus size={18} />
            {admin ? "Cadastrar veículo" : "Nova locação"}
          </Link>
        }
      />
      <section className="welcome-banner">
        <div>
          <span className="banner-tag">
            {admin ? "GESTÃO QUE ACOMPANHA VOCÊ" : "LIBERDADE PARA ESCOLHER"}
          </span>
          <h2>
            {admin
              ? "Sua frota em movimento."
              : "Qual vai ser o seu próximo destino?"}
          </h2>
          <p>
            {admin
              ? "Acompanhe cada veículo. Simplifique cada jornada."
              : "Encontre o carro certo para cada momento da sua vida."}
          </p>
          <Link to="/veiculos">
            {admin ? "Gerenciar minha frota" : "Explorar veículos"}{" "}
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="banner-art" aria-hidden="true">
          <CarFront size={136} strokeWidth={0.8} />
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
        </div>
      </section>
      <section className="stats-grid" aria-label="Indicadores">
        {cards.map((card) => (
          <article className="stat-card" key={card.label}>
            <div className="stat-top">
              <span>{card.label}</span>
              <span className={`stat-icon ${card.color}`}>
                <card.icon size={20} />
              </span>
            </div>
            <strong>{card.value.toString().padStart(2, "0")}</strong>
            <small>{card.note}</small>
          </article>
        ))}
      </section>
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Locações recentes</h2>
            <p className="muted small">
              {admin
                ? "As últimas movimentações da locadora."
                : "Acompanhe suas últimas jornadas."}
            </p>
          </div>
          <Link className="text-link" to="/locacoes">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>
        <RentalList rentals={stats.recentRentals} admin={admin} />
      </section>
      <section className="available-section">
        <div className="section-heading">
          <div>
            <h2>Prontos para partir</h2>
            <p className="muted small">
              Veículos disponíveis para sua próxima viagem.
            </p>
          </div>
          <Link className="text-link" to="/veiculos?status=AVAILABLE">
            Explorar frota <ArrowRight size={16} />
          </Link>
        </div>
        {stats.availableVehiclesList.length ? (
          <div className="vehicle-grid">
            {stats.availableVehiclesList.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="panel">
            <Empty
              title="Nenhum veículo disponível"
              description="Novos veículos aparecerão aqui assim que estiverem disponíveis."
            />
          </div>
        )}
      </section>
    </>
  );
}
