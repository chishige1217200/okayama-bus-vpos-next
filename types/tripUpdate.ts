import { Trip } from "./trip";
import { Vehicle } from "./vehicle";

export interface TripUpdate {
  id: string;
  tripUpdate: {
    trip: Trip;
    stopTimeUpdate: {
      stopSequence: number;
      arrival: { delay: number; uncertainty: number };
      departure: { delay: number; uncertainty: number };
      stopId: string;
    }[];
    vehicle: Vehicle;
    timestamp: string;
  };
}
