#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <TFT_eSPI.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Dashboard API configuration
const char* apiServer = "your-app.railway.app";
const char* deviceToken = "YOUR_DEVICE_TOKEN";

// MQTT configuration
const char* mqttServer = "your-mqtt-broker.railway.app";
const int mqttPort = 1883;
const char* mqttUser = "mqtt_user";
const char* mqttPassword = "mqtt_password";

WiFiClient espClient;
PubSubClient client(espClient);
TFT_eSPI tft = TFT_eSPI();

// Display configuration
#define SCREEN_WIDTH 320
#define SCREEN_HEIGHT 240
#define WIDGET_HEIGHT 60

struct WidgetData {
  String type;
  String value;
  String change;
  String unit;
  String symbol;
  bool hasData;
};

WidgetData widgets[4];
int widgetCount = 0;
unsigned long lastUpdate = 0;
const unsigned long updateInterval = 60000; // 1 minute

void setup() {
  Serial.begin(115200);
  
  // Initialize display
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE);
  
  displayMessage("Connecting to WiFi...");
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  
  displayMessage("WiFi Connected!\nConnecting to MQTT...");
  
  // Setup MQTT
  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);
  
  connectToMQTT();
  
  // Initial data fetch
  fetchDashboardData();
  
  displayMessage("Ready!");
  delay(1000);
  
  // Clear screen and setup display layout
  setupDisplay();
}

void loop() {
  if (!client.connected()) {
    connectToMQTT();
  }
  client.loop();
  
  // Periodic data refresh
  if (millis() - lastUpdate > updateInterval) {
    fetchDashboardData();
    lastUpdate = millis();
  }
  
  // Send heartbeat every 30 seconds
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 30000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
  
  delay(100);
}

void connectToMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    String clientId = "ESP32-" + String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqttUser, mqttPassword)) {
      Serial.println(" connected");
      
      // Subscribe to dashboard updates
      String topic = "dashboard/" + String(deviceToken) + "/+/update";
      client.subscribe(topic.c_str());
      
    } else {
      Serial.print(" failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println("MQTT message received: " + message);
  
  // Parse JSON message
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, message);
  
  if (doc["type"] == "widget_update") {
    updateWidgetData(doc["data"]);
    updateDisplay();
  }
}

void fetchDashboardData() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "https://" + String(apiServer) + "/api/iot/" + String(deviceToken) + "/dashboard";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == 200) {
      String response = http.getString();
      
      DynamicJsonDocument doc(2048);
      deserializeJson(doc, response);
      
      // Clear existing widgets
      widgetCount = 0;
      
      // Parse widgets
      JsonArray widgetArray = doc["widgets"];
      for (JsonObject widget : widgetArray) {
        if (widgetCount < 4) {
          parseWidget(widget, widgetCount);
          widgetCount++;
        }
      }
      
      updateDisplay();
      
    } else {
      Serial.printf("HTTP error: %d\n", httpResponseCode);
      displayError("Failed to fetch data");
    }
    
    http.end();
  }
}

void parseWidget(JsonObject widget, int index) {
  widgets[index].type = widget["type"].as<String>();
  widgets[index].hasData = true;
  
  JsonObject data = widget["data"];
  
  if (widgets[index].type == "STOCK") {
    widgets[index].symbol = data["u"].as<String>();
    widgets[index].value = String(data["v"].as<float>(), 2);
    widgets[index].change = String(data["c"].as<float>(), 2) + "%";
    widgets[index].unit = "$";
    
  } else if (widgets[index].type == "WEATHER") {
    widgets[index].symbol = data["u"].as<String>();
    widgets[index].value = String(data["v"].as<int>());
    widgets[index].unit = "°C";
    widgets[index].change = "";
    
  } else if (widgets[index].type == "CRYPTO") {
    widgets[index].symbol = data["u"].as<String>();
    widgets[index].value = String(data["v"].as<float>(), 2);
    widgets[index].change = String(data["c"].as<float>(), 2) + "%";
    widgets[index].unit = "$";
  }
}

void updateWidgetData(JsonObject data) {
  String widgetId = data["widgetId"];
  // Update specific widget based on real-time data
  updateDisplay();
}

void setupDisplay() {
  tft.fillScreen(TFT_BLACK);
  
  // Header
  tft.setTextSize(2);
  tft.setTextColor(TFT_CYAN);
  tft.drawString("IoT Dashboard", 10, 5);
  
  // Draw widget containers
  for (int i = 0; i < 4; i++) {
    int y = 35 + (i * WIDGET_HEIGHT);
    tft.drawRect(5, y, SCREEN_WIDTH - 10, WIDGET_HEIGHT - 5, TFT_WHITE);
  }
}

void updateDisplay() {
  // Update each widget display
  for (int i = 0; i < widgetCount; i++) {
    drawWidget(i);
  }
  
  // Update status
  tft.setTextSize(1);
  tft.setTextColor(TFT_GREEN);
  tft.fillRect(200, 5, 120, 20, TFT_BLACK);
  tft.drawString("Updated: " + String(millis() / 1000) + "s", 200, 5);
}

void drawWidget(int index) {
  if (!widgets[index].hasData) return;
  
  int y = 40 + (index * WIDGET_HEIGHT);
  int x = 10;
  
  // Clear widget area
  tft.fillRect(x, y, SCREEN_WIDTH - 20, WIDGET_HEIGHT - 10, TFT_BLACK);
  
  // Widget type and symbol
  tft.setTextSize(1);
  tft.setTextColor(TFT_YELLOW);
  tft.drawString(widgets[index].type + ": " + widgets[index].symbol, x, y);
  
  // Value
  tft.setTextSize(2);
  tft.setTextColor(TFT_WHITE);
  String valueText = widgets[index].unit + widgets[index].value;
  tft.drawString(valueText, x, y + 15);
  
  // Change (if available)
  if (widgets[index].change.length() > 0) {
    tft.setTextSize(1);
    
    // Color based on positive/negative change
    bool isPositive = widgets[index].change.indexOf('-') == -1;
    tft.setTextColor(isPositive ? TFT_GREEN : TFT_RED);
    
    tft.drawString(widgets[index].change, x + 150, y + 20);
  }
}

void displayMessage(String message) {
  tft.fillScreen(TFT_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(TFT_WHITE);
  tft.drawString(message, 10, 100);
}

void displayError(String error) {
  tft.setTextSize(1);
  tft.setTextColor(TFT_RED);
  tft.fillRect(0, SCREEN_HEIGHT - 20, SCREEN_WIDTH, 20, TFT_BLACK);
  tft.drawString("Error: " + error, 5, SCREEN_HEIGHT - 15);
}

void sendHeartbeat() {
  if (client.connected()) {
    String topic = "dashboard/" + String(deviceToken) + "/heartbeat";
    
    DynamicJsonDocument doc(256);
    doc["timestamp"] = millis();
    doc["wifi_rssi"] = WiFi.RSSI();
    doc["free_heap"] = ESP.getFreeHeap();
    
    String payload;
    serializeJson(doc, payload);
    
    client.publish(topic.c_str(), payload.c_str());
  }
}