async function createShapesFromClipboard() {
    try {
        // Prompt für Benutzereingabe
        const inputData = prompt("Bitte fügen Sie die Urlaubsdaten als JSON-String ein:");
        if (!inputData) {
            console.log("Keine Daten eingegeben. Abbruch.");
            return;
        }

        const vacationData = JSON.parse(inputData);

        // Konfigurierbare Basis-Dimensionen für die Shapes
        const baseWidth = 100;
        const baseHeight = 100;
        const padding = 20;

        // Ermitteln der aktuellen Viewport-Position
        const viewport = await miro.board.viewport.get();
        let x = viewport.x + viewport.width / 4;
        let y = viewport.y + viewport.height / 4;

        // Erstellen der Shapes für jeden Urlaubseintrag
        for (const vacation of vacationData) {
            const shapeWidth = baseWidth * vacation.vacationDuration + (vacation.vacationDuration-1) * 2;
            const shape = await miro.board.createShape({
                content: `<p><b>${vacation.employeeName}</b><br />${vacation.vacationPeriod}</p>`,
                shape: 'rectangle',
                x: x + shapeWidth / 2, // Zentrieren des Shapes basierend auf seiner Breite
                y: y,
                width: shapeWidth,
                height: baseHeight,
                style: {
                    fillColor: '#FF469B',
                    fontFamily: 'open_sans',
                    fontSize: baseHeight / 5,
                    borderWidth: 0,
                },
            });

            // Nächste Position berechnen
            x += shapeWidth + padding;
            if (x > viewport.x + viewport.width * 0.75) {
                x = viewport.x + viewport.width / 4;
                y += baseHeight + padding;
            }
        }

        console.log('Shapes erfolgreich erstellt');
    } catch (error) {
        console.error('Fehler beim Erstellen der Shapes:', error);
    }
}

// Überprüfen, ob das Miro SDK verfügbar ist und Funktion ausführen
if (typeof miro !== 'undefined') {
    createShapesFromClipboard();
} else {
    console.error('Miro SDK nicht gefunden. Stellen Sie sicher, dass Sie sich auf einem Miro-Board befinden.');
}