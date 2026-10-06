import { session } from 'electron';

export function setupSecurityHeaders(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://127.0.0.1:8000 ws://127.0.0.1:8000; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https://fonts.gstatic.com data:; " +
          "img-src 'self' data: https:; " +
          "connect-src 'self' http://127.0.0.1:8000 ws://127.0.0.1:8000 https://api.anthropic.com https://api.openai.com https://generativelanguage.googleapis.com;"
        ],
      },
    });
  });
}
