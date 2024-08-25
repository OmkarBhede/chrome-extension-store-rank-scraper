import { program } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { validateChromeExtensionId } from "./validator.js";
import { scrapeChromeStore } from "./scraper.js";

program.version("1.0.0").description("My Node CLI");

function formatString(input, length) {
  if (input.length > length) {
    return input.substring(0, length - 3) + "...";
  } else {
    return input.padEnd(length, " ");
  }
}

program.action(() => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "id",
        message: "What's your Chrome Extension ID?",
        default: "fagkajglcbohimamlhcpghddiogkfcae",
      },
    ])
    .then((idAns) => {
      if (!validateChromeExtensionId(idAns.id)) {
        console.log(chalk.red("Invalid Chrome Extension ID"));
        return;
      }
      inquirer
        .prompt([
          {
            type: "input",
            name: "searchKeyword",
            message: "What's your search keyword?",
            default: "turbo notion",
          },
        ])
        .then((keywordAns) => {
          if (keywordAns.searchKeyword.length < 3) {
            console.log(
              chalk.red("Search keyword must be at least 3 characters")
            );
            return;
          }
          inquirer
            .prompt([
              {
                type: "input",
                name: "totalPages",
                message: "How many pages to scrape?",
                default: 5,
              },
            ])
            .then(async (totalPagesAns) => {
              // scrape extensions
              console.log("\n");
              const extensions = await scrapeChromeStore(
                idAns.id,
                keywordAns.searchKeyword,
                totalPagesAns.totalPages
              );

              // log all extensions detials
              console.log("\n");
              console.log(chalk.underline("Exensions by rank,"));
              extensions.map((ext, index) => {
                const str =
                  formatString((index + 1).toString(), 3) +
                  " | " +
                  formatString(ext.title, 25) +
                  " | " +
                  ext.rating +
                  " | " +
                  ext.reviews;

                if (ext.id === idAns.id) {
                  console.log(chalk.green(str));
                } else {
                  console.log(str);
                }
              });

              const doesExtensionExists = extensions.some(
                (ext) => ext.id === idAns.id
              );

              console.log("\n");
              if (doesExtensionExists) {
                console.log(
                  "Extension's Rank on Chrome Web Store is : ",
                  extensions?.filter((ext) => ext.id === idAns.id)[0]?.index + 1
                );
              } else {
                console.log(
                  chalk.underline(
                    `Extension [${idAns.id}] Not Found in first ${totalPagesAns.totalPages} pages`
                  )
                );
              }
            });
        });
    });
});

program.parse(process.argv);
