package provider

import (
	"time"
	m "webapp/model"

	"golang.org/x/net/websocket"
)

type Message struct {
	Action string   `json:"action"`
	Cells  []m.Cell `json:"cells"`
}

type provider struct {
	model     Model
	sendCells chan []m.Cell
}

type Provider interface {
	Serv_tableView(ws *websocket.Conn)
	Serv_tableView2(ws *websocket.Conn)
}

func NewWsProvider(model Model, sendCells chan []m.Cell) Provider {
	return provider{
		model:     model,
		sendCells: sendCells,
	}
}

type Model interface {
	DataCells(cells *[]m.Cell)
	DataAll() []m.Cell
}

func (p provider) Serv_tableView(ws *websocket.Conn) {
	var mes Message
	for {
		websocket.JSON.Receive(ws, &mes)

		switch mes.Action {
		case "dataCells":
			p.model.DataCells(&mes.Cells)
		case "dataAll":
			mes.Cells = p.model.DataAll()
		case "setDataCell":
			mes.Action = "dataCell"
		default:
			continue
		}

		websocket.JSON.Send(ws, mes)
		time.Sleep(5 * time.Millisecond)
	}
}

func (p provider) Serv_tableView2(ws *websocket.Conn) {

	sendCh := make(chan Message)
	receiveCh := make(chan Message)
	go sendMes(ws, sendCh)
	go recieveMes(ws, receiveCh)

	for {
		select {
		case mes := <-receiveCh:
			switch mes.Action {
			case "dataCells":
				p.model.DataCells(&mes.Cells)
			case "dataAll":
				mes.Cells = p.model.DataAll()
			case "setDataCell":
				mes.Action = "dataCell"
			default:
				continue
			}
			sendCh <- mes
		case cells := <-p.sendCells:
			sendCh <- Message{
				Action: "DataCells",
				Cells:  cells,
			}
		}
		time.Sleep(5 * time.Millisecond)
	}
}

func recieveMes(ws *websocket.Conn, reciveCh chan Message) {
	var mes Message
	for {
		websocket.JSON.Receive(ws, &mes)
		reciveCh <- mes
	}
}

func sendMes(ws *websocket.Conn, sendCh chan Message) {
	for {
		mes := <-sendCh
		websocket.JSON.Send(ws, mes)
	}
}
