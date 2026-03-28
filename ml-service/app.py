from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
# This allows React (Port 5173) to talk directly to Python (Port 5000)
CORS(app) 

print("🧠 Loading AI Forecasting Engine...")
# Load the Random Forest model we just trained
model = joblib.load('forecast_model.pkl')
print("✅ Brain Loaded and Ready!")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 1. Catch the JSON numbers sent by React
        data = request.json
        
        temp = float(data.get('temperature', 24.0))
        oxy = float(data.get('oxygen', 8.0))
        turb = float(data.get('turbidity', 3.0))
        ph = float(data.get('ph', 7.2))

        # 2. Package them into a Pandas DataFrame
        features = pd.DataFrame([[temp, oxy, turb, ph]], 
                                columns=['temperature', 'oxygen', 'turbidity', 'ph'])
        
        # 3. Look into the future!
        prediction = model.predict(features)[0]
        future_ph = prediction[0]
        future_turbidity = prediction[1]

        # 4. Check if the FUTURE state is dangerous
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

if __name__ == '__main__':
    app.run(port=5000, debug=True)