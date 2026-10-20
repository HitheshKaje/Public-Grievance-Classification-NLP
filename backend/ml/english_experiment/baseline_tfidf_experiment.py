"""
Baseline NLP Classifier for English Public Grievance Department Classification
Task: 7-Class Municipal Department Classification
Feature: complaint_text
Target: department
Directory: D:\\PublicGravianceClassification\\backend\\ml\\english_experiment\\
"""

import os
import sys
import csv
import argparse

def load_split(filepath):
    texts, labels = [], []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row["complaint_text"])
            labels.append(row["department"])
    return texts, labels

def run_baseline_experiment():
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
        from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
    except ImportError:
        print("Error: scikit-learn is required to execute the baseline experiment.")
        print("Please install scikit-learn: pip install scikit-learn")
        return

    base_dir = os.path.dirname(os.path.abspath(__file__))
    train_path = os.path.join(base_dir, "train.csv")
    val_path = os.path.join(base_dir, "validation.csv")
    test_path = os.path.join(base_dir, "test.csv")

    print("=" * 70)
    print("RUNNING BASELINE EXPERIMENT: TF-IDF + LOGISTIC REGRESSION")
    print("=" * 70)

    print("Loading datasets...")
    train_texts, train_labels = load_split(train_path)
    val_texts, val_labels = load_split(val_path)
    test_texts, test_labels = load_split(test_path)

    print(f"Train samples:      {len(train_texts)}")
    print(f"Validation samples: {len(val_texts)}")
    print(f"Test samples:       {len(test_texts)}")

    # 1. Feature Extraction: TF-IDF
    print("\nFitting TF-IDF Vectorizer on train.csv...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        sublinear_tf=True,
        stop_words="english"
    )
    X_train = vectorizer.fit_transform(train_texts)
    X_val = vectorizer.transform(val_texts)
    X_test = vectorizer.transform(test_texts)
    print(f"Vocabulary size: {len(vectorizer.vocabulary_)} features")

    # 2. Classifier: Logistic Regression (Multinomial)
    print("\nTraining Logistic Regression Classifier...")
    clf = LogisticRegression(
        C=1.0,
        max_iter=1000,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X_train, train_labels)

    # 3. Evaluation on Validation Set
    val_preds = clf.predict(X_val)
    val_acc = accuracy_score(val_labels, val_preds)
    print("\n" + "-" * 70)
    print(f"VALIDATION SET RESULTS (Accuracy: {val_acc:.4f})")
    print("-" * 70)
    print(classification_report(val_labels, val_preds, digits=4))

    # 4. Evaluation on Test Set
    test_preds = clf.predict(X_test)
    test_acc = accuracy_score(test_labels, test_preds)
    print("\n" + "-" * 70)
    print(f"TEST SET RESULTS (Accuracy: {test_acc:.4f})")
    print("-" * 70)
    print(classification_report(test_labels, test_preds, digits=4))

    print("=" * 70)
    print("Baseline experiment completed.")

if __name__ == "__main__":
    run_baseline_experiment()
