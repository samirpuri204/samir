
// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero Section Animation
gsap.from(".animate-hero", {
  opacity: 0,
  y: 50,
  duration: 1,
  stagger: 0.3,
  delay: 0.5,
});

// Section Animations
gsap.utils.toArray(".animate-section").forEach((section) => {
  gsap.from(section, {
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });
});
// JavaScript code for interacting with IIam Meta AI API
document.getElementById('ai-submit').addEventListener('click', async function () {
  const userInput = document.getElementById('ai-input').value;
  if (userInput.trim() === "") return;
  
  const responseElement = document.getElementById('ai-response');
  responseElement.textContent = "Loading...";

  // Call to IIam Meta AI API (replace the fetch URL with your actual API endpoint)
  const aiResponse = await fetchAIResponse(userInput);
  responseElement.textContent = aiResponse;
});

async function fetchAIResponse(input) {
  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', { // Replace with actual endpoint URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $TOGETHER_API_KEY', // Replace with your API key
      },
      body: JSON.stringify({
        query: input, // The user's query
        model: "iiam-meta-ai-model", // Use the appropriate model if needed
      })
    });

    if (!response.ok) {
      throw new Error('AI API call failed');
    }

    const data = await response.json();
    return data.response || "Sorry, I couldn't process your request.";
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return "Sorry, something went wrong while contacting the AI service.";
  }
}import java.net.HttpURLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;

public class IIamMetaAIExample {
    public static void main(String[] args) {
        try {
            String apiKey = "YOUR_IIAM_META_API_KEY"; // Replace with your IIam Meta API key
            String query = "What is the weather like today?"; // Replace with your query
            String apiUrl = "https://api.iiam-meta-ai.com/v1/query"; // Replace with your actual API endpoint

            // Setup URL and connection
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Authorization", "Bearer " + apiKey);
            connection.setDoOutput(true);

            // JSON body for IIam Meta AI API request
            String jsonInputString = "{\"query\": \"" + query + "\", \"model\": \"iiam-meta-ai-model\"}";

            // Send request
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            // Get response
            try (BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(), "utf-8"))) {
                StringBuilder response = new StringBuilder();
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }

                // Output response (AI-generated text)
                System.out.println("AI Response: " + response.toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});
<script>
  window.addEventListener("load", function () {
    setTimeout(function () {
      document.getElementById("preloader").style.display = "none";
    }, 500); // Ensures preloader disappears after 0.5s even if page loads instantly
  });
</script>
