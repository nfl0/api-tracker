// Function to update the badge text
function updateBadgeText(value) {
  chrome.action.setBadgeText({ text: value.toString() });
}

// Function to update the badge text when hovered over
function updateBadgeOnHover(value) {
  chrome.action.setTitle({ title: value.toString() });
}

// Function to fetch data from the API
function fetchData(url, key) {
  fetch(url)
      .then(response => response.json())
      .then(data => {
          const value = getValueByKey(data, key);
          updateBadgeText(value);
          updateBadgeOnHover(value); // Update badge text on hover
      })
      .catch(error => {
          console.error('Error fetching data:', error);
      });
}

// Function to get value by key from JSON object
function getValueByKey(data, key) {
  const keys = key.split('.');
  let value = data;

  keys.forEach(k => {
      value = value[k];
  });

  return value;
}

// Function to handle storage changes
function handleStorageChange(changes, namespace) {
  for (const key in changes) {
      if (key === 'result') {
          const storageChange = changes[key];
          const result = storageChange.newValue;
          if (result) {
              fetchData(result.url, result.key);
          }
      }
  }
}

// Listen for changes in storage
chrome.storage.onChanged.addListener(handleStorageChange);

// Function to update badge text periodically
function updateBadgePeriodically() {
  chrome.storage.local.get('result', function (data) {
      const result = data.result;
      if (result) {
          fetchData(result.url, result.key);
      }
  });
}

// Set up periodic update using chrome.alarms API
chrome.alarms.create('updateBadge', { periodInMinutes: 0.25 }); // 15 seconds interval

// Add listener for alarm
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'updateBadge') {
      updateBadgePeriodically();
  }
});

// Initial update of badge text when extension is first loaded
updateBadgePeriodically();
