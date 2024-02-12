package main

import (
	"log"
	"net/http"
	"webapp/model"
	"webapp/provider"

	"golang.org/x/net/websocket"
)

func main() {

	sendCells := make(chan []model.Cell)

	model := model.NewTestTableModel(sendCells)
	prov := provider.NewWsProvider(model, sendCells)

	http.Handle("/tableview", websocket.Handler(prov.Serv_tableView2))
	go http.ListenAndServe(":8008", nil)

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
