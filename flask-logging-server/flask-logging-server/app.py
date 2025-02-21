from flask import Flask, request
import logging
import os
import json
from datetime import datetime

app = Flask(__name__)

log_dir = "logs"
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
log_path = os.path.join(log_dir, f"log_{timestamp}.jsonl")

if not os.path.exists(log_dir):
    os.makedirs(log_dir)

logger = logging.getLogger("asam-osi-converter-logger")
logger.setLevel(logging.INFO)

file_handler = logging.FileHandler(log_path)
file_handler.setLevel(logging.INFO)

class JSONFormatter(logging.Formatter):
    def format(self, record):
        try:
            message = json.loads(record.getMessage())
        except json.JSONDecodeError:
            message = record.getMessage()
        
        log_entry = {
            "time": self.formatTime(record, self.datefmt),
            "message": message,
        }
        return json.dumps(log_entry)

formatter = JSONFormatter()
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

@app.route("/", methods=["POST"])
def receive_data():
    data = request.data.decode("utf-8")
    logger.info(data)
    return "Data received and logged", 200

if __name__ == "__main__":
    app.run(debug=True)
