from flask import Flask, request
from datetime import datetime
import os

app = Flask(__name__)

log_dir = "logs"
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
log_path = os.path.join(log_dir, f"log_{timestamp}.json")
file = open(log_path, "ab")

@app.route("/", methods=["POST"])
def receive_data():
    file.write(request.data + b"\n")
    return "Data received and written to file", 200

if __name__ == "__main__":
    app.run(debug=True)
