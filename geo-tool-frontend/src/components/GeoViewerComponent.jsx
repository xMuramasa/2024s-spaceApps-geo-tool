import { useEffect, useRef, useState } from 'react';
import { fromUrl, fromArrayBuffer, fromBlob } from "geotiff";

import L from 'leaflet';
import 'leaflet-geotiff';
import 'leaflet/dist/leaflet.css';
import 'leaflet.gridlayer.googlemutant'
import GeoRasterLayer from "georaster-layer-for-leaflet";

import './components.scss';


const parseGeoraster = require("georaster");


const GeoViewerComponent = () => {
  const [metadata, setMetadata] = useState(null);

  const [map, setMap] = useState(null);

  useEffect(() => {
    // Initialize the map
    const initialMap = L.map('map').setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(initialMap);

    L.gridLayer
      .googleMutant({
        type: "satellite", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
      })
      .addTo(initialMap);

    setMap(initialMap); // Store map instance

    // Cleanup on unmount
    return () => {
      initialMap.remove(); // Remove the map instance when the component unmounts
    };
  }, []);

  useEffect(() => {
    (async function () {
      // fetch('/geofiles/HLSS30.020_2017182_to_2017212/HLSS30.020_Fmask_doy2017198_aid0001_12N.tif')
      fetch('/geofiles/MOD13A3.061_20220101_to_20230101/MOD13A3.061__1_km_monthly_sun_zenith_angle_doy2022001_aid0001.tif')
        .then(response => response.arrayBuffer())
        .then(f => parseGeoraster(f, { palette: 'inferno', }))
        .then(georaster => {
          if (map) {
            console.log('georaster', georaster.noDataValue)
            let layer = new GeoRasterLayer({
              georaster: georaster,
              opacity: 0.7,
              // pixelValuesToColorFn: value => viridisColor(value),
              resolution: 400// optional parameter for adjusting display resolution
            });
            layer.addTo(map);

            map.fitBounds(layer.getBounds());
          }
        })
    })();
  }, [map]);

  useEffect(() => {
    console.log('metadata', metadata)
  }, [metadata])

  return (
    <div className='geo-viewer-container'>
      <div id="map" className='map' />
    </div>
  )
};


function viridisColor(value) {
  // Ensure the value is clamped between 0 and 255

  value = Math.max(0, Math.min(255, value));

  // Normalize the value to a range of 0 to 1
  const normalizedValue = value / 255;

  // Viridis color scale
  const viridis = [
    [68, 1, 84],    // Dark purple
    [68, 2, 144],
    [58, 82, 139],
    [32, 144, 141],
    [12, 204, 161],
    [253, 231, 37], // Yellow
    [254, 204, 92],
    [255, 182, 31],
    [254, 153, 7],
    [255, 255, 255] // White (optional, for values above 255)
  ];

  // Calculate the index for the color
  const n = viridis.length - 1;
  const idx = Math.floor(normalizedValue * n);
  const ratio = (normalizedValue * n) - idx;

  // Interpolate between colors
  const color1 = viridis[idx];
  const color2 = viridis[Math.min(idx + 1, n)];
  const r = Math.round(color1[0] + ratio * (color2[0] - color1[0]));
  const g = Math.round(color1[1] + ratio * (color2[1] - color1[1]));
  const b = Math.round(color1[2] + ratio * (color2[2] - color1[2]));

  // Convert to hex
  const color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0')}`;
  return color;
  // if (value >= 255) {
  //   return 'rgba(0, 0, 0, 0)'; // Transparent
  // } else {
  //   return color;
  // }
}
export default GeoViewerComponent;