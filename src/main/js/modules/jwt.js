var Mac = javax.crypto.Mac,
  SecretKeySpec = javax.crypto.spec.SecretKeySpec;

exports.jwt = function(payload, secret) {
  var segments = [encodedHeader(), encodedPayload(payload)];

  segments.push(encodedSignature(segments.join('.'), secret));

  return segments.join('.');
};

function encodedHeader() {
  var header = JSON.stringify({
    alg: 'HS256',
    typ: 'JWT'
  });

  return base64UrlEncode(header.getBytes('UTF-8'));
}

function encodedPayload(payload) {
  return base64UrlEncode(JSON.stringify(payload).getBytes('UTF-8'));
}

function base64UrlEncode(bytes) {
  return java.util.Base64.getUrlEncoder()
    .encodeToString(bytes)
    .replace(/=*$/, '');
}

function encodedSignature(str, secret) {
  var signature = sign(str, secret);
  return base64UrlEncode(signature);
}

function sign(str, secret) {
  var mac = Mac.getInstance('HmacSHA256');
  mac.init(new SecretKeySpec(secret.getBytes('UTF-8'), mac.algorithm));
  return mac.doFinal(str.getBytes('UTF-8'));
}
