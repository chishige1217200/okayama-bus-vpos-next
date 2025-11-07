export interface TripUpdate {
  id: string;
  tripUpdate: {
    trip: {
      tripId: string;
      startTime: string;
      startDate: string;
      routeId: string;
    };
    stopTimeUpdate: {
      stopSequence: number;
      arrival: { delay: number; uncertainty: number };
      departure: { delay: number; uncertainty: number };
      stopId: string;
    }[];
  };
}
