// 87 Kings Road: emails the pre-tenancy application form to people who register for the open home.
// Called by the kings-road-viewing Worker. Deployed as a web app: Execute as me, Who has access: Anyone.
// SECRET must match the Worker's MAILER_SECRET.

const SECRET = 'REPLACE_WITH_SECRET';
const FORM_DOC_ID = '1qmd-fdzL7eGFck-lZNQl-JOsrGz0_I2kMOvU8SF4cjg';
const FROM_NAME = 'Steve Bonnici';

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'bad json' }); }
  if (b.secret !== SECRET) return out({ ok: false, error: 'unauthorised' });
  const email = String(b.email || '').trim();
  const first = String(b.first_name || '').trim() || 'there';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out({ ok: false, error: 'bad email' });

  const name = 'Pre-tenancy application - 87 Kings Road';
  const pdf = DriveApp.getFileById(FORM_DOC_ID).getAs('application/pdf').setName(name + '.pdf');
  const docx = UrlFetchApp.fetch(
    'https://docs.google.com/document/d/' + FORM_DOC_ID + '/export?format=docx',
    { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } }
  ).getBlob().setName(name + '.docx');

  const text =
    'Hi ' + first + ',\n\n' +
    'Thanks for registering for the open home at 87 Kings Road, Panmure on Saturday 7 November, 2:00-3:30pm.\n\n' +
    'Attached is our pre-tenancy application form, as a Word document you can fill in on screen and as a PDF you can print. ' +
    'You are welcome to complete it before the viewing, or after you have seen the cottage. ' +
    'When it is done, just reply to this email with the completed form attached.\n\n' +
    'If you have any questions, call or text me on 021 932 611.\n\n' +
    'Kind regards,\nSteve Bonnici';
  const html = text.split('\n\n').map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');

  GmailApp.sendEmail(email, 'Application form - 87 Kings Road, Panmure', text, {
    htmlBody: html, name: FROM_NAME, attachments: [docx, pdf],
  });
  return out({ ok: true });
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Run this once from the editor to grant Gmail + Drive permission and send yourself a test.
function testSendToMe() {
  doPost({ postData: { contents: JSON.stringify({ secret: SECRET, email: Session.getActiveUser().getEmail(), first_name: 'Steve' }) } });
}
