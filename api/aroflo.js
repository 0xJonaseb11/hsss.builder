import CryptoJS from 'crypto-js';
import https from 'https';

/**
 * AroFlo API Wrapper — GET + POST
 * 
 * GET usage:
 *   /api/aroflo?pin=7788&zone=tasks&page=1&where=...
 * 
 * POST usage:
 *   POST /api/aroflo?pin=7788
 *   Body (JSON): { zone: "tasks", postxml: "<tasks><task>...</task></tasks>" }
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pin = req.query.pin || req.body?.pin;
  if (pin !== '7788') {
    return res.status(403).json({ error: 'Invalid PIN' });
  }

  const isPost = req.method === 'POST' && req.body?.postxml;
  const zone = req.query.zone || req.body?.zone || 'tasks';
  const page = req.query.page || req.body?.page || '1';
  const where = req.query.where || req.body?.where || '';

  const secret_key = (process.env.APISecretKey || '').trim();
  const uEncoded = (process.env.uEncoded || '').trim();
  const pEncoded = (process.env.pEncoded || '').trim();
  const orgEncoded = (process.env.orgEncoded || '').trim();

  if (!secret_key || !uEncoded || !pEncoded || !orgEncoded) {
    return res.status(500).json({ error: 'Missing AroFlo credentials in environment' });
  }

  try {
    const requestType = isPost ? 'POST' : 'GET';

    // Build the form body for POST (needed before HMAC since it may be part of signing)
    let postBody = null;
    if (isPost) {
      postBody = 'zone=' + encodeURIComponent(zone) + '&postxml=' + encodeURIComponent(req.body.postxml);
    }

    // For GET: zone & page in URL query string and HMAC urlVarString
    // For POST: the form body IS the urlVarString for HMAC signing
    let urlVarString = '';
    if (isPost) {
      urlVarString = postBody;
    } else {
      const urlVarParts = [
        'zone=' + encodeURIComponent(zone),
        'page=' + encodeURIComponent(page)
      ];
      if (where) urlVarParts.splice(1, 0, 'where=' + encodeURIComponent(where));
      urlVarString = urlVarParts.join('&');
    }

    const isotimestamp = new Date().toISOString();
    const urlPath = '';
    const accept = 'text/json';

    // Authorization — lowercase uencoded/pencoded (matching working version)
    const Authorization = 'uencoded=' + encodeURIComponent(uEncoded)
      + '&pencoded=' + encodeURIComponent(pEncoded)
      + '&orgEncoded=' + encodeURIComponent(orgEncoded);

    // HMAC payload
    const payload = [requestType, urlPath, accept, Authorization, isotimestamp, urlVarString];
    const payloadString = payload.join('+');
    const hash = CryptoJS.HmacSHA512(payloadString, secret_key).toString();

    return new Promise((resolve) => {
      const reqPath = isPost ? '/' : '/?' + urlVarString;
      const options = {
        hostname: 'api.aroflo.com',
        path: reqPath,
        method: requestType,
        headers: {
          'Accept': accept,
          'Authentication': 'HMAC ' + hash,
          'Authorization': Authorization,
          'afdatetimeutc': isotimestamp
        }
      };

      if (isPost) {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.headers['Content-Length'] = Buffer.byteLength(postBody);
      }

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
            method: requestType,
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

      if (postBody) {
        request.write(postBody);
      }
      request.end();
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3),
    });
  }
}
