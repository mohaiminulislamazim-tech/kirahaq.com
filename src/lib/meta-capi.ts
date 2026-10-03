
export async function sendMetaConversionEvent(
  pixelId: string,
  accessToken: string,
  event: any
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [event] }),
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Meta CAPI Error:', error);
    return null;
  }
}
