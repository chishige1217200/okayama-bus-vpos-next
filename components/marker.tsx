import { Agency, getVehicleStateUrl } from "@/types/agency";
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
  setActiveMarkerId: React.Dispatch<React.SetStateAction<string | null>>;
};

// 事業者毎に運行情報の取得を行う
const MarkerGroup = (props: MarkerGroupProps) => {
  const fetchTripUpdate = async (agency: Agency) => {
    const response = await fetch(`/api/get_trip_update/?agency=${agency}`);
    const data = await response.json();
    setTripUpdateList(data);
  };

  const fetchVposUpdate = async (agency: Agency) => {
    const response = await fetch(`/api/get_vehicle_position/?agency=${agency}`);
    const data = await response.json();
    setVposUpdateList(data);
  };

  const fetchRoutes = async (agency: Agency) => {
    const response = await fetch(`api/get_routes/?agency=${agency}`);
    const data = await response.json();
    setRoutesList(data);
  };

  const fetchRoutesJp = async (agency: Agency) => {
    const response = await fetch(`api/get_routes_jp/?agency=${agency}`);
    const data = await response.json();
    setRoutesJpList(data);
  };

  const fetchStops = async (agency: Agency) => {
    const response = await fetch(`api/get_stops/?agency=${agency}`);
    const data = await response.json();
    setStopsList(data);
  };

  const fetchIcon = async (agency: Agency) => {
    const response = await fetch(`/api/get_icon/?agency=${agency}`);
    const data = await response.json();
    setIconList(data);
  };

  // 運行情報の状態管理
  const [tripUpdateList, setTripUpdateList] = useState<TripUpdate[] | null>(
    null
  );
  const [vposUpdateList, setVposUpdateList] = useState<VposUpdate[] | null>(
    null
  );
  const [routesList, setRoutesList] = useState<Routes[] | null>(null);
  const [routesJpList, setRoutesJpList] = useState<RoutesJp[] | null>(null);
  const [stopsList, setStopsList] = useState<Stops[] | null>(null);
  const [iconList, setIconList] = useState<Icon[] | null>(null);

  useEffect(() => {
    fetchTripUpdate(props.agency);
    fetchVposUpdate(props.agency);
    fetchRoutes(props.agency);
    fetchRoutesJp(props.agency);
    fetchStops(props.agency);
    fetchIcon(props.agency);
  }, [props.agency]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTripUpdate(props.agency);
      fetchVposUpdate(props.agency);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {vposUpdateList
        ? vposUpdateList.map((vpos, index) => (
            <React.Fragment key={vpos.vehicle.vehicle.id}>
              <Marker
                agency={props.agency}
                key={vpos.vehicle.vehicle.id}
                trip={
                  tripUpdateList && vpos
                    ? tripUpdateList.find(
                        (trip) =>
                          trip.tripUpdate.vehicle.id === vpos.vehicle.vehicle.id
                      ) ?? null
                    : null
                }
                vpos={vpos}
                routes={routesList}
                routesJp={routesJpList}
                stops={stopsList}
                icon={iconList}
                zIndex={Number(props.agency) * 100 + index}
                activeMarkerId={props.activeMarkerId}
                setActiveMarkerId={props.setActiveMarkerId}
              />
            </React.Fragment>
          ))
        : null}
    </>
  );
};

type MarkerProps = {
  agency: Agency;
  trip: TripUpdate | null;
  vpos: VposUpdate | null;
  routes: Routes[] | null;
  routesJp: RoutesJp[] | null;
  stops: Stops[] | null;
  icon: Icon[] | null;
  zIndex: number;
  activeMarkerId: string | null;
  setActiveMarkerId: React.Dispatch<React.SetStateAction<string | null>>;
};

