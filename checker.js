export function evaluateDecline(priorText, followingText) {
  const values = [priorText.trim(), followingText.trim()];
  const counts = values.map(Number);
  const invalid = values.findIndex((value, index) =>
    !/^\d+$/.test(value) || !Number.isSafeInteger(counts[index])
  );
  if (invalid !== -1) {
    return {
      invalid,
      title: "Enter valid impression counts.",
      detail: "Both fields need whole numbers of zero or more within the supported numeric range."
    };
  }

  const [prior, following] = counts;
  if (prior < 300) {
    return { title: "Outside the study population.", detail: "A page needs at least 300 prior impressions to be eligible." };
  }

  const loss = prior - following;
  const missing = [
    loss < 150 ? "150 fewer impressions" : null,
    10n * BigInt(loss) < 3n * BigInt(prior) ? "30% decline" : null
  ].filter(Boolean);
  const rate = Math.abs(100 * loss / prior).toFixed(1);
  const count = Math.abs(loss).toLocaleString("en-IN");
  const direction = loss > 0 ? " fewer impressions, a " + rate + "% decrease, rounded." : " more impressions, a " + rate + "% increase, rounded.";
  const movement = loss === 0 ? "No change." : count + direction;

  return {
    title: missing.length ? "Below the material-decline threshold." : "Meets the material-decline label.",
    detail: movement + (missing.length ? " Short of: " + missing.join(" and ") + "." : " Both decline thresholds are met.")
  };
}

if (typeof document !== "undefined") {
  const form = document.getElementById("decline-form");
  const fields = ["prior", "following"].map(id => document.getElementById(id));

  function showResult(moveFocus) {
    const result = evaluateDecline(...fields.map(field => field.value));
    fields.forEach((field, index) => field.setAttribute("aria-invalid", String(result.invalid === index)));
    document.getElementById("result-title").textContent = result.title;
    document.getElementById("result-detail").textContent = result.detail;
    if (moveFocus && result.invalid !== undefined) fields[result.invalid].focus();
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    showResult(true);
  });
  showResult(false);
}
