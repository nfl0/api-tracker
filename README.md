## API Tracker Badge

API Tracker Badge is a Chrome extension that helps you monitor data from any API directly on your browser's badge. Stay updated with real-time information without even opening a tab!

**Features:**

* Track data from any API by providing the URL and selecting the desired key.
* Live data displayed directly on the badge.
* Supports JSON data.

**Planned Features:**

* Support for plain text and XML data.
* Custom refresh timer.
* Option to show response time.
* Support for POST parameters.
* Improved CORS detection.
* Favorite APIs.
* Click on the badge to open the options page.

**Resources:**

* Public APIs repository: [https://publicapis.dev/category/cryptocurrency](https://publicapis.dev/category/cryptocurrency)

**Example Usage:**

1. Install the API Tracker Badge extension.
2. Open the options page and define a new API using the URL and key.
3. The live data will be displayed on the badge.

**Feedback:**

We welcome your feedback and suggestions!

















[BETA] API Tracker Badge

[BETA] API Tracker Badge is a handy Chrome extension that allows you to effortlessly track data from any API directly on your browser's badge. Whether you want to monitor the temperature, stock prices, or any other data, simply input the API URL, select the desired key (e.g., temperature), and the extension will display the live value on the badge. Stay updated with real-time information without even opening a tab!

todo:
    - add support for APIs that return plain text and not json
    - add link to the useful public APIs repo: ```https://publicapis.dev/category/cryptocurrency```
    - [options] custom refresh timer + inform the user about api call limits and remind him to check the api docs for more info. default refresh time is 30 seconds
    - [options] show response time (eye candy)
    - [options] add support for POST params
    - [options] add better CORS detection
    - [options] favorite APIs
    - [options] add XML support
    - add listener to open options page via extension click?
    - [background] feat: click on badge to open the options page