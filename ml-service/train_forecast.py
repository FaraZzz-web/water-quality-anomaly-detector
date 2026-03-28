import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
from datetime import datetime, timedelta

print("🌊 Booting up AquaAI Forecasting Engine...")

# ==========================================
# 1. GENERATE REALISTIC SYNTHETIC DATA (V2)
# ==========================================
print("📊 Generating 30 days of historical telemetry data...")
np.random.seed(42)
num_records = 720 # 30 days of hourly data

temps = np.zeros(num_records)
turbidity = np.zeros(num_records)
oxygen = np.zeros(num_records)
ph = np.zeros(num_records)

# Initial baseline
temps[0], turbidity[0], oxygen[0], ph[0] = 24.0, 3.0, 8.0, 7.2

# Inject realistic physics using a Random Walk (Momentum)
for i in range(1, num_records):
    # Base: water stays similar to the previous hour
    temps[i] = temps[i-1] + np.random.normal(0, 0.2)
    turbidity[i] = abs(turbidity[i-1] + np.random.normal(0, 0.1))
    oxygen[i] = oxygen[i-1] + np.random.normal(0, 0.1)
    ph[i] = ph[i-1] + np.random.normal(0, 0.05)
    
    # 5% chance a toxic spill happens and PERSISTS
    if np.random.random() > 0.95: 
        ph[i] -= np.random.uniform(1.5, 2.5)       # Acid crashes down
        turbidity[i] += np.random.uniform(4.0, 8.0) # Water gets extremely dirty
        oxygen[i] -= np.random.uniform(3.0, 5.0)    # Oxygen gets choked out

# Keep values within physical limits
ph = np.clip(ph, 0, 14)
oxygen = np.clip(oxygen, 0, 15)

df = pd.DataFrame({'temperature': temps, 'oxygen': oxygen, 'turbidity': turbidity, 'ph': ph})
df['target_future_ph'] = df['ph'].shift(-1)
df['target_future_turbidity'] = df['turbidity'].shift(-1)
df = df.dropna()

# ==========================================
# 2. TRAIN THE PREDICTIVE MODEL
# ==========================================
print("🧠 Training Random Forest Regressor on feature data...")

# Our inputs (Current state)
X = df[['temperature', 'oxygen', 'turbidity', 'ph']]

# Our outputs (Future state we want to predict)
y = df[['target_future_ph', 'target_future_turbidity']]

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Test the model's accuracy (R^2 Score)
score = model.score(X_test, y_test)
print(f"🎯 Model Accuracy (R² Score): {score * 100:.2f}%")

# Save the trained brain
joblib.dump(model, 'forecast_model.pkl')
print("✅ Training Complete! Model saved as 'forecast_model.pkl'")
