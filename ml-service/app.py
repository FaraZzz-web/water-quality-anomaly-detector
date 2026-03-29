from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
from twilio.rest import Client

app = Flask(__name__)
CORS(app) 

# ==========================================
# 🚨 TWILIO SMS CONFIGURATION 🚨
# Paste your credentials from the Twilio Console here
# ==========================================
TWILIO_ACCOUNT_SID = "AC3dcdc71cfd1f00d63dfd358ef8f23457"
TWILIO_AUTH_TOKEN = "bc3757aedd681a20fb984baa828b12c2"
TWILIO_PHONE_NUMBER = "+12603668193" # Your Twilio Virtual Number
YOUR_CELL_PHONE = "+918929468040"   # Your verified personal phone number (include country code!)

print("🧠 Loading AI Forecasting Engine...")
model = joblib.load('forecast_model.pkl')
print("✅ Brain Loaded and Ready!")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        temp = float(data.get('temperature', 24.0))
        oxy = float(data.get('oxygen', 8.0))
        turb = float(data.get('turbidity', 3.0))
        ph = float(data.get('ph', 7.2))

        features = pd.DataFrame([[temp, oxy, turb, ph]], columns=['temperature', 'oxygen', 'turbidity', 'ph'])
        prediction = model.predict(features)[0]
        future_ph = prediction[0]
        future_turbidity = prediction[1]

        is_threat = future_ph < 6.5 or future_ph > 8.5 or future_turbidity > 5.0
        
        if is_threat:
            status = "CRITICAL FORECAST"
            message = f"🚨 WARNING: AI predicts pH will hit {future_ph:.2f} and turbidity {future_turbidity:.2f} in the next 12 hours. Imminent contamination risk."
        else:
            status = "SAFE FORECAST"
            message = f"✅ Ecosystem stable. Projected 12-hour pH: {future_ph:.2f}, Turbidity: {future_turbidity:.2f}. No anomalies detected."

        return jsonify({
            "status": status,
            "message": message,
            "future_ph": round(future_ph, 2),
            "future_turbidity": round(future_turbidity, 2)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# NEW: EMERGENCY DISPATCH ENDPOINT
# ==========================================
@app.route('/dispatch', methods=['POST'])
def dispatch_alert():
    try:
        data = request.json
        location = data.get('location', 'Unknown Sector')
        ph = data.get('ph', 'N/A')
        turbidity = data.get('turbidity', 'N/A')

        # Super short message to avoid Twilio's Trial character limits
        sms_body = f"🚨 TOXIC ALERT: {location} | pH: {ph} | Turbidity: {turbidity}. Dispatch team immediately."
        # Connect to Twilio and fire the text
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=sms_body,
            from_=TWILIO_PHONE_NUMBER,
            to=YOUR_CELL_PHONE
        )

        return jsonify({"status": "Success", "message_sid": message.sid})

    except Exception as e:
        print(f"Twilio Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)