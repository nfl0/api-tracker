document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['api', 'coin', 'customApiUrl'], function(result) {
    const selectedAPI = result.api || 'coingecko';
    const selectedCoin = result.coin || 'bitcoin';
    const customApiUrl = result.customApiUrl || '';
    document.getElementById(selectedAPI).checked = true;
    document.getElementById('coinSelect').value = selectedCoin;
    document.getElementById('customApiUrl').value = customApiUrl;

    if (customApiUrl !== '') {
      testCustomApi(customApiUrl);
    }
  });

  document.getElementById('apiForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const selectedAPI = document.querySelector('input[name="api"]:checked').value;
    const selectedCoin = document.getElementById('coinSelect').value;
    const customApiUrl = document.getElementById('customApiUrl').value;
    chrome.storage.local.set({ 'api': selectedAPI, 'coin': selectedCoin, 'customApiUrl': customApiUrl });

    if (customApiUrl !== '') {
      testCustomApi(customApiUrl);
    }
  });
});

function displayMessage(message, isError = false) {
  const messageContainer = document.getElementById('messageContainer');
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  if (isError) {
    messageElement.style.color = 'red';
  }
  messageContainer.appendChild(messageElement);
}

function testCustomApi(apiUrl) {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const keys = Object.keys(data);
      const coinPriceKeys = keys.filter(key => typeof data[key] === 'number');
      if (coinPriceKeys.length > 0) {
        // Prompt user to select which key represents the coin price
        const coinPriceKey = prompt(`Found potential price keys: ${coinPriceKeys.join(', ')}. Please select the key that represents the coin price.`);
        if (coinPriceKey && coinPriceKeys.includes(coinPriceKey)) {
          displayMessage(`Custom API URL test successful. Coin price key set to: ${coinPriceKey}`);
        } else {
          displayMessage('Invalid coin price key selected.', true);
        }
      } else {
        displayMessage('No numeric values found in API response. Please check the custom API URL.', true);
      }
    })
    .catch(error => {
      displayMessage(`Error testing custom API URL: ${error}`, true);
    });
}
