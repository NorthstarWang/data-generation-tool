import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Keypoint {
  timestamp: number;
  payload: number;
}

interface GraphProps {
  keypoints: Keypoint[];
  generatedPoints: Keypoint[];
}

export default function Graph({ keypoints, generatedPoints }: GraphProps) {
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [payloads, setPayloads] = useState<number[]>([]);
  const { theme } = useTheme();
  const themeRef = useRef(theme); // Create a ref to store the theme value

  const pointColors = useMemo(() => {
    const colors = [];
    for (const point of generatedPoints) {
      if (
        keypoints.some(
          (kp) =>
            kp.timestamp === point.timestamp && kp.payload === point.payload
        )
      ) {
        colors.push("red");
      } else {
        colors.push("blue");
      }
    }
    return colors;
  }, [keypoints, generatedPoints]);

  useEffect(() => {
    themeRef.current = theme; // Update the ref value whenever the theme changes
  }, [theme]);

  useEffect(() => {
    const sortedGeneratedPoints = generatedPoints.sort(
      (a, b) => a.timestamp - b.timestamp
    );

    const timestamps = sortedGeneratedPoints.map((point) =>
      Math.max(0, Math.floor(point.timestamp))
    );
    const payloads = sortedGeneratedPoints.map((point) => point.payload);

    setTimestamps(timestamps);
    setPayloads(payloads);
  }, [generatedPoints]);

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: "Payload",
        data: payloads,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        pointBackgroundColor: pointColors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        min: timestamps[0],
        max: timestamps[timestamps.length - 1],
        ticks: {
          source: "auto",
          autoSkip: true,
          precision: 0,
        },
      },
      y: {
        type: "linear",
        position: "left",
        min: Math.min(...payloads),
        max: Math.max(...payloads),
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Payload vs. Timestamp",
      },
      legend: {
        display: false,
      },
    },
  };

  const plugins = [
    {
      afterDraw: function (chart: any) {
        if (chart.data.datasets[0].data.length < 2) {
          let isDark = themeRef.current === "dark"; // Use the ref value here
          let ctx = chart.ctx;
          let width = chart.width;
          let height = chart.height;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "30px Arial";
          ctx.fillStyle = isDark ? "white" : "black";
          ctx.fillText("Please add keypoints", width / 2, height / 2);
          ctx.restore();
        }
      },
    },
  ];

  return (
    <div className="h-[70vh] w-full rounded-md overflow-hidden">
      <Line
        data={data}
        options={options as any}
        plugins={plugins as any}
        className="h-full w-full"
      />
    </div>
  );
}
