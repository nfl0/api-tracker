const localStore = chrome.storage.local;
let selectedAPI = 'coingecko'; // Default to CoinGecko
let selectedCoin = 'bitcoin'; // Default to Bitcoin
let customApiUrl = ''; // Default to empty

const symbolMappings = {
  'binance': {
    'bitcoin': 'BTCUSDT',
    'ethereum': 'ETHUSDT',
    'binancecoin': 'BNBUSDT',
    'matic-network': 'MATICUSDT',
    'solana': 'SOLUSDT',
    'cardano': 'ADAUSDT',
    'ripple': 'XRPUSDT',
    'polkadot': 'DOTUSDT',
    'zcash': 'ZECUSDT',
  },
  'coinbase': {
    'bitcoin': 'BTC-USD',
    'ethereum': 'ETH-USD',
    'binancecoin': 'BNB-USD',
    'matic-network': 'MATIC-USD',
    'solana': 'SOL-USD',
    'cardano': 'ADA-USD',
    'ripple': 'XRP-USD',
    'polkadot': 'DOT-USD',
    'zcash': 'ZEC-USD',
  },
};

(function () {
  let price = 0, prevPrice = 0, up = true, toggle = false;

  function formatPrice(value) {
    if (!toggle) {
      if (value >= 1000) {
        const suffixes = ["", "k", "m", "b", "t"];
        const suffixNum = Math.floor(Math.log10(value) / 3);
        const shortValue = (value / Math.pow(1000, suffixNum)).toPrecision(3);
        return shortValue + suffixes[suffixNum];
      } else {
        return value.toFixed(2);
      }
    }
    return price;
  }
  
  function setToggle(ans) {
    localStore.set({ "toggle": ans });
    toggle = ans;
  }

  function updateBadge() {
    localStore.get(['toggle', 'api', 'coin', 'customApiUrl'], function (items) {
      toggle = items.toggle;
      selectedAPI = items.api || 'coingecko';
      selectedCoin = items.coin || 'bitcoin';
      customApiUrl = items.customApiUrl || '';
      fetchPrice();
    });
  }

  async function fetchPrice() {
    try {
      const apiUrl = getAPIUrl();
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (selectedAPI === 'binance') {
        price = parseFloat(data.price);
      } else if (selectedAPI === 'coinbase') {
        price = parseFloat(data.data.amount);
      } else if (selectedAPI === 'custom') {
        handleCustomApiResponse(data);
      } else {
        price = data[selectedCoin].usd;
      }

      chrome.action.setBadgeText({ text: formatPrice(price).toString() });
      chrome.action.setTitle({ title: `${selectedCoin.toUpperCase()} (${selectedAPI.toUpperCase()}): ${formatPrice(price)}` });
      setupBadge(price >= prevPrice);
      prevPrice = price;
    } catch (error) {
      handleError(error);
    }
  }

  function getAPIUrl() {
    if (selectedAPI === 'binance') {
      return `https://api.binance.com/api/v3/ticker/price?symbol=${symbolMappings[selectedAPI][selectedCoin.toLowerCase()]}`;
    } else if (selectedAPI === 'coinbase') {
      return `https://api.coinbase.com/v2/prices/${symbolMappings[selectedAPI][selectedCoin.toLowerCase()]}/sell`;
    } else if (selectedAPI === 'custom') {
      return customApiUrl;
    } else {
      return `https://api.coingecko.com/api/v3/simple/price?ids=${selectedCoin}&vs_currencies=usd`;
    }
  }

  function handleCustomApiResponse(data) {
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const key = keys[0];
        if (typeof data[key] === 'number') {
          price = data[key];
        } else {
          throw new Error('No numeric value found for coin price');
        }
      } else {
        throw new Error('Empty JSON object');
      }
    } else {
      throw new Error('Invalid JSON format');
    }
  }

  function handleError(error) {
    chrome.action.setBadgeText({ text: "x_x" });
    chrome.action.setTitle({ title: String(error) });
  }

  function setupAlarm() {
    chrome.alarms.create('updateBadgeAlarm', {
      periodInMinutes: 1 // Run every 1 minute
    });
  }

  function setupBadge(up) {
    const color = up ? "#009E73" : "#ff0000";
    setTimeout(function () {
      chrome.action.setBadgeBackgroundColor({ color });
    }, 1000);
    chrome.action.setBadgeBackgroundColor({ color: "#f9a43f" });
  }

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
      if (key === 'toggle' || key === 'api' || key === 'coin' || key === 'customApiUrl') {
        updateBadge();
        break;
      }
    }
  });
  
  chrome.action.onClicked.addListener(function (tab) {
    setToggle(!toggle);
    updateBadge();
  });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'updateBadgeAlarm') {
      updateBadge();
    }
  });

  updateBadge();
  setupAlarm();
})();
