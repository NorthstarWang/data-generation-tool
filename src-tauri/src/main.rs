#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
extern crate splines;
extern crate cubic_spline;

use splines::{ Interpolation, Key, Spline };
use serde::{ Serialize, Deserialize };
use std::collections::HashMap;
use std::error::Error;
use std::fmt;
use cubic_spline::{ Points, SplineOpts };

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

fn main() {
    tauri::Builder
        ::default()
        .invoke_handler(tauri::generate_handler![interpolate_cosine])
        .invoke_handler(tauri::generate_handler![interpolate_cubic])
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
    let source: Vec<(f64, f64)> = keypoints.iter().map(|kp| (kp.timestamp, kp.payload)).collect();
    let opts = SplineOpts::new();

    let points = <Points as cubic_spline::TryFrom<Vec<(f64, f64)>>>::try_from(source).map_err(|_| MyError(String::from("Invalid points")))?;

    let max_timestamp = keypoints.iter().map(|kp| kp.timestamp).fold(f64::NEG_INFINITY, f64::max);
    let min_timestamp = keypoints.iter().map(|kp| kp.timestamp).fold(f64::INFINITY, f64::min);
    let total_duration = max_timestamp - min_timestamp;

    let segments = (total_duration / interval).ceil() as u32;
    println!("segments: {:?}", segments);

    let calculated_points = points.calc_spline(&opts.num_of_segments(segments)).map_err(|_| MyError(String::from("Can't construct spline points")))?;

    let result = calculated_points.into_inner().into_iter().map(|point| {
        Keypoint { timestamp: point.x, payload: point.y }
    }).collect();

    Ok(result)
}








