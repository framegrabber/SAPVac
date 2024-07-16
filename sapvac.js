(() => {
    // Konstanten
    const NEXT_MONTH_BUTTON_ID = 'application-Team-teamkalender-component---calendarView--teamCalendar-planningCalendarControl-Header-NavToolbar-NextBtn';
    const MOUSE_EVENTS = ['mousedown', 'mouseup', 'click'];
    const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
    const WAIT_TIME_MS = 1000;
    const MONTHS_TO_EXTRACT = 12;
  
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
      } else {
        console.warn('Schaltfläche für nächsten Monat nicht gefunden');
      }
    };
  
    const calculateVacationDuration = (startDate, endDate) => {
      const vacationStart = new Date(startDate);
      const vacationEnd = new Date(endDate);
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
  
        monthlyVacations.forEach(vacation => {
          const vacationKey = `${vacation.employeeName}-${vacation.vacationPeriod}`;
          if (!processedVacations.has(vacationKey)) {
            processedVacations.add(vacationKey);
            allVacations.push(vacation);
          }
        });
  
        if (i < monthsToExtract - 1) {
          navigateToNextMonth();
          await new Promise(resolve => setTimeout(resolve, WAIT_TIME_MS));
        }
      }
      return allVacations;
    };
  
    // Hauptfunktion
    const main = async () => {
      try {
        const vacationData = await extractVacationsForPeriod(MONTHS_TO_EXTRACT);
        console.log('Extrahierte Urlaubsdaten für den gesamten Zeitraum (ohne Duplikate):', vacationData);
      } catch (error) {
        console.error('Ein Fehler ist bei der Extraktion der Urlaubsdaten aufgetreten:', error);
      }
    };
  
    // Skript ausführen
    main();
  })();