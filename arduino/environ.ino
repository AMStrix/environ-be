#include <dht.h>

dht DHT;

#define DHT22_PIN 5
#define FAN_PIN 7
#define FAN_ON 'a'
#define FAN_OFF 'b'

boolean isFanOn = false;

void setup()
{
    Serial.begin(115200);
    pinMode(FAN_PIN, OUTPUT);
}

void loop()
{
    if (Serial.available() > 0) {
         char c = Serial.read();
         switch (c) {
           case FAN_ON: digitalWrite(FAN_PIN, HIGH); isFanOn = true; break;
           case FAN_OFF: digitalWrite(FAN_PIN, LOW); isFanOn = false; break;
           default: break;
         }
         //Serial.print("got ");
         //Serial.println(c);
    }
    uint32_t start = micros();
    int chk = DHT.read22(DHT22_PIN);
    uint32_t stop = micros();
    String error;

    switch (chk)
    {
    case DHTLIB_OK:
        // OK
        break;
    case DHTLIB_ERROR_CHECKSUM:
        error = "Checksum error";
        break;
    case DHTLIB_ERROR_TIMEOUT:
        error = "Time out error";
        break;
    case DHTLIB_ERROR_CONNECT:
        error = "Connect error";
        break;
    case DHTLIB_ERROR_ACK_L:
        error = "Ack Low error";
        break;
    case DHTLIB_ERROR_ACK_H:
        error = "Ack High error";
        break;
    default:
        error = "Unknown error";
        break;
    }
    
    if (!error.equals("")) {
      Serial.print("{\"error\":\"");
      Serial.print(error);
      Serial.println("\"}"); 
    }
    
    Serial.print("{\"t\":");
    Serial.print(DHT.temperature);
    Serial.print(",\"h\":");
    Serial.print(DHT.humidity);
    Serial.print(",\"f\":");
    Serial.print(isFanOn);
    Serial.print("}");
    Serial.println();

    delay(2000);
}
