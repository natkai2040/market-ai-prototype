export function loadAI(condition) {
  const panel = document.getElementById("interpretation");

  if (condition === "control") {
    panel.innerHTML = `
<h3>AI Summary</h3>
<p>Recent marketplace signals suggest
a typical value around <b>$180</b>.</p>
`;
    return;
  }

  if (condition === "inspectable") {
    panel.innerHTML = `
<h3>AI Interpretation</h3>

<b>Evidence</b>
<ul>
<li>Auction sale: $220</li>
<li>Confirmed sales: $175–180</li>
<li>Unsold listing: $160</li>
</ul>

<b>Assumptions</b>
<ul>
<li>Auctions reflect collector demand</li>
<li>Listings reflect seller expectations</li>
</ul>

<b>Limitations</b>
<ul>
<li>Sparse data</li>
<li>Condition differences</li>
</ul>
`;
    return;
  }

  if (condition === "contestable") {
    panel.innerHTML = `
<h3>Your Interpretation</h3>

<textarea id="userText" rows="4" cols="60" placeholder="Add your own interpretation..."></textarea>

<br><br>

<button id="submit" type="button">Submit</button>
`;

    document.getElementById("submit").onclick = () => {
      panel.innerHTML += `
<h3>AI Interpretation</h3>
<p>Auction price ($220) may reflect
collector competition rather than
typical market value.</p>
`;
    };
  }
}
