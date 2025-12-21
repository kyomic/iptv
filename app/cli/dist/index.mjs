#!/usr/bin/env node

// index.ts
import { Command } from "commander";
import inquirer3 from "inquirer";
import chalk from "chalk";

// generate_markdown.ts
import inquirer2 from "inquirer";
import * as fs2 from "fs";
import * as path2 from "path";

// common.ts
import inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";
var isManualContinue = async (message = "\u662F\u5426\u7EE7\u7EED\uFF1F") => {
  const { goOn: continueMerge } = await inquirer.prompt([
    {
      type: "confirm",
      name: "goOn",
      message,
      default: false
    }
  ]);
  return continueMerge;
};
var generate_manual_continue = async (execute, message = "\u662F\u5426\u7EE7\u7EED\uFF1F") => {
  const result = await execute();
  if (result) {
    return result;
  }
  const toContinue = await isManualContinue(message);
  if (!toContinue) {
    console.log("\u7528\u6237\u9009\u62E9\u4E0D\u7EE7\u7EED\uFF0C\u7A0B\u5E8F\u9000\u51FA\u3002");
    process.exit(0);
  } else {
    return await generate_manual_continue(execute, message);
  }
};
function concatUrl(baseUrl, relativeUrl) {
  if (/https?:\/\//.test(relativeUrl)) {
    return relativeUrl;
  }
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  if (relativeUrl.startsWith("/")) {
    relativeUrl = relativeUrl.slice(1);
  }
  return baseUrl + relativeUrl;
}
function generateData(rootPath, config = {
  baseUrl: "",
  basePath: "/data/assets/logo/"
}) {
  const groupDirPath = path.resolve(rootPath, "group");
  const groupFiles = fs.readdirSync(groupDirPath).filter((file) => file.endsWith(".md"));
  const groupData = [];
  const result = [];
  const cache = {};
  groupFiles.forEach((file) => {
    const fileName = file.replace(".md", "");
    const filePath = path.resolve(groupDirPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const tableData = parseMarkdownTable(fileContent);
    if (!cache[fileName]) {
      cache[fileName] = {};
      result.push({
        group_data: [],
        group_name: fileName
      });
    }
    let group = result.find((item) => item["group_name"] === fileName);
    for (let i = 0; i < tableData.length; i++) {
      const groupName = tableData[i]["\u5206\u7EC4\u540D\u79F0"];
      const groupChannel = tableData[i]["\u9891\u9053"];
      if (!groupName) {
        continue;
      }
      let currentChannels = group["group_data"].find(
        (item) => item.name === groupName
      );
      if (!currentChannels) {
        currentChannels = {
          name: groupName,
          channels: []
        };
        group["group_data"].push(currentChannels);
      }
      let channelMd = "";
      try {
        channelMd = fs.readFileSync(
          path.resolve(rootPath, "channel", groupChannel + ".md"),
          "utf-8"
        );
      } catch (err) {
        console.log(`\u8BFB\u53D6${groupChannel} \u5931\u8D25`, err);
      }
      const infos = parseMarkdownTable(channelMd)?.[0] || {};
      currentChannels.channels.push({
        name: groupChannel,
        logo: concatUrl(config.baseUrl + config.basePath, infos["LOGO"] || ""),
        alias: infos["\u522B\u540D"] || ""
      });
    }
  });
  return result;
}
function parseMarkdownTable(md) {
  const lines = md.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("|"));
  if (lines.length < 2)
    return [];
  const headerParts = lines[0].split("|").map((h) => h.trim());
  if (headerParts[0] === "")
    headerParts.shift();
  if (headerParts[headerParts.length - 1] === "")
    headerParts.pop();
  const headers = headerParts;
  const dataLines = lines.slice(2);
  const result = dataLines.map((line) => {
    const cellParts = line.split("|").map((cell) => cell.trim());
    if (cellParts[0] === "")
      cellParts.shift();
    if (cellParts[cellParts.length - 1] === "")
      cellParts.pop();
    const cells = cellParts;
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = cells[idx] ?? "";
    });
    return obj;
  });
  return result;
}
function generateMarkdownWithGroup(group) {
  let md = `| \u9891\u9053 | \u522B\u540D | LOGO |
`;
  md += `| --- | --- | --- |
`;
  let generateImage = (channel) => {
    return `<img src="${channel.logo}" height="50" alt="${channel.name} ">`;
  };
  group.channels?.forEach((channel) => {
    md += `| ${channel.name} | ${channel.alias || ""} | ${generateImage(channel) || ""} |
`;
  });
  md = md.replace(/\n$/, "");
  return md;
}

