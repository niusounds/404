package topics

import (
	"bufio"
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// Topic is one entry in _meta/topics.jsonl.
type Topic struct {
	Topic     string `json:"topic"`
	Category  string `json:"category"`   // "supernatural", "hitokowa", "mystery"
	Example   string `json:"example"`    // hint for the LLM
}

// HistoryEntry records which topic was selected, when, and at which attempt.
type HistoryEntry struct {
	Timestamp  string `json:"timestamp"`
	Topic      string `json:"topic"`
	Category   string `json:"category"`
	Result     string // "success" or "failed"
	Attempt    int    `json:"attempt"`
}

// Selector picks the next topic, respecting diversity rules.
type Selector struct {
	topicsPath string
	seen       map[string]int // topic -> usage count (from history)
	rng        *rand.Rand
}

// NewSelector reads _meta/topics.jsonl as the canonical pool and tracks history.
func NewSelector(repoRoot, topicsJSONL string) (*Selector, error) {
	if !filepath.IsAbs(topicsJSONL) {
		topicsJSONL = filepath.Join(repoRoot, topicsJSONL)
	}

	entries := make([]Topic, 0)
	f, err := os.Open(topicsJSONL)
	if err != nil {
		return nil, fmt.Errorf("open topics file: %w", err)
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || line[0] != '{' {
			continue
		}
		var t Topic
		if err := json.Unmarshal([]byte(line), &t); err != nil {
			return nil, fmt.Errorf("parse topic: %w (line=%s)", err, line)
		}
		entries = append(entries, t)
	}

	if len(entries) == 0 {
		fmt.Fprintln(os.Stderr, "[topics] No usable topics in", topicsJSONL, "--- falling back to empty pool")
	}

	return &Selector{
		topicsPath: topicsJSONL,
		seen:       make(map[string]int),
		rng:        rand.New(rand.NewSource(time.Now().UnixNano())),
	}, nil
}

// SelectNext picks the next topic using these priority rules (in order):
//   1. Never repeat the same topic within a window of `recentHistory` entries.
//   2. Prefer topics from underused categories in recent history.
//   3. Among remaining candidates, pick with slight bias toward those never selected yet.
func (s *Selector) SelectNext(recentHistory []string, recentPosts int) (Topic, error) {
	entries := s.loadAll()
	if len(entries) == 0 {
		return Topic{}, fmt.Errorf("no topics available")
	}

	recentSeen := make(map[string]bool)
	for _, h := range recentHistory {
		recentSeen[h] = true
	}

	// Category counts in recent posts.
	catCount := map[string]int{"supernatural": 0, "hitokowa": 0, "mystery": 0}
	for _, p := range recentPostsSlice(recentPosts) {
		if cat, ok := recentPostCategory(p); ok {
			catCount[cat]++
		}
	}

	candidates := make([]Topic, 0, len(entries))
	for _, e := range entries {
		if !recentSeen[e.Topic] {
			candidates = append(candidates, e)
		}
	}

	if len(candidates) == 0 {
		// Allow re-use if everything has been seen.
		candidates = append(candidates, entries...)
	}

	// Rank by: never-used first, then least-used in category (i.e. avoid the most common recent category).
	sort.SliceStable(candidates, func(i, j int) bool {
		a := candidates[i]
		b := candidates[j]
		sa, _ := s.entryFor(a.Topic)
		sb, _ := s.entryFor(b.Topic)

		// Never-used before used.
		if sa.Timestamp == "" && sb.Timestamp != "" {
			return true
		}
		if sb.Timestamp == "" && sa.Timestamp != "" {
			return false
		}

		// Less frequently seen in recent history = higher score (avoid the overused category).
		saCat := catCount[a.Category]
		sbCat := catCount[b.Category]
		if saCat <= sbCat {
			return true
		}
		return false
	})

	idx := s.rng.Intn(len(candidates))
	selected := candidates[idx]
	s.recordSelected(selected)
	return selected, nil
}

// recordSelected appends to the history JSONL file.
func (s *Selector) recordSelected(t Topic) {
	histPath := filepath.Dir(s.topicsPath) + "/topics-history.jsonl"
	f, err := os.OpenFile(histPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Fprintln(os.Stderr, "[topics] cannot open history file:", err)
		return
	}
	defer f.Close()

	entry := HistoryEntry{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Topic:     t.Topic,
		Category:  t.Category,
		Result:    "pending",
		Attempt:   1,
	}
	data, _ := json.Marshal(entry)
	f.Write(append(data, '\n'))
}

// MarkResult updates the most recent history entry.
func (s *Selector) MarkResult(topic string, result HistoryEntry) {
	histPath := filepath.Dir(s.topicsPath) + "/topics-history.jsonl"
	lines, _ := os.ReadFile(histPath)
	text := strings.TrimSpace(string(lines))
	if text == "" {
		return
	}
	scanner := bufio.NewScanner(strings.NewReader(text))
	type lineIdx struct {
		content string
		index   int
	}
	var lastMatch *lineIdx
	idx := 0

	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, topic) {
			lastMatch = &lineIdx{content: line, index: idx}
		}
		idx++
	}
	if lastMatch == nil {
		return
	}

	var e HistoryEntry
	json.Unmarshal([]byte(lastMatch.content), &e)
	e.Result = result.Result
	if result.Attempt > 0 {
		e.Attempt = result.Attempt
	}
	data, _ := json.Marshal(e)

	lines2 := strings.Split(text, "\n")
	lines2[lastMatch.index] = string(data)
	os.WriteFile(histPath, []byte(strings.Join(lines2, "\n"))+"\n", 0644)
}

