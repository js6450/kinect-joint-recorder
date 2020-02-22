const KinectAzure = require('kinect-azure');
const kinect = new KinectAzure();

const {remote} = require('electron');
dialog = remote.dialog;
win = remote.getCurrentWindow();

const fs = require('fs');

let cvs;
let savedJoints = [];
let prevJoints = [];
let joints = [];
let saveJoints = false;
let startTime = 0;
let elapsedSec = 0;
let elapsedMin = 0;

let liveMode = true;
let playBackJoints = [];
let playbackIndex = 0;

let renderMode = false;

let mode = 0;

function setup(){
    cvs = createCanvas(windowWidth * 0.8, windowHeight);
    cvs.id("kinect-feed");
    startKinect();
    background(0);
}

function draw(){

    if(!liveMode){
        if(playBackJoints.length > 0){
            try{
                joints = JSON.parse(playBackJoints[playbackIndex]);
            }catch(e){}
        }
    }

    if(mode == 0){
        background(0);
        colorMode(RGB);

        for(let j = 0; j < joints.length; j++){
            let body = joints[j];

            for(let i = 0; i < body.length; i++){
                fill(255);
                noStroke();
                ellipse(body[i].x, body[i].y, 10, 10);
                // fill(255);
                // text(i, joints[i].x, joints[i].y - 10);
            }

        }

        if(joints.length > 0){
            for(let j = 0; j < joints.length; j++){
                let body = joints[j];
                //connecting joints
                stroke(255);
                for(let i = 1; i < 4; i++){
                    line(body[i].x, body[i].y, body[i+1].x, body[i+1].y);
                }

                for(let i = 4; i < 9; i++){
                    line(body[i].x, body[i].y, body[i+1].x, body[i+1].y);
                }
                line(body[9].x, body[9].y, body[10].x, body[10].y);
                line(body[9].x, body[9].y, body[11].x, body[11].y);

                line(body[4].x, body[4].y, body[12].x, body[12].y);
                for(let i = 12; i < 16; i++){
                    line(body[i].x, body[i].y, body[i+1].x, body[i+1].y);
                }
                line(body[16].x, body[16].y, body[17].x, body[17].y);
                line(body[16].x, body[16].y, body[18].x, body[18].y);

                line(body[1].x, body[1].y, body[23].x, body[23].y);
                for(let i = 23; i < 26; i++){
                    line(body[i].x, body[i].y, body[i+1].x, body[i+1].y);
                }

                line(body[1].x, body[1].y, body[19].x, body[19].y);
                for(let i = 19; i < 22; i++){
                    line(body[i].x, body[i].y, body[i+1].x, body[i+1].y);
                }
            }
        }
    }else if(mode == 1){
        //speed
        // background(0, 1);
        colorMode(HSB, 360, 100, 100, 100);
        noStroke();

        for(let j = 0; j < joints.length; j++){
            let body = joints[j];
            for(let i = 0; i < body.length; i++){
                if(prevJoints[j]){
                    let size = dist(prevJoints[j][i].x, prevJoints[j][i].y, body[i].x, body[i].y);
                    if(size < 100){
                        if(size > 25){
                            fill(map(size, 0, 300, 180, 0), 100, 100, map(size, 0, 300, 5, 200) + 5);
                        }else{
                            fill(0, 0, 100, map(size, 0, 300, 5, 200) + 5);
                        }
                        ellipse(body[i].x, body[i].y, size / 20 + 5, size / 20 + 5);
                    }
                }
            }
        }

    }

    if(saveJoints){
        let elapsed = int((millis() - startTime) / 1000);

        if(elapsed > 59){
            elapsedMin++;
            elapsed -= 60;
        }

        elapsedSec = "00" + elapsed;
        elapsedSec = elapsedSec.substring(1);

        document.getElementById('rec').innerHTML = elapsedMin + ":" + elapsedSec;
    }

    if(!liveMode){
        try{
            prevJoints = JSON.parse(playBackJoints[playbackIndex]);
        }catch(e){}
        playbackIndex++;

        if(playbackIndex > playBackJoints.length - 1){
            playbackIndex = 0;
            clear();
            background(0);
        }
    }

    if(renderMode){
        let elapsed = int((millis() - startTime) / 1000);

        if(elapsed > 59){
            elapsedMin++;
            elapsed -= 60;
        }

        elapsedSec = "00" + elapsed;
        elapsedSec = elapsedSec.substring(1);

        document.getElementById('vid').innerHTML = elapsedMin + ":" + elapsedSec;
    }
}

function windowResized() {
    resizeCanvas(windowWidth * 0.8, windowHeight);
}

