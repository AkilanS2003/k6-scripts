import http from "k6/http";
import { check, sleep, fail } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 300 },
    { duration: "30s", target: 500 },
    { duration: "30s", target: 1000 },
    { duration: "30s", target: 2000 },
    { duration: "30s", target: 5000 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // Abort if >1% failures
    http_req_duration: ["p(95)<2000"], // Abort if p95 > 2s
  },
};

const payload = JSON.stringify({
  object: "whatsapp_business_account",
  entry: [
    {
      id: "test",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            messages: [
              {
                id: "load-test",
                type: "text",
                text: { body: "hello" },
              },
            ],
          },
        },
      ],
    },
  ],
});

export default function () {
  const res = http.post(
    "https://akilan1.stack5.us.konnectify.dev/worker/api/webhoook/whatsapp-1.0.0/webhook-listener",
    payload,
    { headers: { "Content-Type": "application/json" } },
  );

  const ok = check(res, {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300,
  });

  if (!ok) {
    fail(`Request failed with status ${res.status}`);
  }

  sleep(1);
}
