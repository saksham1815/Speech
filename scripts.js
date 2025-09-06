function populateVoiceList() {
  if (typeof speechSynthesis === "undefined") return;

  const voices = speechSynthesis.getVoices();
  const voiceSelect = document.getElementById("voice");
  voiceSelect.innerHTML = "";

  const groupedVoices = voices.reduce((acc, voice) => {
    if (!acc[voice.lang]) acc[voice.lang] = [];
    acc[voice.lang].push(voice);
    return acc;
  }, {});

  for (const lang in groupedVoices) {
    const optgroup = document.createElement("optgroup");
    optgroup.label = lang;
    groupedVoices[lang].forEach((voice) => {
      const option = document.createElement("option");
      option.textContent = `${voice.name} (${voice.lang})`;
      option.setAttribute("data-name", voice.name);
      optgroup.appendChild(option);
    });
    voiceSelect.appendChild(optgroup);
  }
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Speech Recognition
function startRecognition() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Your browser doesn't support Speech Recognition. Use Chrome.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = function (event) {
    let interimTranscript = "";
    let finalTranscript = "";
    for (let i = 0; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    document.getElementById("speech-bubble").innerText = interimTranscript;
    document.getElementById("result").innerText = finalTranscript;
  };

  recognition.onerror = function (event) {
    alert("Error: " + event.error);
  };

  recognition.onend = function () {
    document.getElementById("speech-bubble").style.display = "none";
  };

  document.getElementById("speech-bubble").style.display = "block";
  recognition.start();
}

let utterance;
let mediaRecorder;
let chunks = [];

function speakText() {
  const resultText = document.getElementById("result").innerText;
  const inputText = document.getElementById("text-to-speak").value;
  let textToSpeak = inputText || resultText;

  if (!textToSpeak) {
    alert("No text to speak!");
    return;
  }

  utterance = new SpeechSynthesisUtterance(textToSpeak);

  utterance.pitch = parseFloat(document.getElementById("pitch").value);
  utterance.rate = parseFloat(document.getElementById("rate").value);

  const selectedOption =
    document.getElementById("voice").selectedOptions[0]?.getAttribute("data-name");
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices.find((v) => v.name === selectedOption);

  // Set up audio capture
  const audioContext = new AudioContext();
  const dest = audioContext.createMediaStreamDestination();
  const osc = audioContext.createOscillator();
  osc.connect(dest);
  osc.start();
  osc.stop(audioContext.currentTime + 0.001);

  mediaRecorder = new MediaRecorder(dest.stream, { mimeType: "audio/webm" });
  chunks = [];

  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById("downloadLink");
    downloadLink.href = url;
    downloadLink.style.display = "inline-block";
    downloadLink.download = "speech.webm";
    downloadLink.click(); // auto-download
  };

  mediaRecorder.start();

  utterance.onend = () => {
    mediaRecorder.stop();
  };

  speechSynthesis.speak(utterance);
}

function stopSpeech() {
  if (utterance) speechSynthesis.cancel();
}

function pauseSpeech() {
  if (utterance) speechSynthesis.pause();
}

function resumeSpeech() {
  if (utterance) speechSynthesis.resume();
}
