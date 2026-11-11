import { Link } from "react-router-dom";
import type { Rental } from "../types";
import { dateTime, money } from "../utils/format";
import { Empty, Status } from "./UI";

interface RentalListProps {
  rentals: Rental[];
  admin?: boolean;
  onReturn?: (rental: Rental) => void;
}

export function RentalList({ rentals, admin = false, onReturn }: RentalListProps) {
  if (!rentals.length) {
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
  }

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
          {rentals.map(({ id, vehicle, user, startDate, expectedReturnDate, actualReturnDate, status, estimatedTotal, finalTotal }) => (
            <tr key={id}>
              <td>
                <Link className="table-title" to={`/veiculos/${vehicle.id}`}>
                  {vehicle.brand} {vehicle.model}
                </Link>
                <small>{admin ? user.name : vehicle.plate}</small>
              </td>
              <td>
                {dateTime(startDate)}
                <small>Até {dateTime(expectedReturnDate)}</small>
                {actualReturnDate && <small>Devolvido: {dateTime(actualReturnDate)}</small>}
              </td>
              <td>
                <strong>{money(finalTotal ?? estimatedTotal)}</strong>
                <small>{status === "ACTIVE" ? "Total previsto" : "Valor final"}</small>
              </td>
              <td>
                <Status status={status} />
              </td>
              {onReturn && (
                <td>
                  {status === "ACTIVE" ? (
                    <button className="btn secondary compact" onClick={() => onReturn({ id, vehicle, user, startDate, expectedReturnDate, actualReturnDate, status, estimatedTotal, finalTotal })}>
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
