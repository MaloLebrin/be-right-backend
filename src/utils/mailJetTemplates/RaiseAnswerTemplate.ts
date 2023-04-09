import type AnswerEntity from '../../entity/AnswerEntity'
import type EventEntity from '../../entity/EventEntity'
import type { EmployeeEntity } from '../../entity/employees/EmployeeEntity'
import { isProduction } from '../envHelper'

export function RaiseAnswerTemplate({
  answer,
  event,
  employee,
}: {
  answer: AnswerEntity
  event: EventEntity
  employee: EmployeeEntity
}) {
  const link = `${isProduction() ? process.env.FRONT_URL : 'http://localhost:3000'}/`
  return `
    <!doctype html>
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
          <title>Réinitialiser votre mot de passe</title>
          <!--[if !mso]><!-->
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <!--<![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <style type="text/css">#outlook a { padding:0; }
            body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
            table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
            img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
            p { display:block;margin:13px 0; }
          </style>
          <!--[if mso]>
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
          <![endif]--><!--[if !mso]><!-->
          <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
          <style type="text/css">@import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);</style>
          <!--<![endif]-->
          <style type="text/css">@media only screen and (min-width:480px) {
            .mj-column-per-100 { width:100% !important; max-width: 100%; }
            }
          </style>
          <style media="screen and (min-width:480px)">.moz-text-html .mj-column-per-100 { width:100% !important; max-width: 100%; }</style>
          <style type="text/css">[owa] .mj-column-per-100 { width:100% !important; max-width: 100%; }</style>
          <style type="text/css">@media only screen and (max-width:480px) {
            table.mj-full-width-mobile { width: 100% !important; }
            td.mj-full-width-mobile { width: auto !important; }
            }
          </style>
      </head>
      <body style="word-spacing:normal;background-color:#f2f2f2;">
          <div style="background-color:#f2f2f2;">
            <!--[if mso | IE]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
                            <tbody>
                              <tr>
                                  <td style="direction:ltr;font-size:0px;padding:0px 0px 20px 0px;padding-left:0px;padding-right:0px;padding-top:0px;text-align:center;">
                                    <!--[if mso | IE]>
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                          <td class="" style="vertical-align:top;width:600px;" >
                                              <![endif]-->
                                              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                                    <tbody>
                                                      <tr>
                                                          <td align="center" style="font-size:0px;padding:10px 25px 10px 25px;padding-top:10px;padding-right:25px;padding-bottom:10px;padding-left:25px;word-break:break-word;">
                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                                <tbody>
                                                                  <tr>
                                                                      <td style="width:540px;"><img alt="Looking up at skyscrapers in perspective" height="auto" src="https://0llhi.mjt.lu/tplimg/0llhi/b/l03yj/5g1w.jpeg" style="border:none;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="540"></td>
                                                                  </tr>
                                                                </tbody>
                                                            </table>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td align="left" style="font-size:0px;padding:15px 25px 0px 25px;padding-top:15px;padding-right:25px;padding-bottom:0px;padding-left:25px;word-break:break-word;">
                                                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;">
                                                                <h2 style="text-align:left; margin-top: 10px; margin-bottom: 10px; font-weight: normal;"><span style="line-height:26px;letter-spacing:normal;font-size:24px;font-family:Arial;color:#000000;text-align:left;"><b>Be Right</b></span></h2>
                                                            </div>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td align="left" style="font-size:0px;padding:0px 25px 0px 25px;padding-top:0px;padding-right:25px;padding-bottom:0px;padding-left:25px;word-break:break-word;">
                                                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;">
                                                                <h1 style="text-align:left; margin-top: 10px; margin-bottom: 10px; font-weight: normal;"><span style="line-height:41px;letter-spacing:normal;font-size:24px;font-family:Arial;color:#000000;text-align:left;">
                                                                  <b>Vous avez un document à signer</b></span>
                                                                </h1>
                                                            </div>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td align="left" style="font-size:0px;padding:0px 25px 0px 25px;padding-top:0px;padding-right:25px;padding-bottom:0px;padding-left:25px;word-break:break-word;">
                                                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;">
                                                                <p style="text-align: left; margin: 10px 0; margin-top: 10px;"><span style="line-height:26px;letter-spacing:normal;font-size:16px;font-family:Arial;color:#27272b;text-align:left;">difficultés à se connecter?</span></p>
                                                                <p style="text-align: left; margin: 10px 0;"><span style="line-height:26px;letter-spacing:normal;font-size:16px;font-family:Arial;color:#27272b;text-align:left;">Réinitialiser votre mot de passe est facile.</span></p>
                                                                <p style="text-align: left; margin: 10px 0;"><span style="line-height:26px;letter-spacing:normal;font-size:16px;font-family:Arial;color:#27272b;text-align:left;">Appuyez simplement sur le bouton ci-dessous et suivez les instructions. Vous serez opérationnel en un rien de temps.</span></p>
                                                                <p style="text-align: left; margin: 10px 0; margin-bottom: 10px;"><span style="line-height:26px;letter-spacing:normal;font-size:16px;font-family:Arial;color:#27272b;text-align:left;">Si vous n'avez pas fait cette demande, veuillez ignorer cet e-mail.</span></p>
                                                            </div>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td align="center" vertical-align="middle" style="font-size:0px;padding:20px 25px 20px 25px;padding-top:20px;padding-right:25px;padding-bottom:20px;padding-left:25px;word-break:break-word;">
                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:100%;line-height:100%;">
                                                                <tbody>
                                                                  <tr>
                                                                    <td align="center" bgcolor="#fb0030" role="presentation" style="border:none;border-radius:30px;cursor:auto;mso-padding-alt:15px 25px 15px 25px;background:#fb0030;" valign="middle">
                                                                      <a href="${link}" style="display:inline-block;background:#fb0030;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:15px 25px 15px 25px;mso-padding-alt:0px;border-radius:30px;" target="_blank">
                                                                        <span style="font-size:16px;font-family:Arial;color:#ffffff;background-color:#fb0030;text-align:center;">Accéder au document</span>
                                                                      </a>
                                                                    </td>
                                                                  </tr>
                                                                </tbody>
                                                            </table>
                                                          </td>
                                                      </tr>
                                                    </tbody>
                                                </table>
                                              </div>
                                              <!--[if mso | IE]>
                                          </td>
                                        </tr>
                                    </table>
                                    <![endif]-->
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                      <!--[if mso | IE]>
                  </td>
                </tr>
            </table>
            <table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" >
                <tr>
                  <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                      <![endif]-->
                      <div style="margin:0px auto;max-width:600px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                            <tbody>
                              <tr>
                                  <td style="direction:ltr;font-size:0px;padding:20px 0px 20px 0px;text-align:center;">
                                    <!--[if mso | IE]>
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                          <td class="" style="vertical-align:top;width:600px;" >
                                              <![endif]-->
                                              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                    <tbody>
                                                      <tr>
                                                          <td style="vertical-align:top;padding:0;">
                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                                <tbody>
                                                                  <tr>
                                                                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;">
                                                                            <p style="text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;"><span style="text-align:center;line-height:22px;font-size:16px;">Cet email a été envoyé à [[EMAIL_TO]], <a href="[[UNSUB_LINK_FR]]" style="color:inherit;text-decoration:none;" target="_blank">cliquez ici pour vous désabonner</a>.</span></p>
                                                                        </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;">
                                                                            <p style="text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;"><span style="text-align:center;line-height:22px;font-size:16px;">   FR</span></p>
                                                                        </div>
                                                                      </td>
                                                                  </tr>
                                                                </tbody>
                                                            </table>
                                                          </td>
                                                      </tr>
                                                    </tbody>
                                                </table>
                                              </div>
                                              <!--[if mso | IE]>
                                          </td>
                                        </tr>
                                    </table>
                                    <![endif]-->
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                      <!--[if mso | IE]>
                  </td>
                </tr>
            </table>
            <![endif]-->
          </div>
      </body>
    </html>
  `
}
