import numpy as np
from scipy.interpolate import CubicSpline

def interpolate(keypoints, interval):
    timestamps, payloads = zip(*keypoints)
    cs = CubicSpline(timestamps, payloads)
    new_timestamps = np.arange(min(timestamps), max(timestamps) + interval, interval)
    new_payloads = cs(new_timestamps)
    new_payloads_clamped = np.clip(new_payloads, 0, None)
    return list(zip(new_timestamps, new_payloads_clamped))
