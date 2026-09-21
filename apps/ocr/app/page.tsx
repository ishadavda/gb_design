/**
 * Placeholder landing page. This service is API-first - the page exists so a
 * deploy is verifiable in a browser without reaching for curl.
 */
export default function Page() {
  return (
    <main>
      <h1>Greenback OCR</h1>
      <p>Receipt OCR service. Not implemented yet - this is a deployment placeholder.</p>
      <ul>
        <li>
          <code>GET /api/health</code> - liveness probe
        </li>
        <li>
          <code>POST /api/ocr</code> - returns 501 until a provider is wired up
        </li>
      </ul>
    </main>
  );
}
