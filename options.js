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
          alert(`Custom API URL test successful. Coin price key set to: ${coinPriceKey}`);
        } else {
          alert('Invalid coin price key selected.');
        }
      } else {
        alert('No numeric values found in API response. Please check the custom API URL.');
      }
    })
    .catch(error => {
      alert(`Error testing custom API URL: ${error}`);
    });
}
