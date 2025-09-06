let utterance;
let mediaRecorder;
let audioChunks = [];

function speakText() {
  var resultText = document.getElementById('result').innerText;
  var inputText = document.getElementById('text-to-speak').value;

  var textToSpeak = "";

  if (inputText !== "" && resultText !== "") {
    textToSpeak = inputText + ". " + resultText;
  } else if (inputText !== "") {
    textToSpeak = inputText;
  } else if (resultText !== "") {
    textToSpeak = resultText;
  } else {
    alert("No text to speak. Please recognize or type some text first.");
    return;
  }

  utterance = new SpeechSynthesisUtterance(textToSpeak);

  // Set pitch, rate, and voice
  utterance.pitch = parseFloat(document.getElementById('pitch').value);
  utterance.rate = parseFloat(document.getElementById('rate').value);

  var voiceSelect = document.getElementById('voice');
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  var voices = speechSynthesis.getVoices();
  utterance.voice = voices.find(voice => voice.name === selectedOption);

  // --- Capture Audio ---
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  const mediaStream = destination.stream;
  
  // Connect speech synthesis to audio context
  const source = audioContext.createMediaStreamSource(mediaStream);

  mediaRecorder = new MediaRecorder(mediaStream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = audioUrl;
    downloadLink.download = "speech_output.webm";
    downloadLink.innerText = "Download Audio";
    document.body.appendChild(downloadLink);
  };

  mediaRecorder.start();

  // Stop recording when speech ends
  utterance.onend = () => {
    mediaRecorder.stop();
  };

  // Speak it
  window.speechSynthesis.speak(utterance);
}
