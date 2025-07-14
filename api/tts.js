const textToSpeech = require('@google-cloud/text-to-speech');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const client = new textToSpeech.TextToSpeechClient({ credentials });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Only allow POST
  }

  const text = req.body.text || '기본 테스트 문장입니다.';

  try {
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-B' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    const audioBase64 = response.audioContent.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
    res.status(200).json({ audioUrl });
  } catch (error) {
    console.error('TTS 오류:', error);
    res.status(500).json({ error: 'TTS 처리 실패' });
  }
}
