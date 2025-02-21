import json
import os
import argparse

def is_json_valid(file_path):
    if not os.path.isfile(file_path):
        print(f"File {file_path} does not exist.")
        return False

    try:
        with open(file_path, "r") as file:
            json.load(file)
        print(f"File {file_path} is a valid JSON.")
        return True
    except json.JSONDecodeError as e:
        print(f"File {file_path} is not a valid JSON. Error: {e}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Check if a JSON file is valid.")
    parser.add_argument("file_path", type=str, help="Path to the JSON file to be checked")
    args = parser.parse_args()

    file_path = args.file_path
    is_json_valid(file_path)