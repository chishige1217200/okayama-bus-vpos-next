export interface VposUpdate {
  id: string;
  vehicle: {
    trip: {
      tripId: string;
      startTime: string;
      startDate: string;
      routeId: string;
    };
    position: {
      latitude: number;
      longitude: number;
      speed: number;
    };
    currentStopSequence: number;
    timestamp: string;
    stopId: string;
    vehicle: { id: string; label: string };
  };
}
