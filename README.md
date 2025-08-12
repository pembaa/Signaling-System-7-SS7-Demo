# Signaling-System-7-SS7-Demo
# SS7 Awareness Demo (Offline + Optional ML)

## Requirements
- Python 3.8+ and pip
- (Windows) Use PowerShell or Command Prompt
- Recommended: create a virtual environment

## Setup (Windows example)
Open a terminal in the `SS7_DEMO/backend` folder:

1. Create venv (optional)
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate

    Install dependencies

python -m pip install --upgrade pip
pip install -r requirements.txt

Start the backend (it will auto-train the ML model if missing)

python app.py

You should see messages like:

Model not found — training now...
Trained model saved to ss7_anomaly_model.pkl
Loaded model: ...
* Running on http://127.0.0.1:5000

Open the app in your browser:

    http://127.0.0.1:5000

Demo flow suggestions

    Click Start Demo then Run in Simulation to show the OTP interception animation with plain text explanations.

    Open Operator Training:

        Click Start Live Logs (Normal / Sneaky / OTP steal / Burst).

        Press Run Offline Detection to see client-side explainable flags.

        (Optional) Press Run Backend ML Check to compare with the IsolationForest model (backend).

        Press Guaranteed Attack to create a clear malicious burst for demonstration.

Notes

    The backend auto-trains a synthetic model to keep the demo self-contained. For a real deployment you would replace this with a model trained on real logs (and follow privacy/legal rules).

    All simulation steps are educational only and do not interact with any real telecom networks.
