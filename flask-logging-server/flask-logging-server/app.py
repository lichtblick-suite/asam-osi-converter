from flask import Flask, request
from datetime import datetime
import os
import atexit

app = Flask(__name__)

log_dir = "logs"
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
log_path = os.path.join(log_dir, f"log_{timestamp}.json")

if not os.path.exists(log_dir):
    os.makedirs(log_dir)

file = open(log_path, "ab")
if os.path.getsize(log_path) == 0:
    file.write(b'{"logs": [\n')

def close_file():
    file.seek(-2, os.SEEK_END)
    file.truncate()
    file.write(b"\n]}")
    file.close()

atexit.register(close_file)

@app.route("/", methods=["POST"])
def receive_data():
    file.write(b"\t" + request.data + b",\n")
    return "Data received and written to file", 200

if __name__ == "__main__":
    app.run(debug=True)
