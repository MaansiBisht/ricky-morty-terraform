import requests
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client.rick_and_morty
collection = db.characters

# Fetch data from Rick and Morty API
response = requests.get("https://rickandmortyapi.com/api/character/")
data = response.json()

# Insert characters into MongoDB
for character in data['results']:
    collection.update_one({"id": character["id"]}, {"$set": character}, upsert=True)

print("Data inserted successfully")

# Query MongoDB to check if data was inserted
# characters_in_db = collection.find()

# Print the first 5 characters from the collection for verification
# for i, character in enumerate(characters_in_db):
#     if i < 5:  # Just print the first 5 documents
#         print(character)
#     else:
#         break

total_documents = collection.count_documents({})

# Print the total number of documents
print("Total number of documents in the collection:", total_documents)