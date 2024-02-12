
class TableView {
    table
    ws
    idview
    editBox
    startRow
    startCol
    selActive
   
    constructor(idview, websocket){      
        this.idview = idview
        let div = document.getElementById(idview)
        this.table = document.createElement('table')
        div.appendChild(this.table)
        
        this.initChannel(websocket)
        this.initSelections()
        this.initEditor()
     }

    initChannel(websocket){
        if (websocket == undefined){
            alert("Ошибка конфигурации")
            return
        }

        this.ws = websocket
        this.ws.addEventListener('message',(mess)=>{
            let data =JSON.parse(mess.data)
            switch (data.action){
                case 'dataCell':
                    this.dataCell(data.cells)
                    break;
                case 'dataAll':
                    this.dataAll(data.cells)
                    break
                }
        })
        this.ws.addEventListener('open',()=>{
            this.updateAll()
        })
        this.ws.addEventListener('close',()=>{
            alert("Соединения потеряно. Возможно приложение закрыто")
            document.getElementById('errorClose').hidden=false
        })
    }

    initEditor(){
        let div = document.getElementById(this.idview)
        this.editBox = document.createElement('input')
        this.editBox.setAttribute('type','text')
        this.editBox.setAttribute('id','editBox')
        this.editBox.setAttribute('class','edit')
        this.editBox.hidden=true
        div.appendChild(this.editBox)

        this.editBox.addEventListener('blur', (event) =>{
            let box = event.currentTarget
            let val = box.value
            box.hidden=true
            box.parentNode.removeChild(box)
            document.getElementById(this.idview).appendChild(box)
            this.setDataCells(box.getAttribute('r'),box.getAttribute('c'),val)
        })
    }
    
    initSelections(){
        this.selActive=false

        window.addEventListener('mousedown',(event)=>{

            let ells = document.getElementsByClassName('selected')
            while (ells.length>0) {
                ells.item(0).classList.remove('selected')
            }
            let td = event.toElement
            if(!td.classList.contains('cell')) return
            this.selActive =true
            this.startRow = td.getAttribute('row')
            this.startCol = td.getAttribute('col')
            td.classList.add("selected")
        })

        window.addEventListener('mouseup',()=>{
            this.selActive=false
            this.startRow=null
            this.startCol=null
        })

        window.addEventListener('mouseover',(event)=>{         
            let td = event.toElement
            if(!td.classList.contains('cell')) return
   
            if(this.selActive==false) return
            document.getSelection().removeAllRanges()
            let ells = document.getElementsByClassName('selected')
            while (ells.length>0) {
                ells.item(0).classList.remove('selected')
            }

            if(this.startCol==null) this.startCol=td.getAttribute('col')
            if(this.startRow==null) this.startRow=td.getAttribute('row')

            let r1 = Math.min(td.getAttribute('row'),this.startRow)
            let c1 = Math.min(td.getAttribute('col'),this.startCol)
            let r2 = Math.max(td.getAttribute('row'),this.startRow)
            let c2 = Math.max(td.getAttribute('col'),this.startCol)
            
            for(let r=r1;r<=r2;r++){
                for(let c=c1;c<=c2;c++){
                    document.getElementById(`r${r}c${c}`).classList.add("selected")
                }
            }            
        })

    }

    dataAll(cells){
        this.table.innerHTML=''
        let i=0
        let tr = document.createElement('tr')
        this.table.appendChild(tr)

        cells.forEach(cell => {            
            if(cell.r>i){                
                tr = document.createElement('tr')
                this.table.appendChild(tr)
                i=cell.r
            }
            tr.appendChild(this.createCell(cell.r,cell.c,cell.val))
        })
    }

    createCell(r,c,val){
        let td = document.createElement('td')

        td.setAttribute('class', 'cell')
        td.setAttribute('id', `r${r}c${c}`)
        td.setAttribute('row',r)
        td.setAttribute('col',c)
        td.onselectstart=()=>{return false}
        td.addEventListener('dblclick', event => {
            let box = document.getElementById("editBox")
            let td = event.currentTarget
            box.value=td.textContent
            box.setAttribute('r',td.getAttribute('row'))
            box.setAttribute('c',td.getAttribute('col'))
            td.innerHTML=''
            td.appendChild(box)
            box.hidden=false
            box.focus()
        })
        td.innerHTML = val
        return td
    }

    dataCell(cells){
        let cell = document.getElementById(`r${cells[0].r}c${cells[0].c}`)
        cell.innerHTML=cells[0].val
    }

    setDataCells(r,c,val){
        this.ws.send(`{"action":"setDataCell", "cells":[{"r":${r},"c":${c},"val":"${val}"}]}`)
    }
    updateCell(r,c){
        this.ws.send(`{"action":"dataCell", "cells":[{"r":${r},"c":${c},"val":""}]}`)
    }
    updateAll(){
        this.ws.send(`{"action":"dataAll"}`)
    }
}


