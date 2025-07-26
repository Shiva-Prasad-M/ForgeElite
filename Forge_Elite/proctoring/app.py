from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
import base64, cv2, numpy as np
from datetime import datetime
import os
import torch  # Load YOLOv5 model
import face_recognition
from flask_cors import cross_origin
import PyPDF2
from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
import gridfs
from ultralytics import YOLO

app = Flask(__name__)

CORS(app, origins=["http://localhost:5173","http://localhost:5174"])

client = MongoClient("mongodb://localhost:27017/")  # Update with your MongoDB URI if needed
db = client.SampleDataBase  # Connect to your database
fs = gridfs.GridFS(db)
collection = db["Selfie"]

# Load YOLOv5 model using PyTorch
model = YOLO("yolov8n.pt")  
model.conf = 0.4  # Confidence threshold

prototxt_path = r"C:\Users\dilee\Forge_Elite\proctoring\models\MobileNetSSD_deploy.prototxt.txt"
caffemodel_path = r"C:\Users\dilee\Forge_Elite\proctoring\models\MobileNetSSD_deploy.caffemodel"

net = cv2.dnn.readNetFromCaffe(prototxt_path, caffemodel_path)


CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor", "laptop", "cell phone", "tablet"]

DEVICE_CLASSES = {"cell phone", "laptop", "tablet", "tv", "monitor"}

CAPTURE_DIR = "captures"
os.makedirs(CAPTURE_DIR, exist_ok=True)

# Load OpenCV's Haar cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

