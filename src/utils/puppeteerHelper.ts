import puppeteer from 'puppeteer'

export async function launchPuppeteer() {
  return puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-gpu',
    ],
  })
}
