"use client";

import { useEffect, useRef, useState } from "react";
// Ignore missing type declarations for CSS import
// @ts-ignore
import "./main.css";
import { Info, Maximize, RotateCw, Search } from "lucide-react";
import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import Image from "next/image";
import MarkerGroup from "./Marker";
import { useFetchController } from "@/context/FetchContext";
import { useAgency } from "@/context/AgencyContext";
import { CloseButton, IconButton } from "@chakra-ui/react/button";
import { Dialog, Link, Portal, Theme } from "@chakra-ui/react";
import SearchForm from "./SearchDialog";
import { toaster } from "./ui/toaster";

const Main = () => {
  const { fire, isLoading } = useFetchController(); // ローディング状態をFetchContextから取得
  const { searchAgencies } = useAgency(); // 検索対象のバス事業者をFetchContextから取得
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 34.663,
    lng: 133.925,
  }); // 初期値
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null); // ユーザーの現在地
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ダイアログの開閉状態

  const mapWrapperRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await mapWrapperRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const deactivateFullscreen = async () => {
    await document.exitFullscreen();
  };

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!isMapLoaded) return;

    toaster.create({
      description: "全画面表示にするとスムーズにスクロールできます。",
      type: "info",
      closable: true,
    });
  }, [isMapLoaded]);

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
          onLoad={() => setIsMapLoaded(true)}
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
                gap: "10px",
                zIndex: 5,
              }}
            >
              {/* 利用規約ボタン */}

              <Link href="/terms">
                <IconButton
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
                >
                  <Info />
                </IconButton>
              </Link>

              {/* 検索ボタン */}
              <IconButton
                onClick={() => {
                  setIsDialogOpen(true);
                  deactivateFullscreen();
                }}
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
              >
                <Search />
              </IconButton>

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

            <Theme>
              <Dialog.Root
                closeOnInteractOutside={false}
                modal={false}
                open={isDialogOpen}
                onOpenChange={(e) => setIsDialogOpen(e.open)}
                placement={"bottom"}
                motionPreset={"slide-in-bottom"}
              >
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner pointerEvents="none">
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>絞り込み検索</Dialog.Title>
                      </Dialog.Header>
                      <Dialog.Body>
                        <SearchForm />
                      </Dialog.Body>
                      {/* <Dialog.Footer>
                        <Dialog.ActionTrigger asChild>
                          <Button>閉じる</Button>
                        </Dialog.ActionTrigger>
                      </Dialog.Footer> */}
                      <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" />
                      </Dialog.CloseTrigger>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
            </Theme>
          </div>
        </LoadScript>
      </Theme>
    </>
  );
};

export default Main;
