from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import sys

# --- Load the model ONCE when the server starts ---
print("Loading financial advisor LLM...")
try:
    # Using TinyLlama as it is lightweight and effective for this demo
    model = pipeline("text-generation", model="TinyLlama/TinyLlama-1.1B-Chat-v1.0")
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/api/financial-advice', methods=['POST'])
def get_advice():
    if model is None:
        return jsonify({"error": "Model is not available."}), 500

    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "Query not provided."}), 400

    user_query = data['query']
    user_data = data.get('userData', {})

    # Construct Context string
    context_info = ""
    if user_data:
        inc = user_data.get('monthly_income', 'N/A')
        exp = user_data.get('total_expenses', 'N/A')
        sav = user_data.get('savings', 'N/A')
        curr = user_data.get('currency', 'INR')
        context_info = (
            f"Context: The user has a monthly income of {curr} {inc}, "
            f"expenses of {curr} {exp}, and savings of {curr} {sav}. "
        )

    # Prompt Engineering
    # We instruct the model to act as a financial advisor using the context
    prompt = (
        f"<|system|>\nYou are a helpful financial advisor. "
        f"Use the following user context to give personalized advice.\n{context_info}\n</s>\n"
        f"<|user|>\n{user_query}\n</s>\n"
        f"<|assistant|>\n"
    )

    try:
        # Generate response
        generated = model(prompt, max_length=512, do_sample=True, temperature=0.7, top_k=50)[0]['generated_text']

        # Extract only the assistant's part
        response_text = generated.split("<|assistant|>")[-1].strip()
        
        return jsonify({"response": response_text})

    except Exception as e:
        print(f"Generation Error: {e}")
        return jsonify({"error": "Failed to generate response."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)