function resetMode(num){
    mode = num;
    cvs.clear();
    cvs.background(0);

    if(mode == 0){
        document.getElementById('view').innerHTML = "Joints";
    }else{
        document.getElementById('view').innerHTML = "Painting";
    }
}

function startRec(){
    if(renderMode){
        alert("A video is currently being rendered. Try after stopping render.");
    }else{
        startTime = millis();
        saveJoints = true;

        liveMode = true;
    }
}

const startKinect = () => {
    if(kinect.open()) {
        kinect.startCameras({
            depth_mode: KinectAzure.K4A_DEPTH_MODE_NFOV_UNBINNED
        });
        depthModeRange = kinect.getDepthModeRange(KinectAzure.K4A_DEPTH_MODE_NFOV_UNBINNED);
        kinect.createTracker();

        //fix for multiple bodies

        kinect.startListening((data) => {
            if (data.bodyFrame.bodies) {
                if(liveMode){
                    if(saveJoints && joints.length > 0){
                        savedJoints.push(joints);
                    }
                    prevJoints = joints;
                    joints = [];
                    data.bodyFrame.bodies.forEach(body => {
                        let currentBody = [];
                        body.skeleton.joints.forEach(joint => {
                            currentBody.push({
                                x: joint.colorX,
                                y: joint.colorY
                            })
                        });
                        joints.push(currentBody);
                    });
                }
            }
        });
    }
};

let filePaths;
let mediaRecorder;
let mediaChunks = [];

function renderVideo(){

    if(saveJoints){
        alert("Joints are currently being saved. Try after stopping save.");
    }else {
        renderMode = true;

        startTime = millis();

        mediaRecorder = new MediaRecorder(document.getElementById('kinect-feed').captureStream(), {
            type: "video/mp4",
            videoBitsPerSecond: 2500000
        });

        mediaRecorder.onstop = function (e) {
            let blob = new Blob(mediaChunks);

            mediaChunks.length = 0;

            dialog.showSaveDialog({
                title: "Save render video",
                filters: [{name: "all files", ext: ["*"]}], // what kind of files do you want to see when this box is opend
                defaultPath: "C:\\" // the default path to save file
            }).then(result => {

                if(result.filePath.length > 0){
                    filePaths = result.filePath + ".mp4";

                    let reader = new FileReader();
                    reader.addEventListener("loadend", function (e) {
                        let videoBuffer = new Buffer(reader.result);

                        fs.writeFile(filePaths, videoBuffer, function (err) {
                            if (err) throw err;

                            alert("video file has been saved to " + filePaths);
                        })
                    }, false);

                    reader.readAsArrayBuffer(blob);
                }else{
                    alert("Cannot save file. Inappropriate file name has been entered.");
                }
            });
        };

        mediaRecorder.ondataavailable = function (e) {
            mediaChunks.push(e.data);
        };

        mediaRecorder.start();
    }
}

function stopRender(){
    renderMode = false;
    document.getElementById('vid').innerHTML = "Not Recording"

    mediaRecorder.stop();
}

function saveToFile(){
    if(saveJoints && savedJoints.length > 0){
        saveJoints = false;
        document.getElementById('rec').innerHTML = "Not Saving";

        dialog.showSaveDialog( {
            title: "Save joint info",
            filters: [ { name:"text files", ext: [ ".txt" ] } ], // what kind of files do you want to see when this box is opend
            defaultPath:"C:\\" // the default path to save file
        }).then(result => {

            if(result.filePath.length > 0){
                filePaths = result.filePath + ".txt";

                let content = "";

                for(let i = 0; i < savedJoints.length; i++){
                    content += JSON.stringify(savedJoints[i]) + "\n";
                }

                fs.writeFile(filePaths, content, function(err){
                    if(err) throw err;
                    alert("Joint information has been saved to " + filePaths);

                    savedJoints = [];
                })
            }else{
                alert("Cannot save file. Inappropriate file name has been entered.");
            }

        });
    }else{
        alert("There are no joint information to be saved.");
    }
}

let content = "";

function openSaved(){

    playBackJoints = [];

    dialog.showOpenDialog( {
        title: "Select joint info",
        filters: [ { name:"all files", ext: [ "*" ] } ], // what kind of files do you want to see when this box is opend
        defaultPath:"C:\\" // the default path to save file
    }).then(result => {

        if(result.filePaths[0] == null){
            alert("Please select an appropriate file.");
            liveMode = true;

            return;
        }

        liveMode = false;
        document.getElementById('play').innerHTML = "Playback";

        fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
            if(err){
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            // Change how to handle the file content
            content = data;
            playBackJoints = data.split('\n');
        });
    });
}

// expose the kinect instance to the window object in this demo app to allow the parent window to close it between sessions
window.kinect = kinect;
