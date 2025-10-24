from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from transformers import pipeline
import sys

# --- Load the model ONCE when the server starts ---
print("Loading financial advisor LLM...")
try:
    # Load the text-generation pipeline with your chosen model
    model = pipeline("text-generation", model="TinyLlama/TinyLlama-1.1B-Chat-v1.0")
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Create a Flask web server
app = Flask(__name__)
# --- ADD THIS LINE ---
CORS(app)  # This allows your React app to call this server

# --- THIS ROUTE IS CHANGED to match your React code ---
@app.route('/api/financial-advice', methods=['POST'])
def get_advice():
    """
    This endpoint receives a prompt and returns financial advice from the LLM.
    """
    if model is None:
        return jsonify({"error": "Model is not available."}), 500

    data = request.get_json()
    if not data or 'query' not in data:
        # Changed 'prompt' to 'query' to match your React app's request
        return jsonify({"error": "Query not provided."}), 400

    prompt = data['query']
    user_data = data.get('userData', {}) # Get user data if sent

    # You can format a better prompt for the LLM here
    formatted_prompt = f"<|user|>\n{prompt}\n<|assistant|>\n"

    try:
        # --- Generate response using the pre-loaded model ---
        response = model(formatted_prompt, max_length=400, num_return_sequences=1)[0]['generated_text']

        # Extract only the assistant's response from the generated text
        assistant_response = response.split("<|assistant|>")[-1].strip()
        if "<|" in assistant_response:
            assistant_response = assistant_response.split("<|")[0].strip()

        return jsonify({"response": assistant_response})

    except Exception as e:
        print(f"Error during text generation: {e}")
        return jsonify({"error": "Failed to generate response."}), 500

if __name__ == '__main__':
    # Run the Flask server on port 5000
    app.run(host='0.0.0.0', port=5000)