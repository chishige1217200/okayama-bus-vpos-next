import { Agency } from "@/types/agency";
import { Routes, RoutesJp, Stops } from "@/types/gtfsFeed";
import { Icon } from "@/types/icon";
import { TripUpdate } from "@/types/tripUpdate";
import { VposUpdate } from "@/types/vposUpdate";
import { InfoWindowF, MarkerF, OverlayView } from "@react-google-maps/api";
import React from "react";
import { useEffect, useState } from "react";

type MarkerGroupProps = {
  agency: Agency;
  activeMarkerId: string | null;
};

// 事業者毎に運行情報の取得を行う
const MarkerGroup = (props: MarkerGroupProps) => {
  const fetchTripUpdate = async (agency: Agency) => {
    const response = await fetch(`/api/get_trip_update/?agency=${agency}`);
    const data = await response.json();
    setTripUpdate(data);
  };

  const fetchVposUpdate = async (agency: Agency) => {
    const response = await fetch(`/api/get_vehicle_position/?agency=${agency}`);
    const data = await response.json();
    setVposUpdate(data);
  };

  const fetchRoutes = async (agency: Agency) => {
    const response = await fetch(`api/get_routes/?agency=${agency}`);
    const data = await response.json();
    setRoutes(data);
  };

  const fetchRoutesJp = async (agency: Agency) => {
    const response = await fetch(`api/get_routes_jp/?agency=${agency}`);
    const data = await response.json();
    setRoutesJp(data);
  };

  const fetchStops = async (agency: Agency) => {
    const response = await fetch(`api/get_stops/?agency=${agency}`);
    const data = await response.json();
    setStops(data);
  };

  const fetchIcon = async (agency: Agency) => {
    const response = await fetch(`/api/get_icon/?agency=${agency}`);
    const data = await response.json();
    setIcon(data);
  };

  // 運行情報の状態管理
  const [tripUpdate, setTripUpdate] = useState<TripUpdate[] | null>(null);
  const [vposUpdate, setVposUpdate] = useState<VposUpdate[] | null>(null);
  const [routes, setRoutes] = useState<Routes[] | null>(null);
  const [routesJp, setRoutesJp] = useState<RoutesJp[] | null>(null);
  const [stops, setStops] = useState<Stops[] | null>(null);
  const [icon, setIcon] = useState<Icon[] | null>(null);

  useEffect(() => {
    fetchTripUpdate(props.agency);
    fetchVposUpdate(props.agency);
    fetchRoutes(props.agency);
    fetchRoutesJp(props.agency);
    fetchStops(props.agency);
    fetchIcon(props.agency);
  }, [props.agency]);

  return (
    <>
      {vposUpdate
        ? vposUpdate.map((vpos, index) => (
            <React.Fragment key={vpos.vehicle.vehicle.id}>
              <Marker
                key={vpos.vehicle.vehicle.id}
                trip={
                  tripUpdate && vpos
                    ? tripUpdate.filter(
                        (trip) =>
                          trip.tripUpdate.vehicle.id === vpos.vehicle.vehicle.id
                      )[0]
                    : null
                }
                vpos={vpos}
                icon={
                  icon && vpos
                    ? icon?.filter(
                        (i) => i.label === vpos.vehicle.vehicle.label
                      )[0]
                    : null
                }
                zIndex={Number(props.agency) * 100 + index}
              />
            </React.Fragment>
          ))
        : null}
    </>
  );
};

type MarkerProps = {
  trip: TripUpdate | null;
  vpos: VposUpdate | null;
  icon: Icon | null;
  zIndex: number;
};

// 共通のマーカーコンポーネント
const Marker = (props: MarkerProps) => {
  const getPosition = (): google.maps.LatLngLiteral => {
    if (props.vpos && props.vpos.vehicle && props.vpos.vehicle.position) {
      return {
        lat: props.vpos.vehicle.position.latitude,
        lng: props.vpos.vehicle.position.longitude,
      };
    }
    return { lat: 0, lng: 0 };
  };

  const getTitle = (): string => {
    if (props.trip) {
      return "dummy";
    }
    return "";
  };

  const getIcon = (): string => {
    if (props.icon) {
      return props.icon.url;
    }
    return "/unknown.png";
  };

  const getDestinationStopName = (): string => {
    if (props.trip) {
      return "dummy";
    }
    return "";
  };

  return (
    <>
      <OverlayView
        position={getPosition()}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div
          style={{
            backgroundColor: "#3e3a39", // 背景色
            color: "white", // 文字色
            padding: "5px 10px", // テキスト周囲に余白を確保
            borderRadius: "5px", // 枠を角丸にする
            textAlign: "center", // テキストを中央揃え
            whiteSpace: "nowrap", // テキストを1行で表示
            fontSize: "14px", // 適切なフォントサイズ
            lineHeight: "1.5", // 行の高さを調整して中央揃えを自然にする
            transform: "translate(-50%, -300%)", // 中央揃えでマーカー上部に表示
            display: "inline-block", // ブロック幅の調整
            zIndex: props.zIndex, // アイコンと同レベルに表示
          }}
        >
          {/* {marker.title.includes("特急")
            ? `特急 ${marker.destinationStopName}`
            : marker.destinationStopName} */}
          {getDestinationStopName()}
        </div>
      </OverlayView>
      <MarkerF
        position={getPosition()}
        zIndex={props.zIndex}
        title={getTitle()}
        icon={
          getIcon()
            ? {
                url: getIcon(),
                scaledSize: new window.google.maps.Size(60, 60),
              }
            : undefined
        }
        // onClick={() => setActiveMarkerId(marker.id)} // マーカークリックでInfoWindowFを開く
      />
      {/* {activeMarkerId === marker.id && (
        <InfoWindowF
          position={marker.position} // マーカー座標を指定
          options={{
            pixelOffset: new window.google.maps.Size(0, -100), // マーカーとの相対位置を指定
          }}
          onCloseClick={() => setActiveMarkerId(null)} // 閉じるときにリセット
        >
          <div>
            <h4 style={{ textAlign: "center" }}>{marker.title}</h4>
            <p style={{ textAlign: "center" }}>
              {marker.label}号車
              <br />
              <b>次は {marker.nextStopName}</b>
              <br />
              {marker.delay !== undefined && marker.delay !== null
                ? marker.delay > 0
                  ? "約" + marker.delay + "分遅れ"
                  : "ほぼ定刻"
                : "遅れ情報が取得できません"}
              <br />
              {marker.occupancyStatus}
              <br />
              <a
                href={
                  "https://loc.bus-vision.jp/ryobi/view/vehicleState.html?vehicleCorpCd=3&vehicleCd=" +
                  marker.id +
                  "&lang=0"
                } // 両備バス以外はvehicleCorpCdが違う
                target="_blank"
                rel="noopener noreferrer"
              >
                詳しい運行状況
              </a>
            </p>
          </div>
        </InfoWindowF>
      )} */}
    </>
  );
};

export default MarkerGroup;
