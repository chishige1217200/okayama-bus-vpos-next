import { useFetchController } from "@/context/FetchContext";
import { useTracking } from "@/context/TrackingContext";
import { Agency, getVehicleStateUrl } from "@/types/agency";
import { Routes, RoutesJp, Stops } from "@/types/gtfsFeed";
import { Icon } from "@/types/icon";
import { TripUpdate } from "@/types/tripUpdate";
import { VposUpdate } from "@/types/vposUpdate";
import {
  Badge,
  HStack,
  Link,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { InfoWindowF, MarkerF, OverlayView } from "@react-google-maps/api";
import React, { JSX, useCallback } from "react";
import { useEffect, useState } from "react";
import { LuExternalLink } from "react-icons/lu";

type MarkerGroupProps = {
  agency: Agency;
};

// 事業者毎に運行情報の取得を行う
const MarkerGroup = (props: MarkerGroupProps) => {
  const fetchTripUpdate = async (agency: Agency) => {
    const response = await fetch(`/api/get_trip_update/?agency=${agency}`);

    if (response.ok) {
      const data = await response.json();
      setTripUpdateList(data);
    }
    // 通信エラー発生時は前の状態を維持する
  };

  const fetchVposUpdate = async (agency: Agency) => {
    const response = await fetch(`/api/get_vehicle_position/?agency=${agency}`);

    if (response.ok) {
      const data = await response.json();
      setVposUpdateList(data);
    }
    // 通信エラー発生時は前の状態を維持する
  };

  const fetchRoutes = async (agency: Agency) => {
    const response = await fetch(`/api/get_routes/?agency=${agency}`);
    if (response.ok) {
      const data = await response.json();
      setRoutesList(data);
    } else {
      setRoutesList([]);
    }
  };

  const fetchRoutesJp = async (agency: Agency) => {
    const response = await fetch(`/api/get_routes_jp/?agency=${agency}`);
    if (response.ok) {
      const data = await response.json();
      setRoutesJpList(data);
    } else {
      setRoutesJpList([]);
    }
  };

  const fetchStops = async (agency: Agency) => {
    const response = await fetch(`/api/get_stops/?agency=${agency}`);
    if (response.ok) {
      const data = await response.json();
      setStopsList(data);
    } else {
      setStopsList([]);
    }
  };

  const fetchIcon = async (agency: Agency) => {
    const response = await fetch(`/api/get_icon/?agency=${agency}`);
    if (response.ok) {
      const data = await response.json();
      setIconList(data);
    } else {
      setIconList([]);
    }
  };

  const fetchStaticData = useCallback(async (agency: Agency) => {
    await Promise.all([
      fetchRoutes(agency),
      fetchRoutesJp(agency),
      fetchStops(agency),
      fetchIcon(agency),
    ]);
  }, []);

  const fetchRealtimeData = useCallback(async (agency: Agency) => {
    await Promise.all([fetchTripUpdate(agency), fetchVposUpdate(agency)]);
  }, []);

  // FetchContextから必要な関数と状態を取得
  const { trigger, start, finish } = useFetchController();

  // 運行情報の状態管理
  const [tripUpdateList, setTripUpdateList] = useState<TripUpdate[] | null>(
    null,
  );
  const [vposUpdateList, setVposUpdateList] = useState<VposUpdate[] | null>(
    null,
  );
  const [routesList, setRoutesList] = useState<Routes[] | null>(null);
  const [routesJpList, setRoutesJpList] = useState<RoutesJp[] | null>(null);
  const [stopsList, setStopsList] = useState<Stops[] | null>(null);
  const [iconList, setIconList] = useState<Icon[] | null>(null);

  // 初回フェッチ（事業者変更時もフェッチするが、基本発生しない）
  useEffect(() => {
    if (!props.agency) return;

    fetchStaticData(props.agency);
    fetchRealtimeData(props.agency);
  }, [props.agency, fetchStaticData, fetchRealtimeData]);

  // 20秒ごとに運行情報を更新する
  useEffect(() => {
    if (!props.agency) return;

    const interval = setInterval(async () => {
      start();
      try {
        await fetchRealtimeData(props.agency);
      } finally {
        finish();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [props.agency, start, finish, fetchRealtimeData]);

  // triggerが更新されたときに運行情報を再取得する
  useEffect(() => {
    if (trigger === 0 || !props.agency) return;

    const run = async () => {
      start();
      try {
        await fetchRealtimeData(props.agency);
      } finally {
        finish();
      }
    };

    run();
  }, [trigger, props.agency, start, finish, fetchRealtimeData]);

  return (
    <>
      {vposUpdateList
        ? vposUpdateList.map((vpos, index) => (
            <React.Fragment key={`${props.agency}_${vpos.vehicle.vehicle.id}`}>
              <Marker
                agency={props.agency}
                key={vpos.vehicle.vehicle.id}
                trip={
                  tripUpdateList && vpos
                    ? (tripUpdateList.find(
                        (trip) =>
                          trip.tripUpdate.vehicle.id ===
                          vpos.vehicle.vehicle.id,
                      ) ?? null)
                    : null
                }
                vpos={vpos}
                routes={routesList}
                routesJp={routesJpList}
                stops={stopsList}
                icon={iconList}
                zIndex={Number(props.agency) * 100 + index}
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
};

// 共通のマーカーコンポーネント
const Marker = (props: MarkerProps) => {
  const { trackingVehicleId, setTrackingVehicleId } = useTracking();

  const isMobile = useBreakpointValue({ base: true, md: false });

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
        (r) => r.route_id === props.vpos?.vehicle.trip.routeId,
      );

      // _は半角空白に変換する
      let routeShortName =
        routes?.route_short_name.replace(/(\s|_)/g, " ") ?? "";
      // モバイル端末の場合、改行を行い見やすくする
      if (isMobile && routeShortName.length > 20) {
        routeShortName = routeShortName.replaceAll("→", "\n↓\n");
      }

      return props.agency !== Agency.RYOBI
        ? (routes?.route_long_name ?? "")
        : routeShortName;
    }
    return "";
  };

  const getDestinationStopName = (): string => {
    if (props.agency === Agency.HAKKOU) {
      if (props.routes && props.vpos) {
        const routes = props.routes.find(
          (r) => r.route_id === props.vpos?.vehicle.trip.routeId,
        );

        const destinationStopName = routes?.route_long_name ?? "";
        return destinationStopName;
      }
    } else {
      if (props.routesJp && props.vpos) {
        const routesJp = props.routesJp.find(
          (r) => r.route_id === props.vpos?.vehicle.trip.routeId,
        );

        const destinationStopName = routesJp?.destination_stop ?? "";
        return getRouteShortName().includes("特急")
          ? `特急 ${destinationStopName}`
          : destinationStopName;
      }
    }
    return "";
  };

  const getNextStopName = (): JSX.Element => {
    if (props.stops && props.trip && props.vpos) {
      // 現在のstopSequenceのインデックスを取得
      // stopSequenceと配列の添字が必ずしも一致しないことに注意する
      const currentIndex = props.trip.tripUpdate.stopTimeUpdate.findIndex(
        (stop) => stop.stopSequence === props.vpos?.vehicle.currentStopSequence,
      );

      // 次のインデックスが存在する場合は、stopNameを返す
      if (
        currentIndex !== -1 &&
        currentIndex + 1 < props.trip.tripUpdate.stopTimeUpdate.length
      ) {
        const stopName =
          props.stops.find(
            (s) =>
              s.stop_id ===
              props.trip?.tripUpdate.stopTimeUpdate[currentIndex + 1].stopId,
          )?.stop_name ?? "";
        return (
          <HStack gap={1} justifyContent="center">
            <Text fontWeight="normal">{`次は `}</Text>
            <Text
              fontWeight="normal"
              textDecorationLine="underline"
            >{`${stopName}`}</Text>
          </HStack>
        );
      }

      // 次のインデックスが存在しない場合は、現在のstopNameを返す
      const stopName =
        props.stops.find(
          (s) =>
            s.stop_id ===
            props.trip?.tripUpdate.stopTimeUpdate[currentIndex].stopId,
        )?.stop_name ?? "";

      return (
        <HStack gap={1} justifyContent="center">
          <Text fontWeight="normal">{`次は `}</Text>
          <Text
            fontWeight="normal"
            textDecorationLine="underline"
          >{`${stopName}`}</Text>
        </HStack>
      );
    }
    return <Text fontWeight="normal">運行情報取得不可</Text>;
  };

  const getLabel = (): string => {
    if (props.vpos) {
      return props.vpos.vehicle.vehicle.label;
    }
    return "";
  };

  const getDelay = (): JSX.Element => {
    let delay = null;
    if (props.trip && props.vpos) {
      // 現在のstopSequenceのインデックスを取得
      const currentIndex = props.trip.tripUpdate.stopTimeUpdate.findIndex(
        (stop) => stop.stopSequence === props.vpos?.vehicle.currentStopSequence,
      );

      // 現在のインデックスが存在する場合は、現在の遅れ時分を返す
      if (
        currentIndex !== -1 &&
        currentIndex < props.trip.tripUpdate.stopTimeUpdate.length
      ) {
        delay =
          Math.floor(
            props.trip.tripUpdate.stopTimeUpdate[currentIndex].arrival.delay /
              60,
          ) ?? null; // 正常に遅れ時分が取得できない場合はnull
      } else {
        // インデックスが取得できない場合は、始発時点の遅れ時分を返す
        delay =
          Math.floor(
            props.trip.tripUpdate.stopTimeUpdate[0].arrival.delay / 60,
          ) ?? null; // 正常に遅れ時分が取得できない場合はnull
      }
    }

    if (delay == null) {
      return <Badge>遅延情報取得不可</Badge>;
    }

    if (delay === 0) {
      return <Badge colorPalette="green">ほぼ定刻</Badge>;
    }

    if (delay < 15) {
      return <Badge colorPalette="blue">約{delay}分遅れ</Badge>;
    }

    return <Badge colorPalette="red">約{delay}分遅れ</Badge>;
  };

  const getOccupancyStatus = (): JSX.Element => {
    if (props.vpos) {
      switch (props.vpos.vehicle.occupancyStatus) {
        case "EMPTY":
          return <Badge colorPalette="yellow">乗車率0%</Badge>;
        case "MANY_SEATS_AVAILABLE":
          return <Badge colorPalette="green">乗車率50%未満</Badge>;
        case "STANDING_ROOM_ONLY":
          return <Badge colorPalette="blue">乗車率50%~80%</Badge>;
        case "FULL":
          return <Badge colorPalette="red">乗車率80%以上</Badge>;
        default:
          return <Badge>乗車率取得不可</Badge>;
      }
    }
    return <Badge>乗車率取得不可</Badge>;
  };

  const getIcon = (): string => {
    if (props.icon && props.vpos) {
      const icon = props.icon.find(
        (icon) => icon.label === props.vpos?.vehicle.vehicle.label,
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
          setTrackingVehicleId(
            props.vpos?.vehicle.vehicle.id
              ? `${props.agency}_${props.vpos.vehicle.vehicle.id}`
              : "",
          )
        } // マーカークリックでInfoWindowFを開く
      />
      {trackingVehicleId ===
        `${props.agency}_${props.vpos?.vehicle.vehicle.id}` && (
        <InfoWindowF
          position={getPosition()} // マーカー座標を指定
          options={{
            pixelOffset: new window.google.maps.Size(0, -100), // マーカーとの相対位置を指定
          }}
          onCloseClick={() => setTrackingVehicleId("")} // 閉じるときにリセット
        >
          <div>
            <VStack gap={0.5} padding="1">
              <Text
                fontWeight="medium"
                textAlign="center"
                whiteSpace="pre-wrap"
              >
                {getRouteShortName()}
              </Text>
              <Badge>{getLabel()}号車</Badge>
              {getNextStopName()}
              <HStack gap={1} justifyContent="center">
                {getDelay()}
                {getOccupancyStatus()}
              </HStack>
              {props.vpos ? (
                <Link
                  href={getVehicleStateUrl(
                    props.agency,
                    props.vpos.vehicle.vehicle.id,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  textDecoration="underline"
                  color="blue.600"
                  _hover={{ color: "blue.800" }}
                  _visited={{ color: "purple.600" }}
                >
                  詳しい運行状況
                  <LuExternalLink />
                </Link>
              ) : (
                <></>
              )}
            </VStack>
          </div>
        </InfoWindowF>
      )}
    </>
  );
};

export default MarkerGroup;
