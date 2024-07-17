(() => {
  // Konstanten
  const NEXT_MONTH_BUTTON_ID = 'application-Team-teamkalender-component---calendarView--teamCalendar-planningCalendarControl-Header-NavToolbar-NextBtn';
  const MOUSE_EVENTS = ['mousedown', 'mouseup', 'click'];
  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  const WAIT_TIME_MS = 500;
  const MONTHS_TO_EXTRACT = 9;

  // Hilfsfunktionen
  const navigateToNextMonth = () => {
      const nextMonthButton = document.getElementById(NEXT_MONTH_BUTTON_ID);
      if (nextMonthButton) {
          MOUSE_EVENTS.forEach(eventType => {
              nextMonthButton.dispatchEvent(new MouseEvent(eventType, {
                  view: window,
                  bubbles: true,
                  cancelable: true
              }));
          });
          return true;
      } else {
          console.warn('next month button not found');
          return false;
      }
  };

  const calculateVacationDuration = (startDate, endDate) => {
    const parseGermanDate = (dateString) => {
        const [day, month, year] = dateString.split(/[\s.]+/);
        const monthMap = {
            'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
            'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
        };
        return new Date(year, monthMap[month], parseInt(day));
    };

    const vacationStart = parseGermanDate(startDate);
    const vacationEnd = parseGermanDate(endDate);

    if (isNaN(vacationStart.getTime()) || isNaN(vacationEnd.getTime())) {
        console.warn('Ungültiges Datum:', startDate, endDate);
        return 0;
    }

    const durationMs = Math.abs(vacationEnd - vacationStart);
    return Math.ceil(durationMs / MILLISECONDS_PER_DAY) + 1;
};



  const extractVacationFromEntry = (employeeName, vacationEntry) => {
      const vacationTitleElement = vacationEntry.querySelector('.sapUiCalendarAppTitle');
      const vacationDateElement = vacationEntry.querySelector('.sapUiCalendarAppText');

      if (vacationTitleElement && vacationDateElement) {
          const vacationTitle = vacationTitleElement.textContent.trim().toLowerCase();
          if (!vacationTitle.includes('feiertag')) {
              const vacationPeriod = vacationDateElement.textContent.trim();
              const [vacationStart, vacationEnd = vacationStart] = vacationPeriod.split('–').map(d => d.trim());
              const vacationDuration = calculateVacationDuration(vacationStart, vacationEnd);

              return {
                  employeeName,
                  vacationPeriod,
                  vacationDuration
              };
          }
      }
      return null;
  };

  const extractVacationsFromCurrentView = () => {
      const employeeRows = document.querySelectorAll('.sapMListTblRow');
      if (employeeRows.length === 0) {
          console.warn('no employee data found');
          return [];
      }
      return Array.from(employeeRows).flatMap(row => {
          const employeeNameElement = row.querySelector('.sapMSLITitle');
          const vacationEntries = row.querySelectorAll('.sapUiCalendarApp.sapUiCalendarAppType08');

          if (employeeNameElement) {
              const employeeName = employeeNameElement.textContent.trim();
              return Array.from(vacationEntries)
                  .map(entry => extractVacationFromEntry(employeeName, entry))
                  .filter(vacation => vacation !== null);
          }
          return [];
      });
  };

  const extractVacationsForPeriod = async (monthsToExtract) => {
      const allVacations = [];
      const processedVacations = new Set();

      for (let i = 0; i < monthsToExtract; i++) {
          const monthlyVacations = extractVacationsFromCurrentView();

          if (monthlyVacations.length === 0) {
              console.warn(`No vacation data for month ${i + 1}`);
          }

          monthlyVacations.forEach(vacation => {
              const vacationKey = `${vacation.employeeName}-${vacation.vacationPeriod}`;
              if (!processedVacations.has(vacationKey)) {
                  processedVacations.add(vacationKey);
                  allVacations.push(vacation);
              }
          });

          if (i < monthsToExtract - 1) {
              const success = navigateToNextMonth();
              if (!success) {
                  console.warn(`Couldn't navigate to the next month. Quitting after ${i + 1} months.`);
                  break;
              }
              await new Promise(resolve => setTimeout(resolve, WAIT_TIME_MS));
          }
      }
      return allVacations;
  };

  const copyToClipboard = (data) => {
    const jsonString = JSON.stringify(data, null, 2);

    navigator.clipboard.writeText(jsonString)
        .then(() => {
            console.log('Daten wurden erfolgreich in die Zwischenablage kopiert.');
        })
        .catch(err => {
            console.error('Fehler beim Kopieren in die Zwischenablage:', err);
        });
};

  // Hauptfunktion
  const main = async () => {
      try {
          const vacationData = await extractVacationsForPeriod(MONTHS_TO_EXTRACT);
          if (vacationData.length === 0) {
              console.warn('No vacation data was extracted');
          } else {
              console.log(vacationData);
              copyToClipboard(vacationData);
          }
      } catch (error) {
          console.error('Extraction failed:', error);
      }
  };

  // Skript ausführen
  main();
})();