package util

import "github.com/agnivade/levenshtein"

func FindClosestStringIndex(target string, candidatesList [][]string) int {
	minIndex := -1
	minDistance := -1

	for i, sameIndexCandidates := range candidatesList {
		for _, candidate := range sameIndexCandidates {
			distance := levenshtein.ComputeDistance(target, candidate)
			if minIndex == -1 || distance < minDistance {
				minIndex = i
				minDistance = distance
			}
		}
	}

	return minIndex
}
