import { $ontologyRid } from "@custom-widget/sdk";
import { createClient } from "@osdk/client";

// Use window.location.origin to make requests relative to the widget's host
// This avoids CSP violations in the iframe
export const client = createClient(
  window.location.origin,
  $ontologyRid,
  async () => {
    // Authentication is handled automatically via session cookies
    // Return empty string to let the client use default cookie-based auth
    return "";
  }
);
