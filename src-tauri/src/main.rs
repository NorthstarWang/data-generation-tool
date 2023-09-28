// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
extern crate splines;

use splines::{ Interpolation, Spline };
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

fn main() {
    tauri::Builder
        ::default()
        .invoke_handler(tauri::generate_handler![interpolate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize, Deserialize)]
struct Keypoint {
    timestamp: f64,
    payload: f64,
}

struct Interpolator {
    cache: HashMap<f64, f64>,
}

fn new_interpolator() -> Interpolator {
    Interpolator {
        cache: HashMap::new(),
    }
}

#[tauri::command]
fn interpolate(
    keypoints: &[Keypoint],
    interval: f64
) -> Result<Vec<Keypoint>, Box<dyn std::error::Error>> {
    let mut points = Vec::new();
    let mut spline = Spline::from_iter(
        keypoints.iter().map(|keypoint| (keypoint.timestamp, keypoint.payload)),
        Interpolation::CatmullRom
    );
    let start_timestamp = keypoints[0].timestamp;
    let end_timestamp = keypoints[keypoints.len() - 1].timestamp;
    let num_points = ((end_timestamp - start_timestamp) / interval).ceil() as usize;
    let mut cache = HashMap::new();
    for j in 0..num_points {
        let timestamp = start_timestamp + interval * (j as f64);
        let payload = if cache.contains_key(&timestamp) {
            *cache.get(&timestamp).unwrap()
        } else {
            let payload = spline.clamped_sample(timestamp).unwrap().max(0.0);
            cache.insert(timestamp, payload);
            payload
        };
        points.push(Keypoint { timestamp, payload });
    }
    Ok(points)
}
