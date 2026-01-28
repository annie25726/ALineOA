import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const keywordMap = {
  annie12345678: "連結1回覆 Aaaaaaaa",
  annie99999999: "連結2回覆 Bbbbbbbb"
};

app.get("/", (_req, res) => {
  res.send("OK");
});

app.post("/api/push", async (req, res) => {
  const { userId, ref } = req.body || {};
  if (!userId || !ref) {
    return res.status(400).json({ error: "missing userId or ref" });
  }

  const messageText = keywordMap[ref];
  if (!messageText) {
    return res.status(400).json({ error: "unknown ref" });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "missing LINE_CHANNEL_ACCESS_TOKEN" });
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text: messageText }]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: text || "line push failed" });
    }

    return res.json({ ok: true, ref, messageText });
  } catch (err) {
    return res.status(500).json({ error: err.message || "server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
