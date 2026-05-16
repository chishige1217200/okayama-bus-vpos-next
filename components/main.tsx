"use client";

import { useEffect, useRef, useState } from "react";
import "./main.css";
import { Maximize, RotateCw } from "lucide-react";
import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import Image from "next/image";
import MarkerGroup from "./marker";
import { useFetchController } from "@/context/FetchContext";
import { useAgency } from "@/context/AgencyContext";
import { IconButton } from "@chakra-ui/react/button";
import { Theme } from "@chakra-ui/react";

const Main = () => {
  const { fire, isLoading } = useFetchController(); // ローディング状態をFetchContextから取得
  const { searchAgencies } = useAgency(); // 検索対象のバス事業者をFetchContextから取得
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 34.663,
    lng: 133.925,
  }); // 初期値
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null); // ユーザーの現在地

  const mapWrapperRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await mapWrapperRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    console.log("Fetching user location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude }); // 現在地を中心に設定
          setUserLocation({ lat: latitude, lng: longitude }); // 現在地を保存
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <>
      <Theme appearance="light">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? ""}
        >
          <div
            ref={mapWrapperRef}
            className="relative"
            style={{
              width: "100vw",
              height: "100vh",
            }}
          >
            {/* ボタン群 */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                gap: "8px",
                zIndex: 5,
                color: "white",
              }}
            >
              {/* 更新ボタン */}
              <IconButton
                onClick={fire}
                disabled={isLoading}
                h="40px"
                w="40px"
                bg="white"
                color="black"
                border="0"
                borderRadius="2px"
                boxShadow="0px 1px 4px -1px rgba(0, 0, 0, 0.3)"
                overflow="hidden"
                cursor="pointer"
                userSelect="none"
                textTransform="none"
                _hover={{ bg: "white" }}
                _active={{ bg: "gray.100" }}
                loading={isLoading}
              >
                <RotateCw />
              </IconButton>

              {/* 最大化ボタン */}
              <IconButton
                onClick={toggleFullscreen}
                h="40px"
                w="40px"
                bg="white"
                color="black"
                border="0"
                borderRadius="2px"
                boxShadow="0px 1px 4px -1px rgba(0, 0, 0, 0.3)"
                _hover={{ bg: "white" }}
                _active={{ bg: "gray.100" }}
              >
                <Maximize />
              </IconButton>
            </div>
            <GoogleMap
              mapContainerStyle={{
                height: "100%",
                width: "100%",
              }}
              center={center}
              zoom={17}
              options={{
                fullscreenControl: false,
              }}
            >
              {userLocation && (
                <OverlayView
                  position={userLocation}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div className="pulse-container">
                    <Image
                      src="/bluedot.png"
                      width={1}
                      height={1}
                      alt="現在地"
                      className="pulse-dot"
                    />
                    <div className="pulse-ring"></div>
                  </div>
                </OverlayView>
              )}
              {searchAgencies.map((agency) => (
                <MarkerGroup key={agency} agency={agency} />
              ))}
            </GoogleMap>
          </div>
        </LoadScript>
      </Theme>
    </>
  );
};

export default Main;
