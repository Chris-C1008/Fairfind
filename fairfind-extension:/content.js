// Utility to log when the content script is loaded
console.log("FairFind content script loaded.");

// Function to detect checkout pages
function isCheckoutPage() {
  const url = window.location.href;
  return (
    url.includes("/checkout") || 
    url.includes("/cart") || 
    document.body.innerHTML.includes("checkout") // Additional heuristic checks
  );
}

// Function to extract the page's HTML, URL, and other details and send them to the backend
async function getDiscountCodesFromBackend() {
  try {
    // Ensure we're on a checkout page before proceeding
    if (!isCheckoutPage()) {
      console.log("Not on a checkout page. Skipping discount code application.");
      return;
    }

    // Extract the current page's HTML content and URL
    const htmlContent = document.documentElement.outerHTML;
    const url = window.location.href;

    // Send the HTML and URL to the backend for processing
    const response = await fetch('http://localhost:3000/process-discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: htmlContent, url }), // Send HTML and URL
    });

    if (!response.ok) {
      console.error('Error fetching discount codes:', response.statusText);
      return;
    }

    const data = await response.json();
    console.log('Discount codes received from backend:', data.discounts);

    // Automatically apply the best discount code
    await applyBestDiscountCode(data.discounts);
  } catch (error) {
    console.error('Error in getDiscountCodesFromBackend:', error);
  }
}

// Function to apply the best discount code to the page
async function applyBestDiscountCode(discounts) {
  if (!discounts || discounts.length === 0) {
    console.log('No discount codes available to apply.');
    return;
  }

  // Group and log discount codes by product
  discounts.forEach(({ product, discount }) => {
    console.log(Found discount for ${product}: ${discount});
  });

  // Find the discount code input field on the page
  const discountInput = document.querySelector(
    "input[name='discount-code'], input[name='promo-code'], input[name='coupon-code']"
  );

  if (!discountInput) {
    console.log("No discount code input field found on this page.");
    return;
  }

  // Iterate through discounts and apply them one by one
  for (let i = 0; i < discounts.length; i++) {
    const { product, discount } = discounts[i];
    discountInput.value = discount;

    console.log(Testing discount code for ${product}: ${discount});

    // Attempt to find and click the "Apply" button
    const applyButton = document.querySelector(
      "button[aria-label='Apply'], button.apply, button.submit"
    );

    if (applyButton) {
      applyButton.click();
      console.log("Clicked the apply button.");

      // Wait for the site to process the discount (adjust timing as needed)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if the discount was applied successfully (example logic, adjust per site)
      if (document.body.innerHTML.includes("discount applied") || 
          document.body.innerHTML.includes("code accepted")) {
        console.log(Discount applied successfully: ${discount});
        break; // Stop if a valid code is applied
      } else {
        console.log(Discount code failed: ${discount});
      }
    } else {
      console.log("No apply button found.");
      break;
    }
  }
}

// Function to display savings notification to the user
function displaySavingsNotification(savings) {
  const banner = document.createElement('div');
  banner.style.position = 'fixed';
  banner.style.bottom = '10px';
  banner.style.left = '10px';
  banner.style.padding = '10px 20px';
  banner.style.backgroundColor = '#28a745';
  banner.style.color = '#fff';
  banner.style.fontSize = '16px';
  banner.style.borderRadius = '8px';
  banner.style.zIndex = '10000';
  banner.innerText = You saved $${savings}!;

  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 5000); // Remove banner after 5 seconds
}

// Automatically run the discount fetching function when the page loads
document.addEventListener("DOMContentLoaded", () => {
  getDiscountCodesFromBackend();
});