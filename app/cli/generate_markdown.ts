import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { generateData, generateMarkdownWithGroup, generate_manual_continue, isManualContinue, parseMarkdownTable } from './common';
import { ChannelGroup, Group } from './types';

let inputPath = '';
let outputPath = ''
export async function mergeMarkdown() {
  inputPath = await generate_manual_continue(async () => {
    const { filepath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filepath',
        message: '请输入数据配置文件路径（如：./data）：'
      }
    ]);
    let inputPath = filepath;
    if (!inputPath) {
      inputPath = '../../data';
      console.log(`您未输入任何路径，使用默认的 ${inputPath}。`);
    } 
    const dirPath = path.resolve(inputPath);
    if (!fs.existsSync(dirPath)) {
      console.log(`目录不存在: ${dirPath}`);
      return 0
    }
    return inputPath;
  }, '是否继续选择数据配置文件？');


  outputPath = await generate_manual_continue(async () => {
    const { output } = await inquirer.prompt([
      {
        type: 'input',
        name: 'output',
        message: '请输入输出文件路径（如：./output）：'
      }
    ]);
    if (!output) {
      outputPath = './output';
      console.log('您未输入任何输出文件名，使用默认的 ./output。');
    } else {
      outputPath = output;
    }
    const outDirPath = path.resolve(outputPath)
    if (!fs.existsSync(outDirPath)) {
      fs.mkdirSync(outDirPath, { recursive: true });
    }
    return outputPath;
  }, '是否继续选择输出文件路径？');

  console.log(`输入路径为: ${inputPath}`);
  console.log(`输出路径为: ${outputPath}`);
  console.log('开始合并Markdown文件...');

  // 清空output 下所有文件
  const outDirPath = path.resolve(outputPath);
  try{
    fs.readdirSync(outDirPath).forEach(file => {
      const filePath = path.resolve(outDirPath, file);
      fs.unlinkSync(filePath);
    });
  }catch(err){
    console.log(`清空${outDirPath} 下所有文件失败`, err);
  }
  let tmpFileName = '';
  let json = generateData(path.resolve(inputPath));
  for( let i=0;i<json.length;i++){
    let group:Group = json[i];
    for(let j=0;j<group['group_data'].length;j++){
      let group:ChannelGroup=json[i]['group_data'][j];
      tmpFileName = json[i]['group_name'].replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') + '.md';
      let tmpFilePath = path.resolve(outputPath, tmpFileName);  
      let tmpFileContent = generateMarkdownWithGroup(group);
      fs.writeFileSync(tmpFilePath, tmpFileContent, 'utf-8');
    }
  }
}


export const getChannelInfo = (md:string)=>{
  const tableData = parseMarkdownTable(md);
  console.log('tableData',tableData)
  return tableData;
}