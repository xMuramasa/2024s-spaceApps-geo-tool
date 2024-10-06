import { useEffect, useState } from 'react';

import L from 'leaflet';
import 'leaflet-geotiff';
import 'leaflet/dist/leaflet.css';
import 'leaflet.gridlayer.googlemutant'

import 'leaflet-draw';
import 'leaflet-geometryutil';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import GeoRasterLayer from "georaster-layer-for-leaflet";
// import { SimpleMapScreenshoter } from 'leaflet-simple-map-screenshoter';
import 'leaflet-simple-map-screenshoter'


import './components.scss';
import { requestCaption } from '../api/api';

const parseGeoraster = require("georaster");


const GeoViewerComponent = ({ selectedPlace, loading }) => {

  const [customMap, setMap] = useState(null);
  const editableLayers = new L.FeatureGroup();
  const [snapshot, setSnapshot] = useState();


  useEffect(() => {
    // Initialize the customMap
    const initialMap = L.map('map').setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(initialMap);

    // L.gridLayer
    //   .googleMutant({
    //     type: "satellite", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    //   })
    //   .addTo(initialMap);

    setSnapshot(L.simpleMapScreenshoter().addTo(initialMap));


    L.control.scale().addTo(initialMap);


    // Initialize the draw control and pass it the FeatureGroup of editable layers
    initialMap.addLayer(editableLayers);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: editableLayers
      },
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
      }
    });
    initialMap.addControl(drawControl);

    initialMap.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      editableLayers.addLayer(layer);

      // Calculate and display the area
      const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      layer.bindPopup(`Area: ${area.toFixed(2)} square meters`).openPopup();
    });

    // Event listener for when a polygon is edited
    initialMap.on(L.Draw.Event.EDITED, function (event) {
      const layers = event.layers;
      layers.eachLayer(function (layer) {
        const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        layer.setPopupContent(`Area: ${area.toFixed(2)} square meters`).openPopup();
      });
    });


    setMap(initialMap); // Store customMap instance

    // Cleanup on unmount
    return () => {
      initialMap.remove(); // Remove the customMap instance when the component unmounts
    };

  }, []);

  console.log('selectedPlace', selectedPlace)
  useEffect(() => {
    if (customMap) {
      (async function () {
        fetch(selectedPlace === 'GRCA' ?
          '/geofiles/HLSS30.020_2017182_to_2017212/HLSS30.020_Fmask_doy2017198_aid0001_12N.tif'
          :
          '/geofiles/MOD13A3.061_20240706_to_20241006/MOD13A3.061__1_km_monthly_NDVI_doy2024214_aid0001.tif'
        )
          .then(response => response.arrayBuffer())
          .then(f => parseGeoraster(f, { palette: 'inferno', }))
          .then(georaster => {
            let layer = new GeoRasterLayer({
              georaster: georaster,
              opacity: 0.7,
              // pixelValuesToColorFn: value => selectedPlace === 'GRCA' ? viridisColor(value) : value,
              resolution: 400// optional parameter for adjusting display resolution
            });
            layer.addTo(customMap);

            customMap.fitBounds(layer.getBounds());
          })
      })();


    }
  }, [customMap, selectedPlace]);

  const handleSnap = () => {
    if (customMap && snapshot) {
      customMap.whenReady(() => {
        snapshot.takeScreen('image').then(async img => {

          var byteString = atob(img.split(',')[1]);
          var mimeString = img.split(',')[0].split(':')[1].split(';')[0];
          var arrayBuffer = new ArrayBuffer(byteString.length);
          var ia = new Uint8Array(arrayBuffer);
          for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          var blob = new Blob([arrayBuffer], { type: mimeString });

          const r = await requestCaption(blob);
          if(r) {
            alert(JSON.stringify(r))
          }
          // FileSaver.saveAs(blob, 'screen.png')
        }).catch(e => {
          console.error(e)
        })

      })
    } else {
      alert('No se pudo obtener imagen del mapa')
    }
  }

  return (
    <div className='geo-viewer-container'>
      {/* <Button
        variant='outline-primary'
        className='m-1'
        onClick={handleSnap}>
        Consultar Mapa
      </Button> */}
      <div id="map" className='custom-map' />
    </div >
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
  // return color;
  if (value >= 255) {
    return 'rgba(0, 0, 0, 0)'; // Transparent
  } else {
    return color;
  }
}
export default GeoViewerComponent;