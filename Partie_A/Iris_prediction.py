import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix


iris_data = pd.read_csv("IRIS_ Flower_Dataset.csv")

X = iris_data.drop(['Species', 'Id'], axis=1)
y = iris_data['Species']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.8, random_state=42)


model = SVC(probability=True)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("Confusion Matrix :\n", confusion_matrix(y_test, y_pred))
print("\nclassification report :\n", classification_report(y_test, y_pred))

from sklearn.model_selection import GridSearchCV

param_grid = {'C': [0.1, 1, 10, 100], 'gamma': [1, 0.1, 0.01, 0.001], 'kernel': ['rbf', 'linear', 'poly', 'sigmoid']}
grid_model = GridSearchCV(model, param_grid, refit=True, verbose=3)
grid_model.fit(X_train, y_train)

print("Best hyperparameters :", grid_model.best_params_)

y_pred_test = grid_model.predict(X_test)

print("Confusion Matrix :\n", confusion_matrix(y_test, y_pred_test))
print("\nClassification report :\n", classification_report(y_test, y_pred_test))


import pickle
pickle.dump(grid_model, open('model.pkl', 'wb'))
