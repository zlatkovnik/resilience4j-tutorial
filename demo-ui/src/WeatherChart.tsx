import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

interface WeatherRecord {
  hour: string;
  temp: number;
}

interface WeatherChartProps {
  resilience: boolean;
}

function WeatherChart({ resilience }: WeatherChartProps) {
  const [data, setData] = useState<WeatherRecord[]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/weather/${resilience ? 'resilience' : 'regular'}`);
      const csvLines: string = await response.text();

      const parsedData = csvLines
        .split('\n')
        .filter(line => line.includes(',') && !line.startsWith('City'))
        .map(line => {
          const [, hour, temp] = line.split(',');
          return { hour: hour + 'h', temp: parseFloat(temp) };
        });

      setData(parsedData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const fetchErrorCount = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/weather/error/${resilience ? 'resilience' : 'regular'}`);
      const csvLines: string = await response.text();
      
      // Count the number of lines (excluding header)
      const lines = csvLines.split('\n').filter(line => line.trim() && !line.startsWith('Timestamp'));
      setErrorCount(lines.length);
    } catch (error) {
      console.error("Error fetching error data:", error);
      setErrorCount(0);
    }
  };

  useEffect(() => {
    fetchData();
    fetchErrorCount();
    const interval = setInterval(() => {
      fetchData();
      fetchErrorCount();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: data.map(d => d.hour),
    datasets: [
      {
        label: `Niš Temperature (°C)`,
        data: data.map(d => d.temp),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
        pointRadius: 3,
        segment: {
          borderColor: (ctx: { p0DataIndex: number }) => {
            const index = ctx.p0DataIndex;
            const current = data[index];
            const next = data[index + 1];
            
            if (!current || !next) return 'rgb(53, 162, 235)';
            
            // Parse hour values (remove 'h' suffix)
            const currentHour = parseFloat(current.hour.replace('h', ''));
            const nextHour = parseFloat(next.hour.replace('h', ''));
            
            // Calculate difference
            const diff = Math.abs(nextHour - currentHour);
            
            // If difference is more than 0.5 hours, make it red
            return diff > 0.5 ? 'rgb(239, 68, 68)' : 'rgb(53, 162, 235)';
          }
        }
      },
    ],
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, color: '#1a1a1a' }}>{resilience ? "Resilience" : "Regular"}</h2>
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, animation: { duration: 0 } }} />
      </div>
      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '14px', color: '#1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgb(53, 162, 235)' }}></div>
          <span><strong>Success:</strong> {data.length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgb(239, 68, 68)' }}></div>
          <span><strong>Errors:</strong> {errorCount}</span>
        </div>
        <div>
          <strong>Total:</strong> {data.length + errorCount}
        </div>
      </div>
    </div>
  );
}

export default WeatherChart;
