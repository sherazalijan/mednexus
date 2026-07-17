import json

with open("output.json", "r") as f:
    data = json.load(f)

print("MCQs:", len(data["mcqs"]))

for mcq in data["mcqs"][:2]:
    print(mcq["question"])
    