import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Proxy Real User Monitoring Data (DataDog)
 * https://docs.datadoghq.com/real_user_monitoring/faq/proxy_rum_data/?tab=npm
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const xff = req.headers["X-Forwarded-For"]?.toString();
    // Syntax
    // X-Forwarded-For: <client>, <proxy1>, <proxy2>
    const ip = xff ? xff.split(/, /)[0] : "127.0.0.1";

    // Forward data to DataDog
    let datadogResponse = await fetch(req.query.ddforward.toString(), {
      method: "POST",
      headers: {
        "Accept-Language": req.headers["accept-language"] || "",
        "User-Agent": req.headers["user-agent"] || "",
        "Content-Type": req.headers["content-type"] || "application/json",
        "X-Forwarded-For": ip,
      },
      body: req.body,
    });

    res.status(datadogResponse.status).json(await datadogResponse.json());
  }
  // 405 Method Not Allowed
  res.status(405);
};
