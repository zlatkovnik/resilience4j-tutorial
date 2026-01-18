import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import WeatherChart from './WeatherChart';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '100%' }}>
      <h1>Weather Monitoring System</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
        <WeatherChart resilience={true} />
        <WeatherChart resilience={false} />
      </div>
      <p style={{ marginTop: '20px' }}>Updating live from <code>weather_data.csv</code> every 5 seconds.</p>
    </div>
  );
}

export default App;