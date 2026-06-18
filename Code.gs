function doPost(e) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Server not configured: missing API key.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid JSON body.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  return ContentService.createTextOutput(response.getContentText())
    .setMimeType(ContentService.MimeType.JSON);
}
