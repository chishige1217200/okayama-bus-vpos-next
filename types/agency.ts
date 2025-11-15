export enum Agency {
  OKAKIDO = "1", // 岡山電気軌道
  OKADEN = "2", // 岡電バス
  RYOBI = "3", // 両備バス
  CHUTETSU = "4", // 中鉄バス
  HAKKOU = "5", // 八晃運輸
}

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
  vehicleCd: string
): string => {
  return `https://loc.bus-vision.jp/ryobi/view/vehicleState.html?vehicleCorpCd=${agency}&vehicleCd=${vehicleCd}&lang=0`;
};
