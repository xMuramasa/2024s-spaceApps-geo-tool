import { useState, useEffect } from 'react';

import GeoViewerComponent from './components/GeoViewerComponent';

import { fetchData, postData } from './api/api';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { matchSorter } from 'match-sorter';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './styles/App.scss';

import theme from './styles/theme';
import RRAppBar from './components/AppBar';


function App() {

  const [places, setPlaces] = useState(null);
  const [products, setProducts] = useState(null);

  const [layers, setLayers] = useState(null);
  const [loadingLayers, setLoadingLayers] = useState(false);

  const [error, setError] = useState(null);

  const [selectedPlace, setSelectedPlace] = useState();
  const [selectedProduct, setSelectedProduct] = useState();

  const [selectedLayer, setSelectedLayer] = useState();

  const [dateState, setDateState] = useState({
    startDate: dayjs('2022-04-17'),
    endDate: dayjs('2022-04-17')
  });

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const dataPlaces = await fetchData("places"); // Pass your API URL
        setPlaces(dataPlaces.map(p => { return { label: p['UNIT_NAME'], id: p['UNIT_CODE'] } }));

        const dataProducts = await fetchData('product-descriptions');
        setProducts(dataProducts.map(p => { return { label: p['Description'], id: p['ProductAndVersion'] } }));

      } catch (error) {
        setError(error);
      }
    };

    fetchPlaces();

  }, [])

  useEffect(() => {
    if (selectedProduct) {
      setLoadingLayers(true);
      (async function () {
        const data = {
          query_string: selectedProduct.label
        }
        postData('get-layers', data)
          .then(d => {
            if (d) {
              setLayers(d);
            }
          })
          .catch(e => setError(e))
          .finally(() => {
            setLoadingLayers(false);
          })

      })()
    }
  }, [selectedProduct])

  const [open, setOpen] = useState(false);

  const handleChange = (event) => {
    setSelectedLayer(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <RRAppBar />

      <div className="App">

        <div className='top-bar-container'>
          {places ?
            <Autocomplete
              options={places}
              sx={{ m: 2, minWidth: 300, borderColor: '#8af1d9' }}
              renderInput={(params) => <TextField {...params} label="🔎 Busca un lugar..." />}
              onChange={(e, v) => setSelectedPlace(v && v.id ? v.id : null)}
            />
            : null
          }

          {products ?
            <Autocomplete
              disabled={!selectedPlace}
              options={products}
              sx={{ m: 2, minWidth: 300, borderColor: '#8af1d9' }}
              renderInput={(params) => <TextField {...params} label={!selectedPlace ? "Selecciona un lugar" : "🔎 Busca un estudio..."} />}
              onChange={(e, v) => setSelectedProduct(v ? v : null)}
            />
            : null
          }
          {loadingLayers ?
            <CircularProgress width={50} />
            : !loadingLayers && layers !== null && selectedProduct && layers ?
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="open-select-label">Selecciona una banda</InputLabel>
                <Select
                  labelId="open-select-label"
                  id="controlled-open-select"
                  open={open}
                  onClose={handleClose}
                  onOpen={handleOpen}
                  value={selectedLayer ? selectedLayer : ''}
                  label="Age"
                  onChange={handleChange}
                >
                  {layers.map(l => (
                    <MenuItem value={l}>{l.description}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              :
              <Autocomplete
                disabled={!selectedProduct}
                options={products}
                sx={{ width: 300, m: 0 }}
                renderInput={(params) => <TextField {...params} label={"Selecciona un estudio"} />}
                onChange={(e, v) => { }}
              />
          }

        </div>
        {selectedLayer ?

          <div className='top-bar-container'>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker', 'DatePicker']}>
                <DatePicker
                  label="Controlled picker"
                  value={dateState.startDate}
                  onChange={(newValue) => setDateState({ ...dateState, startDate: newValue })}
                  minDate={dayjs(selectedLayer.minDate)}
                  maxDate={dayjs()}

                  format="DD/MM/YYYY"
                />
                <DatePicker
                  label="Controlled picker"
                  value={dateState.endDate}
                  onChange={(newValue) => setDateState({ ...dateState, endDate: newValue })}
                  minDate={dayjs(selectedLayer.minDate)}
                  maxDate={dayjs()}
                  format="DD/MM/YYYY"
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
          : null
        }


        <div className='map-container'>

          <GeoViewerComponent />

          <div>ACONTAINER</div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
