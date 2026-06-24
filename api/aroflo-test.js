import CryptoJS from 'crypto-js';
import https from 'https';

export default async function handler(req, res) {
  const { pin, zone = 'users', page = '1', where = '' } = req.query;
  if (pin !== '7788') {
    return res.status(401).json({ error: 'Invalid PIN' });
  }

  const secret_key = (process.env.APISecretKey || '').trim();
  const uEncoded = (process.env.uEncoded || '').trim();
  const pEncoded = (process.env.pEncoded || '').trim();
  const orgEncoded = (process.env.orgEncoded || '').trim();

  if (!secret_key || !uEncoded || !pEncoded || !orgEncoded) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  const requestType = 'GET';
  const urlVarParts = [
    'zone=' + encodeURIComponent(zone),
    'page=' + encodeURIComponent(page)
  ];
  if (where) urlVarParts.splice(1, 0, 'where=' + encodeURIComponent(where));
  const urlVarString = urlVarParts.join('&');

  const isotimestamp = new Date().toISOString();
  const urlPath = '';
  const accept = 'text/json';

  // HostIP removed per AroFlo docs:
  // "IF YOU ARE USING POSTMAN WEB, DISABLE HOSTIP"
  // Vercel sends from cloud IPs, not the user's IP, so HostIP must be
  // removed from BOTH the payload AND the headers.

  const Authorization = 'uencoded=' + encodeURIComponent(uEncoded)
    + '&pencoded=' + encodeURIComponent(pEncoded)
    + '&orgEncoded=' + encodeURIComponent(orgEncoded);

  // Payload WITHOUT HostIP
  const payload = [requestType, urlPath, accept, Authorization, isotimestamp, urlVarString];
  const payloadString = payload.join('+');

  const hash = CryptoJS.HmacSHA512(payloadString, secret_key).toString();

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.aroflo.com',
      path: '/?' + urlVarString,
      method: 'GET',
      headers: {
        'Accept': accept,
        'Authentication': 'HMAC ' + hash,
        'Authorization': Authorization,
        'afdatetimeutc': isotimestamp
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
        res.status(200).json({
          ok: parsed.status === '0',
          api_status: parsed.status,
          api_message: parsed.statusmessage,
          zone,
          data: parsed.zoneresponse || parsed,
          debug: parsed.status !== '0' ? {
            payload: payloadString,
            hmac: hash,
            note: 'HostIP removed from payload and headers'
          } : undefined
        });
        resolve();
      });
    });

    request.on('error', (err) => {
      res.status(500).json({ error: err.message });
      resolve();
    });
    request.end();
  });
}
