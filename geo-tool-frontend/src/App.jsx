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
import SendIcon from '@mui/icons-material/Send';

import IconButton from '@mui/material/IconButton';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import FmdBadIcon from '@mui/icons-material/FmdBad';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './styles/App.scss';

import theme from './styles/theme';
import RRAppBar from './components/AppBar';

import Button from 'react-bootstrap/Button';
import { Form, Stack } from 'react-bootstrap';
import ModalComponent from './components/ModalComponent';
import AreaChart from './components/LineChartComponent';

import Markdown from 'react-markdown'

import plot1Img from '../src/static/plot1.png';
import predictionsImg from '../src/static/predictions.png';


function App() {

  const [places, setPlaces] = useState(null);
  const [products, setProducts] = useState(null);

  const [layers, setLayers] = useState(null);
  const [loadingLayers, setLoadingLayers] = useState(false);

  const [error, setError] = useState(null);

  const [selectedPlace, setSelectedPlace] = useState();
  const [selectedProduct, setSelectedProduct] = useState();

  const [selectedLayer, setSelectedLayer] = useState();

  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);

  const [predictions, setPredictions] = useState();
  const [infoPlace, setInfoPlace] = useState();

  const [dateState, setDateState] = useState({
    startDate: dayjs('2022-04-17'),
    endDate: dayjs('2022-04-17')
  });

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const dataPlaces = await fetchData("earthdata/places"); // Pass your API URL
        setPlaces(dataPlaces.map(p => { return { label: p['UNIT_NAME'], id: p['UNIT_CODE'] } }));

        const dataProducts = await fetchData('earthdata/product-descriptions');
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
        postData('earthdata/get-layers', data)
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

  const handleQueueTask = async () => {
    setLoading(true);

    const data = {
      place: selectedPlace,
      product: selectedProduct,
      layer: selectedLayer.id,
      start_date: dateState.startDate,
      end_date: dateState.endDate,
    }

    try {
      const r = await postData('earthdata/queue-task', data);
      const r2 = await fetchData('llm_router/predict');

      if (selectedPlace && selectedProduct) {
        const placeData = {
          label: places.find(p => p.id === selectedPlace).label,
          id: selectedProduct.id
        }
        postData('llm_router/analyze', placeData)
          .then(r => {
            if (r) {
              setInfoPlace(r.content)
            }
          })
          .catch(e => setError(e));
      }
      if (r2) {
        setPredictions(r2)
      }

      console.log('r2', r2)
    } catch (e) {
      console.log('e', e)
    } finally {
      setLoading(false);
    }

  }

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (predictions) {
      setShow(true)
    }

  }, [predictions])


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <RRAppBar />

      <div className="App">

        <div className='top-bar-container'>
          {places ?
            <Autocomplete
              options={places}
              sx={{ m: 1, minWidth: 300, borderColor: '#8af1d9' }}
              renderInput={(params) => <TextField {...params} label="🔎 Busca un lugar..." />}
              onChange={(e, v) => setSelectedPlace(v && v.id ? v.id : null)}
            />
            : null
          }

          {products ?
            <Autocomplete
              disabled={!selectedPlace}
              options={products}
              sx={{ m: 1, minWidth: 300, borderColor: '#8af1d9' }}
              renderInput={(params) => <TextField {...params} label={!selectedPlace ? "Selecciona un lugar" : "🔎 Busca un estudio..."} />}
              onChange={(e, v) => setSelectedProduct(v ? v : null)}
            />
            : null
          }
          {loadingLayers ?
            <div className='mx-2 px-2 d-flex justify-content-center' style={{ width: '120px' }}>
              <CircularProgress width={50} />
            </div>
            : !loadingLayers && layers !== null && selectedProduct && layers ?
              <FormControl sx={{ m: 1, minWidth: 220 }}>
                <InputLabel id="open-select-label">Selecciona una banda</InputLabel>
                <Select
                  labelId="open-select-label"
                  id="controlled-open-select"
                  open={open}
                  onClose={handleClose}
                  onOpen={handleOpen}
                  value={selectedLayer ? selectedLayer : ''}
                  label="layer"
                  autoWidth
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

          {selectedLayer ?
            <LocalizationProvider dateAdapter={AdapterDayjs} >
              <DemoContainer components={['DatePicker', 'DatePicker']}>
                <DatePicker
                  sx={{ m: 2 }}
                  label="Inicio"
                  value={dateState.startDate}
                  onChange={(newValue) => setDateState({ ...dateState, startDate: newValue })}
                  minDate={dayjs(selectedLayer.minDate)}
                  maxDate={dayjs()}
                  format={"DD/MM/YYYY"}
                />
                <DatePicker
                  label="Fin"
                  value={dateState.endDate}
                  onChange={(newValue) => setDateState({ ...dateState, endDate: newValue })}
                  minDate={dayjs(selectedLayer.minDate)}
                  maxDate={dayjs()}
                  format={"DD/MM/YYYY"}
                />
              </DemoContainer>
              <Button
                className='today-button'
                variant='outline-primary'
                disabled={!selectedLayer}
                onClick={() => setDateState({ startDate: dayjs(), endDate: dayjs() })}>
                HOY
              </Button>
            </LocalizationProvider>
            : null
          }
        </div>
        {selectedPlace ?
          <div className='d-flex flex-row justify-content-center'>
            <Button variant='outline-primary'
              onClick={handleQueueTask}
            >
              <Stack direction='horizontal' gap={2}>
                <div>
                  Calcular datos de la superficie
                </div>
                <SettingsSuggestIcon style={{ margin: '0 0 5px' }} />
              </Stack>
            </Button>
          </div>
          : null}


        <div className='map-container'>
          <div className='item1'>
            {selectedPlace ?
              <GeoViewerComponent selectedPlace={selectedPlace} loading={loading} />
              :
              <div className='m-4 d-flex flex-column justify-content-center align-items-center'>
                <FmdBadIcon style={{ fontSize: '120px  ' }} />
                <div>
                  <h4>Selecciona un lugar</h4>
                </div>
              </div>
            }
          </div>

          {infoPlace ?
            <div className='item2 outline'>
              <div style={{ padding: '1.5rem', maxHeight: '75%', overflowY: 'scroll' }}>
                <Markdown>{infoPlace}</Markdown>
              </div>

              <div className='h-25 p-4 d-flex flex-row gap-3'>
                <Form className='msg'>
                  <Form.Control as="textarea" rows={3} />
                </Form>

                <div className="send">
                  <IconButton
                    onClick={() => console.log('first',)}
                  >
                    <SendIcon />
                  </IconButton>
                </div>
              </div>
            </div>
            : null}
        </div>
      </div>

      <ModalComponent
        title={'NDVI Predictions'}
        show={show}
        setShow={setShow}
      >
        {predictions ?
          // <AreaChart data={predictions} />
          <>
            <img src={plot1Img} alt='plot1' width={'100%'} className='mb-1' />
            <img src={predictionsImg} alt='predictions' width={'100%'} className='mb-1' />
          </>
          : null
        }
      </ModalComponent>
    </ThemeProvider>
  );
}

export default App;