// loadAll reads all Topic entries from the JSONL file.
func (s *Selector) loadAll() []Topic {
	f, err := os.Open(s.topicsPath)
	if err != nil {
		return nil
	}
	defer f.Close()
	var out []Topic
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || line[0] != '{' {
			continue
		}
		var t Topic
		if err := json.Unmarshal([]byte(line), &t); err != nil {
			continue
		}
		out = append(out, t)
	}
	return out
}

// entryFor returns the most recent history entry for a topic.
func (s *Selector) entryFor(topic string) (HistoryEntry, bool) {
	histPath := filepath.Dir(s.topicsPath) + "/topics-history.jsonl"
	data, err := os.ReadFile(histPath)
	if err != nil || len(data) == 0 {
		return HistoryEntry{}, false
	}
	scanner := bufio.NewScanner(strings.NewReader(string(data)))
	var best *HistoryEntry
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		var e HistoryEntry
		if err := json.Unmarshal([]byte(line), &e); err != nil {
			continue
		}
		if strings.Contains(e.Topic, topic) || (e.Topic == "" && e.Result == "") {
			best = &e
		}
	}
	// Prefer a line that contains the topic name.
	scanner2 := bufio.NewScanner(strings.NewReader(string(data)))
	for scanner2.Scan() {
		line := strings.TrimSpace(scanner2.Text())
		if strings.Contains(line, topic) {
			var e HistoryEntry
			if err := json.Unmarshal([]byte(line), &e); err == nil && e.Topic == topic {
				return e, true
			}
		}
	}
	if best != nil {
		return *best, true
	}
	return HistoryEntry{}, false
}

// --- helpers to read recent posts (stubs; real impl reads _posts/*.md) ---

func recentPostsSlice(n int) []HistoryEntry { return loadRecentHistory(30*60) } // ~last hour approximated

func loadRecentHistory(minutesAgo int) []HistoryEntry {
	histPath := ""
	// placeholder: real implementation would scan topics-history.jsonl and filter by time.
	f, err := os.Open(histPath)
	if err != nil {
		return nil
	}
	defer f.Close()
	var out []HistoryEntry
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || line[0] != '{' {
			continue
		}
		var h HistoryEntry
		if json.Unmarshal([]byte(line), &h) == nil {
			out = append(out, h)
		}
	}
	return out
}

// --- post genre detection helpers (used when selector reads _posts) ---

func recentPostCategory(slug string) (string, bool) {
	if slug == "" {
		return "", false
	}
	if strings.Contains(strings.ToLower(slug), "stalker") ||
		strings.Contains(strings.ToLower(slug), "follower") ||
		strings.Contains(strings.ToLower(slug), "cult") ||
		strings.Contains(strings.ToLower(slug), "workplace") ||
		strings.Contains(strings.ToLower(slug), "neighbor") {
		return "hitokowa", true
	}
	if strings.Contains(strings.ToLower(slug), "mystery") ||
		strings.Contains(strings.ToLower(slug), "missing") {
		return "mystery", true
	}
	return "", false
}
