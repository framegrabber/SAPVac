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
        const baseHeight = 100;
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

        const startDate = new Date(vacationData[0].vacationStartDate);
        let occupiedSlots = [];

        for (const vacation of vacationData) {
            const vacationStart = new Date(vacation.vacationStartDate);

            const daysFromStart = getWorkdays(startDate, getNextWorkday(vacationStart));
            let x = startX + daysFromStart * (baseWidth + padding) + padding;

            // Verwenden der vacationDuration aus den Eingabedaten
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

            await miro.board.createShape({
                content: `<p><b>${vacation.employeeName}</b><br />${vacation.vacationPeriod}</p>`,
                shape: 'rectangle',
                x: x + width / 2,
                y: y + baseHeight / 2,
                width: width,
                height: baseHeight,
                style: {
                    fillColor: '#FF469B',
                    fontFamily: 'open_sans',
                    fontSize: 10,
                    borderWidth: 0,
                },
            });
        }

        console.log('Shapes erfolgreich erstellt');
    } catch (error) {
        console.error('Fehler beim Erstellen der Shapes:', error);
    }
}

if (typeof miro !== 'undefined') {
    createShapesFromClipboard();
} else {
    console.error('Miro SDK nicht gefunden. Stellen Sie sicher, dass Sie sich auf einem Miro-Board befinden.');
}