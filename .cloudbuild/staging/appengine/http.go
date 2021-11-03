package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
)

var (
	intlMatcher = regexp.MustCompile(`^/intl/([-_\w]+)(/.*|)$`)
)

func main() {
	fileServer := http.FileServer(http.Dir("prod"))
	handler := rewriteLang(fileServer)

	http.Handle("/", handler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	log.Printf("Serving on %s...", addr)
	http.ListenAndServe(addr, nil)
}

// pathForLangFile serves the specified "rest" file for the given lang, falling
// back to the top-level if it doesn't exist there.
func pathForLangFile(lang, rest string) string {
	if len(rest) != 0 && rest[0] == '/' {
		rest = rest[1:] // trim leading slash
	}
	check := fmt.Sprintf("prod/intl/%s_ALL/%s", lang, rest)
	if _, err := os.Stat(check); err != nil && os.IsNotExist(err) {
		return fmt.Sprintf("/%s", rest)
	}
	return fmt.Sprintf("/intl/%s_ALL/%s", lang, rest)
}

func rewriteLang(wrapped http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		found := intlMatcher.FindStringSubmatch(r.URL.Path)
		if found != nil {
			// this was an /intl/de/... request, rewrite it
			lang, rest := found[1], found[2]
			r.URL.Path = pathForLangFile(lang, rest)
		}
		wrapped.ServeHTTP(w, r)
	})
}
