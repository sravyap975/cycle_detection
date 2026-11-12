let nodes = [];
let slowIdx = 0;
let fastIdx = 0;
let cycleTo = -1;
let isGameOver = false;

const listContainer = document.getElementById('listContainer');
const svgCanvas = document.getElementById('svgCanvas');
const statusMsg = document.getElementById('statusMessage');
const nextBtn = document.getElementById('nextBtn');

document.getElementById('initBtn').addEventListener('click', initializeList);
nextBtn.addEventListener('click', moveStep);
document.getElementById('resetBtn').addEventListener('click', () => location.reload());

function initializeList() {
    const values = document.getElementById('nodeValues').value.split(',').map(v => v.trim());
    cycleTo = parseInt(document.getElementById('cycleIndex').value);
    
    if (values[0] === "") return alert("Please enter node values");
    
    nodes = values;
    slowIdx = 0;
    fastIdx = 0;
    isGameOver = false;
    nextBtn.disabled = false;
    
    renderNodes();
    updatePointers();
    statusMsg.innerText = "Pointers initialized at the head. Click 'Next Step'.";
}

function renderNodes() {
    listContainer.innerHTML = '';
    svgCanvas.innerHTML = '';
    
    const nodeElements = [];
    const radius = 25;
    const margin = 100;

    // Calculate Positions
    nodes.forEach((val, i) => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.id = `node-${i}`;
        nodeEl.innerText = val;
        
        // Layout Logic: If cycle, use a "U-turn" layout, else linear
        let x, y;
        if (cycleTo !== -1 && i > 5) { // Wrap after 6 nodes for visual clarity
            x = margin + (5 - (i - 6)) * 100;
            y = 200;
        } else {
            x = margin + (i * 100);
            y = 100;
        }

        nodeEl.style.left = `${x}px`;
        nodeEl.style.top = `${y}px`;
        listContainer.appendChild(nodeEl);
        nodeElements.push({x: x + radius, y: y + radius});
    });

    // Draw Arrows
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `<marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" /></marker>`;
    svgCanvas.appendChild(defs);

    for (let i = 0; i < nodeElements.length; i++) {
        let start = nodeElements[i];
        let end;

        if (i < nodeElements.length - 1) {
            end = nodeElements[i + 1];
            drawArrow(start.x, start.y, end.x, end.y);
        } else if (cycleTo !== -1) {
            end = nodeElements[cycleTo];
            drawArrow(start.x, start.y, end.x, end.y, true); // Curved for cycle
        }
    }
}

function drawArrow(x1, y1, x2, y2, isCycle = false) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let d;
    if (isCycle) {
        // Create a curve for the cycle back
        const midY = y1 + 80;
        d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    } else {
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    path.setAttribute("d", d);
    path.setAttribute("stroke", "#64748b");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    path.setAttribute("marker-end", "url(#arrow)");
    svgCanvas.appendChild(path);
}

function moveStep() {
    if (isGameOver) return;

    // Move Slow by 1
    slowIdx = (slowIdx + 1);
    if (cycleTo !== -1 && slowIdx >= nodes.length) {
        slowIdx = cycleTo; 
    }

    // Move Fast by 2
    for (let i = 0; i < 2; i++) {
        fastIdx++;
        if (cycleTo !== -1 && fastIdx >= nodes.length) {
            fastIdx = cycleTo;
        }
        if (cycleTo === -1 && fastIdx >= nodes.length) {
            fastIdx = -1; // Fast reached NULL
            break;
        }
    }

    updatePointers();
    checkCondition();
}

function updatePointers() {
    document.querySelectorAll('.node').forEach(n => n.classList.remove('active-slow', 'active-fast', 'collision'));
    
    if (slowIdx < nodes.length) document.getElementById(`node-${slowIdx}`).classList.add('active-slow');
    if (fastIdx !== -1 && fastIdx < nodes.length) document.getElementById(`node-${fastIdx}`).classList.add('active-fast');
    
    if (slowIdx === fastIdx && fastIdx !== -1) {
        document.getElementById(`node-${slowIdx}`).classList.add('collision');
    }
}

function checkCondition() {
    if (fastIdx === -1) {
        statusMsg.innerText = "Fast pointer reached NULL. No cycle detected!";
        statusMsg.style.color = "#ef4444";
        nextBtn.disabled = true;
        isGameOver = true;
    } else if (slowIdx === fastIdx) {
        statusMsg.innerText = "Slow and Fast pointers met! Cycle detected.";
        statusMsg.style.color = "#10b981";
        nextBtn.disabled = true;
        isGameOver = true;
    } else {
        statusMsg.innerText = `Slow at node ${nodes[slowIdx]}, Fast at node ${nodes[fastIdx]}. Keep going!`;
    }
}