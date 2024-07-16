import puppeteer from 'puppeteer'
import { useEnv } from '../env'
import { isProduction } from './envHelper'

export async function launchPuppeteer(isMadeByBrowserless?: boolean) {
  const { BROWSERLESS_API_KEY } = useEnv()

  if (isMadeByBrowserless && BROWSERLESS_API_KEY) {
    return puppeteer.connect({
      browserWSEndpoint: `https://chrome.browserless.io/pdf?token=${BROWSERLESS_API_KEY}`,
    })
  }
  return puppeteer.launch({
    userDataDir: './tmp',
    headless: 'new',
    executablePath: isProduction() ? '/usr/bin/chromium-browser' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--autoplay-policy=user-gesture-required',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-notifications',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-setuid-sandbox',
      '--disable-speech-api',
      '--disable-sync',
      '--hide-scrollbars',
      '--ignore-gpu-blacklist',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--password-store=basic',
      '--use-gl=swiftshader',
      '--use-mock-keychain',
    ],
  })
}

export async function generatePdfFromUrl({
  url,
  fileName,
  token,
  isMadeByBrowserless,
}: {
  url: string
  fileName: string
  token: string
  isMadeByBrowserless?: boolean
}) {
  console.time('pdf generate in')

  const filePath = `/app/src/uploads/${fileName}`
  const browser = await launchPuppeteer(isMadeByBrowserless)
  const page = await browser.newPage()

  await page.setExtraHTTPHeaders({
    authorization: `Bearer ${token}`,
  })

  await page.goto(url, { waitUntil: 'networkidle0' })

  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()

  console.timeEnd('pdf generate in')

  return {
    filePath,
    content: pdf.toString('base64'),
    fileName,
  }
}
