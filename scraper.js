import puppeteer from "puppeteer";

const scrapeExtensionsDetails = async (page) => {
  return await page.evaluate(() => {
    try {
      const items = Array.from(document.querySelectorAll("[data-item-id]"));
      currentExtensions = items.map((item, index) => {
        const id = item.getAttribute("data-item-id");
        const titleElement = item.querySelector("h2");
        const title = titleElement
          ? titleElement?.textContent?.trim()
          : "No title available";
        const rating =
          item.querySelector("span span span")?.textContent?.trim() || "-";
        const reviews =
          item
            ?.querySelector("span span span:nth-child(3)")
            ?.textContent?.trim()
            ?.replace("(", "")
            ?.replace(")", "") || "-";

        return { id, title, rating, reviews, index };
      });

      return currentExtensions;
    } catch (e) {
      console.error("Error inside evaluate:", JSON.stringify(e));
      return [];
    }
  });
};

const clickLoadMoreButton = async (page) => {
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const loadMoreBtn = buttons.find(
      (button) => button?.textContent?.trim()?.toLowerCase() === "load more"
    );
    if (loadMoreBtn) {
      loadMoreBtn.click();
    }
  });
};
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export const scrapeChromeStore = async (
  extensionId,
  searchKeyword,
  maxScrapePages
) => {
  const baseURL = "https://chromewebstore.google.com/search/";
  const searchURL = `${baseURL}${encodeURIComponent(searchKeyword)}`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    console.log("Scraping Chrome Web Store...");
    await page.goto(searchURL, {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    let found = false;
    let extensions = [];
    let currentPage = 0;

    while (!found && currentPage < maxScrapePages) {
      currentPage++;
      extensions = await scrapeExtensionsDetails(page);

      found = extensions.find((ext) => ext.id === extensionId);

      if (!found) {
        console.log("Not Found On Page:", currentPage);
        await clickLoadMoreButton(page);
        await delay(500);
      }
    }

    return extensions;
  } catch (error) {
    console.error(error.message, "Error occurred while scraping Chrome Store");
  } finally {
    await browser.close();
  }
};
