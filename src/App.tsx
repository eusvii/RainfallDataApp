import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Spinner } from "./components/ui/spinner";

function App() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateRange, setDateRange] = useState({ min_date: "", max_date: "" });
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = (date: string) => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/rainfall?date=${date}`)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      fetchData(date);
    }
  };

  const formatTime = (timestamp: any): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatTimeWithLabel = (timestamp: any): string => {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return `Time: ${time}`;
  };

  const hourlyTicks = data
    .filter((_: any, index: number) => index % 4 === 0)
    .map((item: any) => item.timestamp);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/rainfall/daterange")
      .then((response) => {
        const minDate = response.data.min_date.split("T")[0];
        const maxDate = response.data.max_date.split("T")[0];
        setDateRange({ min_date: minDate, max_date: maxDate });
        setSelectedDate(minDate);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchData(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/location")
      .then((response) => {
        setLocation(`${response.data.city}, ${response.data.country}`);
      })
      .catch((err) => console.error(err));
  });

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#171717]">
        <Spinner className="size-10 text-white" />
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen bg-[#171717] text-white">
        Error: {error}
      </div>
    );

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#171717]">
        <div className="container-md">
          <div className="mb-2 flex justify-center">
            <h1 className="text-2xl text-[#8884d8]">Rainfall Data</h1>
          </div>
          <div className="mb-2 flex w-full items-center justify-center">
            <label className="text-white">Select Date: </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={dateRange.min_date}
              max={dateRange.max_date}
              className="p-3 text-white scheme-dark"
            />
          </div>
          <div className="mb-3 w-full text-end">
            <FontAwesomeIcon icon={faLocationDot} color="#8884d8" />
            <span className="text-[#8884d8]">{location}</span>
          </div>
          <div>
            <LineChart width={1200} height={600} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                angle={-30}
                textAnchor="start"
                height={30}
                interval={0}
                ticks={hourlyTicks}
                stroke="white"
                label={{
                  value: "Time (Hourly)",
                  position: "insideBottom",
                  offset: -40,
                  fill: "#fff"
                }}
              />
              <YAxis
                padding={{ bottom: 30 }}
                stroke="white"
                label={{
                  value: "Rainfall (mm)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#fff"
                }}
              />
              <Tooltip
                labelFormatter={formatTimeWithLabel}
                formatter={(value: any) => [
                  `${Number(value).toFixed(2)} mm`,
                  "RG_A"
                ]}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px"
                }}
                iconType="line"
                verticalAlign="bottom"
                align="left"
                layout="horizontal"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                name="Rainfall at Rain Gauge A (mm)"
              />
            </LineChart>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
