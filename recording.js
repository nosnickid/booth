class Recorder {
  constructor(canvas, stopRecordingCallback) {
    this.canvas = canvas;
    this.stream = this.canvas.captureStream();
    this.chunks = []
    this.mediaRecorder = new MediaRecorder(this.stream, {mimeType: 'video/webm;codecs=vp9'});
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      } else {
        console.log("got mediaRecorder event with no data", event);
      }
    }
    this.mediaRecorder.onstop = stopRecordingCallback;
  }
  
  blob() {
    return new Blob(this.chunks, {
      type: 'video/webm'
    });    
  }
  
  clearRecording() {
    this.chunks = [];
  }
  
  startRecording() {
    this.mediaRecorder.start();
  }

  finishRecording() {
    this.mediaRecorder.stop();
  }
}


function makeRecording(canvas) {
  let stream = canvas.captureStream();
  let recordedChunks = [];
 
  let options = {mimeType: 'video/webm;codecs=vp9'};
  let mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = function(event) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    } else {
      console.log("got mediaRecorder event with no data", event);
    }
  }
  function download() {
    var blob = new Blob(recordedChunks, {
      type: 'video/webm'
    });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'test.webm';
    a.click();
    window.URL.revokeObjectURL(url);
    // TODO delete the a element
  }
  mediaRecorder.onstop = download;
  mediaRecorder.start();
  setTimeout(() => {
    mediaRecorder.stop();
  }, 1000);
}