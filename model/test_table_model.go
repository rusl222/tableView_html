package model

import "fmt"

type Cell struct {
	R   int    `json:"r"`
	C   int    `json:"c"`
	Val string `json:"val"`
	Err string `json:"err"`
}

type TableModel interface {
	DataCells(cells *[]Cell)
	DataAll() []Cell
}

type model struct {
	sendCells chan []Cell
}

func NewTestTableModel(sendCells chan []Cell) TableModel {
	return model{sendCells: sendCells}
}

func dataCell(c *Cell) {
	c.Val = fmt.Sprintf("%d", (c.R+1)*(c.C+1))
	c.Err = ""
}

func (model) DataAll() []Cell {
	ret := []Cell{}
	for r := 0; r < 4; r++ {
		for c := 0; c < 8; c++ {
			c := Cell{
				R: r,
				C: c,
			}
			dataCell(&c)
			ret = append(ret, c)
		}
	}
	return ret
}
func (model) DataCells(cells *[]Cell) {
	for _, c := range *cells {
		dataCell(&c)
	}
}
