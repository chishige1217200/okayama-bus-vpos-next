export interface Routes {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_desc: string;
  route_type: string;
  route_url: string;
  route_color: string;
  route_text_color: string;
  jp_parent_route_id: string;
}

export interface RoutesJp {
  route_id: string;
  route_update_date: string;
  origin_stop: string;
  via_stop: string;
  destination_stop: string;
}

export interface Stops {
  stop_id: string;
  stop_code: string;
  stop_name: string;
  stop_desc: string;
  stop_lat: string;
  stop_lon: string;
  zone_id: string;
  stop_url: string;
  location_type: string;
  parent_station: string;
  stop_timezone: string;
  wheelchair_boarding: string;
  platform_code: string;
}
