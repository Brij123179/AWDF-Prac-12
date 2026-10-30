import http from 'http';

export function createCaller(app) {
  return function request(method, path, { headers = {}, body } = {}) {
    return new Promise((resolve, reject) => {
      const req = new http.IncomingMessage();
      req.method = method.toUpperCase();
      req.url = path;
      req.headers = { ...headers };

      let payload = null;
      if (body) {
        payload = typeof body === 'string' ? body : JSON.stringify(body);
        req.headers['content-type'] = req.headers['content-type'] || 'application/json';
        req.headers['content-length'] = Buffer.byteLength(payload);
      }

      const res = new http.ServerResponse(req);
      let responseBody = '';

      res.write = function (chunk) {
        responseBody += chunk.toString();
        return true;
      };

      res.end = function (chunk) {
        if (chunk) responseBody += chunk.toString();
        let json = null;
        try { json = JSON.parse(responseBody); } catch (e) {}

        resolve({
          status: res.statusCode,
          statusCode: res.statusCode,
          headers: res.getHeaders(),
          text: responseBody,
          body: json,
          json: async () => json
        });
      };

      app.handle(req, res);

      if (payload) {
        req.push(payload);
      }
      req.push(null);
    });
  };
}
