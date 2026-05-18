export enum Agency {
  OKAKIDO = "1", // 岡山電気軌道
  OKADEN = "2", // 岡電バス
  RYOBI = "3", // 両備バス
  CHUTETSU = "4", // 中鉄バス
  HAKKOU = "5", // 八晃運輸
}

export const availableAgencies = [Agency.OKADEN, Agency.RYOBI, Agency.HAKKOU];

export const getAgencyName = (agency: Agency): string => {
  switch (agency) {
    case Agency.OKAKIDO:
      return "岡山電気軌道";
    case Agency.OKADEN:
      return "岡電バス";
    case Agency.RYOBI:
      return "両備バス";
    case Agency.CHUTETSU:
      return "中鉄バス";
    case Agency.HAKKOU:
      return "八晃運輸";
  }
};

export const getTripUpdateUrl = (agency: Agency): string => {
  switch (agency) {
    case Agency.OKADEN:
      return "https://loc.bus-vision.jp/realtime/okaden_trip_update.bin";
    case Agency.RYOBI:
      return "https://loc.bus-vision.jp/realtime/ryobi_trip_update.bin";
    case Agency.HAKKOU:
      return "https://loc.bus-vision.jp/realtime/hakkou_trip_update_v2.bin";
    default:
      return "";
  }
};

export const getVehiclePositionUrl = (agency: Agency): string => {
  switch (agency) {
    case Agency.OKADEN:
      return "https://loc.bus-vision.jp/realtime/okaden_vpos_update.bin";
    case Agency.RYOBI:
      return "https://loc.bus-vision.jp/realtime/ryobi_vpos_update.bin";
    case Agency.HAKKOU:
      return "https://loc.bus-vision.jp/realtime/hakkou_vpos_update_v2.bin";
    default:
      return "";
  }
};

export const getVehicleStateUrl = (
  agency: Agency,
  vehicleCd: string,
): string => {
  return `https://loc.bus-vision.jp/ryobi/view/vehicleState.html?vehicleCorpCd=${agency}&vehicleCd=${vehicleCd}&lang=0`;
};

export const getVehicleTrackingParam = (
  agency: Agency,
  vehicleCd: string,
): string => {
  return `?tracking_vehicle=${agency}_${vehicleCd}`;
};
