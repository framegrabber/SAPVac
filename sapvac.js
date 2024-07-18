(() => {
    function loadScript(url) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  
    Promise.all([
      loadScript('https://unpkg.com/dayjs@1.10.7/dayjs.min.js'),
      loadScript('https://unpkg.com/dayjs@1.10.7/plugin/localeData.js'),
      loadScript('https://unpkg.com/dayjs@1.10.7/plugin/localizedFormat.js'),
      loadScript('https://unpkg.com/dayjs@1.10.7/plugin/isSameOrBefore.js'),
      loadScript('https://unpkg.com/dayjs@1.10.7/plugin/isoWeek.js'),
      loadScript('https://unpkg.com/dayjs@1.10.7/plugin/customParseFormat.js'),
      loadScript('https://unpkg.com/dayjs@1.10.7/locale/de.js')
    ]).then(() => {
      // Hier beginnt der Hauptcode
      dayjs.extend(window.dayjs_plugin_localeData);
      dayjs.extend(window.dayjs_plugin_localizedFormat);
      dayjs.extend(window.dayjs_plugin_isSameOrBefore);
      dayjs.extend(window.dayjs_plugin_isoWeek);
      dayjs.extend(window.dayjs_plugin_customParseFormat);
      dayjs.locale('de');
  
      // Konstanten
      const NEXT_MONTH_BUTTON_ID = 'application-Team-teamkalender-component---calendarView--teamCalendar-planningCalendarControl-Header-NavToolbar-NextBtn';
      const MOUSE_EVENTS = ['mousedown', 'mouseup', 'click'];
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
        const start = dayjs(startDate, 'D. MMMM YYYY', 'de');
        const end = dayjs(endDate, 'D. MMMM YYYY', 'de');
  
        if (!start.isValid() || !end.isValid()) {
          console.warn('Ungültiges Datum:', startDate, endDate);
          return 0;
        }
  
        let workdays = 0;
        let current = start;
  
        while (current.isSameOrBefore(end)) {
          if (current.isoWeekday() <= 5) { // 1 (Montag) bis 5 (Freitag) sind Werktage
            workdays++;
          }
          current = current.add(1, 'day');
        }
  
        return workdays;
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
              console.info(`No vacation data for month ${i + 1}`);
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
      }).catch(error => {
        console.error('Error loading scripts:', error);
      });
})();