import { Link } from "react-router-dom";
import type { Rental } from "../types";
import { dateTime, money } from "../utils/format";
import { Empty, Status } from "./UI";

export function RentalList({
  rentals,
  admin = false,
  onReturn,
}: {
  rentals: Rental[];
  admin?: boolean;
  onReturn?: (rental: Rental) => void;
}) {
  if (!rentals.length)
    return (
      <Empty
        title="Nenhuma locação por aqui"
        description={
          admin
            ? "As locações dos clientes aparecerão aqui."
            : "Seu próximo destino pode começar agora. Explore os veículos disponíveis."
        }
        action={
          !admin && (
            <Link className="btn secondary" to="/veiculos">
              Explorar veículos
            </Link>
          )
        }
      />
    );
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Veículo{admin ? " / cliente" : ""}</th>
            <th>Retirada / previsão</th>
            <th>Valor</th>
            <th>Status</th>
            {onReturn && <th>Ação</th>}
          </tr>
        </thead>
        <tbody>
          {rentals.map((rental) => (
            <tr key={rental.id}>
              <td>
                <Link
                  className="table-title"
                  to={`/veiculos/${rental.vehicle.id}`}
                >
                  {rental.vehicle.brand} {rental.vehicle.model}
                </Link>
                <small>{admin ? rental.user.name : rental.vehicle.plate}</small>
              </td>
              <td>
                {dateTime(rental.startDate)}
                <small>Até {dateTime(rental.expectedReturnDate)}</small>
                {rental.actualReturnDate && (
                  <small>Devolvido: {dateTime(rental.actualReturnDate)}</small>
                )}
              </td>
              <td>
                <strong>
                  {money(rental.finalTotal ?? rental.estimatedTotal)}
                </strong>
                <small>
                  {rental.status === "ACTIVE"
                    ? "Total previsto"
                    : "Valor final"}
                </small>
              </td>
              <td>
                <Status status={rental.status} />
              </td>
              {onReturn && (
                <td>
                  {rental.status === "ACTIVE" ? (
                    <button
                      className="btn secondary compact"
                      onClick={() => onReturn(rental)}
                    >
                      Devolver
                    </button>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
