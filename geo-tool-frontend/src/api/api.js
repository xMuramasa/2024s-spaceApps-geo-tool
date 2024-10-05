// api.js
export const fetchData = async (endpoint) => {
    const uri = `${process.env.REACT_APP_API_URL}/${endpoint}`;

    console.log('uri', uri)
    try {
      const response = await fetch(uri);
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };
  