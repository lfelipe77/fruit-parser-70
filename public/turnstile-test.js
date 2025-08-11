const out = (m) => (document.getElementById('out').textContent += m + "\n");
function onToken(token) {
  console.log("Token:", token);
  out("Token: " + token);
  fetch("https://whqxpuyjxoiufzhvqneg.functions.supabase.co/verify-turnstile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
    .then((r) => r.json())
    .then((j) => {
      console.log("Verify response:", j);
      out("Verify response: " + JSON.stringify(j));
    })
    .catch((e) => {
      console.error(e);
      out("Error: " + e.message);
    });
}
