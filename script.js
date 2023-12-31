let _speechSynth
let _voices
const _cache = {}

/**
 * retries until there have been voices loaded. No stopper flag included in this example. 
 * Note that this function assumes, that there are voices installed on the host system.
 */

function loadVoicesWhenAvailable (onComplete = () => {}) {
  _speechSynth = window.speechSynthesis
  const voices = _speechSynth.getVoices()

  if (voices.length !== 0) {
    _voices = voices
    onComplete()
  } else {
    return setTimeout(function () { loadVoicesWhenAvailable(onComplete) }, 100)
  }
}

/**
 * Returns the first found voice for a given language code.
 */

function getVoices (locale) {
  if (!_speechSynth) {
    throw new Error('Browser does not support speech synthesis')
  }
  if (_cache[locale]) return _cache[locale]

  _cache[locale] = _voices.filter(voice => voice.lang === locale)
  return _cache[locale]
}

/**
 * Speak a certain text 
 * @param locale the locale this voice requires
 * @param text the text to speak
 * @param onEnd callback if tts is finished
 */

function playByText (locale, text, onEnd) {
  const voices = getVoices(locale)

  // TODO load preference here, e.g. male / female etc.
  // TODO but for now we just use the first occurrence
  const utterance = new window.SpeechSynthesisUtterance()
  utterance.voice = voices[0]
  utterance.pitch = 1
  utterance.rate = 1
  utterance.voiceURI = 'native'
  utterance.volume = 1
  utterance.rate = 1
  utterance.pitch = 0.8
  utterance.text = text
  utterance.lang = locale

  if (onEnd) {
    utterance.onend = onEnd
  }

  _speechSynth.cancel() // cancel current speak, if any is running
  _speechSynth.speak(utterance)
}

// on document ready
loadVoicesWhenAvailable(function () {
 console.log("loaded") 
})

function speak () {
  setTimeout(() => playByText("en-US", "Hello, world"), 300)
}

let open_ai_response;

let conversation = [
  { role: "user", content: "hi" },
  { role: "assistant", content: "Hi, how can I help you today" },
];

async function conversationsUserAdd(question, sentiment) {
  conversation.push({
    role: "user",
    content:
      "My happiness out of 10: " + sentiment + "." + "my input is: " + question,
  });
}

async function conversationAssistantAdd(response) {
  conversation.push({ role: "assistant", content: response });
}

async function openai_test() {

  var url = "https://api.openai.com/v1/chat/completions";
  let part1 = "sk";
  let part2 = "-FwTAQ8hQ31W8irBwTpMXT3BlbkFJ";
  let part3 = "tqFgcpK3EZmVIOsoPEKV";

  let allParts = part1 + part2 + part3;

  var data = {
    model: "gpt-3.5-turbo",
    messages: conversation,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-Type": "application/json",
        Authorization: `Bearer ${allParts}`,
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const responseData = await response.json();
      const message = responseData.choices[0].message.content;
      conversationAssistantAdd(message);

      // const utterance = new SpeechSynthesisUtterance(message);
      // speechSynthesis.speak(utterance);
      setTimeout(() => playByText("en-US", message), 300)

      return message;
    }
    ///
    else {
      console.log("request failed with status :", response.status);
    }
    ///
  }
  catch (error) {
    console.log("an error occured:", error);
  }
}
