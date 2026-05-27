"use client";

import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map } from "leaflet";

type Props = {
  pickupLat?: number;
  pickupLon?: number;
  destinationLat?: number;
  destinationLon?: number;
};

export default function MapPanel({
  pickupLat,
  pickupLon,
  destinationLat,
  destinationLon,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<Map | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      if (!mapRef.current || leafletMapRef.current) return;

      const L = await import("leaflet");

      delete (
        L.Icon.Default.prototype as { _getIconUrl?: unknown }
      )._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current).setView([-36.8485, 174.7633], 11);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        }
      ).addTo(map);

      const markerLayer = L.layerGroup().addTo(map);

      leafletMapRef.current = map;
      markerLayerRef.current = markerLayer;

      setMapReady(true);
    }

    loadMap();

    return () => {
      cancelled = true;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerLayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function updateMarkers() {
      if (!mapReady || !leafletMapRef.current || !markerLayerRef.current)
        return;

      const L = await import("leaflet");

      const map = leafletMapRef.current;
      const markerLayer = markerLayerRef.current;

      markerLayer.clearLayers();

      const hasPickup =
        typeof pickupLat === "number" &&
        !Number.isNaN(pickupLat) &&
        typeof pickupLon === "number" &&
        !Number.isNaN(pickupLon);

      const hasDestination =
        typeof destinationLat === "number" &&
        !Number.isNaN(destinationLat) &&
        typeof destinationLon === "number" &&
        !Number.isNaN(destinationLon);

      if (hasPickup) {
        L.marker([pickupLat, pickupLon])
          .addTo(markerLayer)
          .bindPopup("Pickup Location");
      }

      if (hasDestination) {
        L.marker([destinationLat, destinationLon])
          .addTo(markerLayer)
          .bindPopup("Destination Location");
      }

      if (hasPickup && hasDestination) {
        L.polyline(
          [
            [pickupLat, pickupLon],
            [destinationLat, destinationLon],
          ],
          { weight: 4 }
        ).addTo(markerLayer);

        const bounds = L.latLngBounds([
          [pickupLat, pickupLon],
          [destinationLat, destinationLon],
        ]);

        map.fitBounds(bounds, { padding: [40, 40] });
      } else if (hasPickup) {
        map.setView([pickupLat, pickupLon], 15);
      } else if (hasDestination) {
        map.setView([destinationLat, destinationLon], 15);
      }
    }

    updateMarkers();
  }, [mapReady, pickupLat, pickupLon, destinationLat, destinationLon]);

  return (
    <div className="card">
      <h2>Real Map</h2>
      <p>
        Selected addresses are displayed on an interactive OpenStreetMap map.
      </p>
      <div ref={mapRef} className="realMap"></div>
    </div>
  );
}
