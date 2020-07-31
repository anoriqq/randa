package main

import (
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

var db = make(map[string]string)

func setupRouter() *gin.Engine {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	router.Use(static.Serve("/", static.LocalFile("./public", false)))
	router.Use(static.Serve("/", static.LocalFile("./dist", false)))

	api := router.Group("/api")
	{
		api.GET("/remuneration", func(c *gin.Context) {
			p := c.Query("p")
			if p == "" {
				c.JSON(http.StatusOK, gin.H{"ok": false, "message": "Need a p path parameter"})
				return
			}
			probability, _ := strconv.ParseFloat(p, 64)
			remuneration := toss(int(probability * 1000))
			c.JSON(http.StatusOK, gin.H{"ok": true, "remuneration": remuneration})
		})
	}

	return router
}

func toss(probability int) bool {
	rand.Seed(time.Now().UnixNano())
	randomNumber := rand.Intn(100000)
	return randomNumber < probability
}

func main() {
	r := setupRouter()
	// Listen and Server in 0.0.0.0:8000
	r.Run(":8000")
}