// 共通のマーカーコンポーネント
const Marker = (props: MarkerProps) => {
  const getPosition = (): google.maps.LatLngLiteral => {
    if (props.vpos) {
      return {
        lat: props.vpos.vehicle.position.latitude,
        lng: props.vpos.vehicle.position.longitude,
      };
    }
    return { lat: 0, lng: 0 };
  };

  const getRouteShortName = (): string => {
    if (props.routes && props.vpos) {
      const routes = props.routes.find(
        (r) => r.route_id === props.vpos?.vehicle.trip.routeId
      );
      return routes?.route_short_name ?? "";
    }
    return "";
  };

  const getDestinationStopName = (): string => {
    if (props.routesJp && props.vpos) {
      const routesJp = props.routesJp.find(
        (r) => r.route_id === props.vpos?.vehicle.trip.routeId
      );

      const destinationStopName = routesJp?.destination_stop ?? "";
      return getRouteShortName().includes("特急")
        ? `特急 ${destinationStopName}`
        : destinationStopName;
    }
    return "";
  };

  const getNextStopName = (): string => {
    if (props.stops && props.trip && props.vpos) {
      // 現在のstopSequenceのインデックスを取得
      const stopSequence =
        props.trip.tripUpdate.stopTimeUpdate.find(
          (s) => s.stopSequence === props.vpos?.vehicle.currentStopSequence
        )?.stopSequence ?? null;

      if (
        stopSequence != null &&
        stopSequence < props.trip.tripUpdate.stopTimeUpdate.length
      ) {
        // TODO: stopSequenceの値が配列の長さをはみ出さない考慮が必要
        const nextStopId =
          props.trip?.tripUpdate.stopTimeUpdate[stopSequence].stopId;
        if (nextStopId) {
          return (
            props.stops.find((s) => s.stop_id === nextStopId)?.stop_name ?? ""
          );
        }
      }
    }
    return "";
  };

  const getLabel = (): string => {
    if (props.vpos) {
      return props.vpos.vehicle.vehicle.label;
    }
    return "";
  };

  const getDelay = (): string => {
    let delay = null;
    if (props.trip && props.vpos) {
      // 現在のstopSequenceのインデックスを取得
      const currentIndex = props.trip.tripUpdate.stopTimeUpdate.findIndex(
        (stop) => stop.stopSequence === props.vpos?.vehicle.currentStopSequence
      );

      // 現在のインデックスが存在する場合は、現在の遅れ時分を返す
      if (
        currentIndex !== -1 &&
        currentIndex < props.trip.tripUpdate.stopTimeUpdate.length
      ) {
        delay =
          Math.floor(
            props.trip.tripUpdate.stopTimeUpdate[currentIndex].arrival.delay /
              60
          ) ?? null; // 正常に遅れ時分が取得できない場合はnull
      } else {
        // インデックスが取得できない場合は、始発時点の遅れ時分を返す
        delay =
          Math.floor(
            props.trip.tripUpdate.stopTimeUpdate[0].arrival.delay / 60
          ) ?? null; // 正常に遅れ時分が取得できない場合はnull
      }
    }

    if (delay == null) {
      return "遅れ情報が取得できません";
    }

    if (delay === 0) {
      return "ほぼ定刻";
    }

    return `約${delay}分遅れ`;
  };

  const getOccupancyStatus = (): string => {
    if (props.vpos) {
      switch (props.vpos.vehicle.occupancyStatus) {
        case "EMPTY":
          return "乗車率0%";
        case "MANY_SEATS_AVAILABLE":
          return "乗車率50%未満";
        case "STANDING_ROOM_ONLY":
          return "乗車率50%~80%";
        case "FULL":
          return "乗車率80%以上";
        default:
          return "乗車率取得不可";
      }
    }
    return "";
  };

  const getIcon = (): string => {
    if (props.icon && props.vpos) {
      const icon = props.icon.find(
        (icon) => icon.label === props.vpos?.vehicle.vehicle.label
      );
      return icon?.url ?? "/unknown.png";
    }
    return "/unknown.png";
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
          {getDestinationStopName()}
        </div>
      </OverlayView>
      <MarkerF
        position={getPosition()}
        zIndex={props.zIndex}
        title={getRouteShortName()}
        icon={
          getIcon()
            ? {
                url: getIcon(),
                scaledSize: new window.google.maps.Size(60, 60),
              }
            : undefined
        }
        onClick={() =>
          props.setActiveMarkerId(props.vpos?.vehicle.vehicle.id ?? null)
        } // マーカークリックでInfoWindowFを開く
      />
      {props.activeMarkerId === props.vpos?.vehicle.vehicle.id && (
        <InfoWindowF
          position={getPosition()} // マーカー座標を指定
          options={{
            pixelOffset: new window.google.maps.Size(0, -100), // マーカーとの相対位置を指定
          }}
          onCloseClick={() => props.setActiveMarkerId(null)} // 閉じるときにリセット
        >
          <div className="text-black">
            <div className="font-medium text-center">{getRouteShortName()}</div>
            <div className="text-center">
              <p>{getLabel()}号車</p>
              <p className="font-medium">次は {getNextStopName()}</p>
              <p>{getDelay()}</p>
              <p>{getOccupancyStatus()}</p>
              <p>
                {props.vpos ? (
                  <a
                    className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                    href={getVehicleStateUrl(
                      props.agency,
                      props.vpos.vehicle.vehicle.id
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    詳しい運行状況
                  </a>
                ) : (
                  <></>
                )}
              </p>
            </div>
          </div>
        </InfoWindowF>
      )}
    </>
  );
};

export default MarkerGroup;
