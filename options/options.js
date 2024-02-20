document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('testApiBtn').addEventListener('click', testAPI);
    document.getElementById('saveBtn').addEventListener('click', saveResult);
});

function testAPI() {
    var url = document.getElementById("apiUrl").value;
    var xhr = new XMLHttpRequest();

    // Clear response input field
    document.getElementById("response").value = "";

    // Show loading animation
    document.getElementById("loading").style.display = "block";

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            // Hide loading animation
            document.getElementById("loading").style.display = "none";

            var response = xhr.responseText;
            if (xhr.status == 200) {
                // If successful response
                document.getElementById("response").value = response;
                try {
                    var jsonObject = JSON.parse(response);
                    showKeys(jsonObject, [], url, document.getElementById("keySelection"));
                } catch (error) {
                    document.getElementById("keySelection").innerHTML = "";
                }
            } else {
                // If error response
                var errorMessage = "Error: ";
                if (xhr.status === 0) {
                    errorMessage += "Connection failed. Possible causes: CORS policy, network issues, or incorrect URL.";
                    // Suggesting a possible solution for CORS issues
                    errorMessage += "\nSolution: If you're facing CORS issues, try using a proxy server or contacting the API provider to enable CORS.";
                } else {
                    errorMessage += xhr.status + " " + xhr.statusText;
                }
                document.getElementById("response").value = errorMessage;
            }
        }
    };

    xhr.open("GET", url, true);
    xhr.send();
}

function showKeys(obj, path, url, parentNode) {
    parentNode.innerHTML = "";
    for (var key in obj) {
        if (typeof obj[key] === 'object') {
            var node = document.createElement("div");
            node.className = "tree-node";
            var indicator = document.createElement("span");
            indicator.className = "toggle-indicator";
            indicator.onclick = function() {
                toggleNode(this);
            };
            node.appendChild(indicator);
            var keyText = document.createTextNode(key);
            node.appendChild(keyText);
            parentNode.appendChild(node);
            var subNode = document.createElement("div");
            subNode.style.display = "none";
            node.appendChild(subNode);
            showKeys(obj[key], path.concat(key), url, subNode);
        } else {
            var keyPath = path.concat(key).join('.');
            var button = document.createElement("button");
            button.textContent = keyPath;
            button.className = "key-button";
            
            (function(key) {
                button.onmouseover = function() {
                    var value = obj[key];
                    document.getElementById("valueDisplay").value = value;
                };
            })(key);
            
            button.onmouseout = function() {
                document.getElementById("valueDisplay").value = "";
            };
            button.onclick = function() {
                selectKey(url, this.textContent);
            };
            parentNode.appendChild(button);
        }
    }
}

function toggleNode(indicator) {
    var node = indicator.parentNode.querySelector('.tree-node > div');
    if (node.style.display === 'none') {
        node.style.display = 'block';
        indicator.classList.add('expanded');
    } else {
        node.style.display = 'none';
        indicator.classList.remove('expanded');
    }
}

function selectKey(url, selectedKey) {
    var result = {
        "url": url,
        "key": selectedKey
    };
    document.getElementById("result").value = JSON.stringify(result);
}

function saveResult() {
    var resultObject = JSON.parse(document.getElementById("result").value);
    chrome.storage.local.set({"result": resultObject}, function() {
        console.log("Result saved to storage:", resultObject);
    });
}

function filterKeys() {
    var input, filter, keyContainer, keys, i;
    input = document.getElementById("keySearch");
    filter = input.value.toUpperCase();
    keyContainer = document.getElementById("keySelection");
    keys = keyContainer.getElementsByTagName("button");
    for (i = 0; i < keys.length; i++) {
        var button = keys[i];
        var parentDiv = button.parentNode;
        if (button.textContent.toUpperCase().indexOf(filter) > -1) {
            button.style.display = "";
            parentDiv.style.display = "";
        } else {
            button.style.display = "none";
            parentDiv.style.display = parentDiv.querySelectorAll('.key-button[style="display: none;"]').length === parentDiv.querySelectorAll('.key-button').length ? "none" : "";
        }
    }
}
