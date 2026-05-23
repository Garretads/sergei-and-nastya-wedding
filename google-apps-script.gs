const SHEET_NAME = 'Ответы гостей';

const HEADERS = [
  'Дата отправки',
  'Ваши имена',
  'Сможете ли вы присутствовать?',
  'Сколько вас будет?',
  'Нужен ли трансфер?',
  'Есть ли особенности питания, аллергии или пожелания?',
  'Предпочтения по алкоголю',
  'Источник',
  'Время на устройстве гостя',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getOrCreateSheet_();
    const values = e && e.parameter ? e.parameter : {};
    const listValues = e && e.parameters ? e.parameters : {};
    const requestId = values.requestId || '';

    sheet.appendRow([
      new Date(),
      values['entry.1498135098'] || '',
      values['entry.877086558'] || '',
      values['entry.1863762620'] || '',
      joinValues_(listValues['entry.2142031974']),
      values['entry.1727700536'] || '',
      joinValues_(listValues['entry.966178019']),
      values.source || '',
      values.submittedAtClient || '',
    ]);

    return htmlResponse_('OK', requestId);
  } catch (error) {
    console.error(error);
    const requestId = e && e.parameter && e.parameter.requestId ? e.parameter.requestId : '';
    return htmlResponse_('ERROR', requestId);
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function joinValues_(value) {
  if (!value) return '';
  return Array.isArray(value) ? value.join(', ') : String(value);
}

function htmlResponse_(status, requestId) {
  const payload = JSON.stringify({
    type: 'RSVP_SUBMIT_RESULT',
    status: status,
    requestId: requestId || '',
  });

  return HtmlService
    .createHtmlOutput(
      '<!doctype html><html><body><script>' +
      'window.top && window.top.postMessage(' + payload + ', "*");' +
      '</script></body></html>'
    )
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
