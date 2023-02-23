import type { EmployeeEntity } from '../entity/EmployeeEntity'
import type { UserEntity } from '../entity/UserEntity'

export function firtSendAnswerTemplate({ employee, creator }: { employee: EmployeeEntity; creator: UserEntity }) {
  return `<!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><title></title><!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">#outlook a { padding:0; }
  body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
  table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
  img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
  p { display:block;margin:13px 0; }</style><!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
  <o:AllowPNG/>
  <o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]--><!--[if lte mso 11]>
<style type="text/css">
  .mj-outlook-group-fix { width:100% !important; }
</style>
<![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css"><style type="text/css">@import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);</style><!--<![endif]--><style type="text/css">@media only screen and (min-width:480px) {
.mj-column-per-100 { width:100% !important; max-width: 100%; }
.mj-column-per-33 { width:33% !important; max-width: 33%; }
.mj-column-per-67 { width:67% !important; max-width: 67%; }
}</style><style media="screen and (min-width:480px)">.moz-text-html .mj-column-per-100 { width:100% !important; max-width: 100%; }
.moz-text-html .mj-column-per-33 { width:33% !important; max-width: 33%; }
.moz-text-html .mj-column-per-67 { width:67% !important; max-width: 67%; }</style><style type="text/css">[owa] .mj-column-per-100 { width:100% !important; max-width: 100%; }
[owa] .mj-column-per-33 { width:33% !important; max-width: 33%; }
[owa] .mj-column-per-67 { width:67% !important; max-width: 67%; }</style><style type="text/css">@media only screen and (max-width:480px) {
table.mj-full-width-mobile { width: 100% !important; }
td.mj-full-width-mobile { width: auto !important; }
}</style></head><body style="word-spacing:normal;background-color:#F2F2F2;"><div style="background-color:#F2F2F2;"><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;padding-bottom:0px;padding-left:0px;padding-right:0px;padding-top:0px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:4px 10px 4px 10px;padding-top:4px;padding-right:10px;padding-bottom:4px;padding-left:10px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><p style="text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;"><span style="text-align:center;line-height:23px;letter-spacing:normal;font-size:14px;font-family:Arial;color:#798084;text-align:left;">Lorem ipsum dolor sit amet | </span><a href="[[PERMALINK]]" target="_blank" style="; text-decoration: none;"><span><b><u><span style="text-align:center;line-height:23px;letter-spacing:normal;font-size:14px;font-family:Arial;color:#7F66FF;text-align:left;"><b><u>View in your browser</u></b></span></u></b></span></a></p></div></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;padding-bottom:0px;padding-left:0px;padding-right:0px;padding-top:0px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0px 30px 30px 30px;padding-top:0px;padding-right:30px;padding-bottom:30px;padding-left:30px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:30px;line-height:1;text-align:left;color:#000000;"><h1 class="text-build-content" style="line-height:33px;text-align:center;; margin-top: 10px; font-weight: normal;" data-testid="tWRVajSD43t3SV9lf13K2"><span style="color:#000000;font-family:Arial;font-size:30px;"><b>Vous avez un document à signer</b></span></h1><p class="text-build-content" style="text-align: center; margin: 10px 0; margin-bottom: 10px;" data-testid="tWRVajSD43t3SV9lf13K2"><span style="color:#000000;font-family:Arial;font-size:16px;line-height:22px;">Hello ${employee.firstName} ! Vous avez un document de droit à l'image à signer provenant de ${creator.firstName} ${creator.lastName} de ${creator.companyName}</span><span style="color:inherit;font-family:Arial;font-size:16px;line-height:22px;"><u>Be-Right</u></span></a></p></div></td></tr><tr><td align="center" style="font-size:0px;padding:0px 0px 0px 0px;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;"><tbody><tr><td style="width:600px;"><img alt="Banner" height="auto" src="https://9pl9.mjt.lu/tplimg/9pl9/b/x4w5m/v69yw.jpeg" style="border:none;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600"></td></tr></tbody></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px 30px 0px 30px;padding-bottom:0px;padding-left:30px;padding-right:30px;padding-top:0px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tbody><tr><td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;"><tbody><tr><td align="center" bgcolor="#414141" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#414141;" valign="middle"><p style="display:inline-block;background:#414141;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;"><span style="font-size:14px;font-family:Arial;color:#ffffff;background-color:#414141;text-align:center;">Voir le document</span></p></td></tr></tbody></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#8066FF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#8066FF;background-color:#8066FF;margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#8066FF;background-color:#8066FF;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:10px 30px 10px 30px;padding-bottom:10px;padding-left:30px;padding-right:30px;padding-top:10px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:540px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;vertical-align:middle;"><!--[if mso | IE]><table border="0" cellpadding="0" cellspacing="0" role="presentation" ><tr><td style="vertical-align:middle;width:178px;" ><![endif]--><div class="mj-column-per-33 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:33%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0px 10px 0px 10px;padding-top:0px;padding-right:10px;padding-bottom:0px;padding-left:10px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><p style="text-align: left; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;"><span style="line-height:22px;letter-spacing:normal;font-size:16px;font-family:Arial;color:#ffffff;text-align:left;"><b>Follow us</b></span></p></div></td></tr></tbody></table></div><!--[if mso | IE]></td><td style="vertical-align:middle;width:361px;" ><![endif]--><div class="mj-column-per-67 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:67%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%"><tbody><tr><td align="right" style="font-size:0px;padding:0px 0px 0px 0px;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;word-break:break-word;"><!--[if mso | IE]><table align="right" border="0" cellpadding="0" cellspacing="0" role="presentation" ><tr><td><![endif]--><table align="right" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;"><tbody><tr><td style="padding:4px;vertical-align:middle;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#8066FF;border-radius:50%;width:26;"><tbody><tr><td style="padding:5px 5px 5px 5px;font-size:0;height:26;vertical-align:middle;width:26;"><a href="https://www.facebook.com/sharer/sharer.php?u=[[SHORT_PERMALINK]]" target="_blank"><img height="26" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/facebook.png" style="border-radius:50%;display:block;" width="26"></a></td></tr></tbody></table></td></tr></tbody></table><!--[if mso | IE]></td><td><![endif]--><table align="right" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;"><tbody><tr><td style="padding:4px;vertical-align:middle;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#8066FF;border-radius:50%;width:26;"><tbody><tr><td style="padding:5px 5px 5px 5px;font-size:0;height:26;vertical-align:middle;width:26;"><a href="https://twitter.com/intent/tweet?url=[[SHORT_PERMALINK]]" target="_blank"><img height="26" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/twitter.png" style="border-radius:50%;display:block;" width="26"></a></td></tr></tbody></table></td></tr></tbody></table><!--[if mso | IE]></td><td><![endif]--><table align="right" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;"><tbody><tr><td style="padding:4px;vertical-align:middle;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#8066FF;border-radius:50%;width:26;"><tbody><tr><td style="padding:5px 5px 5px 5px;font-size:0;height:26;vertical-align:middle;width:26;"><a href="[[SHORT_PERMALINK]]" target="_blank"><img height="26" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/youtube.png" style="border-radius:50%;display:block;" width="26"></a></td></tr></tbody></table></td></tr></tbody></table><!--[if mso | IE]></td><td><![endif]--><table align="right" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;"><tbody><tr><td style="padding:4px;vertical-align:middle;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#8066FF;border-radius:50%;width:26;"><tbody><tr><td style="padding:5px 5px 5px 5px;font-size:0;height:26;vertical-align:middle;width:26;"><a href="[[SHORT_PERMALINK]]" target="_blank"><img height="26" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/linkedin.png" style="border-radius:50%;display:block;" width="26"></a></td></tr></tbody></table></td></tr></tbody></table><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="transparent" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:transparent;background-color:transparent;margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;background-color:transparent;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:10px 20px 30px 20px;padding-bottom:30px;padding-left:20px;padding-right:20px;padding-top:10px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0px 0px 0px 0px;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><p style="text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;"><span style="text-align:center;line-height:23px;letter-spacing:normal;font-size:14px;font-family:Arial;color:#798084;text-align:left;">Designed with Mailjet</span><span style="text-align:center;line-height:23px;letter-spacing:normal;font-size:16px;font-family:Arial;color:#000000;text-align:left;"><br></span><span style="text-align:center;line-height:23px;letter-spacing:normal;font-size:14px;font-family:Arial;color:#798084;text-align:left;">This e-mail has been sent to </span><span style="text-align:center;line-height:23px;letter-spacing:normal;font-size:14px;font-family:Arial;color:#7F66FF;text-align:left;"><b>[[EMAIL_TO]]</b></span><span style="text-align:center;line-height:23px;letter-spacing:normal;font-size:14px;font-family:Arial;color:#798084;text-align:left;">, click </span><a href="[[UNSUB_LINK_EN]]" target="_blank" style="; text-decoration: none;"><span><b><u><span style="text-align:center;line-height:23px;letter-spacing:normal;font-size:14px;font-family:Arial;color:#798084;text-align:left;"><b><u>here</u></b></span></u></b></span></a><span style="text-align:center;line-height:23px;letter-spacing:normal;font-size:14px;font-family:Arial;color:#798084;text-align:left;"> to unsubscribe.</span></p></div></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div></body></html>`
}