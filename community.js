// Discount Code Submission Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("submit-code-form");
  const codeInput = document.getElementById("code");
  const descriptionInput = document.getElementById("description");
  const urlInput = document.getElementById("url");
  const expiryDateInput = document.getElementById("expiry-date");
  const submitButton = document.querySelector(".submit-btn");
  const API_URL = "http://localhost:3000/submit-code"; // Update with your backend endpoint

  // Feedback message display
  const showFeedback = (message, type = "success") => {
    const feedbackMessage = document.createElement("div");
    feedbackMessage.className = feedback-message ${type};
    feedbackMessage.textContent = message;

    const existingMessage = document.querySelector(".feedback-message");
    if (existingMessage) {
      existingMessage.remove(); // Prevent multiple messages stacking
    }

    form.appendChild(feedbackMessage);

    // Automatically remove the message after 4 seconds
    setTimeout(() => feedbackMessage.remove(), 4000);
  };

  // Validate form inputs
  const validateInputs = () => {
    if (!codeInput.value.trim() || !descriptionInput.value.trim()) {
      showFeedback("Please fill out all required fields.", "error");
      return false;
    }
    if (codeInput.value.trim().length < 3) {
      showFeedback("Discount code must be at least 3 characters long.", "error");
      return false;
    }
    if (urlInput.value && !isValidURL(urlInput.value)) {
      showFeedback("Please enter a valid URL.", "error");
      return false;
    }
    return true;
  };

  // Validate URL format
  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable the submit button while processing
    submitButton.disabled = true;

    if (!validateInputs()) {
      submitButton.disabled = false;
      return;
    }

    const requestData = {
      code: codeInput.value.trim(),
      description: descriptionInput.value.trim(),
      url: urlInput.value.trim() || null,
      expiryDate: expiryDateInput.value || null,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error.");
      }

      const responseData = await response.json();
      showFeedback("Thank you! Your code has been submitted successfully.", "success");
      form.reset(); // Clear the form fields
    } catch (error) {
      console.error("Error submitting code:", error);
      showFeedback("Failed to submit code. Please try again later.", "error");
    } finally {
      submitButton.disabled = false; // Re-enable the button
    }
  });
});