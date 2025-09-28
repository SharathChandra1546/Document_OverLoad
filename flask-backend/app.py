from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
from ocr import process_file  # Import our OCR processing function

# Load environment variables from .env file
load_dotenv()

# ---------------- Configuration ----------------
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])  # Enable CORS for frontend

# Configure upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure allowed file extensions
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

# ---------------- Helper Functions ----------------
def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ---------------- Routes ----------------
@app.route("/")
def index():
    """Health check endpoint"""
    return jsonify({
        "message": "OCR Backend API is running",
        "status": "healthy"
    })

@app.route("/upload", methods=["POST"])
def upload_file():
    """
    Upload a file, process it with OCR, and return the extracted text.
    
    Expected form data:
        file: The file to process
        
    Returns:
        JSON response with extracted text and metadata
    """
    # Check if file is present in request
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    
    # Check if file has a filename
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({
            "error": "File type not allowed",
            "allowed_types": list(ALLOWED_EXTENSIONS)
        }), 400

    try:
        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Process the file using our OCR function
        result = process_file(file_path)
        
        # Check if there was an error in processing
        if "error" in result:
            return jsonify({
                "error": result["error"],
                "status": "error"
            }), 500
        
        # Return the result as JSON
        return jsonify({
            "filename": filename,
            "text": result.get("text", ""),
            "summary": result.get("summary", ""),
            "status": "success"
        })
        
    except Exception as e:
        # Handle any errors during processing
        return jsonify({
            "error": f"Error processing file: {str(e)}",
            "status": "error"
        }), 500

# ---------------- Main ----------------
if __name__ == "__main__":
    print("Starting OCR Backend Server...")
    print("Upload endpoint: http://localhost:5000/upload")
    app.run(debug=True, host="0.0.0.0", port=5000)