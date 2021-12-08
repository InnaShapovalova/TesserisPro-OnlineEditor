var connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:44373/EditorHub").build();
connection.on("test", function (message) {
    console.log(message)
});

connection.on("mousedown", function (message) {
    onMouseDown(message)
});

connection.on("mousemove", function (message) {
    onMouseMove(message)
});

connection.start().then(function () {
    console.log(connection)
}).catch(function (err) {
    return console.error(err.toString());
});


function makeRequest(data) {
    console.log(data)
    $.ajax({
        method: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        url: "https://localhost:44373/api/message/send",
        success: function (result) {
            console.log(result);
        },
        error: function (result, status) {
            console.log(result);
        }
    });
}

const stage = new Konva.Stage({
    container: 'rectsize',
    width: window.innerWidth,
    height: window.innerHeight,
});

var layer = new Konva.Layer();
stage.add(layer);


var tr = new Konva.Transformer();
layer.add(tr);

var selectionRectangle = new Konva.Rect({
    fill: 'rgba(0,0,255,0.5)',
    visible: false,
});

layer.add(selectionRectangle);

var x1, y1, x2, y2;

stage.on('mousemove touchmove', (e) => {
    if (!selectionRectangle.visible()) {
        return;
    }
    e.evt.preventDefault();
    x2 = stage.getPointerPosition().x;
    y2 = stage.getPointerPosition().y;

    selectionRectangle.setAttrs({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
    });
});


stage.on('click tap', function (e) {
    if (selectionRectangle.visible()) {
        return;
    }

    if (e.target === stage) {
        tr.nodes([]);
        return;
    }

    if (!e.target.hasName('rect')) {
        return;
    }

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = tr.nodes().indexOf(e.target) >= 0;

    if (!metaPressed && !isSelected) {
        tr.nodes([e.target]);
    } else if (metaPressed && isSelected) {
        nodes.splice(nodes.indexOf(e.target), 1);
        tr.nodes(nodes);
    } else if (metaPressed && !isSelected) {
        const nodes = tr.nodes().concat([e.target]);
        tr.nodes(nodes);
    }
});

var typeOfShape = 0;

function rect() {
    typeOfShape = 0;
}

function arrow() {
    typeOfShape = 1;
}

function circle() {
    typeOfShape = 2;
}

function tranform() {
    typeOfShape = 3;
}

var shape = undefined;


var startPoint = {
    x: -1,
    y: -1
}

document.onkeydown = function (key) {
    if (key.keyCode === 46) {
        
    }
}

function onMouseMove(message) {
    shape.remove();
    typeOfShape = message.typeOfShape
    shape = getShape(message.startX, message.startY, message.endX, message.endY)
    

    layer.add(shape);
    layer.draw();
}

stage.on('mousemove', (e) => {
    if (startPoint.x !== -1 && startPoint.y !== -1 && shape != undefined && typeOfShape !== 3) {
        shape.remove();
        currentPoint = getRelativePointerPosition(layer);
        shape = getShape(startPoint.x, startPoint.y, currentPoint.x, currentPoint.y)

        layer.add(shape);
        layer.draw();

        makeRequest({
            "StartX": startPoint.x,
            "StartY": startPoint.y,
            "EndX": currentPoint.x,
            "EndY": currentPoint.y,
            "TypeOfShape": typeOfShape,
            "ClientId": connection.connectionId,
            "EventType": "mousemove"
        })
    }
});


stage.on('mouseup', (e) => {
    if (shape != undefined && typeOfShape != 3) {
        startPoint = {
            x: -1,
            y: -1
        }
    }
    else {
        if (!selectionRectangle.visible()) {
            return;
        }
        e.evt.preventDefault();
        setTimeout(() => {
            selectionRectangle.visible(false);
        });
        var shapes = stage.find('#rectangle, #circle, #arrow');
        var box = selectionRectangle.getClientRect();
        var selected = shapes.filter((shape) =>
            Konva.Util.haveIntersection(box, shape.getClientRect())
        );
        tr.nodes(selected);
    }
});


function onMouseDown(message) {
    typeOfShape = message.typeOfShape
    shape = getShape(message.startX, message.startX, message.endX, message.endY)
    layer.add(shape);
    layer.draw();
}

stage.on('mousedown', (e) => {
    if (typeOfShape != 3) {
        startPoint = getRelativePointerPosition(layer);
        shape = getShape(startPoint.x, startPoint.y, startPoint.x + 1, startPoint.y + 1)
        layer.add(shape);
        layer.draw();

        makeRequest({
            "StartX": startPoint.x,
            "StartY": startPoint.y,
            "EndX": startPoint.x + 1,
            "EndY": startPoint.y + 1,
            "TypeOfShape": typeOfShape,
            "ClientId": connection.connectionId,
            "EventType": "mousedown"
        })
    }
    else {
        if (e.target !== stage) {
            return;
        }
        e.evt.preventDefault();
        x1 = stage.getPointerPosition().x;
        y1 = stage.getPointerPosition().y;
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;

        selectionRectangle.visible(true);
        selectionRectangle.width(0);
        selectionRectangle.height(0);
    }
})

function getShape(startX, startY, endX, endY) {
    switch (typeOfShape) {
        case 0: return getRect(startX, startY, endX, endY)
        case 1: return getArrow(startX, startY, endX, endY)
        case 2: return getCircle(startX, startY, endX, endY)
        default:
    }
}

function getRelativePointerPosition() {
    return stage.getPointerPosition();
}





function getRect(startX, startY, endX, endY) {
    var width = endX - startX
    var height = endY - startY

    var rect = new Konva.Rect({
        x: startX,
        y: startY,
        width: width,
        height: height,
        draggable: true,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        id: 'rectangle',
    });

    rect.on('dblclick', () => {
        tr.nodes([rect]);
    })

    return rect;
}

function getCircle(startX, startY, endX, endY) {
    var circle = new Konva.Ellipse({
        x: startX + ((endX - startX) / 2),
        y: startY + ((endY - startY) / 2),
        radiusX: Math.abs(endX - startX) / 2,
        radiusY: Math.abs(endY - startY) / 2,
        fill: 'yellow',
        stroke: 'black',
        strokeWidth: 4,
        draggable: true,
        id: 'circle',
    });

    circle.on('dblclick', () => {
        tr.nodes([circle]);
    })

    return circle;
}

function getArrow(startX, startY, endX, endY) {
    var width = endX - startX
    var height = endY - startY

    var arrow = new Konva.Arrow({
        x: startX,
        y: startY,
        points: [0, 0, 0, 0, width, height],
        pointerLength: 10,
        pointerWidth: 10,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 4,
        draggable: true,
        id: 'arrow',
    });

    arrow.on('dblclick', () => {
        tr.nodes([arrow]);
    })

    return arrow;
}















