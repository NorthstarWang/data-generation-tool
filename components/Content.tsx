import React, { useState, useRef } from "react";
import Graph from "./Graph";
import Table from "./Table";
import Notification from "./Notification";
import { CSVLink } from "react-csv";
import { invoke } from "@tauri-apps/api";

export default function Content() {
  const [dptId, setDptId] = useState("");
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [generatedPoints, setGeneratedPoints] = useState<Keypoint[]>([]);
  const [graphKeypoints, setGraphKeypoints] = useState<Keypoint[]>([]);
  const [show, setShow] = useState(false); 
  const [formData, setFormData] = useState({
    time_interval: "",
  });
  const [errorNotification, setErrorNotification] = useState("");

  const intervalRef = useRef<HTMLInputElement>(null);  // Specify HTMLInputElement as the generic type

  const handleSettingInput = (e: any) => {
    e.preventDefault();
    if (intervalRef.current) {
      const value = intervalRef.current?.value;
      const parsedValue = parseInt(value, 10);
      if (Number.isInteger(parsedValue) && parsedValue > 0) {
        setFormData((prevState) => ({
          ...prevState,
          time_interval: parsedValue.toString(),
        }));
      } else {
        setErrorNotification("Time interval must be a positive integer larger than 0!");
        setShow(true);
      }
    }
  };

  const clearGraph = () => {
    setKeypoints([]);
    setGraphKeypoints([]);
    setGeneratedPoints([]);
  };

  const addKeypoint = (e: any) => {
    e.preventDefault();
    const timestampInput = document.getElementById(
      "timestamp"
    ) as HTMLInputElement;
    const payloadInput = document.getElementById("payload") as HTMLInputElement;

    if (Number.isNaN(payloadInput.value)) {
      setErrorNotification("Payload must be a number!");
      setShow(true);
      return;
    }
    if (timestampInput.value.trim() === "" || payloadInput.value.trim() === "") {
      setErrorNotification("Timestamp and payload cannot be empty!");
      setShow(true);
      return;
    }
    
    const timestamp = Math.max(0, Math.floor(Number(timestampInput.value)));

    if (timestamp !== Number(timestampInput.value)) {
      setErrorNotification("Timestamp must be a non-negative integer!");
      setShow(true);
      return;
    }

    const payload = Number(payloadInput.value);

    const existingKeypointIndex = keypoints.findIndex(
      (keypoint) => keypoint.timestamp === timestamp
    );
    let updatedKeypoints;
    if (existingKeypointIndex !== -1) {
      updatedKeypoints = [...keypoints];
      updatedKeypoints[existingKeypointIndex] = { timestamp, payload };
    } else {
      updatedKeypoints = [...keypoints, { timestamp, payload }];
    }
    
    updatedKeypoints.sort((a, b) => a.timestamp - b.timestamp);
    setKeypoints(updatedKeypoints);
  };

  const interpolatePoints = () => {
    if (typeof window !== "undefined" && keypoints.length >= 2) {
      const tauri: any = window.__TAURI__;
      tauri
        .invoke("interpolate_cubic", {
          keypoints: keypoints,
          interval: parseFloat(formData.time_interval),
        })
        .then((res: Keypoint[]) => {
          res.sort((a, b) => a.timestamp - b.timestamp);
          setGeneratedPoints(res);
        });
    }
  };

  const generateGraph = () => {
    if (formData.time_interval === "") {
      setErrorNotification("You need to apply setting for time interval first!");
      setShow(true);
    }else if(keypoints.length < 2){
      setErrorNotification("You need to have at least 2 keypoints first!");
      setShow(true);
    } else {
      interpolatePoints();
      setGraphKeypoints(keypoints);
    }
  }

  const removeKeypoint = (index: number) => {
    const updatedKeypoints = [...keypoints];
    updatedKeypoints.splice(index, 1);
    updatedKeypoints.sort((a, b) => a.timestamp - b.timestamp);
    setKeypoints(updatedKeypoints);
  };

  return (
    <div className="mx-auto flex w-full h-full max-h-full max-w-full items-start gap-x-8 py-10 px-8 overflow-hidden">
      {show && <Notification show={show} setShow={setShow} error={errorNotification}/>}
      <aside className="flex flex-col max-w-xs border-r border-gray-200 dark:border-gray-700 pr-8 h-full">
        <div className="flex-grow overflow-y-auto">
          <form>
            <div className="flex-grow">
              <div className="p-6 px-4 py-5">
                <h4 className="block text-sm font-medium leading-6">
                  Set Time Interval
                </h4>
                <div className="mt-2 -space-y-px rounded-md shadow-sm">
                  <div className="flex -space-x-px">
                    <div className="flex-1">
                      <label htmlFor="timestamp" className="sr-only">
                        Time interval
                      </label>
                      <input
                        type="number"
                        name="time_interval"
                        id="time_interval"
                        min="1"
                        step="1"
                        className="relative block w-full rounded-md border-0 bg-transparent py-1.5 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-gray-900 dark:focus:ring-white text-sm leading-6"
                        placeholder="Time Interval"
                        ref={intervalRef}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 px-4 py-5 flex items-center justify-end gap-x-6">
                <button
                  type="button"
                  className="text-sm font-semibold leading-6"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  onClick={handleSettingInput}
                  className="rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-gray-300 dark:bg-white/10"
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </form>

          <form>
            <div className="p-6 px-4 py-5">
              <h4 className="block text-sm font-medium leading-6">
                Add Keypoint
              </h4>
              <div className="mt-2 -space-y-px rounded-md shadow-sm">
                <div className="flex -space-x-px">
                  <div className="w-1/2 min-w-0 flex-1">
                    <label htmlFor="timestamp" className="sr-only">
                      Timestamp
                    </label>
                    <input
                      type="number"
                      name="timestamp"
                      id="timestamp"
                      min="0"
                      step="1"
                      className="relative block w-full rounded-none rounded-l-md border-0 bg-transparent py-1.5 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-gray-900 dark:focus:ring-white text-sm leading-6"
                      placeholder="Timestamp"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label htmlFor="payload" className="sr-only">
                      Payload
                    </label>
                    <input
                      type="number"
                      name="payload"
                      id="payload"
                      className="relative block w-full rounded-none rounded-r-md border-0 bg-transparent py-1.5 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-gray-600 dark:focus:ring-white text-sm leading-6"
                      placeholder="Payload"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 px-4 py-5 flex items-center justify-end gap-x-6">
              <button type="button" className="text-sm font-semibold leading-6">
                Clear
              </button>
              <button
                onClick={addKeypoint}
                className="rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-gray-300 dark:bg-white/10"
              >
                Add Keypoint
              </button>
            </div>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <div className="rounded-lg">
          <div className="p-6 px-4 py-5">
            <Graph keypoints={graphKeypoints} generatedPoints={generatedPoints} />
          </div>
          <div className="px-4 py-3 flex justify-between">
            <button onClick={clearGraph} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Clear Graph
            </button>
            <button onClick={generateGraph} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Generate Graph
            </button>
            <CSVLink data={generatedPoints} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Export Graph
            </CSVLink>
          </div>
        </div>
      </div>

      <aside className="flex flex-col flex-shrink-0 flex-grow-0 w-200 border-l border-gray-200 dark:border-gray-700 pl-8 h-full">
        <div className="flex-grow overflow-y-hidden">
          <Table keypoints={keypoints} removeKeypoint={removeKeypoint} />
        </div>
      </aside>
    </div>
  );
}
