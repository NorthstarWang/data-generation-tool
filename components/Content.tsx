import React, { useState } from "react";
import Graph from "./Graph";
import { invoke } from "@tauri-apps/api/tauri";

export default function Content() {

  const [dptId, setDptId] = useState("");
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [formData, setFormData] = useState({
    time_interval: "",
  });

  const [points, setPoints] = useState<Keypoint[]>([]);

  const handleSettingInput = (e: any) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addKeypoint = (e: any) => {
    e.preventDefault();
    const timestampInput = document.getElementById(
      "timestamp"
    ) as HTMLInputElement;
    const payloadInput = document.getElementById("payload") as HTMLInputElement;
    const timestamp = Math.max(0, Math.floor(Number(timestampInput.value)));
    const payload = Number(payloadInput.value);
  
    const existingKeypointIndex = keypoints.findIndex(
      (keypoint) => keypoint.timestamp === timestamp
    );
    if (existingKeypointIndex !== -1) {
      setKeypoints((prevState) => {
        const updatedKeypoints = [...prevState];
        updatedKeypoints[existingKeypointIndex] = { timestamp, payload };
        return updatedKeypoints;
      });
    } else {
      setKeypoints((prevState) => [...prevState, { timestamp, payload }]);
    }

    invoke("interpolate", {keypoints: keypoints, interval: formData.time_interval}).then((res: Keypoint[]) => {
      setPoints(res);
    });

  };

  return (
    <div className="mx-auto flex w-full h-full max-h-full max-w-7xl items-start gap-x-8 py-10 px-8">
      <aside className="flex-1 border-r border-gray-200 dark:border-gray-700 pr-8">
        <form>
          <div className="rounded-lg overflow-auto max-h-full">
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
                      onChange={handleSettingInput}
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
                type="submit"
                className="rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-gray-300 dark:bg-gray-700"
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
              className="rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-gray-300 dark:bg-gray-700"
            >
              Add Keypoint
            </button>
          </div>
        </form>
      </aside>

      <div className="flex-1">
        <div className="rounded-lg">
          <div className="p-6 px-4 py-5">
            <Graph keypoints={points}/>
          </div>
        </div>
      </div>
    </div>
  );
}
