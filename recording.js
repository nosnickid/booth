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