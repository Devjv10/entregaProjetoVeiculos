export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENTE";
};
export type Category =
  "ECONOMY" | "SEDAN" | "SUV" | "HATCH" | "PICKUP" | "LUXURY";
export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  category: Category;
  dailyRate: string;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
  imageUrl: string | null;
};
export type Rental = {
  id: string;
  vehicle: Vehicle;
  user: Pick<User, "id" | "name" | "email">;
  startDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  contractedDailyRate: string;
  estimatedTotal: string;
  finalTotal: string | null;
  status: "ACTIVE" | "COMPLETED";
};
export type Paginated<T> = {
  data: T[];
  meta: { page: number; pages: number; total: number; limit: number };
};
export type Stats = {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  activeRentals: number;
  completedRentals: number;
  recentRentals: Rental[];
  availableVehiclesList: Vehicle[];
};
