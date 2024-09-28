"use client";

import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  geoData: GeoJSON.FeatureCollection,
  latitude?: number,
  longitude?: number
}

const MapComponent: React.FC<MapComponentProps> = ({ geoData, latitude, longitude }) => {

  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    // Initialize the map
    const initialMap = L.map('map').setView([51.505, -0.09], 13); // Fallback center

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(initialMap);

    setMap(initialMap); // Store map instance

    // Cleanup on unmount
    return () => {
      initialMap.remove(); // Remove the map instance when the component unmounts
    };
  }, []);

  useEffect(() => {
    // Use Geolocation API to center the map based on user's location
    const setUserLocation = (lat: number, long: number) => {
      if (navigator.geolocation) {
        if(map){
          map.setView([lat, long], 15); // Center the map at user's location
        }
      } else {
        console.warn('Geolocation is not supported by this browser.');
      }
    };

    if(latitude && longitude){
      setUserLocation(latitude, longitude);
    }

  }, [map, latitude, longitude]);


  useEffect(() => {
    // Add GeoJSON data to the map if it exists
    let geoJsonLayer: L.GeoJSON | null = null;

    if (geoData && map) {
      geoJsonLayer = L.geoJSON(geoData).addTo(map);
      map.fitBounds(geoJsonLayer.getBounds()); // Adjust map to fit GeoJSON bounds
    }

  }, [geoData, map]);

  return (
    <div id="map" className="w-full h-[500px]"></div>
  )
};

export default MapComponent;
