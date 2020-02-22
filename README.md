# Joint Recorder and Viewer for Kinect Azure
Desktop application for viewing and recording joints with Azure Kinect built with [electron](https://www.electronjs.org/). 

Download release [here](https://github.com/js6450/kinect-joint-recorder/releases).

## Requirements
* Windows OS
* [Azure Kinect sensor SDK](https://docs.microsoft.com/en-us/azure/kinect-dk/sensor-sdk-download) and [Body Tracking SDK](https://docs.microsoft.com/en-us/azure/kinect-dk/body-sdk-download)

## Dependencies
* Electron
* [Kinect-Azure npm module](https://www.npmjs.com/package/kinect-azure)

## Development & Compilation
### Installing dependencies
```
npm install
```
### Building
```
npm install electron-packager
npm run package
```

## Functionality

Supports multi-body view and record of joint information using Azure Kinect. Joint information can be exported as txt files which contains JSON objects. Canvas feed can be recorded as .mp4 videos.

* View Modes:
  * Joint Mode: Can view joints and connections of joints in simple ellipses and lines. 
  * Paint Mode: Can view trackes of joint movements with variations of color and size depending on speed of movement
* Saving Joints:
  * Saves JSON objects per body dectected as .txt file
* Load Saved Joints:
  * Can load .txt file that was previously saved to view
* Rendering Video:
  * Saves preview feed (canvas element) as .mp4 video file