// generate_markdown.ts
var inputPath = "";
var outputPath = "";
async function mergeMarkdown() {
  inputPath = await generate_manual_continue(async () => {
    const { filepath } = await inquirer2.prompt([
      {
        type: "input",
        name: "filepath",
        message: "\u8BF7\u8F93\u5165\u6570\u636E\u914D\u7F6E\u6587\u4EF6\u8DEF\u5F84\uFF08\u5982\uFF1A./data\uFF09\uFF1A"
      }
    ]);
    let inputPath2 = filepath;
    if (!inputPath2) {
      inputPath2 = "../../data";
      console.log(`\u60A8\u672A\u8F93\u5165\u4EFB\u4F55\u8DEF\u5F84\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u7684 ${inputPath2}\u3002`);
    }
    const dirPath = path2.resolve(inputPath2);
    if (!fs2.existsSync(dirPath)) {
      console.log(`\u76EE\u5F55\u4E0D\u5B58\u5728: ${dirPath}`);
      return 0;
    }
    return inputPath2;
  }, "\u662F\u5426\u7EE7\u7EED\u9009\u62E9\u6570\u636E\u914D\u7F6E\u6587\u4EF6\uFF1F");
  outputPath = await generate_manual_continue(async () => {
    const { output } = await inquirer2.prompt([
      {
        type: "input",
        name: "output",
        message: "\u8BF7\u8F93\u5165\u8F93\u51FA\u6587\u4EF6\u8DEF\u5F84\uFF08\u5982\uFF1A./output\uFF09\uFF1A"
      }
    ]);
    if (!output) {
      outputPath = "./output";
      console.log("\u60A8\u672A\u8F93\u5165\u4EFB\u4F55\u8F93\u51FA\u6587\u4EF6\u540D\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u7684 ./output\u3002");
    } else {
      outputPath = output;
    }
    const outDirPath2 = path2.resolve(outputPath);
    if (!fs2.existsSync(outDirPath2)) {
      fs2.mkdirSync(outDirPath2, { recursive: true });
    }
    return outputPath;
  }, "\u662F\u5426\u7EE7\u7EED\u9009\u62E9\u8F93\u51FA\u6587\u4EF6\u8DEF\u5F84\uFF1F");
  console.log(`\u8F93\u5165\u8DEF\u5F84\u4E3A: ${inputPath}`);
  console.log(`\u8F93\u51FA\u8DEF\u5F84\u4E3A: ${outputPath}`);
  console.log("\u5F00\u59CB\u5408\u5E76Markdown\u6587\u4EF6...");
  const outDirPath = path2.resolve(outputPath);
  if (fs2.readdirSync(outDirPath).length > 0) {
    console.log(`${outDirPath} \u4E0B\u6709\u6587\u4EF6\uFF0C\u662F\u5426\u7EE7\u7EED\u6E05\u7A7A\uFF1F`);
    const { confirm } = await inquirer2.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "\u662F\u5426\u7EE7\u7EED\u6E05\u7A7A\uFF1F"
      }
    ]);
    if (!confirm) {
      console.log("\u5DF2\u53D6\u6D88\u6E05\u7A7A\u64CD\u4F5C");
      return;
    }
  }
  try {
    fs2.readdirSync(outDirPath).forEach((file) => {
      const filePath = path2.join(outDirPath, file);
      if (fs2.lstatSync(filePath).isDirectory()) {
        fs2.rmdirSync(filePath, { recursive: true });
      } else {
        fs2.unlinkSync(filePath);
      }
    });
  } catch (err) {
    console.log(`\u6E05\u7A7A${outDirPath} \u4E0B\u6240\u6709\u6587\u4EF6\u5931\u8D25`, err);
  }
  let tmpFileName = "";
  let json = generateData(path2.resolve(inputPath));
  for (let i = 0; i < json.length; i++) {
    let group = json[i];
    let folderName = group["group_name"].replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
    let folderPath = path2.resolve(outputPath, folderName);
    if (!fs2.existsSync(folderPath)) {
      fs2.mkdirSync(folderPath, { recursive: true });
    }
    for (let j = 0; j < group["group_data"].length; j++) {
      let group2 = json[i]["group_data"][j];
      tmpFileName = group2.name.trim() + ".md";
      console.log("\u751F\u6210\u6587\u4EF6:", path2.resolve(folderPath, tmpFileName));
      let tmpFilePath = path2.resolve(folderPath, tmpFileName);
      let tmpFileContent = generateMarkdownWithGroup(group2);
      fs2.writeFileSync(tmpFilePath, tmpFileContent, "utf-8");
    }
  }
}

// index.ts
var program = new Command();
console.log(chalk.green.bold("\n\u6B22\u8FCE\u4F7F\u7528 Markdown \u5DE5\u5177\u7BB1 CLI\uFF01\n"));
console.log(
  chalk.yellow("\u5DE5\u5177\u8BF4\u660E\uFF1A") + "\n" + chalk.cyan("1. \u5408\u5E76 Markdown \u6587\u4EF6\uFF1A") + chalk.gray("\u5C06\u591A\u4E2A Markdown \u6587\u4EF6\u5408\u5E76\u4E3A\u4E00\u4E2A\u3002") + "\n" + chalk.cyan("2. \u5DE5\u51772\uFF1A") + chalk.gray("\u8FD9\u91CC\u662F\u5DE5\u51772\u7684\u529F\u80FD\u63CF\u8FF0\u3002") + "\n" + chalk.cyan("3. \u9000\u51FA\uFF1A") + chalk.gray("\u9000\u51FA\u7A0B\u5E8F\u3002") + "\n"
);
program.name("md-merge").description("\u5408\u5E76\u591A\u4E2A Markdown \u6587\u4EF6").version("1.0.0");
program.action(async () => {
  const { tool } = await inquirer3.prompt([
    {
      type: "list",
      name: "tool",
      message: "\u8BF7\u9009\u62E9\u8981\u4F7F\u7528\u7684\u5DE5\u5177\uFF1A",
      choices: [
        { name: "1. \u5408\u5E76 Markdown \u6587\u4EF6", value: "1" },
        { name: "2. \u5DE5\u51772", value: "2" },
        { name: "3. \u9000\u51FA", value: "3" }
      ]
    }
  ]);
  if (tool === "1") {
    await mergeMarkdown();
  } else if (tool === "2") {
  } else if (tool === "3") {
    console.log(chalk.yellow.bold("\n\u8C22\u8C22\u4F7F\u7528 Markdown \u5DE5\u5177\u7BB1 CLI\uFF01\n"));
    process.exit(0);
  }
});
program.parseAsync(process.argv);
