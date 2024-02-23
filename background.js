// Function to update the badge text when hovered over
function updateBadgeOnHover(value) {
  chrome.action.setTitle({ title: value.toString() });
}
// Function to update the badge text with truncation for numerical values and strings
function updateBadgeText(value) {
  let badgeText = '';

  // Check if value is a string representing a numerical value enclosed in quotes
  if (typeof value === 'string' && !isNaN(value.replace(/"/g, ''))) {
    // Convert the string to a number
    value = parseFloat(value.replace(/"/g, ''));
  }

  if (Number.isFinite(value)) { // Check if value is a number
    // Truncate and format numerical values
    console.log("value is number");
    badgeText = truncateNumber(value);
  } else if (typeof value === 'string') {
    // Check if value is an IP address
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value)) {
      badgeText = 'IP';
    } else {
      // Check if value is a hash
      if (/^[a-fA-F0-9]{32}$/.test(value)) {
        badgeText = 'Hash';
      } else {
        // Truncate strings
        console.log("value is string");
        badgeText = truncateString(value);
      }
    }
  } else if (typeof value === 'boolean') {
    // Handle booleans
    console.log("value is boolean");
    badgeText = value.toString();
  } else if (value instanceof Array) {
    // Handle array type if needed
    console.log("value is array");
    badgeText = 'Array';
  } else if (value instanceof Object) {
    // Handle object type if needed
    console.log("value is object");
    badgeText = 'Object';
  }
  chrome.action.setBadgeText({ text: badgeText });
}

// Function to truncate and format numerical values within 4 characters
function truncateNumber(number) {
  let truncatedText = number.toString();
  if (truncatedText.length > 4) {
    // Truncate and format the number to fit within 4 characters
    const absNumber = Math.abs(number);
    if (absNumber >= 1.0e+9) {
      truncatedText = (absNumber / 1.0e+9).toFixed(1) + 'B';
    } else if (absNumber >= 1.0e+6) {
      truncatedText = (absNumber / 1.0e+6).toFixed(1) + 'M';
    } else if (absNumber >= 1.0e+3) {
      truncatedText = (absNumber / 1.0e+3).toFixed(1) + 'K';
    } else {
      truncatedText = absNumber.toFixed(2);
    }
    // Truncate to fit within 4 characters
    if (truncatedText.length > 4) {
      truncatedText = truncatedText.slice(0, 4);
    }
  }
  return truncatedText;
}

// Function to truncate strings and booleans to expected formats
function truncateString(value) {
  if (!isNaN(value) || /^\d+(\.\d+)?$/.test(value)) { // Check if it's numeric
    const numericValue = parseFloat(value);
    if (Math.abs(numericValue) >= 1.0e+6) {
      return truncateNumber(numericValue);
    } else {
      const stringValue = numericValue.toFixed(2);
      return stringValue.length > 4 ? stringValue.slice(0, 4) : stringValue;
    }
  } else {
    // Check for specific cases
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value)) {
      return 'IP';
    } else if (/^[a-fA-F0-9]{32}$/.test(value)) {
      return 'Hash';
    } else if (value === 'true' || value === 'false') {
      return value === 'true' ? 'true' : 'not';
    } else if (Array.isArray(value)) {
      return 'Arr';
    } else if (typeof value === 'object') {
      return 'Obj';
    } else {
      return 'Text';
    }
  }
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
