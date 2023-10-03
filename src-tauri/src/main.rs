#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
extern crate splines;
extern crate inline_python;
extern crate pyo3;
extern crate csv;
extern crate native_dialog;

use splines::{ Interpolation, Key, Spline };
use serde::{ Serialize, Deserialize };
use std::collections::HashMap;
use std::error::Error;
use std::fmt;
use pyo3::prelude::*;
use pyo3::types::PyDict;
use native_dialog::FileDialog;
use csv::Writer;

#[derive(Debug)]
struct MyError(String);

impl fmt::Display for MyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl Error for MyError {}

impl Serialize for MyError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::Serializer {
        serializer.serialize_str(&self.0)
    }
}


impl From<pyo3::PyErr> for MyError {
    fn from(err: pyo3::PyErr) -> Self {
        MyError(format!("Python error: {}", err))
    }
}

fn main() {
    tauri::Builder
        ::default()
        .invoke_handler(tauri::generate_handler![interpolate_cosine, interpolate_cubic, export_csv])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize, Deserialize, Debug)]
struct Keypoint {
    timestamp: f64,
    payload: f64,
}

#[tauri::command]
fn interpolate_cosine(keypoints: Vec<Keypoint>, interval: f64) -> Result<Vec<Keypoint>, MyError> {
    let mut points = Vec::new();
    let keys: Vec<Key<f64, f64>> = keypoints
        .iter()
        .map(|keypoint| Key::new(keypoint.timestamp, keypoint.payload, Interpolation::Cosine))
        .collect();
    let spline = Spline::from_iter(keys.into_iter());
    let start_timestamp = (keypoints[0].timestamp * 1000.0).round() as i64;
    let end_timestamp = (keypoints[keypoints.len() - 1].timestamp * 1000.0).round() as i64;
    let num_points = (
        ((end_timestamp - start_timestamp) as f64) /
        (interval * 1000.0)
    ).ceil() as usize;
    let mut cache = HashMap::new();
    // println!("keypoints: {:?}", keypoints);
    // println!("interval: {:?}", interval);
    for j in 0..num_points + 1 {
        let timestamp = start_timestamp + ((interval * 1000.0 * (j as f64)).round() as i64);
        let payload = if cache.contains_key(&timestamp) {
            *cache.get(&timestamp).unwrap()
        } else {
            match spline.clamped_sample((timestamp as f64) / 1000.0) {
                Some(value) => {
                    let payload = value.max(0.0);
                    cache.insert(timestamp, payload);
                    payload
                }
                None => {
                    continue;
                }
            }
        };
        points.push(Keypoint { timestamp: (timestamp as f64) / 1000.0, payload });
    }
    // println!("Generated points: {:?}", points);

    Ok(points)
}

#[tauri::command]
fn interpolate_cubic(keypoints: Vec<Keypoint>, interval: f64) -> Result<Vec<Keypoint>, MyError> {
    Python::with_gil(|py| {
        let py_module = PyModule::from_code(py, include_str!("interpolate.py"), "interpolate.py", "interpolate")?;
        
        let data: Vec<(f64, f64)> = keypoints.iter().map(|kp| (kp.timestamp, kp.payload)).collect();
        
        // Prepare locals as a dictionary
        let locals = PyDict::new(py);
        locals.set_item("keypoints", data.clone())?;  // Clone data here
        locals.set_item("interval", interval)?;

        // Now call the function with the prepared locals
        let py_result: PyResult<&PyAny> = py_module
            .call_method1("interpolate", (data, interval));  // Updated this line
        
        match py_result {
            Ok(py_any) => {
                let interpolated_data: Vec<(f64, f64)> = py_any.extract()?;
                let result: Vec<Keypoint> = interpolated_data
                    .iter()
                    .map(|&(timestamp, payload)| Keypoint { timestamp, payload })
                    .collect();
                Ok(result)
            },
            Err(e) => Err(e.into()),
        }
    })
}

#[tauri::command]
fn export_csv(keypoints: Vec<Keypoint>) -> Result<(), MyError> {
    let path = FileDialog::new()
        .set_location(&std::env::current_dir().unwrap())
        .add_filter("CSV files", &["csv"])
        .show_save_single_file()
        .unwrap();

    if let Some(path) = path {
        let mut wtr = match Writer::from_path(&path) {
            Ok(writer) => writer,
            Err(e) => return Err(MyError(format!("CSV error: {}", e))),
        };

        // Write header row
        match wtr.write_record(&["timestamp", "payload"]) {
            Ok(_) => (),
            Err(e) => return Err(MyError(format!("CSV error: {}", e))),
        }

        for keypoint in &keypoints {
            match wtr.write_record(&[keypoint.timestamp.to_string(), keypoint.payload.to_string()]) {
                Ok(_) => (),
                Err(e) => return Err(MyError(format!("CSV error: {}", e))),
            }
        }

        match wtr.flush() {
            Ok(_) => (),
            Err(e) => return Err(MyError(format!("IO error: {}", e))),
        };
    }

    Ok(())
}
