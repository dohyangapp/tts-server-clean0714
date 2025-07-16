import textToSpeech from '@google-cloud/text-to-speech';

// ✅ 1. 환경변수에서 자격증명 가져오기
let credentials = null;

try {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) throw new Error('환경변수가 설정되지 않았습니다.');
  credentials = JSON.parse(raw.replace(/\\n/g, '\n'));
} catch (err) {
  console.error('❌ 자격증명 파싱 실패:', err);
}

// ✅ 2. 클라이언트 초기화
const client = new textToSpeech.TextToSpeechClient({ credentials });

// ✅ 3. API 핸들러 함수
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ✅ 안전하게 body 접근
  let text = '';
  try {
    if (typeof req.body === 'string') {
      const parsed = JSON.parse(req.body);
      text = parsed.text;
    } else {
      text = req.body.text;
    }
  } catch (err) {
    console.error('❌ JSON 파싱 실패:', err);
    return res.status(400).json({ error: '잘못된 JSON 형식입니다.' });
  }

  // ✅ 유효성 검사
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: '올바른 텍스트가 필요합니다.' });
  }

  try {
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-B' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    if (!response.audioContent) {
      throw new Error('TTS 응답이 비어 있습니다.');
    }

    const audioBase64 = response.audioContent.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
    res.status(200).json({ audioUrl });
  } catch (error) {
  console.error('❌ TTS 처리 오류:', error);
  return res.status(500).json({
    error: 'TTS 처리 실패',
    detail: error.message,
    stack: error.stack,
  });
}
