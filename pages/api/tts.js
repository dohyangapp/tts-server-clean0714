// 👇 꼭 최상단에 위치해야 합니다.
export const config = {
  runtime: 'nodejs',
};

import textToSpeech from '@google-cloud/text-to-speech';

// JSON 형식의 인증 정보 직접 삽입 (private_key는 반드시 \n을 문자열로 유지)
const credentialsJson = {
  type: "service_account",
  project_id: "aroma-tts",
  private_key_id: "49396c6947fc87fdbaa51c5e2826016b1e198a7c",
  private_key: "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkq...snip...\\n-----END PRIVATE KEY-----\\n",
  client_email: "firebase-adminsdk-nn9d9@aroma-tts.iam.gserviceaccount.com",
  client_id: "101673604145714991350",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-nn9d9%40aroma-tts.iam.gserviceaccount.com"
};

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: '텍스트가 제공되지 않았습니다.' }),
        { status: 400 }
      );
    }

    const client = new textToSpeech.TextToSpeechClient({
      credentials: {
        client_email: credentialsJson.client_email,
        private_key: credentialsJson.private_key,
      },
      projectId: credentialsJson.project_id,
    });

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-B' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    const audioContent = response.audioContent?.toString('base64');

    if (!audioContent) {
      return new Response(
        JSON.stringify({ error: 'TTS 변환 실패' }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ audioContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ 서버 에러:', error);
    return new Response(
      JSON.stringify({
        error: '서버 에러가 발생했습니다.',
        detail: error.message,
      }),
      { status: 500 }
    );
  }
}
