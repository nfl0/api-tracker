const apiUrlInput = document.getElementById("api-url");
const testApiBtn = document.getElementById("test-api-btn");
const responseContainer = document.getElementById("response-container");
const responseData = document.getElementById("response-data");
const keySelectionContainer = document.getElementById("key-selection-container");
const keySelection = document.getElementById("key-selection");
const result = document.getElementById("result");

const toggleIndicator = (indicator) => {
  indicator.classList.toggle("expanded");
  const node = indicator.parentNode.querySelector(".tree-node > div");
  node.style.display = node.style.display === "none" ? "block" : "none";
};

const showKeys = (obj, path, url, parentNode) => {
  parentNode.innerHTML = "";
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      const node = document.createElement("div");
      node.className = "tree-node";
      const indicator = document.createElement("span");
      indicator.className = "toggle-indicator";
      indicator.onclick = () => toggleIndicator(indicator);
      node.appendChild(indicator);
      const keyText = document.createTextNode(key);
      node.appendChild(keyText);
      parentNode.appendChild(node);
      const subNode = document.createElement("div");
      subNode.style.display = "none";
      node.appendChild(subNode);
      showKeys(obj[key], path.concat(key), url, subNode);
    } else {
      const keyPath = path.concat(key).join(".");
      const button = document.createElement("button");
      button.textContent = keyPath;
      button.className = "key-button";

      // Wrap the event handler assignment in an IIFE to capture the current value of 'key'
      (function (key) {
        button.onmouseover = () => {
          const value = obj[key]; // Get value of the key
          responseData.textContent = value; // Display value in the input field
        };
      })(key);

      button.onmouseout = () => {
        responseData.textContent = ""; // Clear input field when mouse leaves button
      };
      button.onclick = () => {
        console.log("Selected key:", this.textContent);
        selectKey(url, this.textContent);
      };
      parentNode.appendChild(button);
    }
  }
};

const selectKey = (url, selectedKey) => {
  const resultObject = {
    url: url,
    key: selectedKey,
  };
  console.log("Result:", resultObject);
  result.value = JSON.stringify(resultObject);
};

const testAPI = (e) => {
  e.preventDefault();

  if (!apiUrlInput.value) {
    alert("Please enter an API URL.");
    return;
  }

  responseContainer.style.display = "block";
  keySelectionContainer.style.display = "none";

  const url = apiUrlInput.value;
  console.log("Testing API:", url);
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      const response = xhr.responseText;
      console.log("Response:", response);
      responseData.textContent = response;
      try {
        const jsonObject = JSON.parse(response);
        console.log("Parsed JSON:", jsonObject);
        showKeys(jsonObject, [], url, keySelection);
        keySelectionContainer.style.display = "block";
      } catch (error) {
        // Response is not a valid JSON
        console.error("Error parsing JSON:", error);
        responseData.textContent = "Error parsing JSON. Please check the API response.";
      }
    }
  };
  xhr.send();
};

testApiBtn.addEventListener("click", testAPI);