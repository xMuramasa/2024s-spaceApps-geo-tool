import { useState, useEffect } from 'react';

import GeoViewerComponent from './components/GeoViewerComponent';

import { fetchData } from './api/api';

import './styles/App.scss';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

function App() {

  const [places, setPlaces] = useState(null);
  const [products, setProducts] = useState(null);
  const [layers, setLayers] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPlace, setSelectedPlace] = useState();
  const [selectedProduct, setSelectedProduct] = useState();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const dataPlaces = await fetchData("places"); // Pass your API URL
        setPlaces(dataPlaces.map(p => { return { label: p['UNIT_NAME'], id: p['UNIT_CODE'] } }));

        const dataProducts = await fetchData('product-descriptions');
        setProducts(dataProducts.map(p => { return { label: p['Description'], id: p['ProductAndVersion'] } }));

        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchPlaces();

  }, [])

  return (
    <div className="App">

      <div className='top-bar-container'>
        {places ?
          <Autocomplete
            freeSolo
            options={places}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="🔎 Busca un lugar..." />}
            onChange={(e, v) => setSelectedPlace(v.id)}
          />
          : null
        }

        {products ?
          <Autocomplete
            freeSolo
            disabled={!selectedPlace}
            options={products}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label={!selectedPlace ? "Selecciona un lugar" : "🔎 Busca un estudio..."} />}
            onChange={(e,v) => console.log('v', v)}
          />
          : null
        }
        { 
          <CircularProgress width={50} />
        }

      </div>
      <div className='map-container'>

        <GeoViewerComponent />

        <div>ACONTAINER</div>
      </div>
    </div>
  );
}

export default App;
