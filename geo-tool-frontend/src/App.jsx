import { useState, useEffect } from 'react';

import GeoViewerComponent from './components/GeoViewerComponent';

import { fetchData } from './api/api';

import './styles/App.scss';
import SearchComponent from './components/SearchComponent/SearchComponent';

function App() {

  const [places, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPlaces, setSelectedPlaces] = useState([]);

  const [selectedOption, setSelectedOption] = useState('');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const handleSelectionChange = (value) => {
    setSelectedOption(value);
    console.log('Selected:', value);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await fetchData("places"); // Pass your API URL
        setData(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchDataFromAPI();

  }, [])

  return (
    <div className="App">
      {data ?
        <SearchComponent
          options={data}
          rootSelectedIds={selectedPlaces}
          handleRootSelection={(x) => console.log('x', x)}
          nameLabel={'UNIT_NAME'}
          idLabel={'UNIT_CODE'}
        />
        : null
      }
      {/* <GeoViewerComponent /> */}
    </div>
  );
}

export default App;
