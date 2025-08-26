/* eslint-disable prettier/prettier */
/**
 * Cloudflare Turnstile server-side verification utility
 */

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!token) {
    console.error("No Turnstile token provided");
    return false;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY environment variable not set");
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    if (!response.ok) {
      console.error("Turnstile verification request failed:", response.status);
      return false;
    }

    const data = await response.json();

    if (data.success) {
      console.log("Turnstile verification successful");
      return true;
    } else {
      console.error("Turnstile verification failed:", data["error-codes"]);
      // Log specific error codes for debugging
      if (data["error-codes"]) {
        data["error-codes"].forEach((code: string) => {
          switch (code) {
            case "missing-input-secret":
              console.error("Missing secret key");
              break;
            case "invalid-input-secret":
              console.error("Invalid secret key - check TURNSTILE_SECRET_KEY");
              break;
            case "missing-input-response":
              console.error("Missing turnstile token");
              break;
            case "invalid-input-response":
              console.error("Invalid turnstile token");
              break;
            case "timeout-or-duplicate":
              console.error("Token timeout or duplicate submission");
              break;
            default:
              console.error(`Unknown error code: ${code}`);
          }
        });
      }
      return false;
    }
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}

export interface TurnstileVerificationResult {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}
