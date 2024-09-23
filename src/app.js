import OpenAI from 'openai';

let isLoadingImage = false;

// TODO: Guard this so that people cannot take our API key
const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true,
});

async function generateImage(prompt) {
  const image = await openai.images.generate({
    model: 'dall-e-3',
    prompt: 'real photo of ' + prompt,
  });

  console.log(image.data);
  return image.data[0];
}

const resultElement = document.getElementById('result');
const startBtn = document.getElementById('startBtn');
const animatedSvg = startBtn.querySelector('svg');
const stopBtn = document.getElementById('stopBtn');

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);

let recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let linebreak = document.createElement('br');

if (recognition) {
  recognition = new recognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    animatedSvg.classList.remove('hidden');
    console.log('Recording started');
  };

  recognition.onresult = async function (event) {
    let result = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const resultText = event.results[i][0].transcript;
      if (event.results[i].isFinal && resultText && !isLoadingImage) {
        isLoadingImage = true;
        resultElement.prepend(linebreak);
        let textDiv = document.createElement('div');
        textDiv.innerText = resultText;
        textDiv.style.color = 'white';
        resultElement.prepend(textDiv);

        // add image
        let img = document.createElement('img');
        console.log('==== generating image');
        img.style.height = '400px';
        img.src =
          'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHFzMDFwdzh4dHYyMWEweHAwenE4Ym5pNGtodjhnbnpld3ZqendoeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VseXvvxwowwCc/giphy.gif';
        resultElement.prepend(img);
        const imageResponse = await generateImage(resultText);
        console.log('==== imageResponse', imageResponse);
        img.src = imageResponse.url;
        isLoadingImage = false;
      }
    }

    if (result.toLowerCase().includes('stop recording')) {
      resultElement.innerText = result.replace(/stop recording/gi, '');
      stopRecording();
    }
  };

  recognition.onerror = function (event) {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    console.error('Speech recognition error:', event.error);
  };

  recognition.onend = function () {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    animatedSvg.classList.add('hidden');
    console.log('Speech recognition ended');
  };
} else {
  isLoadingImage = false;
  console.error('Speech recognition not supported');
}

function startRecording() {
  resultElement.innerText = '';
  isLoadingImage = false;
  recognition.start();
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
}
