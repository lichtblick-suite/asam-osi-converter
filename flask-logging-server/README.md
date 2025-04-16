## Flask Logging Server for asam-osi-converter Lichtblick Extension

### Execution

Run the following commands in this directory:

```sh
poetry install
```

```sh
poetry run python flask-logging-server/app.py
```

(Optional) Formatting jsonl log files (json line files) to valid json files using `jq`:

```sh
jq -s . logs.jsonl > logs_array.json
```
