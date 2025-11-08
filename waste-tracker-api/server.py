import sqlite3
import os
import json
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager

# --- Setup ---
app = Flask(__name__)

# Configure JWT - MUST be a secret key
app.config["JWT_SECRET_KEY"] = "your-very-secret-key-that-should-be-long-and-random"
jwt = JWTManager(app)

# Database Setup
DATABASE = 'users.db'

def init_db():
    """Initializes the SQLite database and creates the users table."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Ensure the database is ready when the app starts
with app.app_context():
    init_db()

# --- Utility Functions ---
def get_db_connection():
    """Returns a new database connection."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row # Allows access by column name
    return conn

# --- API Endpoints ---

@app.route('/register', methods=['POST'])
def register():
    """Registers a new user with a hashed password."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, hashed_password)
        )
        conn.commit()
        return jsonify({"msg": f"User {username} created successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"msg": "Username already exists"}), 409
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    """Authenticates a user and returns an access token."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()

    if user and check_password_hash(user['password'], password):
        # Create a token, using the user ID as the identity
        access_token = create_access_token(identity=user['id'])
        return jsonify(access_token=access_token, user_id=user['id']), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/waste/log', methods=['POST'])
@jwt_required()
def log_waste():
    """Protected endpoint to log waste (mock endpoint)."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # In a real app, you would save this data to a waste-specific table
    print(f"User {current_user_id} logged waste: {data}")
    return jsonify({"msg": "Waste logged successfully", "user_id": current_user_id}), 200

@app.route('/waste/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_waste(user_id):
    """Protected endpoint to retrieve user's waste data (mock endpoint)."""
    # In a real app, you would check if get_jwt_identity() matches user_id
    # For simplicity, we just return mock data based on the user ID
    
    # Simple, deterministic mock data based on user_id
    mock_data = []
    
    # Create enough entries to generate 3 pieces of garbage (30 points)
    for i in range(1, 4):
        mock_data.append({
            "id": f"log-{user_id}-{i}",
            "points": 10,
            "type": "plastic",
            "date": "2024-01-01"
        })
    
    return jsonify(mock_data), 200

# To run:
# export FLASK_APP=server.py
# flask run
if __name__ == '__main__':
    app.run(debug=True, port=5000)