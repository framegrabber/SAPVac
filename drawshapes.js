async function createShapesFromClipboard() {
    try {
        const inputData = prompt("Bitte fügen Sie die Urlaubsdaten als JSON-String ein:");
        if (!inputData) {
            console.log("Keine Daten eingegeben. Abbruch.");
            return;
        }

        let vacationData = JSON.parse(inputData);

        vacationData.sort((a, b) => new Date(a.vacationStartDate) - new Date(b.vacationStartDate));

        const baseWidth = 100;
        const baseHeight = 70;
        const padding = 2;

        const viewport = await miro.board.viewport.get();
        const startX = viewport.x + viewport.width / 4;
        const startY = viewport.y + viewport.height / 4;

        function getNextWorkday(date) {
            const d = new Date(date);
            while (d.getDay() === 0 || d.getDay() === 6) {
                d.setDate(d.getDate() + 1);
            }
            return d;
        }

        function getWorkdays(startDate, endDate) {
            let start = new Date(startDate);
            let end = new Date(endDate);
            let count = 0;
            const curDate = new Date(start);
            while (curDate <= end) {
                const dayOfWeek = curDate.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
                curDate.setDate(curDate.getDate() + 1);
            }
            return count;
        }

        function generatePastelColor(index, totalColors) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
        
            const hue = (index / totalColors) * 360;
            const saturation = 70 + Math.random() * 10; // 70-80%
            const lightness = 80 + Math.random() * 10;  // 80-90%
        
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctx.fillRect(0, 0, 1, 1);
        
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        const startDate = new Date(vacationData[0].vacationStartDate);
        let occupiedSlots = [];
        let employeeColors = {};
        let employees = [...new Set(vacationData.map(v => v.employeeName))];
        let totalEmployees = employees.length;

        employees.forEach((employee, index) => {
            employeeColors[employee] = generatePastelColor(index, totalEmployees);
        });

        let createdShapes = []; // Array to store all created shapes

        for (const vacation of vacationData) {
            const vacationStart = new Date(vacation.vacationStartDate);

            const daysFromStart = getWorkdays(startDate, getNextWorkday(vacationStart));
            let x = startX + daysFromStart * (baseWidth + padding) + padding;

            const width = vacation.vacationDuration * baseWidth + (vacation.vacationDuration - 1) * padding;

            let y = startY;
            let overlap = true;
            while (overlap) {
                overlap = occupiedSlots.some(slot => {
                    return (x < slot.x + slot.width && x + width > slot.x &&
                            y < slot.y + baseHeight && y + baseHeight > slot.y);
                });
                if (overlap) y += baseHeight + padding;
            }

            occupiedSlots.push({x, y, width, height: baseHeight});

            const shape = await miro.board.createShape({
                content: `<p><b>${vacation.employeeName}</b><br />${vacation.vacationPeriod}</p>`,
                shape: 'rectangle',
                x: x + width / 2,
                y: y + baseHeight / 2,
                width: width,
                height: baseHeight,
                style: {
                    fillColor: employeeColors[vacation.employeeName],
                    fontFamily: 'open_sans',
                    fontSize: 10,
                    borderWidth: 0,
                },
            });

            createdShapes.push(shape); // Add the created shape to our array
        }

        console.log('Shapes erfolgreich erstellt');
        
        await miro.board.group({ items: createdShapes })
        console.log('Shapes erfolgreich gruppiert');
    } catch (error) {
        console.error('Fehler beim Erstellen der Shapes:', error);
    }
}

if (typeof miro !== 'undefined') {
    createShapesFromClipboard();
} else {
    console.error('Miro SDK nicht gefunden. Stellen Sie sicher, dass Sie sich auf einem Miro-Board befinden.');
}