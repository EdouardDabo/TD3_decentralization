from flask import Flask, request, jsonify
import pickle
import numpy as np

model = pickle.load(open('model.pkl', 'rb'))

app = Flask(__name__)

@app.route('/')
def home():
    return "API de prédiction de l'Iris avec Flask"

@app.route('/predict', methods=['GET'])
def predict():
    try:
        sepal_length = float(request.args.get('sepal_length'))
        sepal_width = float(request.args.get('sepal_width'))
        petal_length = float(request.args.get('petal_length'))
        petal_width = float(request.args.get('petal_width'))

        features = np.array([[sepal_length, sepal_width, petal_length, petal_width]])

        prediction = model.predict(features)
        probabilities = model.best_estimator_.predict_proba(features).tolist()[0] if hasattr(model, 'best_estimator_') else None

        return jsonify({
            "class_name": str(prediction[0]),
            "probabilities": probabilities

        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port = 5002, debug=True)
