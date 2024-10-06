// api.js
export const fetchData = async (endpoint) => {
  const uri = `${process.env.REACT_APP_API_URL}/${endpoint}`;
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

export const postData = async (endpoint, data) => {
  const uri = `${process.env.REACT_APP_API_URL}/${endpoint}`;
  try {
    const response = await fetch(
      uri,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const res = await response.json();
    return res;

  } catch (error) {
    throw error;
  }
};


export const requestCaption = async (file) => {

  const imageBlob = file instanceof Blob
    ? file
    : await fetch(file).then(r => r.blob());

  const formData = new FormData();
  formData.append('file', imageBlob);

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/llm_router/generate_caption/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.caption);
  } catch (error) {
    console.log('Error uploading image: ' + error.message);
  }
};