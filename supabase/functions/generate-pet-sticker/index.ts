const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  const endpoint = Deno.env.get('STICKER_AI_ENDPOINT');
  const apiKey = Deno.env.get('STICKER_AI_API_KEY');
  if (!endpoint || !apiKey) {
    return new Response(JSON.stringify({ error: 'Sticker AI service is not configured' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 501,
    });
  }

  const form = await request.formData();
  const image = form.get('image');
  if (!(image instanceof File)) {
    return new Response(JSON.stringify({ error: 'Missing image file' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  const upstreamForm = new FormData();
  upstreamForm.append('image', image, image.name);
  const upstream = await fetch(endpoint, {
    body: upstreamForm,
    headers: { Authorization: `Bearer ${apiKey}` },
    method: 'POST',
  });

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: 'Sticker AI service failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 502,
    });
  }

  const resultBlob = await upstream.blob();
  return new Response(JSON.stringify({ imageBase64: await blobToBase64(resultBlob) }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
