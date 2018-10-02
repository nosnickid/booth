class Recorder {
  constructor(canvas) {
    this.canvas = canvas;
    this.stream.CaptureStream();
    this.chunks = []
    this.options = {mimeType: 'video/webm;codecs=vp9'};
    this.mediaRecorder = new MediaRecorder(this.stream, this.options);
    this.mediaRecorder.ondataavailable = function(event) {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      } else {
        console.log("got mediaRecorder event with no data", event);
      }
    }
  }

  download(filename) {
    let blob = new Blob(this.chunks, {
      type: 'video/webm'
    });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.style = 'display: none';
    document.body.appendChild(a);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    a.parentNode.removeChild(a);
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