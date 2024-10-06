import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

// Register required components for chart.js
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const AreaChart = ({ data }) => {
  // Format data before passing to the chart
  const formattedData = formatData(data);

  // Extracting the formatted ds and yhat for the chart
  const labels = formattedData.map(item => item.ds); // Dates
  const yhatData = formattedData.map(item => parseFloat(item.yhat)); // Yhat values

  // Chart.js data configuration
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Yhat Values',
        data: yhatData,
        backgroundColor: 'rgba(75,192,192,0.2)', // Light fill color for the area
        borderColor: 'rgba(75,192,192,1)', // Line color
        borderWidth: 2,
        fill: true, // To create an area chart
      },
    ],
  };

  // Chart.js options
  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Yhat',
        },
        ticks: {
          beginAtZero: true,
        },
      },
    },
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Yhat: ${tooltipItem.raw.toFixed(4)}`;
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

// Helper function to format the data
const formatData = (data) => {
  return data.map(item => ({
    ds: new Date(item.ds).toLocaleDateString('en-GB'), // Convert date to dd/mm/yyyy format
    yhat: parseFloat(item.yhat).toFixed(4) // Round to 4 decimal places
  }));
};

export default AreaChart;
