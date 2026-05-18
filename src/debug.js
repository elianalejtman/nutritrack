export async function testAPI() {
  try {
    const res = await fetch("/api/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 100, messages: [{ role: "user", content: [{ type: "text", text: "say hi" }] }] }),
    });
    const data = await res.json();
    alert(JSON.stringify(data));
  } catch(err) {
    alert("Error: " + err.message);
  }
}
