import { Trip } from "./trip";
import { Vehicle } from "./vehicle";

export interface VposUpdate {
  id: string;
  vehicle: {
    trip: Trip;
    position: {
      latitude: number;
      longitude: number;
      speed: number;
    };
    currentStopSequence: number;
    timestamp: string;
    stopId: string;
    vehicle: Vehicle;
    occupancyStatus: string;
  };
}
