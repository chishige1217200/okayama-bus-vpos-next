import { useFetchController } from "@/context/FetchContext";
import { useSearch } from "@/context/SearchContext";
import { useTracking } from "@/context/TrackingContext";
import { useStaticData } from "@/context/StaticDataContext";
import {
  Agency,
  getVehicleStateUrl,
  getVehicleTrackingParam,
} from "@/types/agency";
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
import { LuExternalLink, LuShare2 } from "react-icons/lu";
import CopyLink from "./CopyLink";

type MarkerGroupProps = {
  agency: Agency;
};

// 事業者毎に運行情報の取得を行う
const MarkerGroup = (props: MarkerGroupProps) => {
  const { fetchStaticData } = useStaticData();

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
  zIndex: number;
};

// 共通のマーカーコンポーネント
const Marker = (props: MarkerProps) => {
  const { trackingVehicleId, setTrackingVehicleId } = useTracking();
  const { staticData } = useStaticData();
  const { state: searchState } = useSearch();
  const agencyData = staticData[props.agency] || {};
  const routesList = agencyData.routesList ?? null;
  const routesJpList = agencyData.routesJpList ?? null;
  const stopsList = agencyData.stopsList ?? null;
  const iconList = agencyData.iconList ?? null;

  // const isMobile = useBreakpointValue({ base: true, md: false });

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
    if (routesList && props.vpos) {
      const routes = routesList.find(
        (r) => r.route_id === props.vpos?.vehicle.trip.routeId,
      );

      // _は半角空白に変換する
      let routeShortName =
        routes?.route_short_name.replace(/(\s|_)/g, " ") ?? "";
      // 改行を行い見やすくする
      if (routeShortName.length > 20) {
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
      if (routesList && props.vpos) {
        const routes = routesList.find(
          (r) => r.route_id === props.vpos?.vehicle.trip.routeId,
        );

        const destinationStopName = routes?.route_long_name ?? "";
        return destinationStopName;
      }
    } else {
      if (routesJpList && props.vpos) {
        const routesJp = routesJpList.find(
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
    if (stopsList && props.trip && props.vpos) {
      // 現在のstopSequenceのインデックスを取得
      // stopSequenceと配列の添字が必ずしも一致しないことに注意する
      const currentIndex = props.trip.tripUpdate.stopTimeUpdate.findIndex(
        (stop) => stop.stopSequence === props.vpos?.vehicle.currentStopSequence,
      );

      // 次のインデックスが存在する場合は、stopNameを返す
      let stopName = "";
      if (
        currentIndex !== -1 &&
        currentIndex + 1 < props.trip.tripUpdate.stopTimeUpdate.length
      ) {
        stopName =
          stopsList.find(
            (s) =>
              s.stop_id ===
              props.trip?.tripUpdate.stopTimeUpdate[currentIndex + 1].stopId,
          )?.stop_name ?? "";
      } else {
        // 次のインデックスが存在しない場合は、現在のstopNameを返す
        stopName =
          stopsList.find(
            (s) =>
              s.stop_id ===
              props.trip?.tripUpdate.stopTimeUpdate[currentIndex].stopId,
          )?.stop_name ?? "";
      }

      // 改行を行い見やすくする
      if (stopName.length > 10) {
        stopName = stopName.replaceAll("・", "・\n");
      }

      return (
        <HStack gap={1} justifyContent="center" alignItems="flex-start">
          <Text fontWeight="normal" whiteSpace="nowrap">
            次は
          </Text>
          <Text
            fontWeight="normal"
            whiteSpace="pre-wrap"
            textDecorationLine="underline"
          >
            {stopName}
          </Text>
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
    if (iconList && props.vpos) {
      const icon = iconList.find(
        (icon) => icon.label === props.vpos?.vehicle.vehicle.label,
      );
      return icon?.url ?? "/unknown.png";
    }
    return "/unknown.png";
  };

  const shouldShow = (): boolean => {
    const { search_vehicle, route, from_stop, via_stop, to_stop } = searchState;

    if (!search_vehicle && !route && !from_stop && !via_stop && !to_stop) {
      return true;
    }

    if (search_vehicle) {
      const label = getLabel();
      if (!label.toLowerCase().includes(search_vehicle.toLowerCase())) {
        return false;
      }
    }

    if (route) {
      const routeShortName = getRouteShortName();
      if (routesList && props.vpos) {
        const matchedRoute = routesList.find(
          (r) => r.route_id === props.vpos?.vehicle.trip.routeId,
        );
        const routeLongName = matchedRoute?.route_long_name ?? "";
        if (
          !routeShortName.toLowerCase().includes(route.toLowerCase()) &&
          !routeLongName.toLowerCase().includes(route.toLowerCase())
        ) {
          return false;
        }
      } else if (!routeShortName.toLowerCase().includes(route.toLowerCase())) {
        return false;
      }
    }

    if (from_stop || via_stop || to_stop) {
      if (!stopsList || !props.trip) return false;

      const stopNames = props.trip.tripUpdate.stopTimeUpdate.map(
        (st) => stopsList.find((s) => s.stop_id === st.stopId)?.stop_name ?? "",
      );

      if (from_stop && stopNames.length > 0) {
        if (!stopNames[0].toLowerCase().includes(from_stop.toLowerCase())) {
          return false;
        }
      }

      if (to_stop && stopNames.length > 0) {
        if (
          !stopNames[stopNames.length - 1]
            .toLowerCase()
            .includes(to_stop.toLowerCase())
        ) {
          return false;
        }
      }

      if (via_stop) {
        const hasViaStop = stopNames.some((name) =>
          name.toLowerCase().includes(via_stop.toLowerCase()),
        );
        if (!hasViaStop) return false;
      }
    }

    return true;
  };

  if (!shouldShow()) return null;

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
                <>
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
                  <CopyLink
                    copyText={getVehicleTrackingParam(
                      props.agency,
                      props.vpos.vehicle.vehicle.id,
                    )}
                  >
                    位置情報を共有
                    <LuShare2 />
                  </CopyLink>
                </>
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
