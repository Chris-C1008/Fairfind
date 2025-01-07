document.addEventListener('DOMContentLoaded', () => {
  const domainNameElement = document.getElementById('domain-name');
  const codesListElement = document.getElementById('codes-list');
  const noCodesMessageElement = document.getElementById('no-codes-message');
  const savingsAmountElement = document.getElementById('savings-amount');
  const feedbackWorkedButton = document.getElementById('feedback-worked');
  const feedbackDidntWorkButton = document.getElementById('feedback-didnt-work');
  const modifiedUrlDisplay = document.getElementById('modified-url-display'); // Display for affiliate link updates

  // Fetch and display discount codes for the current site
  async function fetchCodesForCurrentSite() {
    try {
      // Get the current tab's domain
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabUrl = new URL(tabs[0].url);
      const domain = tabUrl.hostname;

      // Display the current site domain
      domainNameElement.textContent = domain;

      // Fetch discount codes from the backend
      const response = await fetch(http://localhost:3000/codes?domain=${domain});
      if (!response.ok) {
        throw new Error(Failed to fetch codes: ${response.statusText});
      }

      const data = await response.json();
      displayCodes(data.codes);

      // Process affiliate link
      processAffiliateLink(tabUrl.href, domain);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      noCodesMessageElement.classList.remove('hidden');
    }
  }

  // Process affiliate links
  async function processAffiliateLink(currentUrl, domain) {
    try {
      const response = await fetch('http://localhost:3000/process-affiliate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentUrl, domain }),
      });

      if (!response.ok) {
        throw new Error(Failed to process affiliate link: ${response.statusText});
      }

      const data = await response.json();
      if (data.url) {
        console.log(Modified URL with affiliate code: ${data.url});
        modifiedUrlDisplay.textContent = Affiliate Link Applied: ${data.url};
      } else {
        console.log('No affiliate link added.');
      }
    } catch (error) {
      console.error('Error processing affiliate link:', error);
    }
  }

  // Display the fetched codes
  function displayCodes(codes) {
    codesListElement.innerHTML = ''; // Clear previous codes
    noCodesMessageElement.classList.add('hidden'); // Hide "no codes" message

    if (codes.length === 0) {
      noCodesMessageElement.classList.remove('hidden');
      return;
    }

    codes.forEach(({ code, expiry, description }) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <div>
          <span class="code">${code}</span>
          <span class="expiry">${expiry || 'No Expiry'}</span>
        </div>
        <p class="description">${description || 'No description available'}</p>
      `;
      codesListElement.appendChild(listItem);
    });
  }

  // Update savings tracker
  function updateSavings(amount) {
    const currentSavings = parseFloat(savingsAmountElement.textContent) || 0;
    const newSavings = currentSavings + amount;
    savingsAmountElement.textContent = newSavings.toFixed(2);
  }

  // Handle feedback for codes
  async function sendFeedback(feedbackType) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabUrl = new URL(tabs[0].url);
      const domain = tabUrl.hostname;

      const response = await fetch('http://localhost:3000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, feedbackType }),
      });

      if (!response.ok) {
        throw new Error(Failed to send feedback: ${response.statusText});
      }

      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  }

  // Add event listeners
  feedbackWorkedButton.addEventListener('click', () => sendFeedback('worked'));
  feedbackDidntWorkButton.addEventListener('click', () => sendFeedback('didnt_work'));

  // Initialize the popup
  fetchCodesForCurrentSite();
});