import React, { useState, useEffect } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GraphProps {
  keypoints: Keypoint[];
}

export default function Graph({ keypoints }: GraphProps) {
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [payloads, setPayloads] = useState<number[]>([]);

  useEffect(() => {
    const sortedKeypoints = keypoints.sort((a, b) => a.timestamp - b.timestamp);

    const timestamps = sortedKeypoints.map((keypoint) =>
      Math.max(0, Math.floor(keypoint.timestamp))
    );
    const payloads = sortedKeypoints.map((keypoint) => keypoint.payload);

    setTimestamps(timestamps);
    setPayloads(payloads);
  }, [keypoints]);

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: "Payload",
        data: payloads,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
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
          let ctx = chart.ctx;
          let width = chart.width;
          let height = chart.height;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "30px Arial";
          ctx.fillText("Please add keypoints", width / 2, height / 2);
          ctx.restore();
        }
      },
    },
  ];

  return (
    <div className="h-full w-full rounded-md overflow-hidden">
      <Line
        data={data}
        options={options}
        plugins={plugins}
        className="h-full w-full"
      />
    </div>
  );
}
