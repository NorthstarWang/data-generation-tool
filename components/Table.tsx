import React from "react";

interface TableProps {
  keypoints: Keypoint[];
  removeKeypoint: (index: number) => void;
}

export default function Table({ keypoints, removeKeypoint }: TableProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-0"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Payload
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keypoints.map((keypoint, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                      {keypoint.timestamp}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-200">
                      {keypoint.payload}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      <button
                        type="button"
                        onClick={() => removeKeypoint(index)}
                        className="rounded-md bg-gray-300 dark:bg-white/10 px-3.5 py-2.5 text-sm font-semibold shadow-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