@app.route("/proctor/upload", methods=["POST"])
@cross_origin(["http://localhost:5173","http://localhost:5174"])
def upload_image():
    try:
        # Decode base64 image
        data = request.json.get('image', '')
        if not data:
            return jsonify({"error": "No image data received"}), 400

        encoded = data.split(",")[1]
        img_data = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)

        if len(faces) == 0:
            return jsonify({"warning": "No face detected!"}), 200
        if len(faces) > 1:
            return jsonify({"warning": "Multiple faces detected. Please be alone in the frame."}), 200

        # Blurriness check using Laplacian
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 80:
            return jsonify({"warning": "Face is too blurry or low lighting. Try again."}), 200

        # --- YOLOv8 Object Detection ---
        results = model(img)[0]  # Get the first result
        detected_devices = []

        if results.boxes is not None:
            for box in results.boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                label = model.names[cls_id]

                if conf > 0.4 and label in ["cell phone", "laptop", "tablet"]:
                    detected_devices.append(label)

        if detected_devices:
            return jsonify({
                "status": "Device detected",
                "devices": detected_devices,
                "action": "logout"
            }), 200

        # Get user ID from token (for now assuming token itself is user_id)
        user_id = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not user_id:
            return jsonify({"error": "User ID/token missing"}), 400

        # Save image to MongoDB using GridFS
        img_binary = BytesIO(img_data)
        fs.put(img_binary, filename=f"{user_id}_registered.jpg", user_id=user_id)

        # Save selfie record in MongoDB (optional)
        selfie = {
            "user_id": user_id,
            "image_id": f"{user_id}_registered.jpg",
            "timestamp": datetime.utcnow()
        }
        db.Selfie.insert_one(selfie)

        return jsonify({"success": True, "status": "Valid face detected. No external devices found."}), 200

    except Exception as e:
        print("Upload error:", str(e))
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route("/proctor/detect-device", methods=["POST"])
def detect_device():
    try:
        # Get base64 image from frontend
        data = request.json['image']
        encoded = data.split(",")[1]
        img_data = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Run YOLOv8 inference
        results = model(img)[0]  # Get first result from list

        detected_devices = []
        for box in results.boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            confidence = float(box.conf[0])

            print(f"Detected {label} with confidence {confidence:.2f}")

            if label in DEVICE_CLASSES:
                detected_devices.append(label)

        if detected_devices:
            return jsonify({
                "status": "Device detected",
                "devices": detected_devices,
                "action": "logout",
            }), 200

        return jsonify({"status": "No device detected"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/save-selfie', methods=['POST'])
def save_selfie():
    data = request.get_json()
    image_data = data['image']
    user_id = data['userId']

    try:
        img_bytes = base64.b64decode(image_data.split(",")[1])
        with open(f"faces/{user_id}.jpg", "wb") as f:
            f.write(img_bytes)
        return jsonify({"status": "saved"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/proctor/tab-warning", methods=["POST"])
def tab_warning():
    data = request.json
    print("Tab violation:", data)
    return jsonify({"status": "Tab switch logged"}), 200

@app.route('/compare-face', methods=['POST'])
def compare_face():
    try:
        data = request.get_json()
        image_data = data.get('image')
        user_id = data.get('userId')

        # Check if image data and user_id are provided
        if not image_data or not user_id:
            return jsonify({'match': False, 'error': 'Missing image or userId'}), 400

        # Retrieve the stored face encoding from the database
        stored_data = collection.find_one({"user_id": user_id})

        # Check if the stored data exists
        if not stored_data:
            return jsonify({'match': False, 'error': 'Reference image not found in the database'}), 404

        # Extract the stored face encoding from the database
        stored_encoding = np.frombuffer(base64.b64decode(stored_data["face_encoding"]), dtype=np.float64)

        # Decode the current image from base64
        current_image = face_recognition.load_image_file(BytesIO(base64.b64decode(image_data.split(",")[1])))
        current_encodings = face_recognition.face_encodings(current_image)

        # Check if there are any faces in the current image
        if not current_encodings:
            return jsonify({'match': False, 'error': 'No face in current image'}), 400

        # Compare the faces from the stored image and current image
        match = face_recognition.compare_faces([stored_encoding], current_encodings[0])[0]

        # Return the result of the comparison
        return jsonify({'match': match}), 200

    except Exception as e:
        return jsonify({'match': False, 'error': str(e)}), 500

ROLE_KEYWORDS = {
    "Frontend Developer": [
        "react", "javascript", "typescript", "css", "html", "redux", "tailwind", "ui/ux", "responsive design",
        "frontend", "material ui", "bootstrap", "figma", "webpack", "vite", "accessibility"
    ],
    "Backend Developer": [
        "node", "express", "mongodb", "sql", "api", "authentication", "jwt", "restful", "microservices",
        "docker", "kubernetes", "redis", "backend", "scalability", "spring boot"
    ],
    "Data Scientist": [
        "python", "pandas", "numpy", "machine learning", "sklearn", "regression", "classification",
        "data analysis", "data visualization", "matplotlib", "seaborn", "deep learning", "tensorflow",
        "nlp", "model evaluation", "data preprocessing"
    ],
    "Full Stack Developer": [
        "react", "node", "mongodb", "express", "fullstack", "api", "jwt", "typescript", "docker", "ci/cd",
        "agile", "graphql", "rest api", "integration", "testing", "unit test", "microservices"
    ]
}


COMMON_KEYWORDS = [
    "projects", "technical skills", "problem solving", "certifications", "achievements",
    "leadership", "team player", "collaboration", "project management", "communication", "github"
]

def extract_text_from_pdf(file_stream):
    reader = PyPDF2.PdfReader(file_stream)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.lower()

@app.route('/score-resume', methods=['POST'])
def score_resume():
    role = request.form.get('role', '').lower()
    pdf_file = request.files.get('resume')

    if not role or not pdf_file:
        return jsonify({"error": "Role and resume required"}), 400

    text = extract_text_from_pdf(pdf_file.stream)

    role_keywords = ROLE_KEYWORDS.get(role, [])
    total_keywords = role_keywords + COMMON_KEYWORDS

    matched_keywords = [kw for kw in total_keywords if kw in text]
    score = int((len(matched_keywords) / len(total_keywords)) * 100)

    suggestion = "✅ Great resume! You're good to go." if score > 60 else "⚠️ Consider updating your resume with more relevant skills, projects, and keywords."

    return jsonify({
        "score": score,
        "matched_keywords": matched_keywords,
        "total_keywords": len(total_keywords),
        "suggestion": suggestion
    })


if __name__ == "__main__":
    app.run(debug=True)
