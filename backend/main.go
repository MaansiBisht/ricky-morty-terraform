package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Handling request to get characters by name or all characters by default
func getCharacter(w http.ResponseWriter, r *http.Request) {
	// Connecting to MongoDB
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Println("Error connecting to MongoDB:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	collection := client.Database("rick_and_morty").Collection("characters")

	// Get the "name" query parameter from the URL (if any)
	name := r.URL.Query().Get("name")

	var cursor *mongo.Cursor
	if name != "" {
		// If a name is provided, search for that character by partial name using a case-insensitive regex
		filter := bson.D{
			{Key: "name", Value: bson.D{
				{Key: "$regex", Value: name},  // Search for partial match
				{Key: "$options", Value: "i"}, // Case-insensitive search
			}},
		}
		cursor, err = collection.Find(context.Background(), filter)
	} else {
		// If no name is provided, fetch all characters
		cursor, err = collection.Find(context.Background(), bson.D{})
	}

	if err != nil {
		log.Println("Error fetching characters:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	// Create a slice to hold the results
	var characters []map[string]interface{}

	// Iterate through the cursor and decode the documents into the slice
	for cursor.Next(context.Background()) {
		var character map[string]interface{}
		err := cursor.Decode(&character)
		if err != nil {
			log.Println("Error decoding character:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		characters = append(characters, character)
	}

	if err := cursor.Err(); err != nil {
		log.Println("Cursor iteration error:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	charactersJSON, err := json.Marshal(characters)
	if err != nil {
		log.Println("Error marshaling characters:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(charactersJSON)
}

func main() {
	// HTTP handler for the "/character" route
	http.HandleFunc("/character", getCharacter)

	port := "8000"
	fmt.Printf("Server running at http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
