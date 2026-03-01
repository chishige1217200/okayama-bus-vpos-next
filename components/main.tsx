"use client";

import { useEffect, useState } from "react";
import "./main.css";
import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import Image from "next/image";
import MarkerGroup from "./marker";
import { useFetchController } from "@/context/FetchContext";
import { useAgency } from "@/context/AgencyContext";
import { Button } from "@chakra-ui/react/button";
import { Theme } from "@chakra-ui/react";
import SearchBar from "./searchBar";

const Main = () => {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null); // 開いているInfoWindowFを追跡
  const { fire, isLoading } = useFetchController(); // ローディング状態をFetchContextから取得
  const { searchAgencies } = useAgency(); // 検索対象のバス事業者をFetchContextから取得
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 34.663,
    lng: 133.925,
  }); // 初期値
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null); // ユーザーの現在地

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
          <div className="relative">
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 60,
                display: "flex",
                zIndex: 5,
                color: "white",
              }}
            >
              <Button
                onClick={fire}
                disabled={isLoading}
                position="absolute"
                top="0"
                right="0"
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
                _hover={{ bg: "white" }} // Google風はhoverでほぼ変化なし
                _active={{ bg: "gray.100" }}
              >
                更新
              </Button>
            </div>
            <GoogleMap
              mapContainerStyle={{ height: "100vh", width: "100vw" }}
              center={center}
              zoom={17}
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
                <MarkerGroup
                  key={agency}
                  agency={agency}
                  activeMarkerId={activeMarkerId}
                  setActiveMarkerId={setActiveMarkerId}
                />
              ))}
            </GoogleMap>
          </div>
        </LoadScript>
      </Theme>
      <SearchBar />
    </>
  );
};

export default Main;
