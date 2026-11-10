package handler

import (
	"encoding/json"
	"errors"
	"strings"
)

type salonReview struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
	Date    string `json:"date"`
}

func validateReviews(raw string) (string, error) {
	var reviews []salonReview
	if err := json.Unmarshal([]byte(raw), &reviews); err != nil || reviews == nil || len(reviews) > 100 {
		return "", errors.New("Informe até 100 depoimentos válidos.")
	}
	seen := map[string]bool{}
	for i := range reviews {
		r := &reviews[i]
		r.Name, r.Comment = strings.TrimSpace(r.Name), strings.TrimSpace(r.Comment)
		if r.ID == "" || len(r.ID) > 100 || seen[r.ID] || r.Name == "" || len(r.Name) > 150 || r.Comment == "" || len(r.Comment) > 2000 || r.Rating < 1 || r.Rating > 5 || len(r.Date) > 30 {
			return "", errors.New("Revise o nome, comentário e nota de 1 a 5 de cada depoimento.")
		}
		seen[r.ID] = true
	}
	clean, err := json.Marshal(reviews)
	return string(clean), err
}
