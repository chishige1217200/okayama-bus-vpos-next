"use client";

import { useEffect, useState } from "react";
import "./main.css";
import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import Image from "next/image";
import MarkerGroup from "./marker";
import { Agency } from "@/types/agency";

type MainProps = {
  okaden: boolean;
  ryobi: boolean;
  hakkou: boolean;
};

const Main = (props: MainProps) => {
  // const [markers, setMarkers] = useState([]);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null); // 開いているInfoWindowFを追跡
  // const [isLoading, setIsLoading] = useState(true); // ローディング状態
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
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? ""}>
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
        {props.okaden ? (
          <MarkerGroup
            agency={Agency.OKADEN}
            activeMarkerId={activeMarkerId}
            setActiveMarkerId={setActiveMarkerId}
          />
        ) : (
          <></>
        )}
        {props.ryobi ? (
          <MarkerGroup
            agency={Agency.RYOBI}
            activeMarkerId={activeMarkerId}
            setActiveMarkerId={setActiveMarkerId}
          />
        ) : (
          <></>
        )}
        {props.hakkou ? (
          <MarkerGroup
            agency={Agency.HAKKOU}
            activeMarkerId={activeMarkerId}
            setActiveMarkerId={setActiveMarkerId}
          />
        ) : (
          <></>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Main;
