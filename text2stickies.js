async function createStickiesFromInput() {
    try {
        const inputData = prompt("Enter your text (one sticky note per line):");
        if (!inputData) {
            console.log("No input provided. Aborting.");
            return;
        }

        const lines = inputData.split('\n');
        const viewport = await miro.board.viewport.get();
        const startX = viewport.x + viewport.width / 4;
        const startY = viewport.y + viewport.height / 4;
        const width = 200;
        const padding = 10;
        let createdStickies = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const sticky = await miro.board.createStickyNote({
                    content: line,
                    x: startX + (i % 5) * (width + padding),
                    y: startY + Math.floor(i / 5) * (width + padding),
                    width: width,
                    shape: 'rectangle',
                    style: {
                        fillColor: 'light_yellow',
                        textAlign: 'center',
                        textAlignVertical: 'middle',
                    },
                });
                createdStickies.push(sticky);
            }
        }

        console.log('Sticky notes successfully created');
        await miro.board.group({ items: createdStickies });
        console.log('Sticky notes successfully grouped');
    } catch (error) {
        console.error('Error creating sticky notes:', error);
    }
}

if (typeof miro !== 'undefined') {
    createStickiesFromInput();
} else {
    console.error('Miro SDK not found. Make sure you are on a Miro board.');
}